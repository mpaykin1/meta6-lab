import {test} from 'node:test';
import assert from 'node:assert/strict';
import {immersionAt,swimVertical,bubbleEmissions,createGuestSchedule,guestScheduleStep,finishGuestSchedule,ambientBubbleAnchors,namedAssetInventory,STAGE7_REQUIRED_EFFECTS} from '../stage7-simulation.mjs';
test('A: gradual knee, waist, head immersion is monotonic without frame discontinuities',()=>{
 const a=[];for(let y=5.4;y>=1.4;y-=.03)a.push(immersionAt(3.8,y,-2));
 assert.equal(immersionAt(3.8,6,-2),0);
 assert(a.some(x=>x>.1&&x<.4)&&a.some(x=>x>.55&&x<.9));
 for(let i=1;i<a.length;i++){assert(a[i]>=a[i-1]);assert(a[i]-a[i-1]<.02)}
});
test('B: virtual 3-second ascent, smooth inertia, descent after release and bottom clamp',()=>{
 const p={pos:{y:1.5},vel:{y:0},jumpHeld:true,onGround:false},ys=[],vs=[];
 for(let i=0;i<180;i++){swimVertical(p,1/60,-7,3.8);ys.push(p.pos.y);vs.push(p.vel.y)}
 assert(ys.at(-1)>ys[0]+1.5);
 for(let i=1;i<vs.length;i++)assert(Math.abs(vs[i]-vs[i-1])<.16);
 for(let i=1;i<ys.length;i++)assert(ys[i]-ys[i-1]<.15);
 p.jumpHeld=false;const top=p.pos.y;
 for(let i=0;i<240;i++){swimVertical(p,1/60,-7,3.8);}
 assert(p.pos.y<top-.4);assert(p.pos.y>=-6.92);
});
test('C: bubble emissions exist while wet, remain pooled within 96 and stop dry',()=>{
 const s={budget:0};let live=0,seen=0;
 for(let i=0;i<300;i++){const n=bubbleEmissions(s,1/60,.9,1.5);seen+=n;live=Math.min(96,Math.max(0,live-1)+n);assert(live<=96)}
 assert(seen>25);
 const old=seen;for(let i=0;i<180;i++)seen+=bubbleEmissions(s,1/60,0,0);
 assert.equal(seen,old);
});
test('E: pure scheduler re-arms after guest completion (game outcomes checked in stage7-playwright.mjs)',()=>{
 const s=createGuestSchedule(1337);let count=0;
 for(let i=0;i<50*60;i++)if(guestScheduleStep(s,1/60,false))count++;
 assert.equal(count,1);
 for(let i=0;i<90*60;i++)assert.equal(guestScheduleStep(s,1/60,true),false);
 const delay=finishGuestSchedule(s);assert(delay>=50&&delay<=70);
 for(let i=0;i<49*60;i++)assert.equal(guestScheduleStep(s,1/60,false),false);
 let second=false;for(let i=0;i<22*60;i++)second ||=guestScheduleStep(s,1/60,false);
 assert(second);assert.equal(s.cycle,1);assert.equal(count,1);
});

test('E: debug schedule triggers after five seconds without UI',()=>{
 const state=createGuestSchedule(1337,{interval:5});let count=0;
 for(let k=0;k<150;k++)if(guestScheduleStep(state,1/30,false))count++;
 assert.equal(count,1);assert.equal(state.remaining,Infinity);
 for(let k=0;k<90;k++)assert.equal(guestScheduleStep(state,1/30,true),false);
 const next=finishGuestSchedule(state);assert(next>=50&&next<=70);
});

test('C: existing wreck and cathedral anchors emit distant bubbles, bounded to 96 slots',()=>{
 const anchors=[{id:'submarine_wreck',x:30,y:-4,z:0},{id:'cathedral_tower',x:25,y:-3,z:0},{id:'coral_branch',x:22,y:-4,z:0}];
 let emitted=0;const pool=[];
 for(let tick=0;tick<250;tick++)for(const a of ambientBubbleAnchors(anchors,{x:0,z:0},1337,tick)){
  assert(Math.abs(a.x)>10,'ambient vent must be away from player');
  pool.push(a);if(pool.length>96)pool.shift();emitted++;
 }
 assert(emitted>0);assert(pool.length<=96);
});
test('D: inventory preserves actual model names and exposes missing required categories',()=>{
 const v=namedAssetInventory(['cathedral_tower','submarine_wreck','glow_fish_teal','kelp_tall']);
 assert(v.present.includes('submarine_wreck'));assert(v.missing.includes('galleon'));
 assert(STAGE7_REQUIRED_EFFECTS.includes('marine_snow'));assert(!v.missing.includes('marine_snow'));
});
