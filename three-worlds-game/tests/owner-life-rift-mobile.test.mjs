import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lifePlan,lifeRegion,LAND_ARMORY_IDS} from '../living-population.mjs';
import {frontOfHero,createRiftEvent,RIFT_WORDS,RIFT_PHASES} from '../rift-event.mjs';
import {createCameraRig} from '../camera-rig.mjs';
const ids=LAND_ARMORY_IDS.slice();
test('owner §21.4: twenty original weapon types excluding starter stick; all lands carry three life layers',()=>{
 assert.equal(ids.length,20);assert.equal(new Set(ids).size,20);assert(!ids.includes('stick'));
 for(const seed of [1,1337,90210]){
  const floor=(x,z)=>x>=48&&x<110?5:6;
  for(const [name,x,z] of [['island',20,32],['shore',80,32],['ash',-88,32],['offshore',365,32]]){
   const p=lifePlan(x,z,seed,floor);
   assert(p.region!=='water',name);
   assert(p.npcs.length>=2&&p.enemies.length>=2&&p.weapons.length>=20,name+' empty');
   assert.deepEqual(new Set(p.npcs.map(n=>n.id)),new Set(['scavenger','companion']),'only approved original roles permitted');
   assert.deepEqual(new Set(p.weapons.map(x=>x.id)),new Set(ids),name+' original armory incomplete');
   assert(p.weapons.every(v=>v.y===floor(v.x,v.z)),'floating pickup');
   assert(p.enemies.every(v=>['imp','shade'].includes(v.id)),'nonoriginal enemy');
  }
 }
});
function independentAlignment(pos,look,spot){
 let dx=look.x||0,dz=look.z||0,l=Math.hypot(dx,dz);
 if(l<.001){dx=0;dz=-1;l=1}
 const sx=spot.x-pos.x,sz=spot.z-pos.z,d=Math.hypot(sx,sz);
 return d>1e-9?(sx*dx+sz*dz)/(d*l):0;
}
test('owner §21.5: portal placement is checked against the actual hero-to-portal vector',()=>{
 const hero={x:125,z:-8};
 for(const look of [{x:1,z:0},{x:-1,z:0},{x:0,z:1},{x:2,z:-3}]){
  const p=frontOfHero(hero,look),sx=p.x-hero.x,sz=p.z-hero.z;
  const distance=Math.hypot(sx,sz),lookLength=Math.hypot(look.x,look.z);
  assert(Math.abs(distance-3.2)<.05,'portal distance '+distance);
  const independentlyMeasured=independentAlignment(hero,look,p);
  assert(Math.abs(p.alignment-independentlyMeasured)<1e-9,'reported alignment differs from actual geometry');
  assert(independentlyMeasured>.99999,'portal is not in front of the hero');
  const behind={x:hero.x-look.x/lookLength*2.6,z:hero.z-look.z/lookLength*2.6};
  assert(independentAlignment(hero,look,behind)<-.99999,'alignment measurement accepted a point behind the hero');
  const side={x:hero.x-look.z/lookLength*2.6,z:hero.z+look.x/lookLength*2.6};
  assert(Math.abs(independentAlignment(hero,look,side))<1e-9,'alignment measurement accepted a lateral point');
 }
});
for(const choice of ['help','refuse'])test('owner §21.15: ordered 5+5+5 event and real '+choice+' arc',()=>{
 const e=createRiftEvent(1337,{initial:50,interval:58});
 const args={land:true,battle:false,pos:{x:145,z:32},look:{x:1,z:0}};
 for(let i=0;i<1800&&e.state.phase!=='dialogue';i++)e.step(.1,args);
 assert.equal(e.state.phase,'dialogue');assert(e.blocked);
 assert.deepEqual(e.state.history.slice(0,4),['warning','opening','emerging','dialogue']);
 assert.equal(RIFT_WORDS,'Что происходит?!!!');
 assert(e.choose(choice));assert.equal(e.state.choice,choice);
 if(choice==='help'){assert.equal(e.state.phase,'closing');e.step(5,args);assert.equal(e.state.phase,'escort');}
 else assert.equal(e.state.phase,'boss');
 assert(e.finishArc({kind:choice,world:'ash'}));assert.equal(e.blocked,false);
 assert.equal(e.state.phase,'idle');
 assert.deepEqual(e.state.history.slice(0,6),choice==='help'?
  ['warning','opening','emerging','dialogue','closing','escort']:
  ['warning','opening','emerging','dialogue','boss','idle']);
 e.step(65,args);assert.equal(e.state.phase,'warning');assert.equal(e.state.cycle,1);
});
test('owner §21.15 supersedes §21.5: event starts in battle and underwater',()=>{
 for(const [land,battle] of [[false,false],[true,true],[false,true]]){
  const e=createRiftEvent(9);
  const args={pos:{x:0,z:0},look:{x:0,z:1},land,battle};
  e.step(60,args);assert.equal(e.state.phase,'warning');
 }
 assert.equal(RIFT_PHASES.length,8);
});
test('owner §21.7: canonical single camera module replaces canceled phone deadzone',()=>{
 assert.equal(typeof createCameraRig,'function');
});
