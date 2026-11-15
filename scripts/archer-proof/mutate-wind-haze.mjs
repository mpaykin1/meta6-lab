import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../../games/archer-in-the-fog/index.html',import.meta.url),'utf8');
const requirements=[
 'id="wind-haze" aria-hidden="true"',
 '#wind-haze{position:fixed;',
 'pointer-events:none;opacity:.65',
 '@keyframes wind-ribbon-outer',
 '@keyframes wind-ribbon-inner',
 '@media(prefers-reduced-motion:reduce)'
];
function check(source){return requirements.every(r=>source.includes(r));}
assert.ok(check(html),'Archer must render organic moving foreground fog without blocking input');
for(const phrase of requirements){
 assert.ok(html.includes(phrase),'no mutation anchor '+phrase);
 assert.equal(check(html.replace(phrase,'BROKEN_LAYER')),false,'missed regression: '+phrase);
 console.log('MUTATION_CAUGHT '+phrase);
}
console.log('PASS: Archer moving haze and 6 negative mutations');
