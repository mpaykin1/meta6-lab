import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../meta-bot/server.mjs';

const root=new URL('../../',import.meta.url).pathname;
const srv=await serve(root);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  for(const size of [{width:1280,height:720},{width:390,height:844}]){
    const page=await browser.newPage({viewport:size});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto(srv.url+'/demos/patch-pixelfx/',{
      waitUntil:'domcontentloaded'
    });
    assert.equal(response?.status(),200,'PixelFX demo must serve HTTP 200');
    await page.waitForTimeout(650);
    const before=await page.evaluate(()=>{
      const ctx=document.querySelector('#world').getContext('2d');
      const rgba=ctx.getImageData(0,0,640,360).data;
      let colored=0;
      for(let i=0;i<rgba.length;i+=4)
        if(rgba[i]>18 || rgba[i+1]>18 || rgba[i+2]>18)colored++;
      return colored;
    });
    assert.ok(before>5000,'world should have visible multicolor scenery');
    const play=page.locator('#world');
    await play.click({position:{x:320,y:110},force:true});
    await page.waitForTimeout(450);
    const active=await page.evaluate(()=>{
      const canvas=document.querySelector('#vfx');
      const rgba=canvas.getContext('2d').getImageData(0,0,640,360).data;
      let pixels=0;
      for(let i=3;i<rgba.length;i+=4)
        if(rgba[i]>0)pixels++;
      return pixels;
    });
    assert.ok(active>80,'live original PixelFX effects must render onto game canvas');
    assert.deepEqual(errors,[],'no JS runtime errors in PixelFX game');
    console.log('PATCH_BROWSER_PASS',JSON.stringify({viewport:size,worldPixels:before,vfxPixels:active}));
    await page.close();
  }
}finally{
  await browser.close();
  srv.close();
}
