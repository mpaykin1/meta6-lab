import assert from 'node:assert/strict';
import {readFileSync,statSync,cpSync,copyFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {resolve,join,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import readline from 'node:readline';

const root=fileURLToPath(new URL('../../',import.meta.url));
const serverArg=process.argv.indexOf('--server');
assert.ok(serverArg<0||process.argv[serverArg+1],'--server requires a path');
const server=serverArg<0?join(root,'shared/approved/mcp.mjs'):resolve(process.cwd(),process.argv[serverArg+1]);
const withVersion={protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'verify-mcp-list-games',version:'1.0.0'}};

// The reference parser is independent of shared/approved/mcp.mjs.
function expectedGames(indexFile){
 const html=readFileSync(indexFile,'utf8');
 const result=[];
 for(const [anchor] of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)){
  const opening=anchor.slice(0,anchor.indexOf('>')+1);
  const classes=/\bclass\s*=\s*["']([^"']+)["']/i.exec(opening)?.[1]?.split(/\s+/)||[];
  if(!classes.includes('game'))continue;
  const href=/\bhref\s*=\s*["']([^"']+)["']/i.exec(opening)?.[1];
  assert.match(href||'',/^\.\.\/(?:[a-z0-9-]+\/)+$/i,'Game href must be a relative directory');
  const title=/<h3\b[^>]*>([^<]+)<\/h3>/i.exec(anchor)?.[1]?.trim();
  assert.ok(title,'Game card must have an h3 title');
  const path=href.substring(3,href.length-1);
  result.push({id:path.split('/').at(-1),title,path,url:'https://mpaykin1.github.io/meta6/'+path+'/'});
 }
 assert.ok(result.length>0,'No games found in '+indexFile);
 return result;
}

function checkFolder(game,repositoryRoot){
 const base=resolve(repositoryRoot);
 const dir=resolve(base,game.path);
 assert.ok(dir.startsWith(base+sep),'Game path escapes repository: '+game.path);
 assert.ok(statSync(dir).isDirectory(),'Game directory missing: '+game.path);
 assert.ok(statSync(join(dir,'index.html')).isFile(),'Game index.html missing: '+game.path);
}

async function queryServer(serverFile,repositoryRoot,initialization,expected,clientName){
 const proc=spawn(process.execPath,[serverFile],{cwd:repositoryRoot,stdio:['pipe','pipe','pipe']});
 let stderr='';
 proc.stderr.setEncoding('utf8');
 proc.stderr.on('data',chunk=>{stderr+=chunk});
 const pending=new Map();
 let requestId=0;
 const output=readline.createInterface({input:proc.stdout});
 output.on('line',line=>{
  try{
   const msg=JSON.parse(line);
   const request=pending.get(msg.id);
   if(request){pending.delete(msg.id);clearTimeout(request.timeout);request.resolve(msg)}
  }catch(e){console.error('Invalid MCP response:',e)}
 });
 function failPending(error){
  for(const [id,request] of pending){
   clearTimeout(request.timeout);request.reject(error);pending.delete(id);
  }
 }
 proc.on('error',failPending);
 proc.on('exit',(code,signal)=>failPending(Error('MCP exited: '+code+' '+signal+' '+stderr)));
 function ask(method,params={}){
  return new Promise((resolve,reject)=>{
   const id=++requestId;
   const timeout=setTimeout(()=>{pending.delete(id);reject(Error('MCP timeout: '+method+' '+stderr))},10000);
   pending.set(id,{resolve,reject,timeout});
   proc.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
  });
 }
 try{
  const init=await ask('initialize',initialization);
  assert.ok(init.result,'MCP initialization failed ('+clientName+')');
  const listing=await ask('tools/list');
  assert.ok(listing.result?.tools?.some(tool=>tool.name==='list_games'),'tools/list missing list_games ('+clientName+')');
  for(const name of ['list_approved_components','search_approved_code','inspect_approved_component','get_approved_component_source']){
   assert.ok(listing.result.tools.some(tool=>tool.name===name),'Original MCP tool missing: '+name);
  }
  const response=await ask('tools/call',{name:'list_games',arguments:{}});
  assert.ok(response.result?.content?.[0]?.text,'list_games produced no content: '+JSON.stringify(response.error));
  const actual=JSON.parse(response.result.content[0].text);
  assert.ok(Array.isArray(actual),'list_games must return an array');
  assert.deepEqual(actual.map(game=>game.path).sort(),expected.map(game=>game.path).sort(),'games missing or extra ('+clientName+')');
  const byPath=new Map(actual.map(game=>[game.path,game]));
  assert.equal(byPath.size,actual.length,'Duplicate game paths');
  for(const game of expected){
   const received=byPath.get(game.path);
   assert.ok(received,'Missing game: '+game.path);
   assert.deepEqual(Object.keys(received).sort(),['id','path','title','url'],'Unexpected game fields: '+game.path);
   assert.equal(received.id,game.id,'Game ID mismatch: '+game.path);
   assert.equal(received.title,game.title,'Game title mismatch: '+game.path);
   assert.equal(received.url,'https://mpaykin1.github.io/meta6/'+received.path+'/','URL mismatch: '+game.path);
   checkFolder(received,repositoryRoot);
  }
  return actual;
 }finally{
  proc.stdin.end();
  proc.kill();
  output.close();
 }
}

