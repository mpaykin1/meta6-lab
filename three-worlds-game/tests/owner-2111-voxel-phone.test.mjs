import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {voxelHeight,voxelSample,buildGreedyVoxelChunk,oceanEastChunkHasTerrain,EAST_OCEAN_CLIP_X} from '../voxel-terrain.mjs';
import {islandHeight,ashHeight} from '../world-core.mjs';
import {seabedHeight,shoreSeabedHeight,coastalBeachHeight} from '../seabed.mjs';
test('§21.11: 600 seeded Island, Ash, Sunken City cell heights are integers, no fractional mesh corners',()=>{
 for(let t=0;t<600;t++){
  const x=Math.floor(Math.sin(t*13.7)*430),z=Math.floor(Math.cos(t*17.3)*440),seed=[1,1337,90210][t%3];
  for(const fn of [islandHeight,ashHeight,seabedHeight]){
   const h=voxelSample((a,b)=>fn(a,b,seed),x,z);
   assert(Number.isInteger(h),'fractional voxel collision '+x+','+z);
  }
  const s=voxelSample((a,b)=>shoreSeabedHeight(a,b,seed,6),x,z);
  const c=voxelSample((a,b)=>coastalBeachHeight(a,b,seed,5,3),x,z);
  assert(Number.isInteger(s)&&Number.isInteger(c));
 }
});
test('§21.11: fully filled 16x16 cube top merges to ONE quad; hidden internal faces are culled',()=>{
 const a=buildGreedyVoxelChunk(0,0,()=>7);
 assert.equal(a.quads,1);
 assert.equal(a.pos.length/3,4);
 assert(a.heights.every(y=>y===7));
 for(const y of a.pos.filter((_,i)=>i%3===1))assert(Number.isInteger(y));
});
test('§21.11: stair with one-meter elevation change adds ONLY exposed outer walls and greedy top',()=>{
 const h=(x)=>x<8?6:7;
 const a=buildGreedyVoxelChunk(0,0,h);
 assert(a.quads>1&&a.quads<20,'wrong culled geometry count '+a.quads);
 for(let i=0;i<a.pos.length;i++)assert(Number.isInteger(a.pos[i]),'non-cubic coordinate '+i);
 assert(a.normals.every(n=>[-1,0,1].includes(n)));
 assert(a.heights.every(y=>y===6||y===7));
});
test('§21.11: neighboring chunks share exact column elevations, deterministic greedy mesh across revisits',()=>{
 const h=(x,z)=>voxelHeight(5+((x*13+z*7)%11)/3);
 for(const seed of [3,1337])for(let cz=-2;cz<=2;cz++)for(let cx=-2;cx<=2;cx++){
  const src=(x,z)=>h(x+seed,z-seed);
  const a=buildGreedyVoxelChunk(cx,cz,src),b=buildGreedyVoxelChunk(cx,cz,src);
  assert.deepEqual(a,b);
  assert(a.heights.every(Number.isInteger));
  // Reproducibility alone does not prove that real neighbor walls are emitted.
  // The explicit two-chunk top/side seam check below does.
 }
});
test('§21.11 / AUDIT 057: exposed boundary wall exists on taller chunk and is culled on lower chunk',()=>{
 const h=(x)=>x<16?7:4;
 const left=buildGreedyVoxelChunk(0,0,h),right=buildGreedyVoxelChunk(1,0,h);
 assert.equal(left.quads,2,'left chunk needs top and exposed +X wall');
 assert.equal(right.quads,1,'right chunk must not duplicate higher neighbor wall');
 const border=left.pos.filter((_,i)=>left.normals[i]===1&&i%3===0);
 assert(border.includes(16),'positive X wall must terminate at x=16');
});
test('§21.11 / AUDIT 057: 3 seed parameters change the actual height providers and are deterministic',()=>{
 for(const fn of [islandHeight,ashHeight,seabedHeight]){
  const a=[],b=[];
  for(let n=0;n<80;n++){
   const x=n*13.1-390,z=n*19.8-520;
   a.push(voxelSample((u,v)=>fn(u,v,1337),x,z));
   b.push(voxelSample((u,v)=>fn(u,v,90210),x,z));
  }
  assert.deepEqual(a,a.map((_,n)=>voxelSample((u,v)=>fn(u,v,1337),n*13.1-390,n*19.8-520)));
  assert(a.some((v,n)=>v!==b[n]),'two different world seeds generated identical '+fn.name+' terrain');
 }
 const rawFractional=6.4,rounded=voxelSample(()=>rawFractional,68,32);
 assert.notEqual(rawFractional,rounded,'floating-point source must be genuinely quantized');
 assert.equal(rounded,6);
});
test('§21.11 / AUDIT 057: clipped east-ocean overlap renders every column x=64..71 without owner island duplicates',()=>{
 const size=24,cz=1,seeds=[3,1337,90210],z=32;
 assert.equal(EAST_OCEAN_CLIP_X,64);
 assert.equal(oceanEastChunkHasTerrain(1,size),false,'ocean begins too far west');
 assert.equal(oceanEastChunkHasTerrain(2,size),true,'overlap chunk 48..72 was erroneously dropped');
 for(const seed of seeds){
  const height=(x,z)=>seabedHeight(x,z,seed);
  const mesh=buildGreedyVoxelChunk(2,cz,height,{size,clipX:EAST_OCEAN_CLIP_X});
  const tops=[];
  for(let q=0;q<mesh.pos.length;q+=12){
   const nx=mesh.normals[q],ny=mesh.normals[q+1],nz=mesh.normals[q+2];
   const vx=mesh.pos.slice(q,q+12);
   if(ny>.5&&nx===0&&nz===0){
    const xs=[vx[0],vx[3],vx[6],vx[9]],zs=[vx[2],vx[5],vx[8],vx[11]];
    tops.push({left:Math.min(...xs),right:Math.max(...xs),near:Math.min(...zs),far:Math.max(...zs),y:vx[1]});
   }
   // Every emitted vertex must stay in the east ocean. The original Island owns x<64.
   for(let i=q;i<q+12;i+=3)assert(mesh.pos[i]>=64,'clipped ocean leaked mesh vertex x<64');
  }
  assert(tops.length>0,'no east-ocean top faces emitted');
  for(let x=64;x<72;x++){
   const hit=tops.filter(t=>t.left<=x+.5&&x+.5<t.right&&t.near<=z+.5&&z+.5<t.far);
   assert.equal(hit.length,1,'missing or overlapping ocean top at '+x+','+z+' seed '+seed);
   assert(Math.abs(hit[0].y-voxelSample(height,x,z))<=1e-6,'drawn ocean height != physics sample');
  }
 }
});
test('§21.11: original Island joystick is not drawn; interaction is checked by real CDP phone test',()=>{
 const css=readFileSync(new URL('../mobile-controls.css',import.meta.url),'utf8');
 assert(/#v7Stick[^\n]*display:none!important/.test(css));
 assert(/#stick[^\n]*display:none!important/.test(css));
});
test('§21.11: real Ash, Island extension and Sunken City height providers build integer greedy meshes',()=>{
 const providers=[
  ['ash',ashHeight,[[-9,2],[-6,4],[-3,-4]]],
  ['island',islandHeight,[[6,2],[9,7],[-1,2]]],
  ['sunken',seabedHeight,[[11,2],[16,9],[22,-5]]]
 ];
 for(const [name,provider,chunks] of providers)for(const [cx,cz] of chunks){
  const geometry=buildGreedyVoxelChunk(cx,cz,(x,z)=>provider(x,z,1337));
  assert(geometry.quads>0,name+' produced no geometry');
  assert(geometry.pos.length>0&&geometry.indices.length>0);
  assert(geometry.heights.every(Number.isInteger),name+' has fractional heights');
  assert(geometry.pos.every(Number.isInteger),name+' has fractional voxel vertices');
  assert(geometry.normals.every(v=>[-1,0,1].includes(v)),name+' has sloped faces');
  for(let z=0;z<16;z++)for(let x=0;x<16;x++){
   const expected=voxelSample((u,v)=>provider(u,v,1337),cx*16+x,cz*16+z);
   assert.equal(geometry.heights[x+z*16],expected===0?0:expected,name+' collision/mesh diverged at '+x+','+z);
  }
 }
});
