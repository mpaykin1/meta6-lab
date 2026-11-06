import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseVisibleRiftSpot,riftVisualScale} from '../rift-visibility.mjs';
test('§21.25: true terrain portal grows in both five-second phases without visual jump',()=>{
 for(const phase of ['warning','opening','closing']){
  let prev=-1;for(let i=0;i<=20;i++){
   const v=riftVisualScale(phase,i/4);
   assert(v>prev,'portal closed or shrank in '+phase+' at '+i);
   prev=v;
  }
 }
 assert(Math.abs(riftVisualScale('warning',5)-riftVisualScale('opening',0))<.001);
 assert.equal(riftVisualScale('opening',5),1);
 assert.equal(riftVisualScale('closing',5),1);
 assert(riftVisualScale('warning',2.5)>.25,'warning stays point-sized for 5s');
 assert.equal(riftVisualScale('dialogue',3),1);
});
test('phone-safe portal placement survives four camera yaw projections and drift',()=>{
 const player={x:20,z:32};
 let chosen=null;
 for(const [yaw,offset] of [[0,0],[.5,.13],[1.1,-.18],[2.4,.21]]){
  const project=(x,z)=>{
   const dx=x-player.x,dz=z-player.z;
   return {x:((dx*Math.cos(yaw)+dz*Math.sin(yaw))/3.2)+offset,
    y:(-dx*Math.sin(yaw)+dz*Math.cos(yaw))/5, z:.4};
  };
  const p=chooseVisibleRiftSpot(player,project,chosen);
  assert(p,'projection has no candidate');
  assert(Math.abs(project(p.x,p.z).x)<.72,'rift horizontally clipped');
  assert(Math.abs(project(p.x,p.z).y)<.72,'rift vertically clipped');
  assert(Math.abs(Math.hypot(p.x-player.x,p.z-player.z)-3.2)<1e-7);
  chosen=p;
 }
});
