import {test} from 'node:test';import assert from 'node:assert/strict';import {createRiftEvent} from '../../rift-event.mjs';
test('A06 owner 5/5/5 guest appears within 600 virtual steps; help/refuse branch genuinely differs',()=>{
 for(const choice of ['help','refuse']){
  const e=createRiftEvent(1337,{initial:50,interval:58});
  const ctx={land:false,battle:true,pos:{x:145,z:32},look:{x:1,z:0}};
  let count=0;while(e.state.phase!=='dialogue'&&count<600){e.step(.14,ctx);count++}
  assert(count<600);assert.equal(e.state.spot.distance,3.2);
  assert.deepEqual(e.state.history.slice(0,4),['warning','opening','emerging','dialogue']);
  assert(e.choose(choice));
  if(choice==='help'){assert.equal(e.state.phase,'closing');e.step(5,ctx);assert.equal(e.state.phase,'escort')}
  else assert.equal(e.state.phase,'boss');
 }
});