import {test} from 'node:test';import assert from 'node:assert/strict';
import {createIslandInput} from '../../hero-controls.mjs';import {createRiftInputGuard} from '../../rift-input-guard.mjs';
test('A04 original mobile jump/attack release, 25s guard in 500 steps',()=>{
 const G={state:'play'},p={jumpHeld:false,jumpBuf:0},rig={yawT:0,pitchT:.6},drag={t:0,vy:0,vp:0};
 const input=createIslandInput({getG:()=>G,getPlayer:()=>p,getRig:()=>rig,getDrag:()=>drag,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),lerp:(a,b,t)=>a+(b-a)*t});
 input.onJumpPress();input.setAttack('touch',true);assert(p.jumpHeld&&input.input.atk);
 let frozen=false;const guard=createRiftInputGuard({timeout:25,setFrozen:b=>{frozen=b},resetInput:()=>{input.onJumpRelease();input.releaseAll()}});
 guard.set(true);for(let n=0;n<500;n++)guard.tick(.05);
 assert.equal(frozen,false);assert.equal(input.input.atk,false);assert.equal(p.jumpHeld,false);
 input.onJumpPress();input.setAttack('touch',true);assert(p.jumpHeld&&input.input.atk);
});