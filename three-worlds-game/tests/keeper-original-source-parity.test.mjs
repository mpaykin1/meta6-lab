// §21.25 — independent VERBATIM original keeper parity gate.
// Before the genuine Owner artefact is imported, test is explicitly SKIPPED,
// never a fake PASS comparing the generated CSS to itself.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {KEEPER_BUBBLE_CSS} from '../keeper-bubble.mjs';
const cssSource=new URL('../../../reference/island-canon/npc-say.css',import.meta.url);
const jsSource=new URL('../../../reference/island-canon/npc-say-original.js',import.meta.url);
const normalize=x=>x.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([:;{},])\s*/g,'$1').trim();
const select=(css,selector)=>{
 const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const m=css.match(new RegExp(escaped+'\\s*\\{([^}]*)\\}','m'));
 assert(m,'Missing independent original selector '+selector);
 return normalize(m[1]);
};
test('OWNER §21.25 CSS exact parity: real Keeper sprite/name/frame/tail/animation',{
 skip:!existsSync(cssSource)?'SOURCE BLOCKER: verified owner npc-say.css not supplied (see handoff/to-claude/090); no 1:1 PASS':false
},()=>{
 const original=readFileSync(cssSource,'utf8');
 const selectors=['.npc-say','.npc-say::after','.npc-say .npc-say-name','.npc-say .npc-say-text'];
 for(const selector of selectors)assert.equal(select(KEEPER_BUBBLE_CSS,selector),select(original,selector),
  'Exact owner-original CSS differs at '+selector);
});
test('OWNER §21.25 typewriter and fade require verified original script',{
 skip:!existsSync(jsSource)?'SOURCE BLOCKER: verified owner npc-say-original.js not supplied (no 1:1 animation claim)':false
},()=>{
 const original=readFileSync(jsSource,'utf8');
 assert(original.includes('npc-say'), 'Supplied original script does not implement Keeper bubble');
 // Fail closed: merely finding a script is not proof of equal timing,
 // typed-character pacing, DOM transitions or fade. A reviewer must add a
 // real semantic original-vs-runtime golden before unblocking this branch.
 assert(!original.includes('PROVISIONAL'), 'A reconstructed source cannot certify parity');
 assert.fail('Verified original script now present: implement original-vs-runtime keyboard/typing/fade semantic golden before any parity PASS');
});
