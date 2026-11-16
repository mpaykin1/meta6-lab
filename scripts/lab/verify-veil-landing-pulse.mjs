import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Exercise the actual function extracted from the shipped game, without mocking geometry.
export function verifyLandingPulse(source){
 const match=source.match(/function landingPulse\(player,floor,time\)\{[\s\S]*?\n\}/);
 assert.ok(match,'game must define the real landingPulse function');
 const signal=vm.runInNewContext('('+match[0]+')');
 const flyer={x:3.5,z:-2.5,y:4,ground:false};
 assert.equal(signal({...flyer,ground:true},2,1),null,'no redundant draw on ground');
 assert.equal(signal(flyer,null,1),null,'never signal a void');
 assert.equal(signal(flyer,undefined,1),null,'never signal missing terrain');
 assert.equal(signal({...flyer,y:2.45},2,1),null,'no pulse when nearly touching ground');
 const projected=signal(flyer,2,1);
 assert.ok(projected,'jump over a platform must draw');
 assert.equal(projected.x,flyer.x,'ground marker must follow real X');
 assert.equal(projected.z,flyer.z,'ground marker must follow real Z');
 assert.ok(projected.y>=2&&projected.y<=2.3,'marker must hug the actual surface');
 assert.ok(projected.scale>.18&&projected.scale<=.56,'bounded one-mesh VFX budget');
 const high=signal({...flyer,y:35},2,100);
 assert.ok(high.scale<=.56,'far jumps cannot spawn oversized geometry');
 assert.ok(Number.isFinite(high.angle),'animation angle must stay finite');
 assert.match(source,/if\(!menu&&!won&&!p\.ground\)\{const landing=landingPulse\(p,surface\(p\.x,p\.z\),t\);if\(landing\)draw\(shardMesh,model\(landing\.x,landing\.y,landing\.z,landing\.scale,landing\.angle\)\);\}/,
  'game must render the genuine jump marker only when visible');
 return true;
}
const source=readFileSync(new URL('../../games/veil-terraces/index.html',import.meta.url),'utf8');
verifyLandingPulse(source);
console.log('Veil landing projection PASS: ground, void, altitude, position, draw and VFX budget');
