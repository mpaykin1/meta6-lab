import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createHeightSource} from '../world-core.mjs';
test('western ash route is traversable with non-flat terrain and exact source factory excludes viewer',()=>{const h=createHeightSource(1337,()=>1);let lo=Infinity,hi=-Infinity;for(let x=-180;x<-64;x++){const y=h(x,32);lo=Math.min(lo,y);hi=Math.max(hi,y);assert(y>3.8,'ash should remain dry');assert(Math.abs(h(x+1,32)-y)<1.5,'walkable step')}assert(hi-lo>2);const s=readFileSync(new URL('../ash-assets.mjs',import.meta.url),'utf8');assert(s.includes("S('wall_ruin'"));assert(!s.includes('new THREE.WebGLRenderer'));assert(!s.includes('requestAnimationFrame'));assert(!s.includes('getElementById'));});

import {ashWeight,syncAshFog} from '../ash-world.mjs';
test('audit 055: scene fog and shared shader uniform stay equal on Island → Ash → Island',()=>{
 const base=.005,scene={fog:{density:base}},uniform={value:base};
 for(const x of [24,12,-48,-80,-120,-75,-43,12,30]){
  // Original Island applyPalette runs first in every frame.
  scene.fog.density=base;uniform.value=base;
  const weight=ashWeight(x);
  syncAshFog(scene,uniform,weight);
  const expected=Math.max(base,.016*weight);
  assert.equal(scene.fog.density,expected,'Ash fog source density at x='+x);
  assert.equal(uniform.value,scene.fog.density,'rendered fog diverged from scene at x='+x);
 }
 // Underwater: Ash effect is disabled even when x is on Ash land.
 scene.fog.density=base;uniform.value=base;syncAshFog(scene,uniform,0);
 assert.equal(scene.fog.density,base);assert.equal(uniform.value,base);
 const html=readFileSync(new URL('../index.source.html',import.meta.url),'utf8');
 assert.match(html,/createAshWorld\(\{THREE,scene,player,terrainHeight:terrainTop,skyU,fogUniform:U\.fogD/);
});
