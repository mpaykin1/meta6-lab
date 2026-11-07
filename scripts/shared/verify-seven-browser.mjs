import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serve} from '../meta-bot/server.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const srv=await serve(root);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(srv.url+'/meta-games/',{waitUntil:'domcontentloaded'});
 await page.addScriptTag({url:srv.url+'/shared/loader.js'});
 const outcome=await page.evaluate(async()=>{
   const modules=await Promise.all(MetaShared.available.map(id=>MetaShared.use(id)));
   const weather=await MetaShared.use('three-worlds-weather');
   const audio=await MetaShared.use('observer-audio');
   const combat=await MetaShared.use('observer-combat');
   return {ids:MetaShared.available,all:modules.length,
     rain:weather.rainEventAt('island',false,24),
     dry:weather.rainEventAt('island',false,4),
     submerged:weather.worldWeatherAt('water',true,24),
     audio:typeof audio.create,
     combat:typeof combat.create,
     repeated:weather===await MetaShared.use('three-worlds-weather')};
 });
 assert.equal(outcome.all,9);
 assert.equal(outcome.rain,true);
 assert.equal(outcome.dry,false);
 assert.equal(outcome.submerged,'sea_mist');
 assert.equal(outcome.audio,'function');
 assert.equal(outcome.combat,'function');
 assert.equal(outcome.repeated,true);
 assert.deepEqual(errors,[]);
 console.log('SHARED_NINE_BROWSER_PASS',JSON.stringify(outcome));
}finally{await browser.close();srv.close()}
