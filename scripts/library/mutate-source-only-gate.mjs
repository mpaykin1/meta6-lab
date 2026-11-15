import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {validateSourceOnly} from './source-only-gate.mjs';

const fixture=['A\tgames/new-island/index.html','A\tgames/new-island/assets/hero.png',
 'A\treference-archives/owner-original.zip'].join('\n');
function suite(fn){
 assert.equal(fn(fixture,()=>false).game,'new-island');
 assert.throws(()=>fn('M\tgames/new-island/index.html',()=>false),/only add/);
 assert.throws(()=>fn(fixture,()=>true),/existing game/);
 assert.throws(()=>fn('A\tgames/one/index.html\nA\tgames/two/index.html',()=>false),/one game/);
 assert.throws(()=>fn('A\tgames/one/index.html\nA\tscripts/storozha/core.mjs',()=>false),
  /unrelated file/);
 assert.throws(()=>fn('A\tgames/one/index.html\nA\treference-archives/evil.js',()=>false),
  /unrelated file/);
}
suite(validateSourceOnly);
const source=await fs.readFile(new URL('./source-only-gate.mjs',import.meta.url),'utf8');
const damage=[
 ['accept-modified-game',"if(status!=='A')","if(false)"],
 ['existing-game-bypass',"if(baseHasGame(id))","if(id==='hardcoded-fake-game')"],
 ['two-games-bypass',"if(games.size!==1)","if(games.size>2)"],
 ['archive-as-any-file',"/^reference-archives\\/[a-zA-Z0-9._-]+\\.zip$/.test(path)",
  "/^.+$/.test(path)"]
];
for(const [name,before,after] of damage){
 assert.ok(source.includes(before),'missing mutation anchor: '+name);
 const changed=source.replace(before,after);
 const module=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
 let caught=false;
 try{suite(module.validateSourceOnly)}catch{caught=true}
 assert.ok(caught,'mutation escaped: '+name);
}
const workflow=await fs.readFile(new URL('../../.github/workflows/library-machine.yml',import.meta.url),'utf8');
assert.match(workflow,/git diff --exit-code -- shared\/library/);
assert.match(workflow,/node scripts\/library\/source-only-pr-cli.mjs/);
assert.match(workflow,/node scripts\/library\/mutate-source-only-gate.mjs/);
console.log('PASS: source-only alternative gate with four regression mutants');
