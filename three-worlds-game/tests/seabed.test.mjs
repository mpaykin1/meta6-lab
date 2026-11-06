import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seabedHeight,shoreSeabedHeight,landWithin,coastalBeachHeight} from '../seabed.mjs';
import {immersionAt} from '../stage7-simulation.mjs';
test('D: ocean bed is seeded and has >3m relief within 40m view',()=>{
 for(const seed of [1,1337,90210]){
  const values=[];
  for(let x=70;x<=110;x+=5)for(let z=4;z<=64;z+=5){const y=seabedHeight(x,z,seed);assert(Number.isFinite(y));values.push(y);assert.equal(y,seabedHeight(x,z,seed))}
  assert(Math.max(...values)-Math.min(...values)>3, 'flat seabed '+seed);
 }
});
test('A: boundary floor blends accepted island shore without a step',()=>{
 for(const seed of [1337,2026]){
  const edge=5.2;
  assert(Number.isFinite(shoreSeabedHeight(64,31,seed,edge)));
  assert.equal(shoreSeabedHeight(112,31,seed,edge),seabedHeight(112,31,seed));
  let last=shoreSeabedHeight(64,31,seed,edge);
  for(let x=64.1;x<=86;x+=.1){const y=shoreSeabedHeight(x,31,seed,edge);assert(Math.abs(y-last)<.15,'floor jump at '+x+': '+(y-last));last=y}
 }
});
test('G: emergent island has a walkable surface and underwater approach',()=>{
 for(const seed of [1,1337,90210]){
  assert(seabedHeight(145,32,seed)>3.8,'island must emerge above the sea');
  assert(seabedHeight(72,32,seed)<3.8,'sea approach is passable');
  let maxSlope=0;for(let x=122;x<170;x+=.5){const y=seabedHeight(x,32,seed),next=seabedHeight(x+.5,32,seed);maxSlope=Math.max(maxSlope,Math.abs(next-y)/.5)}
  assert(maxSlope<.6,'island shoreline slope unexpectedly steep '+maxSlope);
 }
});

test('G: distant seeded ocean cells have reachable emergent land',()=>{
 for(const seed of [1,1337,90210])for(const [x,z] of [[500,500],[-400,300],[1200,-900],[145,32]])assert(landWithin(x,z,seed,160),'no reachable land near '+x+','+z);
});

test('A: actual shared east-coast profile enters water gradually x58..76 in 0.5m steps',()=>{
 for(const seed of [1,1337,90210]){
  const edge=1; // Accepted voxel beach rim is one block; browser gate also samples actual generated world.hgt.
  let previous=null,values=[];
  for(let x=58;x<=76;x+=.5){
   const original=x<64?edge:shoreSeabedHeight(x,32,seed,edge);
   const y=coastalBeachHeight(x,32,seed,edge,original);
   const d=immersionAt(3.8,y+1.7,y);
   assert(d>=0&&d<=1);
   if(previous){
    assert(d+1e-9>=previous.d,'depth reversed at x='+x+' seed='+seed);
    assert(Math.abs(d-previous.d)<.15,'depth jump at x='+x);
    assert(Math.abs(y-previous.y)/.5<=Math.tan(Math.PI/9)+.002,'shore steeper than 20 degrees at x='+x);
   }
   values.push(d);previous={y,d};
  }
  assert.equal(values[0],0);assert.equal(values.at(-1),1);
  assert(values.some(v=>v>.1&&v<.4),'no knee transition');
  assert(values.some(v=>v>.55&&v<.9),'no waist transition');
 }
});
