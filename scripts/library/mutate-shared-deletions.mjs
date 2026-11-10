import assert from 'node:assert/strict';
import {classifyRemoval,validateGeneratedRemoval} from './guard-shared-deletions.mjs';
const valid='shared/library/broken-city-copy.json';
const good={sameBlob:true,sourceExists:true,absentFromIndex:true,validManifest:true,archiveWasAbsent:true};
assert.deepEqual(classifyRemoval(valid),{name:'broken-city-copy',archive:'archive/library-duplicates-2026-11-10/broken-city-copy.json'});
assert.equal(validateGeneratedRemoval(valid,good),true);
for(const p of ['shared/index.json','shared/library/index.json','shared/library/skin-trainer.json','shared/library/assets/a.png','shared/approved/mcp.mjs','shared/library/broken-city-copy.json/evil']){
  assert.equal(validateGeneratedRemoval(p,good),false,'protected deletion escaped: '+p);
}
for(const key of Object.keys(good))assert.equal(validateGeneratedRemoval(valid,{...good,[key]:false}),false,'mutation escaped: '+key);
console.log('SHARED_DELETION_MUTATIONS_PASS');
