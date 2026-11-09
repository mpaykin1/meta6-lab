#!/usr/bin/env node
// Check the PUBLIC Pages version, not localhost or a mocked URL.
import {chromium} from 'playwright';
const URL='https://mpaykin1.github.io/meta6-lab/preview/skin-rusty-robot/games/skin-trainer/?skin=../../skins/packs/rusty-robot/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:512,height:640}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
 if(response?.status()!==200)throw Error('PUBLIC_GAME_HTTP: '+response?.status());
 await page.waitForFunction(()=>!!(window.__SKIN||window.__SKIN_ERROR),undefined,{timeout:45000});
 const state=await page.evaluate(()=>({parts:window.__SKIN?.manifest?.parts?.length||0,error:window.__SKIN_ERROR||null}));
 if(state.parts<30||state.error)throw Error('PUBLIC_SKIN_NOT_APPLIED: '+JSON.stringify(state));
 await page.waitForTimeout(1000);
 if(errors.length)throw Error('PUBLIC_BROWSER_CONSOLE: '+errors.join('; '));
 console.log('PUBLIC SKIN VISIBLE: HTTP 200; '+state.parts+' mounted parts; WebGL running; no console errors; '+URL);
}finally{await browser.close();}
