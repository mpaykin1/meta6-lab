import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseCombatTarget,turnWeaponToward,turnHeroToward,angleToTarget} from '../../combat-facing.mjs';

// Owner test 5 (2026-10-20), §21.18: already accepted combat-facing
// means walking backward never steals aim from the selected live enemy.
test('A11 accepted combat facing remains aimed at target while retreating for 240 steps',()=>{
 const hero={x:0,z:0},foe={id:'enemy',hp:100,segs:[{x:8,z:0}],def:{rad:.8}};
 const behind={id:'other',hp:100,segs:[{x:0,z:10}],def:{rad:.8}};
 let look={x:-1,z:0},movement={x:-1,z:0},target=null;
 for(let n=0;n<240;n++){
  target=chooseCombatTarget([foe,behind],target,hero,18,x=>x.hp>0,()=>true);
  look=turnWeaponToward(look,{x:target.segs[0].x-hero.x,z:target.segs[0].z-hero.z},1/60);
  assert.equal(movement.x,-1,'aim must not mutate reverse joystick movement');
 }
 assert.equal(target,foe);
 assert(angleToTarget(look,{x:8,z:0})<Math.PI/12,'accepted <15 degree combat aim broken');
 foe.hp=0;target=chooseCombatTarget([foe,behind],target,hero,18,x=>x.hp>0);
 assert.equal(target,behind,'must switch target after death');
 for(let n=0;n<120;n++)look=turnWeaponToward(look,{x:0,z:10},1/60);
 assert(angleToTarget(look,{x:0,z:10})<Math.PI/12);
 behind.hp=0;target=chooseCombatTarget([foe,behind],target,hero,18,x=>x.hp>0);
 assert.equal(target,null);
 for(let n=0;n<120;n++)look=turnHeroToward(look,{x:-1,z:0},1/60);
 assert(angleToTarget(look,{x:-1,z:0})<Math.PI/12,'normal walking direction did not return');
});
