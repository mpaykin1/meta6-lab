import assert from 'node:assert/strict';
import {verify} from './verify.mjs';
const sha='a'.repeat(40);
const good=['last_change: 2026-11-10T00:00:00Z','last_sha: '+sha,'finish: 2/18','checks: зелёный — https://github.com/mpaykin1/meta6-lab/actions/runs/123','broken:','- [error](OSHIBKI.md)','left:','- [finish](rules/09-platforma/FINISH.md)'].join('\n')+'\n';
const bad=[
 ['over-20-lines',good+'- [x](OSHIBKI.md)\n'.repeat(14)],
 ['missing-field',good.replace('checks:','other:')],
 ['wrong-sha',good.replace(sha,'b'.repeat(40))],
 ['deception-matching-prefix',good.replace(sha,sha.slice(0,8))],
 ['unlinked-broken',good.replace('- [error](OSHIBKI.md)','- error')]
];
assert.equal(verify(good,sha,sha),true);
for(const [name,input] of bad){
 assert.throws(()=>verify(input,sha,sha),undefined,'Mutation escaped: '+name);
 console.log('STATUS_MUTATION_CAUGHT '+name);
}
console.log('STATUS_MUTATIONS_OK');
