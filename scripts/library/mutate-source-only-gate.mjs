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

// The probe must distinguish nonexistent games from nonexistent Git revisions.
import {baseGameExists} from './source-only-base.mjs';
function baseSuite(fn){
 const missing=(cmd,args,opts)=>{
  assert.equal(cmd,'git');
  assert.deepEqual(args,['ls-tree','-d','--name-only','origin/main','--','games/new-island']);
  assert.equal(opts.encoding,'utf8');
  return {status:0,stdout:''};
 };
 const existing=()=>({status:0,stdout:'games/new-island\n'});
 const unavailable=()=>({status:128,stdout:'',stderr:'fatal: not a tree'});
 const unexpected=()=>({status:0,stdout:'games/new-island-extra\n'});
 assert.equal(fn('new-island',missing),false,'absent game must be treated as new');
 assert.equal(fn('new-island',existing),true,'existing game must be rejected by source gate');
 assert.throws(()=>fn('new-island',unavailable),/нет данных/);
 assert.throws(()=>fn('new-island',unexpected),/нет данных/);
 assert.throws(()=>fn('../bad',missing),/invalid new-game id/);
}
baseSuite(baseGameExists);
const baseSource=await fs.readFile(new URL('./source-only-base.mjs',import.meta.url),'utf8');
const baseMutants=[
 ['missing-as-existing',"if(paths.length===0)return false;","if(paths.length===0)return true;"],
 ['existing-as-new',"if(paths.length===1&&paths[0]===expected)return true;",
  "if(paths.length===1&&paths[0]===expected)return false;"],
 ['failed-revision-as-absent',"if(result?.status!==0||typeof result.stdout!=='string')",
  "if(false&&typeof result.stdout!=='string')"],
 ['accept-similar-dir',"if(paths.length===1&&paths[0]===expected)return true;",
  "if(paths.length===1)return true;"]
];
for(const [name,before,after] of baseMutants){
 assert.ok(baseSource.includes(before),'missing base-mutation anchor: '+name);
 const broken=baseSource.replace(before,after);
 const m=await import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64'));
 let caught=false;
 try{baseSuite(m.baseGameExists)}catch{caught=true}
 assert.ok(caught,'base-probe mutation escaped: '+name);
}
console.log('PASS: source-only gate and 8 genuine mutants');
