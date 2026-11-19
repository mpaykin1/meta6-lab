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

test('dispatcher does not invent exhausted quota when rate-limit headers are missing',async()=>{
 let calls=0,waits=0;
 await assert.rejects(()=>api('/pulls/1',{now:()=>now,maxWaitMs:10000,
  request:async()=>{calls++;return {ok:false,status:403,headers:{get:()=>null}}},
  wait:async()=>{waits++}}),/нет данных: GitHub HTTP 403/);
 assert.equal(calls,1);
 assert.equal(waits,0);
});


test('dispatcher passes bounded abort signal to slow HTTP requests',async()=>{
 let receivedSignal;
 const result=await api('/pulls/1',{maxWaitMs:10000,
  request:async (_url,options)=>{receivedSignal=options.signal;return {ok:true,json:async()=>({ok:true})}}});
 assert.deepEqual(result,{ok:true});
 assert.equal(receivedSignal instanceof AbortSignal,true);
 assert.equal(receivedSignal.aborted,false);
});

test('dispatcher reports aborted HTTP requests as unavailable data',async()=>{
 await assert.rejects(()=>api('/pulls/1',{maxWaitMs:10000,
  request:async()=>{throw new DOMException('request timed out','TimeoutError')}}),
  /нет данных: таймаут GitHub API \(\/pulls\/1\)/);
});

test('dispatcher treats AbortError as unavailable data, not a successful empty response',async()=>{
 await assert.rejects(()=>api('/pulls/1',{maxWaitMs:10000,
  request:async()=>{throw new DOMException('request aborted','AbortError')}}),
  error=>error.message.includes('нет данных: таймаут GitHub API (/pulls/1)')&&error.cause?.name==='AbortError');
});

test('dispatcher shares one deadline between quota wait and retry request',async()=>{
 let calls=0;
 const started=performance.now();
 // AbortSignal.timeout uses an unref'ed timer in Node; keep the event loop alive
 // while the mocked fetch intentionally waits only for its abort event.
 const keepAlive=setTimeout(()=>{},3000);
 try{
 await assert.rejects(()=>api('/pulls/1',{now:()=>now,maxWaitMs:1500,
  request:async (_url,{signal})=>{
   calls++;
   if(calls===1)return response(429,0.1);
   return new Promise((_resolve,reject)=>{
    if(signal.aborted)return reject(signal.reason);
    signal.addEventListener('abort',()=>reject(signal.reason),{once:true});
   });
  },
  wait:ms=>new Promise(resolve=>setTimeout(resolve,ms))}),
  /нет данных: таймаут GitHub API/);
 const elapsed=performance.now()-started;
 assert.equal(calls,2);
 assert.ok(elapsed>=1050,'quota wait should occur before retry');
 assert.ok(elapsed<2500,'retry must not receive a fresh full deadline');
 }finally{clearTimeout(keepAlive)}
});

test('dispatcher deadline also covers a stalled response.json body',async()=>{
 const keepAlive=setTimeout(()=>{},1500);
 try{
  const started=performance.now();
  await assert.rejects(()=>api('/pulls/1',{maxWaitMs:150,
   request:async()=>({ok:true,json:()=>new Promise(()=>{})})}),
   error=>error.message.includes('нет данных: таймаут GitHub API')&&error.cause?.name==='TimeoutError');
  assert.ok(performance.now()-started<1000,'body parsing must respect the request deadline');
 }finally{clearTimeout(keepAlive)}
});

test('dispatcher deadline rejects a request that ignores AbortSignal',async()=>{
 const keepAlive=setTimeout(()=>{},1200);
 try{
  await assert.rejects(()=>api('/pulls/1',{maxWaitMs:100,
   request:async()=>new Promise(()=>{})}),
   error=>error.message.includes('нет данных: таймаут GitHub API')&&error.cause?.name==='TimeoutError');
 }finally{clearTimeout(keepAlive)}
});
