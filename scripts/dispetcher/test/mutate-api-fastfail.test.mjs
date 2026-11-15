import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {api} from '../build.mjs';
const now=Date.parse('2026-11-15T18:00:00Z');
function response(status,secs){
 return {ok:status===200,status,
 headers:{get:k=>k==='x-ratelimit-remaining'?'0':k==='x-ratelimit-reset'?String((now+secs*1000)/1000):null},
 json:async()=>({ok:true})};
}
async function exercise(fn){
 let calls=0,waits=0;
 await assert.rejects(()=>fn('/pulls/1',{now:()=>now,maxWaitMs:10000,
  request:async()=>{calls++;return response(403,60)},
  wait:async()=>{waits++}}),/нет данных: квота/);
 assert.equal(calls,1,'long quota reset must not consume a second request');
 assert.equal(waits,0,'never block dispatcher for a minute or longer');
 calls=0;waits=0;
 const value=await fn('/pulls/1',{now:()=>now,maxWaitMs:10000,
  request:async()=>++calls===1?response(429,5):response(200,5),
  wait:async ms=>{waits=ms}});
 assert.equal(value.ok,true);assert.equal(calls,2);assert.equal(waits,6000);
}
test('dispatcher fails closed quickly on long API quota instead of sleeping 8 min',async()=>exercise(api));
test('five API wait and caller mutations must be rejected',async()=>{
 const src=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
 assert.match(src,/const dispatchApi=path=>api\(path,\{maxWaitMs:10000\}\)/);
 assert.equal((src.slice(src.indexOf('export async function main(){')).match(/dispatchApi\(/g)||[]).length,5);
 const anchor='waitMs<=8*60*1000&&waitMs<=maxWaitMs&&attempt===0';
 const broken=[
 ['unbounded-wait',src.replace(anchor,'waitMs<=8*60*1000&&attempt===0')],
 ['never-wait',src.replace(anchor,'waitMs<=0&&attempt===0')],
 ['accept-missing-quota',src.replace('remaining===0','remaining!==0')]
 ];
 for(const [name,s] of broken){
  assert.notEqual(s,src,'mutation missing '+name);
  const modified=await import('data:text/javascript;base64,'+Buffer.from(s).toString('base64'));
  let caught=false;try{await exercise(modified.api)}catch{caught=true}
  assert.ok(caught,'regression escaped '+name);
 }
});
