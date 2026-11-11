#!/usr/bin/env node
// Four real headless-Chromium renders + the owner's untouched reference.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import sharp from 'sharp';
const BASE='http://127.0.0.1:8765/games/skin-trainer/?skin=../../skins/packs/rusty-robot/';
const dir='skins/packs/rusty-robot';
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
 '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'
]});
const errors=[], shots=[];
try {
 const page=await browser.newPage({viewport:{width:420,height:570},deviceScaleFactor:1,serviceWorkers:'block'});
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>!!(window.__SKIN||window.__SKIN_ERROR),undefined,{timeout:60000});
 const result=await page.evaluate(()=>{
   if(window.__SKIN_ERROR)throw Error(window.__SKIN_ERROR);
   if(!window.__RUSTY_ROBOT || !window.RustyRobot3D)throw Error('Volumetric model not installed');
   return window.RustyRobot3D.validate(window.THREE,window.__RUSTY_ROBOT);
 });
 if(result.planes||result.sprites||result.contacts<12||result.meshes<35)
   throw Error('Model validation failed: '+JSON.stringify(result));
 console.log('Rusty Robot 3D traversal PASS '+JSON.stringify(result));
 await page.evaluate(()=>{
   document.querySelectorAll('.hint,#fade,#joy').forEach(el=>el.style.display='none');
 });
 for(const [name,yaw] of [['FRONT',Math.PI],['SIDE 90',Math.PI/2],['THREE QUARTER',Math.PI*.75],['BACK',0]]){
   await page.evaluate(a=>window.__SKIN_VIEW(a,.13),yaw);
   await page.waitForTimeout(950);
   await page.evaluate(()=>{
     const r=window.RustyRobot3D.validate(window.THREE,window.__RUSTY_ROBOT);
     if(r.planes||r.sprites)throw Error('Flat model piece after rotation');
   });
   shots.push({name,bytes:await page.screenshot({type:'png'})});
   console.log('Rendered '+name);
 }
 if(errors.length)throw Error('Chromium: '+errors.join('\n'));
 const source='reference/skins/rusty-robot.png';
 if(!fs.existsSync(source))throw Error('Original owner reference missing: '+source);
 const tileW=355,tileH=535,header=36,pad=10;
 const labels=['OWNER SKETCH',...shots.map(s=>s.name)];
 const images=[
  await sharp(source).resize(tileW,tileH,{fit:'contain',background:'#2a2030'}).png().toBuffer(),
  ...await Promise.all(shots.map(s=>sharp(s.bytes).resize(tileW,tileH,{fit:'contain'}).png().toBuffer()))
 ];
 const composite=[];
 for(let i=0;i<images.length;i++){
   const x=i*(tileW+pad);
   composite.push({input:images[i],left:x,top:header});
   const title='<svg xmlns="http://www.w3.org/2000/svg" width="'+tileW+'" height="'+header+'">' +
    '<rect width="100%" height="100%" fill="#2a2030"/>' +
    '<text x="12" y="25" fill="#f0b67d" font-family="sans-serif" font-size="17" font-weight="bold">' +
     labels[i]+'</text></svg>';
   composite.push({input:Buffer.from(title),left:x,top:0});
 }
 const totalW=5*tileW+4*pad;
 await sharp({create:{width:totalW,height:tileH+header,channels:4,background:'#2a2030'}})
  .composite(composite).png({palette:true,colours:160,dither:0,effort:8,compressionLevel:9})
  .toFile(dir+'/stages/3d-check.png');
 // Keep existing preview contract (three views) while displaying the NEW mesh.
 await sharp({create:{width:tileW*3,height:tileH,channels:4,background:'#2a2030'}})
  .composite(shots.filter(s=>s.name!=='THREE QUARTER').map((s,i)=>({
    input:images[1+shots.indexOf(s)],left:i*tileW,top:0
  }))).png({palette:true,colours:128,dither:0,effort:8,compressionLevel:9})
  .toFile(dir+'/preview.png');
 if(process.env.GITHUB_ACTIONS==='true' && process.env.GITHUB_EVENT_NAME==='push') {
   // The existing skin-pack workflow commits what is already staged.
   execFileSync('git',['add',dir+'/stages/3d-check.png',dir+'/preview.png'],{stdio:'inherit'});
 }
 console.log('REAL FOUR-VIEW CHECK: '+dir+'/stages/3d-check.png');
} finally { await browser.close(); }
