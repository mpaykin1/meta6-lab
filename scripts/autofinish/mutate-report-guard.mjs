import assert from 'node:assert/strict';
import {violations} from './report-guard-core.mjs';
function diff(line){return 'diff --git a/SMENA.md b/SMENA.md\n@@ -1,0 +1 @@\n+'+line;}
const cases=[
 ['missing attempt','Осталось устранить конфликт PR #5'],
 ['unverified PR reference','Дождаться CI: https://github.com/mpaykin1/meta6-lab/pull/5'],
 ['deception with generic URL','Повторный прогон нужен: https://github.com/mpaykin1/meta6-lab/issues/5'],
 ['merge without evidence','Слить PR #5'],
];
for(const [name,content] of cases){
  assert.equal(violations(diff(content)).length,1,name);
  console.log('caught mutation '+name);
}
assert.deepEqual(violations(diff(
 'Повторный прогон: https://github.com/mpaykin1/meta6-lab/actions/runs/429123')),[]);
assert.deepEqual(violations(diff('Не слить PR #5 без CI')),[]);
