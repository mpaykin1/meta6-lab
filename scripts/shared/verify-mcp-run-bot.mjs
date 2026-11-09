// M4: independent protocol and runner checks. --real also runs actual Playwright bot.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,copyFileSync,cpSync,rmSync,symlinkSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import readline from 'node:readline';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const original=join(ROOT,'shared/approved/tools/run-bot.mjs');
const flag=process.argv.indexOf('--source');
const source=flag<0?original:resolve(process.argv[flag+1]||'');
const real=process.argv.includes('--real');
const work=mkdtempSync(join(tmpdir(),'mcp-run-bot-'));
const fixture=join(work,'repo');
const modulePath=join(fixture,'shared/approved/tools/run-bot.mjs');
const game=join(fixture,'games','veil-terraces');
const fakeGames=[{id:'veil-terraces',path:'games/veil-terraces'}];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function wrapper(){
 mkdirSync(join(fixture,'shared/approved/tools'),{recursive:true});
 mkdirSync(join(fixture,'scripts/meta-bot'),{recursive:true});
 mkdirSync(game,{recursive:true});
 copyFileSync(source,modulePath);
 writeFileSync(join(game,'index.html'),'HEALTHY');
 writeFileSync(join(game,'bot-adapter.js'),'// read-only marker');
 const stub=[
  "import {readFileSync} from 'node:fs';",
  "import {join} from 'node:path';",
  "const page=readFileSync(join(process.cwd(),process.argv[2],'index.html'),'utf8');",
  "if(page==='SLOW')await new Promise(r=>setTimeout(r,1000));",
  "if(page==='BROKEN'){",
  "console.log('▶ games/veil-terraces');",
  "console.log('  ❌ mobile: уровней 6, пройдено 0, FPS 18');",
  "console.log('     - уровень 1: герой застрял [снимок: уровень 1, герой (0, 0), цель (2, 3), жив true, врагов 1, оружия 1]');",
  "process.exit(1);",
  "}",
  "if(page==='ZERO')process.exit(0);",
  "if(page==='MIXED'){console.log('▶ games/veil-terraces');console.log('  ✅ mobile: уровней 6, пройдено 6, FPS 57.7');console.log('  ✅ desktop: уровней 6, пройдено 6, FPS 58.1');process.exit(1);}",
  "console.log('▶ games/veil-terraces');",
  "console.log('  ✅ mobile: уровней 6, пройдено 6, FPS 57.7');",
  "console.log('  ✅ desktop: уровней 6, пройдено 6, FPS 58.1');"
 ].join('\n')+'\n';
 writeFileSync(join(fixture,'scripts/meta-bot/run.mjs'),stub);
 const mod=await import(pathToFileURL(modulePath).href);
 assert.equal(mod.MAX_RUN_MS,300000,'Missing hard 5-minute deadline');
 assert.deepEqual(mod.parseBotOutput('  ❌ mobile: уровней 2, пройдено 1, FPS —\n     - bad [снимок: уровень 2]\n')
  .map(x=>({viewport:x.viewport,passed:x.passed,errors:x.errors})),[
  {viewport:'mobile',passed:1,errors:[{message:'bad [снимок: уровень 2]',snapshot:'[снимок: уровень 2]'}]}
 ],'Bot snapshot parsing failed');
 const ok=await mod.runBot({id:'veil-terraces'},fakeGames);
 assert.equal(ok.passed,true,'Healthy game should pass');
 assert.equal(ok.status,'прошёл');
 assert.equal(ok.runs.length,2);
 assert.ok(ok.durationMs>=0&&ok.durationMs<=300000,'No duration');
 await assert.rejects(mod.runBot({id:'../veil-terraces'},fakeGames),/Unknown game id/);
 await assert.rejects(mod.runBot({id:'veil-terraces',mode:'unvalidated'},fakeGames),/Unsupported/);
 rmSync(join(game,'bot-adapter.js'));
 await assert.rejects(mod.runBot({id:'veil-terraces'},fakeGames),/нет ручки бота/,'Missing adapter must never pass');
 writeFileSync(join(game,'bot-adapter.js'),'// marker');
 writeFileSync(join(game,'index.html'),'BROKEN');
 const broken=await mod.runBot({id:'veil-terraces'},fakeGames);
 assert.equal(broken.passed,false,'Broken game passed');
 assert.equal(broken.status,'не прошёл');
 assert.match(broken.errors[0]?.message||'',/застрял/);
 assert.match(broken.errors[0]?.snapshot||'',/\[снимок:/);
 writeFileSync(join(game,'index.html'),'ZERO');
 const zero=await mod.runBot({id:'veil-terraces'},fakeGames);
 assert.equal(zero.passed,false,'Zero-result deception passed');
 assert.match(zero.errors[0]?.message||'',/не вернул результаты/);
 // Bot crashed after printing green lines: exit code must win (OSHIBKI, Claude trap exitcode).
 writeFileSync(join(game,'index.html'),'MIXED');
 const mixed=await mod.runBot({id:'veil-terraces'},fakeGames);
 assert.equal(mixed.passed,false,'Non-zero bot exit passed');
 writeFileSync(join(game,'index.html'),'SLOW');
 const pending=mod.runBot({id:'veil-terraces'},fakeGames);
 await sleep(80);
 await assert.rejects(mod.runBot({id:'veil-terraces'},fakeGames),/уже выполняется/,'Concurrent call accepted');
 const independent=await import(pathToFileURL(modulePath).href+'?independent');
 await assert.rejects(independent.runBot({id:'veil-terraces'},fakeGames),/уже выполняется/,'Cross-instance lock ignored');
 assert.equal((await pending).passed,true);
 const cwd=process.cwd();try{process.chdir(work);
  writeFileSync(join(game,'index.html'),'HEALTHY');
  assert.equal((await mod.runBot({id:'veil-terraces'},fakeGames)).passed,true,'CWD-dependent');
 }finally{process.chdir(cwd)}
 console.log('RUN_BOT_WRAPPER_PASS missing adapter, broken game/snapshot, zero-result, concurrency, cwd, deadline');
}
async function runProcess(file,args,cwd=ROOT,timeout=310000){
 return new Promise((done,reject)=>{
  const child=spawn(process.execPath,[file,...args],{cwd,stdio:['ignore','pipe','pipe']});
  let out='',err='',ended=false;
  const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Timed out: '+file))},timeout);
  child.stdout.on('data',b=>out+=b);
  child.stderr.on('data',b=>err+=b);
  child.once('error',e=>{clearTimeout(timer);reject(e)});
  child.once('close',(code,signal)=>{if(ended)return;ended=true;clearTimeout(timer);done({code,signal,out,err})});
 });
}
async function protocol(){
 const cwd=mkdtempSync(join(work,'cwd-'));
 const proc=spawn(process.execPath,[join(ROOT,'shared/approved/mcp.mjs')],{cwd,stdio:['pipe','pipe','pipe']});
 let id=0,stderr='';
 const pending=new Map();
 proc.stderr.on('data',d=>stderr+=d);
 readline.createInterface({input:proc.stdout}).on('line',line=>{
  let response;try{response=JSON.parse(line)}catch(e){return}
  const item=pending.get(response.id);
  if(item){pending.delete(response.id);clearTimeout(item.timer);item.resolve(response)}
 });
 function ask(method,params={},timeout=320000){
  return new Promise((resolve,reject)=>{
   const n=++id;
   const timer=setTimeout(()=>{pending.delete(n);reject(Error('MCP timeout '+stderr))},timeout);
   pending.set(n,{resolve,reject,timer});
   proc.stdin.write(JSON.stringify({jsonrpc:'2.0',id:n,method,params})+'\n');
  });
 }
 const call=(name,args={})=>ask('tools/call',{name,arguments:args});
 try{
  await ask('initialize',{});
  const defs=(await ask('tools/list')).result.tools;
  assert.deepEqual(defs.find(x=>x.name==='run_bot')?.inputSchema.required,['id'],'MCP registration missing');
  assert.match((await call('run_bot',{id:'../../OSHIBKI.md'})).error?.message||'',/Unknown game id/);
  if(real){
   const direct=await runProcess(join(ROOT,'scripts/meta-bot/run.mjs'),['games/veil-terraces']);
   const {parseBotOutput}=await import(pathToFileURL(original).href);
   const expected=parseBotOutput(direct.out);
   assert.ok(expected.length,'Direct bot had no results: '+direct.err);
   const response=await call('run_bot',{id:'veil-terraces'});
   assert.ok(response.result?.content?.[0]?.text,'MCP bot failed: '+JSON.stringify(response.error));
   const actual=JSON.parse(response.result.content[0].text);
   assert.equal(actual.passed,direct.code===0&&expected.every(r=>r.ok&&r.passed===r.levels),'MCP vs direct result diverged');
   assert.deepEqual(actual.runs.map(x=>x.viewport),expected.map(x=>x.viewport),'Viewport coverage diverged');
   assert.deepEqual(actual.runs.map(x=>x.levels),expected.map(x=>x.levels),'Level coverage diverged');
   assert.ok(actual.durationMs>=0&&actual.durationMs<=305000,'Invalid duration');
   assert.ok(actual.errors.every(x=>'snapshot' in x),'Missing snapshot field');
   console.log('RUN_BOT_REAL_PASS direct and MCP: '+actual.status+'; viewports '+actual.runs.length);
  }
  console.log('RUN_BOT_MCP_PASS registered, unknown id blocked, unrelated cwd');
 }finally{proc.kill('SIGKILL');for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('MCP closed'))}pending.clear()}
}
async function brokenCopyReal(){
 const root=mkdtempSync(join(tmpdir(),'mcp-broken-game-'));
 try{
  mkdirSync(join(root,'shared/approved/tools'),{recursive:true});
  mkdirSync(join(root,'games/veil-terraces'),{recursive:true});
  cpSync(join(ROOT,'scripts/meta-bot'),join(root,'scripts/meta-bot'),{recursive:true});
  copyFileSync(original,join(root,'shared/approved/tools/run-bot.mjs'));
  copyFileSync(join(ROOT,'games/veil-terraces/bot-adapter.js'),join(root,'games/veil-terraces/bot-adapter.js'));
  writeFileSync(join(root,'games/veil-terraces/index.html'),'<!doctype html><title>Broken bot game</title><canvas></canvas>');
  assert.ok(existsSync(join(ROOT,'node_modules')),'Playwright dependency missing');
  symlinkSync(join(ROOT,'node_modules'),join(root,'node_modules'),'dir');
  const mod=await import(pathToFileURL(join(root,'shared/approved/tools/run-bot.mjs')).href);
  const response=await mod.runBot({id:'veil-terraces'},fakeGames);
  assert.equal(response.passed,false,'Broken real game passed');
  assert.ok(response.errors.some(e=>/нет ручки|META_BOT/i.test(e.message)),'Real bot did not detect broken copy: '+JSON.stringify(response.errors));
  console.log('RUN_BOT_BROKEN_REAL_PASS Claude core rejects broken temporary game');
 }finally{rmSync(root,{recursive:true,force:true})}
}
try{await wrapper();if(flag<0){await protocol();if(real)await brokenCopyReal()}}
catch(e){console.error('RUN_BOT_VERIFY_FAIL:',e.stack||e);process.exitCode=1}
finally{rmSync(work,{recursive:true,force:true})}
