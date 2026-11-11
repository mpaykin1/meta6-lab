import {test} from 'node:test';
import assert from 'node:assert/strict';
import {previousConflict,resolveConflict,render} from '../build.mjs';
import {verifyMutations} from '../mutate-mergeable-null.mjs';

test('mergeable=null: retry GET three times with 5s pauses; recover true status',async()=>{
 const delays=[],answers=[{mergeable:null},{mergeable:null},{mergeable:false}];
 let calls=0;
 const result=await resolveConflict({mergeable:null},async()=>answers[calls++],false,async(ms)=>{delays.push(ms)});
 assert.equal(calls,3);
 assert.deepEqual(delays,[5000,5000,5000]);
 assert.equal(result.conflict,true);
 assert.equal(result.unresolved,false);
});
test('persistent null preserves old conflict, not a fabricated clean PR',async()=>{
 let calls=0;
 const result=await resolveConflict({mergeable:null},async()=>{calls++;return {mergeable:null}},true,async()=>{});
 assert.equal(calls,3);
 assert.equal(result.conflict,true);
 assert.equal(result.unresolved,true);
});
test('persistent null with no prior evidence remains explicitly unknown',async()=>{
 const result=await resolveConflict({mergeable:null},async()=>({mergeable:null}),null,async()=>{});
 assert.equal(result.conflict,null);
 assert.equal(result.unresolved,true);
 const output=render([{id:99,branch:'lab/unknown',headSha:'sha',lastCommit:'2026-11-10T09:00:00Z',priority:0,conflictUnknown:true,stalled:false,red:false,problem:'Статус конфликта неизвестен',action:'Проверить',finish:false}]);
 assert.match(output,/непроверено 1/);
 assert.match(output,/Статус конфликта неизвестен/);
});
test('previous status parser is exact PR-id and preserves both true and false',()=>{
 const previous='# ДИСПЕТЧЕР\n\n### PR #10\n- Проблема: Конфликт с main\n- Взял: —\n\n### PR #1\n- Проблема: Красная проверка\n- Взял: —\n\n## НУЖЕН CLAUDE\n';
 assert.equal(previousConflict(previous,10),true);
 assert.equal(previousConflict(previous,1),null);
 assert.equal(previousConflict(previous,11),null);
});
test('trap: four mutations including hardcoded clean status must be caught',async()=>{
 assert.equal(await verifyMutations(),5);
});

test('old failed CI does not establish a clean merge when GitHub keeps returning null', async()=>{
 const previous='# ДИСПЕТЧЕР\n\n### PR #42\n- Проблема: Красная проверка: bot\n- Взял: —\n';
 const prior=previousConflict(previous,42);
 assert.equal(prior,null);
 const result=await resolveConflict({mergeable:null},async()=>({mergeable:null}),prior,async()=>{});
 assert.equal(result.conflict,null);
 assert.equal(result.unresolved,true);
});
