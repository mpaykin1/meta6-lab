import {test} from 'node:test';
import assert from 'node:assert/strict';
import {keeperBubbleScreenPoint,KEEPER_BUBBLE_CSS} from '../keeper-bubble.mjs';
test('§21.25 Keeper .npc-say projected over head stays clickable on phone and desktop',()=>{
 assert.match(KEEPER_BUBBLE_CSS,/\.npc-say\{/);
 assert.match(KEEPER_BUBBLE_CSS,/Pixelify Sans/);
 assert.match(KEEPER_BUBBLE_CSS,/::after/);
 for(const [w,h,bw,bh] of [[390,844,281,190],[900,640,320,180]]){
  for(const [nx,ny] of [[0,0],[-1.4,1.5],[1.4,-1.5],[-.9,.95],[.9,-.95]]){
   const p=keeperBubbleScreenPoint(nx,ny,w,h,bw,bh);
   assert(p.x-bw/2>=5,'dialogue clipped horizontally');
   assert(p.x+bw/2<=w-5,'dialogue clipped horizontally');
   assert(p.y-bh>=15,'choice buttons above visible screen');
   assert(p.y<h-12,'choice buttons beneath visible screen');
  }
 }
});