async function checkLiveStorefront(original){
 const temporary=mkdtempSync(join(tmpdir(),'mcp-list-games-'));
 try{
  const approvedDir=join(temporary,'shared/approved');
  cpSync(join(root,'shared/approved'),approvedDir,{recursive:true});
  // When testing a mutant, the isolated process must run that same mutant.
  copyFileSync(server,join(approvedDir,'mcp.mjs'));
  const htmlDir=join(temporary,'meta-games');
  mkdirSync(htmlDir,{recursive:true});
  const htmlFile=join(htmlDir,'index.html');
  copyFileSync(join(root,'meta-games/index.html'),htmlFile);
  const html=readFileSync(htmlFile,'utf8');
  const gameCard=/<a\b[^>]*\bclass\s*=\s*(["'])game\1[^>]*>[\s\S]*?<\/a>/i.exec(html)?.[0];
  assert.ok(gameCard,'No game card found for live storefront probe');
  const originalHref=/\bhref\s*=\s*(["'])(.*?)\1/i.exec(gameCard)?.[2];
  assert.ok(originalHref?.startsWith('../'),'Invalid original game link in probe');
  const removedPath=originalHref.slice(3,-1);
  assert.ok(original.some(game=>game.path===removedPath),'Probe did not select an existing game');
  const probePath='games/zz-probe-game';
  assert.ok(!original.some(game=>game.path===probePath),'Probe game already exists in the catalogue');
  const replacement='<a class="game" href="../games/zz-probe-game/"><h3>Probe Game</h3></a>';
  writeFileSync(htmlFile,html.replace(gameCard,replacement));
  for(const game of [...original,{path:probePath}]){
   const folder=join(temporary,game.path);
   mkdirSync(folder,{recursive:true});
   writeFileSync(join(folder,'index.html'),'<!doctype html><title>Test fixture</title>');
  }
  const expected=expectedGames(htmlFile);
  assert.equal(expected.length,original.length,'Probe must replace exactly one game');
  assert.ok(expected.some(game=>game.path===probePath),'Probe game missing from fixture HTML');
  assert.ok(!expected.some(game=>game.path===removedPath),'Removed game still in fixture HTML');
  const returned=await queryServer(join(approvedDir,'mcp.mjs'),temporary,withVersion,expected,'live storefront');
  assert.ok(returned.some(game=>game.path===probePath),'Live storefront did not discover probe game');
  assert.ok(!returned.some(game=>game.path===removedPath),'Live storefront retained removed game');
 }finally{
  rmSync(temporary,{recursive:true,force:true});
 }
}

try{
 const expected=expectedGames(join(root,'meta-games/index.html'));
 for(const game of expected)checkFolder(game,root);
 await queryServer(server,root,withVersion,expected,'versioned');
 await queryServer(server,root,{},expected,'unversioned');
 await checkLiveStorefront(expected);
 console.log('MCP_LIST_GAMES_PASS '+expected.length+' games; both client versions; live storefront probe; paths and URLs');
}catch(error){
 console.error('MCP_LIST_GAMES_FAIL:',error.stack||error);
 process.exitCode=1;
}
