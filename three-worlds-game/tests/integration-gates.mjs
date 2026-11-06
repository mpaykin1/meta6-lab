// Actual browser gates. This file never converts a context failure into PASS.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],network=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
await page.goto(process.env.TEST_BASE||new URL('../index.html',import.meta.url).href);
await page.waitForFunction(()=>window.__isle?.G?.state==='play',{timeout:60000});
const result=await page.evaluate(async()=>{
 const i=window.__isle,paths=[];
 for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]])for(let n=0;n<=4;n++){
  const x=32+dx*n*16,z=32+dz*n*16;i.player.pos.set(x,i.terrainTop(x,z)+.2,z);i.player.vel.set(0,0,0);
  i.terrainWindow().update(x,z);i.underwater.update(.016);
  paths.push({x,z,height:i.terrainTop(x,z),chunks:i.terrainWindow().items.size,memory:i.renderer.info.memory.geometries});
 }
 const inventory=[...i.combat.arsenal],hp=i.player.hp;
 for(const p of i.rifts.portals){i.rifts.travel(p);assertFinite(i.player.pos);}
 function assertFinite(v){if(![v.x,v.y,v.z].every(Number.isFinite))throw Error('Non-finite transition')}
 return {paths,inventory,hp,after:{inventory:[...i.combat.arsenal],hp:i.player.hp},gl:!!i.renderer.getContext(),dimensions:[i.renderer.domElement.width,i.renderer.domElement.height]};
});
assert(result.gl);assert(result.paths.every(x=>x.chunks<=25));assert.deepEqual(result.inventory,result.after.inventory);assert.equal(result.hp,result.after.hp);assert(Math.max(...result.dimensions)<=1080);
// Reset the fixture after chunk teleports/rift traversal. Keep the hero at the known
// traversable spawn area; (46,32) is blocked by the lighthouse collision plinth.
await page.evaluate(()=>{
 const i=window.__isle,x=44.5,z=49.5;
 i.player.pos.set(x,i.terrainTop(x,z)+.2,z);
 i.player.vel.set(0,0,0);
 i.clearInput?.();
 i.terrainWindow().update(x,z);
});
await page.waitForTimeout(500);
const before=await page.evaluate(()=>({canvas:document.querySelector('#c').getBoundingClientRect().toJSON(),pos:__isle.player.pos.toArray(),camera:__isle.camera.position.toArray()}));
const stick=await page.locator('#v7Stick').boundingBox();assert(stick);
const cdp=await context.newCDPSession(page),x=stick.x+stick.width/2,y=stick.y+stick.height/2;
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y},{id:2,x:320,y:280}]});
await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x+25,y:y-20},{id:2,x:345,y:290}]});
await page.waitForTimeout(10000);
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
const after=await page.evaluate(()=>({canvas:document.querySelector('#c').getBoundingClientRect().toJSON(),pos:__isle.player.pos.toArray(),camera:__isle.camera.position.toArray(),scroll:[scrollX,scrollY]}));
assert.deepEqual(before.canvas,after.canvas);assert.deepEqual(after.scroll,[0,0]);
assert(Math.hypot(after.pos[0]-before.pos[0],after.pos[2]-before.pos[2])>0.3,'hero did not move: '+JSON.stringify([before.pos,after.pos]));
assert.notDeepStrictEqual(before.camera,after.camera);
const frameTimes=await page.evaluate(()=>new Promise(resolve=>{const a=[];let last=performance.now();const frame=t=>{a.push(t-last);last=t;if(a.length<120)requestAnimationFrame(frame);else resolve(a.slice(10))};requestAnimationFrame(frame)}));
frameTimes.sort((a,b)=>a-b);const p50=frameTimes[Math.floor(frameTimes.length*.5)],p95=frameTimes[Math.floor(frameTimes.length*.95)];
assert.equal(errors.length,0,errors.join('\n'));assert.equal(network.length,0,'standalone must make no network requests');
await mkdir('three-worlds-game/evidence',{recursive:true});await page.screenshot({path:'three-worlds-game/evidence/integration-mobile.png'});
await writeFile('three-worlds-game/evidence/integration-gates.json',JSON.stringify({environment:'browser emulation, not physical iPhone',...result,before,after,frameTimeMs:{p50,p95},fpsMedian:1000/p50,errors,network},null,2));
await browser.close();
