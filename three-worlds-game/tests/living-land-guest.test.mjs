import {test} from 'node:test';
import assert from 'node:assert/strict';
import {landBiomeAt,planLivingLandChunk,MIN_DRY_OBJECTS,simulateGuestArrival} from '../living-land.mjs';
import {seabedHeight} from '../seabed.mjs';
import {islandHeight} from '../world-core.mjs';
import {createGuestSchedule,guestScheduleStep} from '../stage7-simulation.mjs';
const SEEDS=[1,1337,90210];
test('owner 041: each surfaced offshore chunk deterministically belongs to Island or Ash with >=4 approved props',()=>{
 let dry=0,ash=0,island=0;
 for(const seed of SEEDS)for(let cx=-20;cx<=42;cx+=2)for(let cz=-20;cz<=42;cz+=2){
   const ground=(x,z)=>x>=64?seabedHeight(x,z,seed):islandHeight(x,z,seed);
   const a=planLivingLandChunk(cx,cz,seed,ground),repeat=planLivingLandChunk(cx,cz,seed,ground);
   assert.deepEqual(a,repeat,'seeded chunk changed between visits');
   if(!a.dry)continue;
   dry++;assert(['ash','island'].includes(a.biome));
   assert(a.objects.length>=MIN_DRY_OBJECTS,'bare land chunk '+cx+','+cz+' seed '+seed);
   for(const o of a.objects){
     assert(o.y>3.8+.12,'land object under water');
     assert.equal(o.y,ground(o.x,o.z),'object floating above real collision floor');
     if(a.biome==='ash')assert(['dead_tree_a','wall_ruin','barrel','dead_tree_b','grave_cross','wreck_truck'].includes(o.type));
     else assert.equal(o.type,'accepted_tree');
   }
   if(a.biome==='ash')ash++;else island++;
 }
 assert(dry>50);assert(ash>0);assert(island>0);
});
test('owner 041: every offshore shelf sampled near 145/32 contains four-plus living props',()=>{
 for(const seed of SEEDS){
  let dry=0;
  for(let cx=6;cx<=11;cx++)for(let cz=0;cz<=4;cz++){
   const a=planLivingLandChunk(cx,cz,seed,(x,z)=>seabedHeight(x,z,seed));
   if(a.dry){dry++;assert(a.objects.length>=4);}
  }
  assert(dry>=8,'seed lacks playable land');
 }
});
test('owner 041: standing idle causes a guest by 60 virtual seconds (1800 steps)',()=>{
 for(const seed of SEEDS){
  const state=createGuestSchedule(seed);let visible=false,seen=0,warning=0;
  const update=(dt)=>{if(!visible&&guestScheduleStep(state,dt,false)){warning=1.5;seen++;}
    if(warning>0){warning=Math.max(0,warning-dt);if(warning<1e-9)visible=true;}};
  update.active=()=>visible;
  const time=simulateGuestArrival(update,1/30,60);
  assert(time!==null&&time<=60,'guest missing by 60 simulated seconds');
  assert.equal(seen,1,'only one arrival before completion');
 }
});
