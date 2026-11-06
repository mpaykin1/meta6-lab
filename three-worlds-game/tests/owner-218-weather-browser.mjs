// Real browser GLSL/scene check for §21.8. No screenshots, no extra canvas.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const logs=[];page.on('console',m=>{if(m.type()==='error')logs.push(m.text())});
 page.on('pageerror',e=>logs.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__isle?.weatherFX?.snapshot&&!!window.__isle?.scene,{timeout:30000});
 await page.evaluate(()=>{if(__isle.G.state==='title')__isle.startGame();__isle.killFoes()});
 const result=[];
 for(const mode of ['rain','snow','ash','embers','spores','stardust','sea_mist']){
  const check=await page.evaluate(async mode=>{
   const i=window.__isle;
   i.weatherFX.select(mode);
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const s=i.weatherFX.snapshot();
   const matches=i.scene.children.filter(o=>o.name==='island-canon-weather-gpu');
   return {kind:s.kind,alpha:s.alpha,shape:s.shape,fall:s.fall,glow:s.glow,
    shader:matches[0]?.material?.type,points:matches[0]?.geometry?.getAttribute('position')?.count,
    count:matches.length,canvases:document.querySelectorAll('canvas').length,
    programs:i.renderer.info.programs?.length||0};
  },mode);
  assert.equal(check.kind,mode,'weather mode ignored');
  assert.equal(check.count,1,'double particle render or weather scene');
  assert(check.points>0,'weather contains no GPU points');
  assert(check.programs>0,'renderer never compiled any programs');
  result.push(check);
 }
 assert.equal(new Set(result.map(o=>o.kind)).size,7,'original owner seven weather profiles not available');
 assert(!logs.some(v=>/shader error|shader.*compile|VALIDATE_STATUS|program.*link/i.test(v)),
  'GLSL compile error: '+logs.join('\n').slice(0,2000));
 console.log('ISLAND_WEATHER_GPU_7_REAL_BROWSER '+JSON.stringify(result));
}finally{await browser.close()}
