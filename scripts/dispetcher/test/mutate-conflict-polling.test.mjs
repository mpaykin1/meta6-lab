import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveConflict} from '../build.mjs';

async function exercise(module){
 const pending={mergeable:null};
 const delays=[];
 let calls=0;
 const ready=await module.resolveConflict(pending,async()=>{
   calls++;
   return {mergeable:calls===3?true:null,mergeable_state:calls===3?'clean':undefined};
 },null,async ms=>{delays.push(ms)},2000);
 assert.deepEqual(delays,[2000,2000,2000],'three complete 2s polls, never a 15s serial stall');
 assert.equal(calls,3,'all three checks must actually query current mergeability');
 assert.equal(ready.conflict,false,'clean response must not be forged');
 assert.equal(ready.unresolved,false);
 assert.equal(ready.retries,3);

 calls=0;delays.length=0;
 const blocked=await module.resolveConflict(pending,async()=>{calls++;return pending},true,async ms=>{delays.push(ms)},2000);
 assert.deepEqual(delays,[2000,2000,2000]);
 assert.equal(calls,3);
 assert.equal(blocked.unresolved,true,'null must stay explicitly unresolved');
 assert.equal(blocked.conflict,true,'historical conflict must remain fail-closed');

 calls=0;delays.length=0;
 const first=await module.resolveConflict(pending,async()=>{calls++;return {mergeable:false}},null,async ms=>{delays.push(ms)},2000);
 assert.deepEqual(delays,[2000]);
 assert.equal(calls,1,'stop as soon as GitHub provides a definitive state');
 assert.equal(first.conflict,true);
 assert.equal(first.unresolved,false);
}

test('dispatcher conflict polling: full checks, 6s worst-case, fail-closed unknown',async()=>exercise({resolveConflict}));

test('four polling regressions are rejected by real assertions',async()=>{
 const src=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
 const mutants=[
  ['slow-15s',src.replace('await sleep(pollMs);','await sleep(5000);')],
  ['silently-drop-retries',src.replace('retries<3','retries<1')],
  ['forge-unknown-clean',src.replace('return {pr:current,conflict:prior,unresolved:true,retries};',
    'return {pr:current,conflict:false,unresolved:false,retries};')],
  ['reuse-stale-pr',src.replace('current=await reload();','current=pr;')]
 ];
 for(const [name,mutant] of mutants){
   assert.notEqual(mutant,src,name+' must change real source');
   const mod=await import('data:text/javascript;base64,'+Buffer.from(mutant).toString('base64'));
   let killed=false;
   try{await exercise(mod)}catch{killed=true}
   assert.ok(killed,'mutation survived: '+name);
 }
});
