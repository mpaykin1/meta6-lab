// Independent, real-input browser completion of a freshly generated game candidate.
// No state mutation, test cheats, or skipping scenes. Exit nonzero on any regression.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'../..');
const slug=process.env.GAME_SLUG||'confluence-studio';
if(!/^[a-z][a-z0-9-]{2,35}$/.test(slug))throw Error('Unsafe game slug');
const dir=path.join(root,'meta-games-worlds','generated-'+slug);
const entry=path.join(dir,'index.html');
assert.ok(fs.existsSync(entry),'Candidate game missing');
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage']});
const failures=[];
async function visit(options){
 const context=await browser.newContext(options),page=await context.newPage();
 page.on('pageerror',e=>failures.push('JS '+e.message));
 page.on('console',m=>{if(m.type()==='error')failures.push('console '+m.text())});
 await page.goto(pathToFileURL(entry).href,{waitUntil:'load'});
 await page.waitForFunction(()=>window.__metaGamesState?.().ready,{timeout:30000});
 const state=await page.evaluate(()=>window.__metaGamesState());
 assert.equal(state.webgl2,true);assert.deepEqual(state.errors,[]);
 assert.equal(state.scrollX,0);assert.equal(state.scrollY,0);
 return {context,page,state};
}
try{
 const {context,page,state}=await visit({viewport:{width:1100,height:740}});
 assert.equal(state.total,6,'Generated six-scene contract');
 const rect=await page.locator('#screen').boundingBox();
 await page.keyboard.press('e');
 await page.waitForFunction(()=>window.__metaGamesState().visited===1&&window.__metaGamesState().menu);
 for(let i=0;i<state.total;i++){
   if(i){
     const target=2+6*i;
     await page.keyboard.down('w');
     try{await page.waitForFunction(z=>window.__metaGamesState().z>z-2,target,{timeout:18000})}
     finally{await page.keyboard.up('w')}
     await page.keyboard.press('e');
     await page.waitForFunction(n=>window.__metaGamesState().visited===n,i+1,{timeout:5000});
   }
   let attempts=0;
   while(await page.locator('#menu').isVisible()&&attempts++<12){
     if((await page.locator('#title').textContent())?.includes('THE VAULT'))break;
     await page.locator('#options button').first().click();
     await page.waitForTimeout(50);
   }
   assert.ok(attempts<12,'Scene dialogue stuck');
 }
 await page.waitForFunction(()=>window.__metaGamesState().won,{timeout:5000});
 const won=await page.evaluate(()=>window.__metaGamesState());
 assert.equal(won.visited,6);assert.ok(won.selections>=5);assert.ok(won.ending);
 assert.deepEqual(won.errors,[]);
 assert.deepEqual(await page.locator('#screen').boundingBox(),rect);
 await context.close();
 const mobile=await visit({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const phone=mobile.page;
 assert.equal(await phone.locator('#jump').isVisible(),true);
 assert.equal(await phone.locator('#use').isVisible(),true);
 const before=await phone.evaluate(()=>window.__metaGamesState());
 const session=await mobile.context.newCDPSession(phone);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:85,y:600,id:1},{x:290,y:440,id:2}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:85,y:515,id:1},{x:335,y:420,id:2}]});
 await phone.waitForTimeout(1100);
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const after=await phone.evaluate(()=>window.__metaGamesState());
 assert.ok(Math.hypot(after.x-before.x,after.z-before.z)>.1,'Real mobile movement');
 assert.ok(Math.hypot(after.camera.x-before.camera.x,after.camera.z-before.camera.z)>.1,'Real camera following');
 assert.equal(after.scrollX,0);assert.equal(after.scrollY,0);
 assert.deepEqual(after.errors,[]);
 await mobile.context.close();
 assert.deepEqual(failures,[],'Browser JS errors');
 console.log('GENERATED_GAME_REAL_INPUT_PASS '+slug+' desktop 6/6 scenes; mobile two-touch; WebGL2; no errors');
}finally{await browser.close()}
