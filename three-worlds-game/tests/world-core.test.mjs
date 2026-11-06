import {test} from 'node:test';
import assert from 'node:assert/strict';
import {islandHeight,createHeightSource,ChunkWindow,WorldManager,usesSurfaceTerrain} from '../world-core.mjs';
test('terrain deterministic, negative coordinates and every sampled 16m patch has relief',()=>{
 for(const seed of [1,1337,90210])for(let z=-160;z<=160;z+=16)for(let x=-160;x<=160;x+=16){let lo=Infinity,hi=-Infinity;
  for(let j=0;j<=16;j+=2)for(let i=0;i<=16;i+=2){const y=islandHeight(x+i,z+j,seed);assert.equal(y,islandHeight(x+i,z+j,seed));lo=Math.min(lo,y);hi=Math.max(hi,y)}
  assert(hi-lo>.4,`flat patch ${seed} ${x} ${z}: ${hi-lo}`)
 }
});
test('core preserved and extension continuous at all four boundaries',()=>{const core=(x,z)=>1+x*.01+z*.02,h=createHeightSource(17,core);assert.equal(h(32,32),core(32,32));for(let t=0;t<64;t++)for(const [x,z,a,b] of [[0,t,-.00001,t],[63,t,64,t],[t,0,t,-.00001],[t,63,t,64]])assert(Math.abs(h(x,z)-h(a,b))<.04)});
test('chunk cache traverses four directions with <=25 live allocations including teleports',()=>{let live=0,peak=0;const c=new ChunkWindow({create:(x,z)=>{peak=Math.max(peak,++live);return{x,z}},dispose:()=>--live});for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])for(let n=0;n<12;n++){c.update(dx*n*16,dz*n*16);assert.equal(live,25)}c.update(-9000,9000);assert.equal(peak,25);c.clear();assert.equal(live,0)});
test('world lifecycle, positions and fade are bounded through repeated transitions',async()=>{let count=0;const m=new WorldManager();for(const id of ['island','water'])m.register(id,{init:()=>count++,dispose:()=>count--});await m.enter('island');for(let n=0;n<10;n++){await m.enter(n%2?'island':'water');m.update(.1,{x:n,y:0,z:0});assert.equal(count,1)}assert.equal(m.positions.size,2);assert(m.fade<1);m.dispose();assert.equal(count,0)});

test('surface domain does not suppress seabed outside eastern shore',()=>{
 assert.equal(usesSurfaceTerrain(20,20),true);
 assert.equal(usesSurfaceTerrain(-100,20),true);
 assert.equal(usesSurfaceTerrain(64,20),false);
 assert.equal(usesSurfaceTerrain(80,20),false);
 let wetCells=0;
 for(let x=64;x<88;x++)for(let z=0;z<24;z++)if(!usesSurfaceTerrain(x,z))wetCells++;
 assert.equal(wetCells,576);
});
