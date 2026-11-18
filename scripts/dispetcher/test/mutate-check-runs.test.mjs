import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertCompleteCheckRuns} from '../build.mjs';

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
