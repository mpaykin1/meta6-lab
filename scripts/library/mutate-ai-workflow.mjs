import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const filename=fileURLToPath(new URL('../../.github/workflows/ai-solutions-catalog.yml',import.meta.url));
const valid=fs.readFileSync(filename,'utf8');
function check(s){
 const bad=s.split('\n').find(line=>/^\s*-\s+name:\s+[^'"][^#\n]*:\s+\S/.test(line));
 if(bad)throw Error('Unquoted colon inside YAML step name: '+bad.trim());
 assert.match(s,/name: 'Strict L3 acceptance: all systems and models must actually load'/,
  'Strict acceptance step missing');
 assert.match(s,/run: node scripts\/library\/verify-load\.mjs --verify --require-all/,
  'Strict browser command replaced or disabled');
 assert.match(s,/run: node scripts\/library\/mcp-test\/client\.mjs/,
  'Official MCP SDK client check missing');
}
check(valid);
const variants=[
 ['unquoted-colon',s=>s.replace("name: 'Strict L3 acceptance: all systems and models must actually load'","name: Strict L3 acceptance: all systems and models must actually load")],
 ['removed-L3',s=>s.replace("name: 'Strict L3 acceptance: all systems and models must actually load'","name: Unverified result")],
 ['deception-fake-green',s=>s.replace('run: node scripts/library/verify-load.mjs --verify --require-all',"run: echo 'L3 PASS'")]
];
for(const [id,mutate] of variants){
 const damaged=mutate(valid);
 assert.notEqual(damaged,valid,'Mutation has no effect: '+id);
 assert.throws(()=>check(damaged),undefined,'Mutation escaped detection: '+id);
 console.log('CAUGHT workflow '+id);
}
