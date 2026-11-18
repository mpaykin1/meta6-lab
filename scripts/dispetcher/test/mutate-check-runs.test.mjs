import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertCompleteCheckRuns,fetchAllCheckRuns} from '../build.mjs';

const sha='deadbeef';
const full={total_count:2,check_runs:[{name:'guard',conclusion:'success'},{name:'visual',conclusion:'failure'}]};
const statuses={statuses:[]};

test('accepts complete check-runs including a failed job (caller must inspect conclusions)',()=>{
 assert.doesNotThrow(()=>assertCompleteCheckRuns(full,statuses,sha));
});

test('mutation 1: truncated check-runs page cannot masquerade as green CI',()=>{
 assert.throws(()=>assertCompleteCheckRuns({...full,total_count:3},statuses,sha),/неполный список check-runs/);
});

test('mutation 2: missing total_count must fail closed',()=>{
 assert.throws(()=>assertCompleteCheckRuns({check_runs:full.check_runs},statuses,sha),/неполный список check-runs/);
});

test('mutation 3: invalid combined status must fail closed',()=>{
 assert.throws(()=>assertCompleteCheckRuns(full,{},sha),/неполный combined status/);
});

test('deception mutation: fabricated empty successful first page despite larger reported count',()=>{
 assert.throws(()=>assertCompleteCheckRuns({total_count:100,check_runs:[]},statuses,sha),/неполный список check-runs/);
});

test('a complete empty check-runs response with valid status is structurally valid',()=>{
 assert.doesNotThrow(()=>assertCompleteCheckRuns({total_count:0,check_runs:[]},statuses,sha));
});

test('negative reported total is invalid even with empty check-runs',()=>{
 assert.throws(()=>assertCompleteCheckRuns({total_count:-1,check_runs:[]},statuses,sha),/неполный список check-runs/);
});


test('fetches later check-run pages including a failure',async()=>{
 let page=0;
 const checks=await fetchAllCheckRuns(sha,async()=>++page===1?
  {total_count:101,check_runs:Array(100).fill({conclusion:'success'})}:
  {total_count:101,check_runs:[{conclusion:'failure'}]});
 assert.equal(page,2);
 assert.equal(checks.check_runs.length,101);
 assert.equal(checks.check_runs[100].conclusion,'failure');
 assert.doesNotThrow(()=>assertCompleteCheckRuns(checks,statuses,sha));
});

test('mutation: changing total count between pages fails closed',async()=>{
 let page=0;
 await assert.rejects(fetchAllCheckRuns(sha,async()=>++page===1?
  {total_count:101,check_runs:Array(100).fill({})}:
  {total_count:102,check_runs:[{}]}),/неполный список/);
});

test('mutation: truncated intermediate page fails closed',async()=>{
 await assert.rejects(fetchAllCheckRuns(sha,async()=>({total_count:101,check_runs:[{}]})),/неполная страница/);
});
