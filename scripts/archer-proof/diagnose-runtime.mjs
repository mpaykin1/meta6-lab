import {chromium} from 'playwright';
import {serve} from '../meta-bot/server.mjs';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const baseline=process.env.ARCHER_BASE_SHA;
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'archer-boot-'));
if(!baseline)throw Error('Missing required Archer baseline SHA');
function run(cmd,args,options={}){
 const out=spawnSync(cmd,args,{cwd:root,maxBuffer:128*1024*1024,...options});
 if(out.error||out.status!==0)throw Error(cmd+' '+args.join(' ')+' failed: '+String(out.stderr));
 return out;
}
try{
 const archive=run('git',['archive',baseline,'games/archer-in-the-fog']);
 const extracted=spawnSync('tar',['-x','-C',temp],{input:archive.stdout});
 if(extracted.status!==0)throw Error('Cannot unpack baseline Archer '+String(extracted.stderr));
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 try{
  for(const [label,folder] of [['baseline',temp],['current',root]]){
   const srv=await serve(folder);
   try{
    const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    try{
     const page=await ctx.newPage(),errors=[],failed=[];
     page.on('pageerror',e=>errors.push(e.message));
     page.on('requestfailed',r=>failed.push(r.url()+': '+r.failure()?.errorText));
     page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+': '+r.url())});
     const response=await page.goto(srv.url+'/games/archer-in-the-fog/',{waitUntil:'load',timeout:20000});
     await page.waitForTimeout(1500);
     const state=await page.evaluate(()=>({
       title:document.title,game:!!window.__A,bot:!!window.__META_BOT__,
       resources:Array.from(document.scripts).map(s=>s.src),
       gameCanvas:!!document.querySelector('canvas#c')
     }));
     console.log('ARCHER_BOOT_DIAG '+JSON.stringify({label,http:response?.status(),...state,errors,failed}));
     if(!state.game||!state.bot)await page.screenshot({path:'.archer-proof/boot-'+label+'.png'}).catch(()=>{});
    }finally{await ctx.close()}
   }finally{srv.close()}
  }
 }finally{await browser.close()}
}finally{fs.rmSync(temp,{recursive:true,force:true})}
