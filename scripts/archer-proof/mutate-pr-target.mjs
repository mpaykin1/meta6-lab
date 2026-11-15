import assert from 'node:assert/strict';
import {checkedPrTarget} from './pr-target.mjs';
const p={base:{ref:'lab/archer-retention-exp-1'},head:{ref:'lab/archer-retention-exp-1-game'}};
assert.equal(checkedPrTarget(p,'lab/archer-retention-exp-1-game'),p.head.ref);
for(const [name,ref] of [['base','lab/archer-retention-exp-1'],['unrelated','main'],['empty','']]){
 assert.throws(()=>checkedPrTarget(p,ref),/wrong PR HEAD/,name);console.log('MUTATION_CAUGHT '+name);
}
for(const [name,payload] of [
 ['missing-head',{base:p.base}],['missing-base',{head:p.head}],
 ['equal',{base:p.base,head:p.base}],
 ['forged',{base:p.base,head:{ref:''}}]
]){
 assert.throws(()=>checkedPrTarget(payload,'lab/archer-retention-exp-1-game'),/нет данных/,name);
 console.log('MUTATION_CAUGHT '+name);
}
console.log('PASS PR target 7 invalid cases rejected');
