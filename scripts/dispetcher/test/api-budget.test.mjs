import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {api} from '../build.mjs';
function response(status,remaining,reset){
 return {ok:status===200,status,
  headers:{get:k=>k==='x-ratelimit-remaining'?remaining:k==='x-ratelimit-reset'?reset:null},
  json:async()=>({ok:true})};
}
async function suite(m){
 const now=Date.parse('2026-11-14T05:00:00Z');
 let n=0,waited=0;
 const value=await m.api('/pulls/3',{now:()=>now,wait:async ms=>{waited=ms},
  request:async()=>++n===1?response(403,'0',String((now+60000)/1000)):response(200,'1','0')});
 assert.equal(n,2);assert.equal(waited,61000);assert.equal(value.ok,true);
 await assert.rejects(()=>m.api('/pulls/3',{now:()=>now,
  request:async()=>response(429,'0',String((now+600000)/1000))}),/нет данных: квота/);
 await assert.rejects(()=>m.api('/pulls/3',{
  request:async()=>response(500,'1','0')}),/нет данных: GitHub HTTP/);
}
test('403 and 429: retry only when quota resets within eight minutes',async()=>suite({api}));
test('GraphQL filters old closed PRs before REST polling',async()=>{
 const s=await fs.readFile(new URL('../build.mjs',import.meta.url),'utf8');
 assert.match(s,/await openPulls\(repo,token\)/);
 assert.match(s,/if\(!openNumbers\.has\(t\.id\)\)continue/);
});
test('three source mutations must fail, including fake empty data',async()=>{
 const s=await fs.readFile(new URL('../build.mjs',import.meta.url),'utf8');
 const mutations=[
  ['rate-remaining-forged',"remaining===0","remaining===2"],
  ['retry-disabled',"waitMs<=8*60*1000","waitMs<=0"],
  ['error-forged-empty',"throw Error('нет данных: GitHub HTTP '+response.status+' ('+path+')');","return [];"]
 ];
 for(const [name,before,after] of mutations){
  assert.ok(s.includes(before),name+' anchor');
  const mutated=s.replace(before,after);
  const m=await import('data:text/javascript;base64,'+Buffer.from(mutated).toString('base64'));
  let caught=false;
  try{await suite(m)}catch{caught=true}
  assert.ok(caught,'mutation escaped: '+name);
 }
});

test('GraphQL open-index mutations: closed, duplicate, third PR and forged two-card list',async()=>{
 const {indexOpened}=await import('../build.mjs');
 const a={number:3,state:'open',head:{sha:'a',ref:'lab/a'}};
 const b={number:87,state:'open',head:{sha:'b',ref:'lab/b'}};
 const c={number:5,state:'open',head:{sha:'c',ref:'lab/c'}};
 const exercise=fn=>{
  const {openNumbers,openPrs}=fn([a,b,c]);
  assert.deepEqual([...openNumbers].sort((x,y)=>x-y),[3,5,87]);
  assert.equal(openPrs.get(5).head.sha,'c');
  assert.throws(()=>fn([a,{...b,state:'closed'},c]),/нет данных/);
  assert.throws(()=>fn([a,a,c]),/нет данных/);
  assert.throws(()=>fn([{...a,number:0},b,c]),/нет данных/);
 };
 exercise(indexOpened);
 const source=await fs.readFile(new URL('../build.mjs',import.meta.url),'utf8');
 const mutations=[
  ['accept-closed',"pr.state!=='open'","false"],
  ['allow-duplicate',"openPrs.has(pr.number)","false"],
  ['truncate-index','const openNumbers=new Set(openPrs.keys());',
   'const openNumbers=new Set([3,87]);'],
  ['hardcode-two-card-demo','return {openNumbers,openPrs};',
   'return {openNumbers:new Set([3,87]),openPrs:new Map(opened.slice(0,2).map(pr=>[pr.number,pr]))};']
 ];
 for(const [name,before,after] of mutations){
  assert.ok(source.includes(before),'missing mutation anchor '+name);
  const mod=await import('data:text/javascript;base64,'+
   Buffer.from(source.replace(before,after)).toString('base64'));
  let caught=false;
  try{exercise(mod.indexOpened)}catch{caught=true}
  assert.ok(caught,'mutation escaped: '+name);
 }
});
