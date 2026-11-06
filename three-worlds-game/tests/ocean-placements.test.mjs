import {test} from 'node:test';
import assert from 'node:assert/strict';
import {oceanPlacements,plannedOceanPopulation,LANDMARKS} from '../ocean-placements.mjs';
import {seabedHeight,shoreSeabedHeight,coastalBeachHeight} from '../seabed.mjs';
import {ambientBubbleAnchors,nextBubbleSlot,namedAssetInventory} from '../stage7-simulation.mjs';
const water=(x,z)=>x>=64;
const realFloor=seed=>(x,z)=>{
 if(x<64)return 1;
 const base=shoreSeabedHeight(x,z,seed,1);
 return coastalBeachHeight(x,z,seed,1,base);
};
test('D: renderer and Node use identical chunk object placement across 3 seeds',()=>{
 const player={x:82,z:32};
 for(const seed of [1,1337,90210]){
  const floor=realFloor(seed),p=plannedOceanPopulation(player,seed,floor,water,40);
  assert(p.ruins>0,'no ruins seed '+seed);
  assert(p.wrecks>0,'no wreck seed '+seed);
  assert(p.fish>=10,'fewer than ten fish seed '+seed+': '+p.fish);
  assert(p.plants>0,'no vegetation seed '+seed);
  assert(p.named.includes('submarine_wreck'),'fixed sunken wreck missing');
  const placements=oceanPlacements(3,1,seed,floor,water);
  assert.deepEqual(placements,oceanPlacements(3,1,seed,floor,water));
  const category=namedAssetInventory(p.named);
  for(const id of ['galleon','whale_skeleton','anchor','cannon','kraken_tentacle'])assert(category.present.includes(id),'owner GLB absent from planned nearby population: '+id);
  assert(!category.missing.some(id=>['galleon','whale_skeleton','anchor','cannon','kraken_tentacle'].includes(id)),'7b owner models must no longer be marked missing');
 }
});
test('C: actual underwater cathedral/wreck anchors vent away from hero in bounded production pool',()=>{
 const hero={x:70,z:32},vents=LANDMARKS.map(([id,x,z])=>({id,x,z,y:-3})),ring={cursor:0};
 const live=new Set();let distant=0,emissions=0;
 for(let tick=0;tick<80;tick++){
  for(const v of ambientBubbleAnchors(vents,hero,1337,tick,40)){
   const slot=nextBubbleSlot(ring,96);
   live.add(slot);
   assert(slot>=0&&slot<96);
   if(Math.abs(v.x-hero.x)>10)distant++;
   emissions++;
  }
  assert(live.size<=96,'production bubble slot count overflow');
 }
 assert(emissions>0,'no bubbles emitted by landmark vents');
 assert(distant>0,'submarine or distant ruin emitted no bubbles');
});
