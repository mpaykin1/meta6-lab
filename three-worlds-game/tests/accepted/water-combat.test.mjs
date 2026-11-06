import {test} from 'node:test';import assert from 'node:assert/strict';import {createIslandInput} from '../../hero-controls.mjs';import {swimVertical} from '../../stage7-simulation.mjs';
test('A10 underwater combat and jump inputs remain responsive in shallow and deep conditions',()=>{
 for(const [sea,floor] of [[3.8,3.4],[3.8,-5]]){
  const G={state:'play'},p={pos:{y:sea-.15},vel:{y:0},jumpHeld:false,jumpBuf:0,onGround:false};
  const input=createIslandInput({getG:()=>G,getPlayer:()=>p,getRig:()=>({yawT:0,pitchT:.5}),getDrag:()=>({t:0}),clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),lerp:(a,b,t)=>a+(b-a)*t});
  input.setAttack('touch',true);input.onJumpPress();
  assert(input.input.atk&&p.jumpHeld&&p.jumpBuf>0);
  let moved=0;for(let i=0;i<120;i++){const before=p.pos.y;swimVertical(p,1/60,floor,sea);moved=Math.max(moved,p.pos.y-before)}
  assert(moved>0);input.setAttack('touch',false);input.onJumpRelease();
  assert(!input.input.atk&&!p.jumpHeld);
 }
});