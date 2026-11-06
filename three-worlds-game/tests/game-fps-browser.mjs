// Reproducible actual-game FPS baseline for §15 / graf §27.
// This records CI Chromium + SwiftShader only; it is not physical-iPhone evidence
// and intentionally introduces no performance pass/fail threshold.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';

const root='three-worlds-game/evidence/performance';
const base=process.env.TEST_BASE||'http://127.0.0.1:8765/three-worlds-game/';
const profiles=[
 {name:'desktop-1440x900',viewport:{width:1440,height:900},deviceScaleFactor:1},
 {name:'mobile-emulation-390x844-dpr2',viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}
];
const percentile=(sorted,p)=>sorted[Math.max(0,Math.ceil(sorted.length*p)-1)];
const summarize=deltas=>{
 const frameTimes=[...deltas].sort((a,b)=>a-b);
 const fps=deltas.map(ms=>1000/ms).sort((a,b)=>a-b);
 return {
  frameTimeMs:{
   p50:Number(percentile(frameTimes,.50).toFixed(3)),
   p95:Number(percentile(frameTimes,.95).toFixed(3)),
   max:Number(frameTimes.at(-1).toFixed(3))
  },
  fps:{
   p05:Number(percentile(fps,.05).toFixed(2)),
   p50:Number(percentile(fps,.50).toFixed(2)),
   p95:Number(percentile(fps,.95).toFixed(2))
  }
 };
};
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
 '--enable-unsafe-swiftshader'
]});
const report={
 kind:'ACTUAL_GAME_RAF_BASELINE',
 performancePass:'UNKNOWN - measurement only',
 physicalIPhone:'UNKNOWN - mobile profile is Chromium emulation',
 sampleFrames:240,
 profiles:[]
};
try{
 for(const profile of profiles){
  const {name,...contextOptions}=profile;
  const context=await browser.newContext(contextOptions);
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push('PAGE '+e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE '+m.text());});
   await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>!!window.__isle?.renderer&&!!window.__isle?.startGame,{timeout:30000});
   const scene=await page.evaluate(async()=>{
    const i=window.__isle,p=i.player;
    if(i.G.state==='title')i.startGame();
    i.killFoes();i.clearInput();i.G.fade=1;i.G.todT=i.G.tod=.1;
    const x=44.5,z=49.5,y=i.terrainTop(x,z)+.3;
    p.pos.set(x,y,z);p.vis.copy(p.pos);p.vel.set(0,0,0);p.onGround=false;
    // Warm the exact production game loop and renderer before sampling.
    await new Promise(resolve=>{
     let frames=120;
     const tick=()=>--frames<=0?resolve():requestAnimationFrame(tick);
     requestAnimationFrame(tick);
    });
    const gl=i.renderer.getContext();
    const debug=gl.getExtension('WEBGL_debug_renderer_info');
    return {
     state:i.G.state,position:{x:p.pos.x,y:p.pos.y,z:p.pos.z},
     seed:i.SEED??i.world?.seed??i.G.seed??'UNKNOWN',
     canvasCss:{width:i.renderer.domElement.clientWidth,height:i.renderer.domElement.clientHeight},
     drawingBuffer:{width:gl.drawingBufferWidth,height:gl.drawingBufferHeight},
     gpuVendor:debug?gl.getParameter(debug.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),
     gpuRenderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
     webglVersion:gl.getParameter(gl.VERSION),
     rendererIsOriginalCanvas:i.renderer.domElement===document.querySelector('#c'),
     canvasCount:document.querySelectorAll('canvas').length
    };
   });
   assert.equal(scene.state,'play','game must be running during FPS sample');
   assert(scene.rendererIsOriginalCanvas,'FPS sample must use the original game renderer canvas');
   const deltas=await page.evaluate(sampleFrames=>new Promise(resolve=>{
    const values=[];let previous;
    const tick=now=>{
     if(previous!==undefined)values.push(now-previous);
     previous=now;
     if(values.length>=sampleFrames)resolve(values);
     else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
   }),report.sampleFrames);
   assert.equal(deltas.length,report.sampleFrames,'incomplete RAF sample');
   assert(deltas.every(n=>Number.isFinite(n)&&n>0),'invalid RAF frame time');
   const metrics=summarize(deltas);
   assert(metrics.frameTimeMs.p95>=metrics.frameTimeMs.p50,'invalid frame-time percentiles');
   const screenshot=path.join(root,name+'.png');
   await page.screenshot({path:screenshot,animations:'disabled',timeout:30000});
   assert((await stat(screenshot)).size>7000,'empty FPS evidence screenshot');
   const renderInfo=await page.evaluate(()=>{
    const info=__isle.renderer.info;
    return {
     render:{calls:info.render.calls,triangles:info.render.triangles,points:info.render.points,lines:info.render.lines},
     memory:{geometries:info.memory.geometries,textures:info.memory.textures},
     programs:info.programs?.length||0
    };
   });
   const scaleSweep=[];
   if(name==='desktop-1440x900'){
    for(const scale of [.5,.4,.3]){
     const sample=await page.evaluate(async scale=>{
      const i=__isle;
      i.perf.lock=true;
      i.perf.scale=scale;
      dispatchEvent(new Event('resize'));
      await new Promise(resolve=>{
       let frames=8;
       const tick=()=>--frames<=0?resolve():requestAnimationFrame(tick);
       requestAnimationFrame(tick);
      });
      const deltas=await new Promise(resolve=>{
       const values=[];let previous;
       const tick=now=>{
        if(previous!==undefined)values.push(now-previous);
        previous=now;
        if(values.length>=24)resolve(values);
        else requestAnimationFrame(tick);
       };
       requestAnimationFrame(tick);
      });
      const gl=i.renderer.getContext();
      return {scale,deltas,drawingBuffer:{width:gl.drawingBufferWidth,height:gl.drawingBufferHeight}};
     },scale);
     scaleSweep.push({scale:sample.scale,drawingBuffer:sample.drawingBuffer,metrics:summarize(sample.deltas)});
    }
    await page.evaluate(()=>{__isle.perf.lock=false;});
    for(let i=1;i<scaleSweep.length;i++){
     const prev=scaleSweep[i-1].drawingBuffer,cur=scaleSweep[i].drawingBuffer;
     assert(cur.width*cur.height<prev.width*prev.height,'scale sweep must reduce rendered pixels');
    }
   }
   assert.deepEqual(errors,[],'browser errors during FPS sample: '+errors.join(' | '));
   report.profiles.push({name,scenario:'accepted island test plaza, idle, tod=0.1',scene,metrics,renderInfo,scaleSweep,errors,screenshot});
   console.log('GAME_FPS_PROFILE '+JSON.stringify({name,scene,metrics,renderInfo,scaleSweep}));
  }finally{await context.close();}
 }
 await writeFile(path.join(root,'game-fps-baseline.json'),JSON.stringify(report,null,2)+'\n');
 console.log('GAME_FPS_BASELINE_RECORDED '+JSON.stringify({
  physicalIPhone:report.physicalIPhone,
  profiles:report.profiles.map(({name,scene,metrics})=>({name,resolution:scene.drawingBuffer,metrics}))
 }));
}finally{await browser.close();}
