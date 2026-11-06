import {test} from 'node:test';import assert from 'node:assert/strict';
import {chooseCombatTarget,turnWeaponToward,turnHeroToward,angleToTarget} from '../combat-facing.mjs';
test('owner §21.18: enemy to right, hero walks left but weapon/body aim right within 600 steps',()=>{
 const pos={x:0,z:0},enemies=[
  {id:'right',segs:[{x:8,z:0}],def:{rad:.8},hp:5},
  {id:'far',segs:[{x:0,z:12}],def:{rad:1},hp:10}
 ];
 const alive=e=>e.hp>0;
 let look={x:-1,z:0},target=null,vel={x:0,z:0};
 for(let n=0;n<240;n++){
  vel.x-=.001; // joystick controls movement ONLY
  target=chooseCombatTarget(enemies,target,pos,20,alive);
  look=turnWeaponToward(look,{x:target.segs[0].x-pos.x,z:target.segs[0].z-pos.z},1/60);
 }
 assert.equal(target.id,'right');
 assert(angleToTarget(look,{x:8,z:0})<Math.PI/12,'weapon cannot face enemy while strafing backward');
 assert(vel.x<0,'joystick retreat incorrectly altered by aiming');
 const actual={...look};look=turnHeroToward(look,{x:8,z:0},1/60);
 assert(angleToTarget(look,{x:8,z:0})<Math.PI/12);
 assert(Math.abs(look.x-actual.x)<.1,'inertial turn jumps');
 enemies[0].hp=0;
 target=chooseCombatTarget(enemies,target,pos,20,alive);
 assert.equal(target.id,'far','must immediately retarget surviving enemy');
 for(let n=0;n<120;n++)look=turnWeaponToward(look,{x:0,z:12},1/60);
 assert(angleToTarget(look,{x:0,z:12})<Math.PI/12);
 enemies[1].hp=0;assert.equal(chooseCombatTarget(enemies,target,pos,20,alive),null);
 for(let n=0;n<120;n++)look=turnHeroToward(look,{x:-1,z:0},1/60);
 assert(angleToTarget(look,{x:-1,z:0})<Math.PI/12,'outside combat should resume smooth motion facing');
});
test('§21.18 priority current selected enemy, not reselecting closer until death/out of range',()=>{
 const origin={x:0,z:0},active={segs:[{x:8,z:0}],def:{rad:0},hp:1},
  closer={segs:[{x:3,z:0}],def:{rad:0},hp:1},live=x=>x.hp>0;
 assert.equal(chooseCombatTarget([active,closer],active,origin,12,live),active);
 active.hp=0;assert.equal(chooseCombatTarget([active,closer],active,origin,12,live),closer);
 assert.equal(chooseCombatTarget([closer],null,origin,2,live),null);
});
