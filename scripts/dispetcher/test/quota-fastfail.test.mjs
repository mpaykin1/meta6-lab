import {test} from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../build.mjs';

const now=Date.parse('2026-11-15T18:00:00Z');
function response(status,seconds){
 return {ok:status===200,status,
  headers:{get:key=>key==='x-ratelimit-remaining'?'0':key==='x-ratelimit-reset'?String((now+seconds*1000)/1000):null},
  json:async()=>({ok:true})};
}
test('dispatcher fails closed on quota reset beyond configured wait',async()=>{
 let calls=0,waits=0;
 await assert.rejects(()=>api('/pulls/1',{now:()=>now,maxWaitMs:10000,
  request:async()=>{calls++;return response(403,60)},
  wait:async()=>{waits++}}),/нет данных: квота/);
 assert.equal(calls,1);
 assert.equal(waits,0);
});
test('dispatcher retries once for short quota reset',async()=>{
 let calls=0,waited=0;
 const result=await api('/pulls/1',{now:()=>now,maxWaitMs:10000,
  request:async()=>++calls===1?response(429,5):response(200,5),
  wait:async ms=>{waited=ms}});
 assert.deepEqual(result,{ok:true});
 assert.equal(calls,2);
 assert.equal(waited,6000);
});

test('dispatcher rejects reset at 10 seconds when safety margin exceeds cap',async()=>{
 let calls=0,waits=0;
 await assert.rejects(()=>api('/pulls/1',{now:()=>now,maxWaitMs:10000,
  request:async()=>{calls++;return response(429,10)},
  wait:async()=>{waits++}}),/нет данных: квота/);
 assert.equal(calls,1);
 assert.equal(waits,0);
});
