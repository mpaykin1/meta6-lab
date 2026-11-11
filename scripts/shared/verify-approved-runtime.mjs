import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const win={};win.window=win;
const ctx=vm.createContext(win);
for(const [id,file] of [['observer-npc','npc-catalog.js'],['observer-buildings','building-assets.js'],['observer-combat','combat-relations.js']]){
 vm.runInContext(fs.readFileSync(path.join(root,'shared/components',id,file),'utf8'),ctx,{filename:id});
}
assert.ok(Object.keys(win.ObserverNpcCatalog.ROLES).length>=12);
assert.equal(typeof win.ObserverCombatRelations.create,'function');
let faces=0;
const draw=Object.fromEntries(['box','beam','roof','post','fence','sign'].map(k=>[k,()=>{faces++}]));
assert.equal(win.ObserverBuildingAssets.build('well',draw),true);
assert.ok(faces>=10,'building geometry should have real parts');
assert.equal(win.ObserverBuildingAssets.build('__unknown__',draw),false);
console.log('APPROVED_GAMEPLAY_RUNTIME_PASS: NPC roles, combat export, 10+ building primitives');
