import assert from 'node:assert/strict';
import {validatePortalLinks} from './portal-link-guard.mjs';
const good=['../observer-world-en-v7/','../ashen-sumerek/'];
assert.equal(validatePortalLinks(good),2);
for (const [name,links] of [
 ['empty',[]],
 ['duplicate',[good[0],good[0]]],
 ['external',[good[0],'https://example.com/']],
 ['missing-target',['../other-world/',good[1]]],
 ['unsafe-relative',[good[0],'../../escape/']]
]) {
 assert.throws(()=>validatePortalLinks(links),undefined,'uncaught '+name);
 console.log('CAUGHT '+name);
}
