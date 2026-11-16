import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const tests=[
  {name:'desktop',width:1280,height:800,isMobile:false},
  {name:'phone-layout',width:390,height:844,isMobile:true}
];
const base='http://127.0.0.1:8774';
const results=[];
try{
  for(const device of tests) {
    const ctx=await browser.newContext({viewport:{width:device.width,height:device.height},
      isMobile:device.isMobile,hasTouch:device.isMobile,deviceScaleFactor:1});
    const captures=[];
    for(const variant of ['v1','v2']) {
      const page=await ctx.newPage(),errors=[];
      page.on('pageerror',e=>errors.push('exception: '+e.message));
      page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
      page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
      page.on('requestfailed',r=>errors.push('network '+r.url()+' '+r.failure()?.errorText));
      const url=variant==='v1'?base+'/demos/living-watercolor/?ink=robot&palette=color':
        base+'/preview/ink-fallen-guardian-v2/?ink=robot&palette=color';
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
      assert.equal(response?.status(),200,variant+' URL status');
      try {
        await page.waitForFunction(()=>window.__INK_FOREST__?.objects?.includes('robot'),
          null,{timeout:20000});
      }catch(e){
        console.error('INK '+device.name+' '+variant+' initialization errors:',JSON.stringify(errors));
        console.error('INK page body:',(await page.locator('body').innerText()).slice(0,400));
        throw e;
      }
      await page.waitForTimeout(1100);
      const metrics=await page.evaluate(()=>{
        const c=document.querySelector('canvas');
        return {width:c?.width||0,height:c?.height||0,active:window.__INK_FOREST__?.active,
          fps:window.__INK_PREVIEW_METRICS__?.fps??null};
      });
      assert.ok(metrics.width>100 && metrics.height>100,variant+' canvas');
      assert.equal(metrics.active,'robot');
      assert.deepEqual(errors,[],variant+' browser errors');
      const png=PNG.sync.read(await page.screenshot());
      captures.push({png,variant,metrics,page:variant==='v2'?page:null});
      if(variant==='v1')await page.close(); // preserve screenshots, not two heavyweight WebGL loops at once
      console.log('INK '+device.name+' '+variant+' canvas='+metrics.width+'x'+metrics.height+
        ' fps_est='+String(metrics.fps===null?'N/A':metrics.fps.toFixed(1))+' console=0');
    }
    const [one,two]=captures;
    assert.equal(one.png.width,two.png.width);
    assert.equal(one.png.height,two.png.height);
    let diff=0,total=0;
    for(let y=0;y<one.png.height;y+=2)for(let x=0;x<one.png.width;x+=2){
      const i=(y*one.png.width+x)*4;
      const gap=Math.abs(one.png.data[i]-two.png.data[i])+
        Math.abs(one.png.data[i+1]-two.png.data[i+1])+
        Math.abs(one.png.data[i+2]-two.png.data[i+2]);
      if(gap>95)diff++;
      total++;
    }
    const percent=(100*diff/total);
    console.log('INK '+device.name+' still-pose pixel difference = '+percent.toFixed(2)+'%');
    // The renders are animated ink: allow rain/fps noise; large divergences reject.
    assert.ok(percent<18,device.name+' resting silhouette significantly diverged');
    const sample=await two.page.evaluate(()=>{
      const s=window.__INK_GUARDIAN_V2__,q=s.robot.userData.robotV2;
      const before=q.arms[1].shoulderPivot.rotation.x;
      s.update(s.robot,8,.016,null);
      return {before,after:q.arms[1].shoulderPivot.rotation.x,fingers:q.arms[1].fingers.length,
        debrisType:q.debris.type};
    });
    assert.equal(sample.fingers,4);
    assert.equal(sample.debrisType,'Points');
    assert.ok(sample.after<sample.before-.08,'waking shoulder has not raised');
    results.push({device:device.name,diff:percent,fpsEstimate:two.metrics.fps});
    for(const item of captures)if(item.page)await item.page.close();
    await ctx.close();
  }
  console.log('INK_V2_BROWSER_PASS '+JSON.stringify(results));
}finally{await browser.close();}
