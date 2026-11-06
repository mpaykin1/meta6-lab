import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {LANDMARKS,plannedOceanPopulation} from '../ocean-placements.mjs';
import {shoreSeabedHeight,coastalBeachHeight} from '../seabed.mjs';

const required=['galleon','whale_skeleton','anchor','cannon','kraken_tentacle'];
test('7b: original GLBs exist as real binary assets with valid headers',()=>{
 for(const name of required){
  const url=new URL('../models/'+name+'.glb',import.meta.url);
  assert(statSync(url).size>1024,name+' is not a GLB payload');
  const b=readFileSync(url);
  assert.equal(b.toString('ascii',0,4),'glTF',name+' GLB magic');
  assert.equal(b.readUInt32LE(4),2,name+' must be binary glTF v2');
  assert.equal(b.readUInt32LE(8),b.length,name+' GLB declared bytes mismatch');
 }
});
test('7b: galleon, whale, anchor, cannon and cliff tentacles occupy real nearby terrain',()=>{
 const found=new Set(LANDMARKS.map(x=>x[0]));
 for(const name of required)assert(found.has(name),name+' missing from live landmarks');
 const kraken=LANDMARKS.filter(x=>x[0]==='kraken_tentacle');
 assert(kraken.length>=3,'owner tentacle cluster at cliff');
 for(const seed of [1,1337,90210]){
  const floor=(x,z)=>coastalBeachHeight(x,z,seed,1,shoreSeabedHeight(x,z,seed,1));
  const p=plannedOceanPopulation({x:96,z:46},seed,floor,(x)=>x>=64,40);
  for(const name of required)assert(p.named.includes(name),'not in 40m radius: '+seed+' '+name);
 }
});
test('7b: underwater GLSL remains copied from owner example, not invented',()=>{
 const owner=readFileSync(new URL('../../reference/sunken-city/index.html',import.meta.url),'utf8');
 const port=readFileSync(new URL('../sunken-atmosphere.mjs',import.meta.url),'utf8');
 for(const fragment of [
  'pow(1.0 - x, 2.2) * smoothstep(0.0, 0.55, vUv.y)',
  'mod(p - uCam + hb, vec3(uBox, uBox * 0.5, uBox))',
  'gl_PointSize = clamp(uSize * uScale / d, 1.0, 10.0)',
  "drift(1700, 0.045, '#9fb9c4', '#c8e6ea', false, 56)",
  "drift(520, 0.07, '#3fe0d8', '#b07cff', true, 48)"
 ]){assert(owner.includes(fragment),'not in original GLSL: '+fragment);assert(port.includes(fragment),'not ported faithfully: '+fragment);}
 assert(port.includes('scene.add(r)')&&port.includes('scene.add(pts)'),'rays and particles must share the single scene');
 assert(!port.includes('new THREE.WebGLRenderer'),'never construct a second renderer');
});
