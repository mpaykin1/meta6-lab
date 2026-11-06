import {test} from 'node:test';import assert from 'node:assert/strict';import {immersionAt,swimVertical} from '../../stage7-simulation.mjs';
test('A02 deep-to-dry return obeys shore floor and never falls through accepted dry land',()=>{
 const sea=3.8,p={pos:{y:2},vel:{y:0},jumpHeld:true,onGround:false};
 for(let j=0;j<300;j++)swimVertical(p,1/60,-3,sea);
 assert(p.pos.y>sea);
 const dryFloor=5;for(let j=0;j<60;j++)swimVertical(p,1/60,dryFloor,sea);
 assert(p.pos.y>=dryFloor+.08);
 assert.equal(immersionAt(sea,p.pos.y,dryFloor),0);
});