import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:[
  '--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--disable-web-security'
]});
try{
  for(const v of [{name:'desktop',width:1366,height:768,mobile:false},
    {name:'phone',width:390,height:844,mobile:true}]){
    const context=await browser.newContext({viewport:{width:v.width,height:v.height},
      hasTouch:v.mobile,isMobile:v.mobile,deviceScaleFactor:1});
    const page=await context.newPage(),errors=[],failed=[];
    page.on('pageerror',e=>errors.push(e.stack||e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('requestfailed',r=>failed.push(r.url()+': '+r.failure()?.errorText));
    const response=await page.goto('http://127.0.0.1:8779/preview/ink-watercolor-train/index.html?view=train&palette=color',{waitUntil:'domcontentloaded',timeout:60000});
    assert.equal(response.status(),200);
    await page.waitForFunction(()=>window.__INK_TRAIN__?.stats?.().renderedFrames>=2,null,{timeout:90000});
    const state=await page.evaluate(()=>{
      const t=window.__INK_TRAIN__,c=document.querySelector('canvas');
      let meshes=0;
      if(t)meshes=t.stats().meshes;
      return {ready:t?.ready||false,stats:t?.stats?.(),canvas:c?{width:c.width,height:c.height}:null,
        webgl:c?.getContext('webgl2')!==null,meshes};
    });
    console.log('TRAIN_BROWSER '+v.name+' '+JSON.stringify({state,errors,failed}));
    assert.deepEqual(failed,[],'network asset requests');
    assert.deepEqual(errors,[],'browser console errors');
    assert.ok(state.ready,'train model loaded');
    assert.ok(state.meshes>100,'train should have actual volumetric meshes');
    assert.ok(state.stats.renderedFrames>=2,'actual WebGL frame updates required');
    await context.close();
  }
} finally{await browser.close();}
