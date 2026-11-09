import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,cpSync,mkdirSync,mkdtempSync,rmSync,statSync,symlinkSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import readline from 'node:readline';

const root=fileURLToPath(new URL('../../',import.meta.url));
const serverFlag=process.argv.indexOf('--server');
assert.ok(serverFlag<0||process.argv[serverFlag+1],'--server needs a path');
const server=serverFlag<0?join(root,'shared/approved/mcp.mjs'):resolve(process.cwd(),process.argv[serverFlag+1]);
const withVersion={protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'verify-mcp-read-game',version:'1'}};
const asLines=text=>text.match(/[^\n]*\n|[^\n]+$/g)||[];

async function withServer(serverFile,initialization,run){
 // OSHIBKI #3: always launch from an unrelated temporary working directory.
 const cwd=mkdtempSync(join(tmpdir(),'mcp-read-cwd-'));
 const proc=spawn(process.execPath,[serverFile],{cwd,stdio:['pipe','pipe','pipe']});
 const pending=new Map();
 let nextId=0,stderr='';
 proc.stderr.setEncoding('utf8');
 proc.stderr.on('data',part=>{stderr+=part});
 const stdout=readline.createInterface({input:proc.stdout});
 const failPending=error=>{
  for(const [id,request] of pending){
   clearTimeout(request.timer);request.reject(error);pending.delete(id);
  }
 };
 stdout.on('line',line=>{
  try{
   const response=JSON.parse(line),request=pending.get(response.id);
   if(request){
    pending.delete(response.id);clearTimeout(request.timer);request.resolve(response);
   }
  }catch(e){failPending(Error('Malformed JSON-RPC response: '+e))}
 });
 proc.on('error',failPending);
 proc.on('exit',(code,signal)=>failPending(Error('MCP exited '+code+' '+signal+' '+stderr)));
 function ask(method,params={}){
  return new Promise((resolve,reject)=>{
   const id=++nextId;
   const timer=setTimeout(()=>{
    pending.delete(id);reject(Error('Timeout '+method+' '+stderr));
   },20000);
   pending.set(id,{resolve,reject,timer});
   proc.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
  });
 }
 try{
  const init=await ask('initialize',initialization);
  assert.ok(init.result,'initialize failed: '+JSON.stringify(init.error));
  const tools=(await ask('tools/list')).result?.tools;
  assert.ok(Array.isArray(tools),'tools/list failed');
  for(const name of ['list_games','list_game_files','read_game_file']){
   assert.ok(tools.some(tool=>tool.name===name),'Missing tool '+name);
  }
  return await run(ask);
 }finally{
  proc.stdin.end();proc.kill();stdout.close();
  failPending(Error('Server closed'));
  rmSync(cwd,{recursive:true,force:true});
 }
}
async function call(ask,name,args={}){
 const reply=await ask('tools/call',{name,arguments:args});
 assert.ok(reply.result?.content?.[0]?.text,name+' call failed: '+JSON.stringify(reply.error));
 return JSON.parse(reply.result.content[0].text);
}
async function assertBad(ask,name,args,label,pattern){
 const reply=await ask('tools/call',{name,arguments:args});
 assert.ok(reply.error,label+' was accepted: '+JSON.stringify(reply.result));
 if(pattern)assert.match(reply.error.message,pattern,label+' wrong error: '+reply.error.message);
 return reply.error.message;
}
async function verifyGames(ask){
 const games=await call(ask,'list_games');
 assert.ok(Array.isArray(games)&&games.length>0,'list_games is empty');
 const ids=new Set();
 for(const game of games){
  assert.ok(game.id&&game.path,'Incomplete list_games result');
  assert.ok(!ids.has(game.id),'Duplicate game id: '+game.id);
  ids.add(game.id);
  const directory=resolve(root,game.path);
  assert.ok(directory.startsWith(resolve(root)+'/'),'Game path outside repository');
  const files=await call(ask,'list_game_files',{id:game.id});
  assert.ok(Array.isArray(files)&&files.length>0,'list_game_files call failed or empty: '+game.id);
  assert.ok(files.some(entry=>entry.file==='index.html'),'index.html missing: '+game.id);
  const unique=new Set();
  for(const entry of files){
   assert.ok(typeof entry.file==='string'&&entry.file&&!entry.file.startsWith('/'),'Invalid relative file');
   assert.ok(!entry.file.split('/').includes('..'),'Traversal in file list');
   assert.ok(!unique.has(entry.file),'Duplicate file: '+entry.file);
   unique.add(entry.file);
   assert.equal(entry.bytes,statSync(join(directory,entry.file)).size,'File size mismatch: '+entry.file);
  }
  const original=readFileSync(join(directory,'index.html'),'utf8');
  const chunks=asLines(original);
  const actual=await call(ask,'read_game_file',{id:game.id,file:'index.html'});
  assert.equal(actual.text,chunks.slice(0,400).join(''),'Index content mismatch: '+game.id);
  assert.equal(actual.totalLines,chunks.length,'Index totalLines mismatch: '+game.id);
  assert.equal(actual.bytes,Buffer.byteLength(original),'Index bytes mismatch: '+game.id);
  assert.equal(actual.start,1,'Default start mismatch');
  assert.equal(actual.count,400,'Default count mismatch');
  const start=Math.max(1,Math.floor(chunks.length/2));
  const narrow=await call(ask,'read_game_file',{id:game.id,file:'index.html',start,count:2});
  assert.equal(narrow.text,chunks.slice(start-1,start+1).join(''),'line window mismatch: '+game.id);
  assert.equal(narrow.totalLines,chunks.length,'Window totalLines mismatch: '+game.id);
 }
 const id=games[0].id;
 await assertBad(ask,'read_game_file',{id,file:'../AGENTS.md'},'../AGENTS.md escape');
 await assertBad(ask,'read_game_file',{id,file:'/etc/passwd'},'/etc/passwd escape');
 await assertBad(ask,'read_game_file',{id:'../../',file:'index.html'},'../../ game id escape');
 await assertBad(ask,'list_game_files',{id:'unknown-game-'+randomUUID()},'unknown game id');
 return games;
}
async function verifyLiveCopy(games){
 const temporary=mkdtempSync(join(tmpdir(),'mcp-read-fixture-'));
 try{
  const approved=join(temporary,'shared/approved');
  cpSync(join(root,'shared/approved'),approved,{recursive:true});
  // Use the mutant under test in the isolated fixture, not the original.
  copyFileSync(server,join(approved,'mcp.mjs'));
  mkdirSync(join(temporary,'meta-games'),{recursive:true});
  copyFileSync(join(root,'meta-games/index.html'),join(temporary,'meta-games/index.html'));
  for(const game of games){
   const directory=join(temporary,game.path);
   mkdirSync(directory,{recursive:true});
   writeFileSync(join(directory,'index.html'),'<!doctype html>\n<title>Probe</title>\n');
  }
  const game=games[0];
  const directory=join(temporary,game.path);
  const liveName='live-'+randomUUID()+'.txt';
  const liveContent='first\r\nsecond\r\nthird\r\nfourth\r\nfifth\r\n';
  writeFileSync(join(directory,liveName),liveContent);
  writeFileSync(join(directory,'probe..txt'),'dot-dot in a legal filename');
  const binaryContent=Buffer.from('ASCII PAYLOAD BUT BINARY EXTENSION');
  writeFileSync(join(directory,'probe.png'),binaryContent);
  const outsideFile=join(temporary,'not-a-game-secret.txt');
  writeFileSync(outsideFile,'outside secret');
  symlinkSync(outsideFile,join(directory,'outside-link.txt'));
  await withServer(join(approved,'mcp.mjs'),withVersion,async ask=>{
   const files=await call(ask,'list_game_files',{id:game.id});
   assert.ok(files.some(entry=>entry.file===liveName&&entry.bytes===Buffer.byteLength(liveContent)),
    'live file not discovered');
   assert.ok(!files.some(entry=>entry.file==='outside-link.txt'),'Outside symlink leaked into listing');
   const result=await call(ask,'read_game_file',{id:game.id,file:liveName,start:2,count:2});
   assert.equal(result.text,'second\r\nthird\r\n','line window mismatch (live fixture)');
   assert.equal(result.totalLines,5,'Live totalLines mismatch');
   assert.equal(result.bytes,Buffer.byteLength(liveContent),'Live bytes mismatch');
   const beyond=await call(ask,'read_game_file',{id:game.id,file:liveName,start:6,count:2});
   assert.equal(beyond.text,'','Past-EOF window must be empty');
   await assertBad(ask,'read_game_file',{id:game.id,file:'probe.png'},'binary marker was not rejected',/binary/i);
   const reply=await ask('tools/call',{name:'read_game_file',arguments:{id:game.id,file:'probe.png'}});
   assert.ok(reply.error.message.includes(String(binaryContent.length)),'binary error omitted byte size');
   await assertBad(ask,'read_game_file',{id:game.id,file:'probe..txt'},'unsafe-dotdot',/Invalid file path/);
   await assertBad(ask,'read_game_file',{id:game.id,file:'outside-link.txt'},'outside symlink',/Symlink/i);
  });
 }finally{rmSync(temporary,{recursive:true,force:true})}
}
try{
 const games=await withServer(server,withVersion,verifyGames);
 await withServer(server,{},verifyGames);
 await verifyLiveCopy(games);
 console.log('MCP_READ_GAME_PASS '+games.length+' games; two initialize variants; isolated cwd; line windows; binary; traversal; symlink; live file');
}catch(error){
 console.error('MCP_READ_GAME_FAIL:',error.stack||error);
 process.exitCode=1;
}
