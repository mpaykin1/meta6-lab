import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const path=new URL('../../automation/prompts/TOLKACH.md',import.meta.url);
const policy=readFileSync(path,'utf8');
const requirements=[
 'git rev-parse --is-shallow-repository',
 'обычный двухродительский merge',
 'условным fast-forward',
 'API-403: остановка повторов',
 'не перезапускать тот же guard'
];
function protectedWorkflow(text){
 return requirements.every(phrase=>text.includes(phrase));
}
assert.equal(protectedWorkflow(policy),true,'TOLKACH lacks a permanent safe-merge or API-quota rule');
for(const phrase of requirements){
 assert.ok(policy.includes(phrase),'missing fixture: '+phrase);
 const broken=policy.replace(phrase,'BROKEN_POLICY');
 assert.equal(protectedWorkflow(broken),false,'mutant escaped: '+phrase);
 console.log('MUTATION_CAUGHT '+phrase);
}
console.log('PASS: TOLKACH safe-merge/API 403 contract and 5 negative mutations');
