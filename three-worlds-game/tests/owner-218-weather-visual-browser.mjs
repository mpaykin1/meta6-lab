// §21.8 / Claude REVIEW 054: actual Chromium + SwiftShader raster and screenshot evidence.
// Debug-only explicit selection of all seven canonical Island presets; gameplay still
// auto-selects ONLY sea_mist (island) and ash (Ash). This test wires no new events/UI.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';

const root='three-worlds-game/evidence/weather-visual';
const base=process.env.TEST_BASE||'http://127.0.0.1:8765/three-worlds-game/';
const names=['rain','snow','ash','embers','spores','stardust','sea_mist'];
const profiles=[
 {name:'desktop',viewport:{width:1100,height:700},deviceScaleFactor:1},
 {name:'mobile',viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}
];
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
 '--enable-unsafe-swiftshader'
]});
const report={kind:'REAL_CHROMIUM_WEBGL_PIXEL_PROOF',ownerPass:'UNKNOWN',
 original86Events:'MISSING - PROVENANCE GAP OPEN',browser:'Chromium SwiftShader (not physical iPhone)',
 screenshots:[],profiles:[]};
try {
 for(const profile of profiles){
  const {name:profileName,...browserOptions}=profile;
  const context=await browser.newContext(browserOptions);
  try {
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push('PAGE '+e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE '+m.text());});
   await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>!!window.__isle?.weatherFX?.snapshot&&
    !!window.__isle?.renderer&&!!window.__isle?.startGame,{timeout:30000});
   await page.evaluate(()=>{
    const i=window.__isle;
    if(i.G.state==='title')i.startGame();
    i.killFoes();
    i.G.fade=1;
   });
   await page.waitForFunction(()=>__isle.G.state==='play'&&!__isle.underwater.isSubmerged(),{timeout:18000});
   // The game itself and its original single composer/RAF remain running.
   const initial=await page.evaluate(()=>({
    rendererIsCanvas:__isle.renderer.domElement===document.querySelector('#c'),
    weatherObjects:__isle.scene.children.filter(o=>o.name==='island-canon-weather-gpu').length,
    canvasCount:document.querySelectorAll('canvas').length,
    scroll:[scrollX,scrollY],kind:__isle.weatherFX.snapshot().kind,
    rendererPrograms:__isle.renderer.info.programs?.length||0,
    hiddenStick:!document.querySelector('#v7Stick')||getComputedStyle(document.querySelector('#v7Stick')).display==='none'
   }));
   assert(initial.rendererIsCanvas&&initial.weatherObjects===1,'unexpected scene/renderer duplication');
   assert.equal(initial.kind,'sea_mist','island must auto-select only canonical sea_mist');
   assert.deepEqual(initial.scroll,[0,0],'weather visual changed mobile viewport');
   if(profile.isMobile)assert(initial.hiddenStick,'visual test must not show native stick');
   const samples=[];
   for(const name of names){
    // Two real animation frames ensure the game has applied original shader uniforms.
    await page.evaluate(name=>{
     __isle.weatherFX.select(name);
     return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    },name);
    // Pixel causality: render the SAME still scene with weather OFF then ON using
    // the EXISTING THREE.WebGLRenderer; read back actual GPU fragment outputs.
    // No second scene, canvas, renderer, fake HTML precipitation, or synthetic image.
    const pixels=await page.evaluate(name=>{
     const i=window.__isle,gl=i.renderer.getContext();
     const weather=i.scene.children.filter(o=>o.name==='island-canon-weather-gpu');
     if(weather.length!==1)throw Error('weather points must exist exactly once');
     const points=weather[0],width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
     if(width<100||height<100)throw Error('no drawable WebGL surface');
     const draw=visible=>{
      points.visible=visible;
      i.renderer.setRenderTarget(null);
      i.renderer.render(i.scene,i.camera);
      const rgba=new Uint8Array(width*height*4);
      gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
      const error=gl.getError();
      if(error!==gl.NO_ERROR)throw Error('WebGL error '+error+' mode='+name);
      return rgba;
     };
     const off=draw(false),on=draw(true);
     points.visible=true;
     let changed=0,energy=0,opaque=0;
     for(let n=0;n<off.length;n+=4){
      const delta=Math.max(Math.abs(on[n]-off[n]),Math.abs(on[n+1]-off[n+1]),
       Math.abs(on[n+2]-off[n+2]));
      if(delta>=4){changed++;energy+=delta;}
      if(on[n]>3||on[n+1]>3||on[n+2]>3)opaque++;
     }
     return {name,changedPixels:changed,averageDelta:changed?energy/changed:0,
      litPixels:opaque,width,height,points:points.geometry.getAttribute('position').count,
      shader:points.material.type,visible:points.visible,programs:i.renderer.info.programs?.length||0,
      selected:i.weatherFX.snapshot().kind,canvasCount:document.querySelectorAll('canvas').length};
    },name);
    assert.equal(pixels.selected,name,'requested mode was not actually selected');
    assert(pixels.points>0&&pixels.shader==='ShaderMaterial'&&pixels.programs>0,
     'the original scene did not compile or draw the weather GLSL');
    assert(pixels.changedPixels>=24,
     'rasterized weather not visible (off/on actual framebuffer): '+JSON.stringify(pixels));
    assert(pixels.litPixels>pixels.width*pixels.height*.02,'empty or black rendered frame');
    assert.equal(pixels.canvasCount,initial.canvasCount,'test introduced a canvas');
    const file=path.join(root,profile.name+'-'+name+'.png');
    // Capture the live gameplay frame through Playwright, including the SAME FX,
    // with original post-processing; screenshots are never generated from mock canvas.
    await page.screenshot({path:file,animations:'disabled',timeout:30000});
    const meta=await stat(file);
    assert(meta.size>7000,'empty screenshot: '+file);
    report.screenshots.push({file,bytes:meta.size,profile:profile.name,mode:name});
    samples.push(pixels);
   }
   // Return to normal automatic weather; no production gameplay event was added.
   const restored=await page.evaluate(async()=>{
    __isle.weatherFX.select(null);
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return __isle.weatherFX.snapshot().kind;
   });
   assert.equal(restored,'sea_mist','debug weather selection could not be released');
   assert.deepEqual(await page.evaluate(()=>[scrollX,scrollY]),[0,0]);
   assert.deepEqual(errors.filter(e=>/shader|compile|link|VALIDATE_STATUS|WebGL|PAGE /i.test(e)),[],
    'browser / GLSL console failures');
   // Surface all browser errors in evidence, not only shader-related errors.
   assert.deepEqual(errors,[],'browser errors: '+errors.join(' | '));
   report.profiles.push({profile:profile.name,initial,restored,samples,errors});
  }finally{await context.close();}
 }
 await writeFile(path.join(root,'manifest.json'),JSON.stringify(report,null,2)+'\n');
 console.log('WEATHER_VISUAL_PIXEL_SCREENSHOTS_PASS '+JSON.stringify({
  modes:names,files:report.screenshots.map(x=>x.file),
  minPixelChanges:Math.min(...report.profiles.flatMap(p=>p.samples.map(s=>s.changedPixels))),
  original86Events:report.original86Events,ownerPass:'UNKNOWN'}));
}finally{await browser.close();}
