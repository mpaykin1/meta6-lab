import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GUEST_ROSTER,getOriginalGuestDefinition,instantiateOriginalGuest} from '../guest-roster.mjs';
test('owner §21.16: original-only guest roster has authentic source and no generic GPT guest',()=>{
 const ash=readFileSync(new URL('../ash-assets.mjs',import.meta.url),'utf8');
 const island=readFileSync(new URL('../npc-catalog.js',import.meta.url),'utf8');
 const sunken=JSON.parse(readFileSync(new URL('../models/MANIFEST.json',import.meta.url),'utf8'));
 assert(GUEST_ROSTER.length>=1);
 assert(GUEST_ROSTER.some(x=>x.id==='strider_m'&&x.origin==='ash'));
 for(const x of GUEST_ROSTER){
  assert(['island','ash','sunken'].includes(x.origin));
  assert(x.sourceModel&&x.catalog);
  const found=x.origin==='ash'?new RegExp("strider\\('"+x.sourceModel+"'").test(ash)||
   new RegExp("humanoid\\('"+x.sourceModel+"'").test(ash):
   x.origin==='island'?island.includes(x.sourceModel):
   sunken.sunkenCityModels.includes(x.sourceModel);
  assert(found,'guest id not found in owner catalogs '+x.sourceModel);
 }
 assert(!GUEST_ROSTER.some(x=>/gpt|generated|proxy|placeholder/i.test(x.id)));
});
test('owner §21.16: runtime must instantiate entire original source def and prohibit any unapproved guest',()=>{
 const def={id:'strider_m',parts:Array.from({length:9},(_,i)=>({name:'part'+i})),stats:()=>({voxels:17894})};
 const factory={models:[def],instance(d){const p=Object.fromEntries(d.parts.map(q=>[q.name,{}]));return {def:d,p,root:{},mat:{}}}};
 const out=instantiateOriginalGuest(factory);
 assert.equal(out.inst.def,def);
 assert.equal(out.sourceVoxels,def.stats().voxels);
 assert.equal(out.sourceParts,def.parts.length);
 assert.equal(out.ref.origin,'ash');
 assert.throws(()=>getOriginalGuestDefinition(factory,'gpt_robot'),/unapproved guest/);
 const degraded={...def,parts:[],stats:()=>({voxels:3})};
 assert.throws(()=>instantiateOriginalGuest({...factory,models:[degraded]}),/degraded/);
});
