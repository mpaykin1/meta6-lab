import {test} from 'node:test';import assert from 'node:assert/strict';
import {ashArchipelagoHeight,ASH_ARCHIPELAGO} from '../../ash-archipelago.mjs';
import {ashHeight} from '../../world-core.mjs';
import {landBiomeAt,planLivingLandChunk} from '../../living-land.mjs';
import {lifePlan,LAND_ARMORY_IDS} from '../../living-population.mjs';
const sea=3.8,seed=1337;
const ground=(x,z)=>ashArchipelagoHeight(x,z,seed,ashHeight(x,z,seed));
test('A05 §21.22 three deterministic separated playable Ash islands retain main/accepted Island',()=>{
 assert.equal(ASH_ARCHIPELAGO.length,3);
 for(const p of ASH_ARCHIPELAGO){
  const y=ground(p.x,p.z);assert(y>sea+2,'island not above sea: '+p.x);
  assert.equal(ground(p.x,p.z),y,'terrain must be seeded and stable');
  assert.equal(landBiomeAt(p.x,p.z,seed),'ash');
  const slope=Math.abs(ground(p.x+1,p.z)-ground(p.x,p.z));
  assert(slope<.9,'island exceeds navigable one-voxel step');
  const plan=lifePlan(p.x,p.z,seed,ground,sea);
  assert(plan.npcs.length>=2&&plan.enemies.length>=2);
  assert.deepEqual([...new Set(plan.weapons.map(w=>w.id))].sort(),[...LAND_ARMORY_IDS].sort(),
    'original 20 weapon types must exist on each island');
  const chunk=planLivingLandChunk(Math.floor(p.x/16),Math.floor(p.z/16),seed,ground,sea);
  assert(chunk.dry>0&&chunk.objects.length>=4,'original terrain props missing');
 }
 for(let i=0;i<ASH_ARCHIPELAGO.length-1;i++){
  const a=ASH_ARCHIPELAGO[i],b=ASH_ARCHIPELAGO[i+1],x=(a.x+b.x)/2,z=(a.z+b.z)/2;
  assert(ground(x,z)<sea-1,'islands fused; ocean corridor is not swimmable');
 }
 for(const [x,z] of [[-90,32],[-126,32],[0,20],[63,63],[80,30]]){
  assert.equal(ashArchipelagoHeight(x,z,seed,54),54,'existing worlds may not change');
 }
});
