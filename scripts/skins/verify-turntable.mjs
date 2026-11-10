#!/usr/bin/env node
// Actual WebGL proof: 8 views from the public Skin Trainer turntable gallery.
// No cached render can satisfy this gate; a fresh Chromium capture is mandatory.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import sharp from 'sharp';
import {chromium} from 'playwright';
import {LIMITS} from './turntable-thresholds.mjs';
import {inspectGeometry} from './turntable-geometry.mjs';

const source=path.resolve(process.argv[2]||'skins/sources/rusty-robot');
const pack=path.resolve(process.argv[3]&&!process.argv[3].startsWith('--')?
 process.argv[3]:path.join('skins/packs',path.basename(source)));
const noWrite=process.argv.includes('--no-write');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fail=msg=>{throw Error('TURNTABLE FAIL: '+msg);};
function regions(bytes,background){
 const w=256,h=320,mask=new Uint8Array(w*h);
 for(let j=0;j<mask.length;j++){
  const k=j*3;
  const delta=Math.hypot(bytes[k]-background[k],bytes[k+1]-background[k+1],
    bytes[k+2]-background[k+2]);
  mask[j]=delta>20?1:0;
 }
 const seen=new Uint8Array(mask.length),parts=[];
 for(let j=0;j<mask.length;j++){
  if(!mask[j]||seen[j])continue;
  const queue=[j];seen[j]=1;let cursor=0;
  let minX=w,maxX=-1,minY=h,maxY=-1,bright=0;
  while(cursor<queue.length){
   const z=queue[cursor++],x=z%w,y=(z/w)|0,k=z*3;
   minX=Math.min(minX,x);maxX=Math.max(maxX,x);
   minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   if(bytes[k]>175&&bytes[k+1]>90&&bytes[k]>bytes[k+2]*1.3)bright++;
   const n=[x>0?z-1:-1,x+1<w?z+1:-1,y>0?z-w:-1,y+1<h?z+w:-1];
   for(const t of n)if(t>=0&&mask[t]&&!seen[t]){seen[t]=1;queue.push(t);}
  }
  parts.push({pixels:queue,area:queue.length,minX,maxX,minY,maxY,bright:bright/queue.length});
 }
 parts.sort((a,b)=>b.area-a.area);
 return {parts,mask,w,h};
}
function lum(r,g,b){
 const v=[r,g,b].map(x=>{const s=x/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;});
 return .2126*v[0]+.7152*v[1]+.0722*v[2];
}
function torsoWidth(component){
 const lo=component.minY+(component.maxY-component.minY)*.38;
 const hi=component.minY+(component.maxY-component.minY)*.68;
 const rows=new Map();
 for(const p of component.pixels){
  const y=(p/256)|0,x=p%256;
  if(y<lo||y>hi)continue;
  if(!rows.has(y))rows.set(y,[x,x]);
  else{const row=rows.get(y);row[0]=Math.min(row[0],x);row[1]=Math.max(row[1],x);}
 }
 const widths=[...rows.values()].map(x=>x[1]-x[0]+1).sort((a,b)=>b-a);
 return widths[Math.floor(widths.length*.35)]||0;
}
function phash(data,c){
 // 16x16 local grayscale fingerprint; robust to palette shifts.
 const values=[];
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){
  const sx=Math.min(255,Math.round(c.minX+(x+.5)*(c.maxX-c.minX+1)/16));
  const sy=Math.min(319,Math.round(c.minY+(y+.5)*(c.maxY-c.minY+1)/16));
  const k=(sy*256+sx)*3;
  values.push((data[k]*.299+data[k+1]*.587+data[k+2]*.114));
 }
 const mean=values.reduce((a,b)=>a+b,0)/values.length;
 return values.map(v=>v>mean?1:0);
}
function similarity(a,b){
 return a.reduce((n,v,i)=>n+(v===b[i]?1:0),0)/a.length;
}
function outlineFraction(img,main){
 const mask=new Uint8Array(256*320);
 for(const p of main.pixels)mask[p]=1;
 let edge=0,outlined=0;
 for(const p of main.pixels){
  const x=p%256,y=(p/256)|0;
  if(x<5||x>250||y<5||y>314)continue;
  if(mask[p-1]&&mask[p+1]&&mask[p-256]&&mask[p+256])continue;
  edge++;
  let dark=false;
  for(let dy=-4;dy<=4&&!dark;dy++)for(let dx=-4;dx<=4;dx++){
   const xx=x+dx,yy=y+dy;
   if(xx<0||xx>=256||yy<0||yy>=320)continue;
   const k=(yy*256+xx)*3;
   if(Math.abs(img[k]-26)+Math.abs(img[k+1]-15)+Math.abs(img[k+2]-20)<=12){
    dark=true;break;
   }
  }
  if(dark)outlined++;
 }
 return edge?outlined/edge:0;
}
export function inspectImage(bytes,bg,angle,hasEffect){
 const image=regions(bytes,bg);
 const main=image.parts[0];
 if(!main||main.area<250)fail(angle+'°: no character silhouette');
 // Only detached *light-emitting effects* are exempt; separated limbs are not.
 const detached=image.parts.slice(1).filter(c=>
   c.area>=main.area*LIMITS.largeComponentFraction&&
   !(hasEffect&&c.bright>.55&&c.area<main.area*.08));
 if(detached.length)fail(angle+'°: '+(detached.length+1)+' disconnected substantial pieces: '+
  JSON.stringify(image.parts.slice(0,6).map(c=>({area:c.area,box:[c.minX,c.minY,c.maxX,c.maxY],
   bright:+c.bright.toFixed(2)}))));
 let l=0,lb=0;
 for(const p of main.pixels){
  const k=p*3;l+=lum(bytes[k],bytes[k+1],bytes[k+2]);
  lb+=lum(bg[k],bg[k+1],bg[k+2]);
 }
 l/=main.area;lb/=main.area;
 const contrast=(Math.max(l,lb)+.05)/(Math.min(l,lb)+.05);
 if(contrast<LIMITS.silhouetteContrast)fail(angle+'°: contrast '+contrast.toFixed(2)+':1');
 const outline=outlineFraction(bytes,main);
 if(outline<LIMITS.outlineCoverage)fail(angle+'°: black contour only '+(outline*100).toFixed(1)+'%');
 return {angle,torso:torsoWidth(main),contrast:+contrast.toFixed(3),
   outline:+outline.toFixed(3),fingerprint:phash(bytes,main),
   components:detached.length+1};
}
async function raw(buffer){
 return (await sharp(buffer).resize(256,320,{fit:'fill'}).removeAlpha()
  .raw().toBuffer({resolveWithObject:true})).data;
}
async function checkFresh(){
 const table=path.join(source,'turntable-meta.json'),image=path.join(pack,'turntable.png');
 if(!fs.existsSync(table)||!fs.existsSync(image))fail('turntable.png + capture metadata required');
 const meta=JSON.parse(fs.readFileSync(table,'utf8'));
 if(meta.manifest!==sha(path.join(pack,'skin.json'))||meta.image!==sha(image)||
  meta.views?.join(',')!==LIMITS.angles.join(','))fail('cached/stale/fake turntable artifact');
 return meta;
}
async function capture(){
 const manifest=JSON.parse(fs.readFileSync(path.join(pack,'skin.json'),'utf8'));
 inspectGeometry(manifest);
 const root=path.resolve('.');
 if(!pack.startsWith(path.join(root,'skins','packs')+path.sep))
  fail('pack for real trainer must reside under skins/packs');
 const port=8890+Math.floor(Math.random()*400);
 const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],
  {cwd:root,stdio:'ignore'});
 let browser;
 try{
  const relative=path.relative(root,pack).split(path.sep).map(encodeURIComponent).join('/');
  const url='http://127.0.0.1:'+port+'/games/skin-trainer/?skin=../../'+relative+'/&turntable=1';
  let up=false;
  for(let i=0;i<70;i++){
   try{if((await fetch(url)).ok){up=true;break;}}catch{}
   await new Promise(ok=>setTimeout(ok,180));
  }
  if(!up)fail('trainer HTTP server unavailable');
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage',
   '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
   '--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:512,height:640},deviceScaleFactor:1,
   serviceWorkers:'block'});
  const errors=[];
  page.on('pageerror',err=>errors.push(String(err)));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>Boolean(window.__SKIN||window.__SKIN_ERROR),
   undefined,{timeout:50000});
  const loadError=await page.evaluate(()=>window.__SKIN_ERROR||null);
  if(loadError)fail('trainer could not render: '+loadError);
  await page.evaluate(()=>{window.SkinTurntable.setAngle(0);window.SkinTurntable.setVisible(false);});
  await page.waitForTimeout(240);
  const blank=await raw(await page.locator('canvas#gl').screenshot({animations:'disabled'}));
  await page.evaluate(()=>window.SkinTurntable.setVisible(true));
  const images=[],metrics=[];
  const hasEffect=manifest.parts.some(p=>['arc','orb'].includes(p.kind)&&p.material==='glow');
  for(const angle of LIMITS.angles){
   await page.evaluate(degrees=>window.SkinTurntable.setAngle(degrees),angle);
   await page.waitForTimeout(1050);
   const shot=await page.locator('canvas#gl').screenshot({animations:'disabled'});
   const metric=inspectImage(await raw(shot),blank,angle,hasEffect);
   metrics.push(metric);
   images.push(await sharp(shot).resize(256,320,{kernel:'nearest'}).png().toBuffer());
  }
  if(errors.length)fail('JavaScript error in trainer: '+errors.join('; '));
  for(const angle of [90,270]){
   const side=metrics.find(m=>m.angle===angle).torso,front=metrics[0].torso;
   if(!front||side/front<LIMITS.sideTorsoWidth)
    fail(angle+'°: torso width '+side+'/'+front+' < '+LIMITS.sideTorsoWidth);
   if(similarity(metrics[0].fingerprint,metrics.find(m=>m.angle===angle).fingerprint)>
     LIMITS.sideFaceHashSimilarity)
    fail(angle+'°: side perceptual hash duplicates front artwork');
  }
  if(!noWrite){
   const collage=await sharp({create:{width:1024,height:640,channels:4,background:'#111720'}})
    .composite(images.map((input,i)=>({input,left:(i%4)*256,top:Math.floor(i/4)*320})))
    .png({palette:true,colours:128,dither:0,compressionLevel:9}).toBuffer();
   fs.writeFileSync(path.join(pack,'turntable.png'),collage);
   fs.writeFileSync(path.join(source,'turntable-meta.json'),
    JSON.stringify({manifest:sha(path.join(pack,'skin.json')),
     image:sha(path.join(pack,'turntable.png')),views:LIMITS.angles,
     measured:metrics.map(({fingerprint,...rest})=>rest)},null,2)+'\n');
   await checkFresh();
  }
  console.log('TURNTABLE PASS: 8 real Chrome views; width, components, color, contour, hash');
 }finally{if(browser)await browser.close();server.kill('SIGTERM');}
}
try{
 if(process.argv.includes('--verify'))await checkFresh();
 else await capture();
}catch(error){console.error(error.message);process.exitCode=1;}
