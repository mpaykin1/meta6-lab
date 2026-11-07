import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serve} from '../meta-bot/server.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const srv=await serve(root);
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(srv.url+'/meta-games/',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>localStorage.removeItem('meta-games:worlds:v1'));
 await page.reload({waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('a.game').count(),10);
 await page.locator('a.game').first().click();
 await page.waitForURL(/observer-world-en-v7/);
 const stored=await page.evaluate(()=>localStorage.getItem('meta-games:worlds:v1'));
 assert.ok(stored?.includes('observer-world-en-v7'));
 await page.goBack({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('a.game')?.classList.contains('world-visited'));
 assert.equal(await page.locator('a.game.world-visited').count(),1);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PORTAL_VISIT_PERSISTENCE_PASS 390x844: visited world survives reload');
}finally{await browser.close();srv.close()}
