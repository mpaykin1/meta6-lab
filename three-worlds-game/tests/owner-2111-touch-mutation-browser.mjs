// Negative live mutation: break the original Island stickId capture in the BUILT game,
// then verify the same real mobile assertion from owner042-044-browser.mjs goes red.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {assertNativeMobileMovement} from './owner-touch-gate.mjs';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const candidates=[...html.matchAll(/\.stickId\s*=\s*([A-Za-z_$][\w$]*)\.pointerId/g)];
assert.equal(candidates.length,1,'expected exactly one original Island stickId capture in compiled game');
const original=candidates[0][0];
const mutated=html.replace(original,original.replace(/=\s*[A-Za-z_$][\w$]*\.pointerId/,'=null'));
assert.notEqual(mutated,html,'mutation must change actual bundled game');
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
 const url='http://127.0.0.1:8765/three-worlds-game/';
 await page.route(url,route=>route.fulfill({status:200,contentType:'text/html',body:mutated}));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__isle?.startGame&&!!window.__isle?.inputPointers,{timeout:25000});
 await page.evaluate(()=>{if(__isle.G.state==='title')__isle.startGame();__isle.killFoes()});
 await page.waitForFunction(()=>__isle.G.state==='play',{timeout:18000});
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:78,y:532,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:119,y:526,id:1}]});
 await page.waitForTimeout(420);
 const observed=await page.evaluate(()=>({input:__isle.inputPointers,drawn:getComputedStyle(document.querySelector('#v7Stick')).display}));
 // The same predicate is used by the positive owner042-044 real-device-emulation gate.
 assert.throws(()=>assertNativeMobileMovement(observed),/joystick|pointer/);
 assert.equal(observed.input.stickId,null,'injected mutation was not exercised');
 assert.equal(observed.drawn,'none','invisible touch overlay must stay invisible');
 console.log('LIVE_TOUCH_MUTATION_KILLED '+JSON.stringify(observed));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}finally{await browser.close()}
