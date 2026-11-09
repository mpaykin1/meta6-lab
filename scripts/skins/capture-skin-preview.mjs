#!/usr/bin/env node
import fs from 'node:fs';
import {chromium} from 'playwright';
import sharp from 'sharp';
const BASE='http://127.0.0.1:8765/games/skin-trainer/?skin=../../skins/packs/rusty-robot/';
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
 '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'
]});
const screenshots=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:512,height:640},deviceScaleFactor:1,serviceWorkers:'block'});
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
 async function visit(yaw,name){
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!(window.__SKIN||window.__SKIN_ERROR),undefined,{timeout:45000});
  const result=await page.evaluate(()=>({error:window.__SKIN_ERROR||null,parts:window.__SKIN?.manifest.parts.length||0}));
  if(result.error||result.parts<30)throw Error('Skin not applied '+name+': '+JSON.stringify(result));
  await page.evaluate(()=>document.querySelectorAll('.hint,#fade,#joy').forEach(el=>el.style.display='none'));
  let distance=Math.abs(yaw/.006);
  while(distance>0.1){
   const step=Math.min(165,distance);
   await page.mouse.move(470,310);
   await page.mouse.down();
   await page.mouse.move(470-step,310,{steps:6});
   await page.mouse.up();
   distance-=step;
  }
  await page.waitForTimeout(1900);
  screenshots.push((await page.screenshot({type:'png'})).toString('base64'));
  console.log('Captured '+name+' with '+result.parts+' rigged details');
 }
 await visit(Math.PI,'front');
 await visit(Math.PI/2,'side');
 await visit(0,'back');
 if(errors.length)throw Error('Browser console/page exceptions:\n'+errors.join('\n'));
 const merged=await page.evaluate(async shots=>{
  const width=512,height=640,c=document.createElement('canvas');c.width=width*shots.length;c.height=height;
  const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
  for(let i=0;i<shots.length;i++){
   const im=new Image();im.src='data:image/png;base64,'+shots[i];await im.decode();
   ctx.drawImage(im,i*width,0,width,height);
  }
  return c.toDataURL('image/png').split(',')[1];
 },screenshots);
 await sharp(Buffer.from(merged,'base64')).resize({width:1152,kernel:'nearest'})
  .png({palette:true,colours:96,dither:0,compressionLevel:9,effort:9})
  .toFile('skins/packs/rusty-robot/preview.png');
 console.log('Front / side / back screenshot written; no console errors.');
}finally{await browser.close();}
