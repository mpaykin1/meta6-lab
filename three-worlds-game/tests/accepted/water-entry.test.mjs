import {test} from 'node:test';import assert from 'node:assert/strict';import {immersionAt,swimVertical} from '../../stage7-simulation.mjs';
test('A01 real deep-water movement enters populated underwater regime within 360 steps',()=>{
 const sea=3.8,floor=-3,p={pos:{y:sea+.3},vel:{y:0},jumpHeld:false,onGround:false};
 let wet=false,maxStep=0;for(let n=0;n<360;n++){const before=p.pos.y;swimVertical(p,1/60,floor,sea);maxStep=Math.max(maxStep,Math.abs(p.pos.y-before));wet ||= immersionAt(sea,p.pos.y,floor)>.5}
 assert(wet);assert(maxStep<.5);
});