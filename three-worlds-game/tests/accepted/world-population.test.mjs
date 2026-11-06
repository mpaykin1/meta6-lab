import {test} from 'node:test';import assert from 'node:assert/strict';import {lifePlan,LAND_ARMORY_IDS} from '../../living-population.mjs';
test('A05 original Island, Ash and offshore islands have independent living NPC/enemies/weapon layers',()=>{
 assert.equal(LAND_ARMORY_IDS.length,20);
 for(const seed of [1,1337,90210])for(const [label,x,z] of [['island',20,32],['ash',-92,32],['offshore',365,32]]){
  const plan=lifePlan(x,z,seed,()=>8);assert(plan.npcs.length>=2,label);assert(plan.enemies.length>=2,label);
  assert(plan.weapons.length>=20,label);
  assert(plan.weapons.every(w=>LAND_ARMORY_IDS.includes(w.id)),label);
 }
});