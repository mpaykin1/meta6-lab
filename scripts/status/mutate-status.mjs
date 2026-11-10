import assert from 'node:assert/strict';
import {verify} from './verify.mjs';
const sha='a'.repeat(40);
const ok=['last_change: 2026-11-10T00:00:00Z','last_sha: '+sha,'finish: 7/18','checks: красный — https://github.com/mpaykin1/meta6-lab/actions/runs/42','broken:','- [broken](OSHIBKI.md)','left:','- [left](rules/09-platforma/FINISH.md)'].join('\n')+'\n';
assert.equal(verify(ok,sha,7),true);
const cases={
 '21-lines':ok+'- [x](OSHIBKI.md)\n'.repeat(14),
 'missing-field':ok.replace('checks:','invalid:'),
 'wrong-sha':ok.replace(sha,'b'.repeat(40)),
 'deceptive-sha-prefix':ok.replace(sha,sha.slice(0,10)),
 'six-broken-items':ok.replace('left:', '- [1](OSHIBKI.md)\n- [2](OSHIBKI.md)\n- [3](OSHIBKI.md)\n- [4](OSHIBKI.md)\n- [5](OSHIBKI.md)\nleft:'),
 'unlinked-error':ok.replace('- [broken](OSHIBKI.md)','- broken'),
 'unverified-checks':ok.replace('checks: красный','checks: ожидание'),
 'false-finish':ok.replace('finish: 7/18','finish: 18/18')
};
for(const [name,data] of Object.entries(cases)){
 assert.throws(()=>verify(data,sha,7),undefined,'escaped: '+name);
 console.log('CAUGHT '+name);
}
console.log('STATUS_MUTATIONS_OK');
