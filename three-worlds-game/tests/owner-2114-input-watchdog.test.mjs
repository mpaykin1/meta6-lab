import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRiftInputGuard} from '../rift-input-guard.mjs';
import {createIslandInput} from '../hero-controls.mjs';

test('owner §21.14(B): 1800 steps; attack, jump and mobile movement always unlock after <=25s',()=>{
 const G={state:'play',riftFrozen:false},player={jumpBuf:0,jumpHeld:false};
 const touch={stickId:17,camId:21,vx:.75,vy:-.3},pad={mx:.4,my:0},keys=new Set(['KeyW']);
 const {input,setAttack,releaseAll,onJumpPress,onJumpRelease}=createIslandInput({
  getG:()=>G,getPlayer:()=>player,getRig:()=>({}),getDrag:()=>({}),
  clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),lerp:(a,b,t)=>a+(b-a)*t
 });
 let resets=0;
 const reset=()=>{
  resets++;keys.clear();touch.stickId=touch.camId=null;
  touch.vx=touch.vy=pad.mx=pad.my=0;onJumpRelease();releaseAll();
 };
 const lock=createRiftInputGuard({timeout:25,resetInput:reset,setFrozen:v=>{G.riftFrozen=v}});
 assert.equal(lock.frozen,false);
 // The original engine's touch, jump and attack sources are real input canonical state.
 onJumpPress();setAttack('touch',true);
 assert(player.jumpBuf>0&&player.jumpHeld&&input.atk&&touch.vx>0);
 lock.set(true);
 assert(G.riftFrozen&&lock.frozen);assert(!input.atk&&!player.jumpHeld);
 assert.equal(touch.stickId,null);assert.equal(touch.camId,null);
 const dt=1/60;
 for(let n=0;n<1800;n++){
  const released=lock.tick(dt);
  if(n<1499)assert(G.riftFrozen,'freeze released before 25 simulated seconds at step '+n);
  if(released){
   assert(n<=1500,'freeze exceeded 25s');
   assert(lock.expired&&!G.riftFrozen);
   assert.equal(touch.vx,0);assert.equal(pad.mx,0);
   assert(!player.jumpHeld&&!input.atk);
   // A second warning callback cannot re-freeze the SAME overlong event.
   assert.equal(lock.set(true),false);
   // Fresh touch, jump and attack must now respond normally.
   touch.vx=-.6;onJumpPress();setAttack('touch',true);
   assert(touch.vx<0&&player.jumpHeld&&input.atk);
   setAttack('touch',false);onJumpRelease();
   break;
  }
 }
 assert.equal(G.riftFrozen,false);assert.equal(lock.elapsed,25);
 lock.set(false);assert.equal(lock.expired,false);
 assert(lock.set(true),'next independent rift is allowed to lock normally');
 lock.set(false);assert(!G.riftFrozen);
 assert(resets>=3,'freeze, fail-safe and completed-event releases must all reset held input');
});
test('owner §21.14(B): freeze uses actual runtime frame delta and releases original input sources',()=>{
 const html=readFileSync(new URL('../index.source.html',import.meta.url),'utf8');
 assert.match(html,/riftInputGuard\.tick\(raw\)/);
 assert.match(html,/onFreeze:\(lock\)=>riftInputGuard\.set\(lock\)/);
 assert.match(html,/keys\.clear\(\);releaseTouchPointers\(\);onJumpRelease\(\);releaseAll\(\)/);
 assert.match(html,/pad\.mx=pad\.my=0/);
 assert.doesNotMatch(html,/onFreeze:\(lock\)=>\{G\.riftFrozen=lock/);
});
