// Stage 7b code-first browser gate. One actual GPU-emulated scene visit, no long simulation.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:960,height:600}}),errors=[];
const required=['galleon','whale_skeleton','anchor','cannon','kraken_tentacle'];
page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:25000});
 await page.waitForFunction(()=>!!window.__isle?.underwater,{timeout:20000});
 await page.evaluate(()=>{const i=__isle;if(i.G.state==='title')i.startGame();
   i.player.pos.set(96,i.terrainTop(96,46)+.6,46);i.player.vis.copy(i.player.pos);
   i.player.vel.set(0,0,0);i.underwater.update(1/30);
 });
 await page.waitForFunction((required)=>{
  const p=__isle.underwater.population(40);
  return required.every(id=>p.present.includes(id));
 },required,{timeout:18000,polling:100});
 const evidence=await page.evaluate(()=>{
  const u=__isle.underwater;
  const shaders=__isle.scene.children.filter(o=>o.isPoints&&o.material?.uniforms?.uCam);
  const rays=__isle.scene.children.filter(o=>o.isMesh&&o.material?.uniforms?.uTime&&o.geometry?.type==='PlaneGeometry'&&o.renderOrder===20);
  return {models:u.population(40),atmosphere:u.atmosphericEffects,
   shaderParticleClouds:shaders.length,rayMeshCount:rays.length,
   visible:shaders.every(p=>p.visible),oneRenderer:!!__isle.renderer};
 });
 for(const name of required)assert(evidence.models.present.includes(name),name+' must load a real GLB');
 assert.deepEqual(evidence.atmosphere,{rays:9,marineSnow:1700,plankton:520});
 assert.equal(evidence.shaderParticleClouds,2);
 assert.equal(evidence.rayMeshCount,9);
 assert(evidence.visible,'marine snow and plankton should be active while submerged');
 assert(evidence.oneRenderer);
 evidence.honest_missing={
  ownerGLB:evidence.models.missing,
  ownerGLSL:[],
  verifiedShaders:['sun_rays','marine_snow','plankton']
 };
 assert.deepEqual(evidence.honest_missing.ownerGLB,[],'required owner GLBs not all loaded');
 assert.deepEqual(errors,[],'uncaught browser JS errors');
 evidence.result='CODE_GATES_OK; OWNER_PASS_UNKNOWN; PHYSICAL_GPU_UNKNOWN';
 await mkdir('three-worlds-game/evidence',{recursive:true});
 await writeFile('three-worlds-game/evidence/stage7b-browser.json',JSON.stringify(evidence,null,2));
 console.log('STAGE_7B_BROWSER_SUCCESS '+JSON.stringify({loaded:required,atmosphere:evidence.atmosphere}));
}finally{await browser.close()}
