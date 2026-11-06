import {test} from 'node:test';import assert from 'node:assert/strict';import {coastalBeachHeight,shoreSeabedHeight} from '../../seabed.mjs';
test('A07 64–72 x-seam blends original Island height into finite coastal voxel shelf',()=>{
 for(const seed of [1,1337,90210])for(const z of [24.5,32.5,40.5]){
  const edge=1,rows=[];for(let i=0;i<=8;i++){
   const x=64+i,t=i/8,blend=t*t*(3-2*t);
   const base=shoreSeabedHeight(x,z,seed,edge);
   const originalBeach=coastalBeachHeight(x,z,seed,edge,base);
   rows.push(Math.round(edge+(originalBeach-edge)*blend));
  }
  assert.equal(rows[0],edge);
  assert(rows.every(Number.isFinite));
  for(let i=1;i<rows.length;i++)assert(Math.abs(rows[i]-rows[i-1])<=2);
 }
});