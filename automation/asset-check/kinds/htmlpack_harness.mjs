// Браузерный измеритель htmlpack/1. Playwright/Chrome взят из scripts/shared/verify-seven-browser.mjs.
// node htmlpack_harness.mjs <reference/index.html> <candidate/index.html>
import {chromium} from 'playwright-core';
import {existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync} from 'node:fs';
import {resolve, join, dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {inflateSync} from 'node:zlib';

const [refPath, packPath] = process.argv.slice(2);
const CAMERA_TOLERANCE=3.5;
const result = {ok: false, reference: null, candidate: null};
const chrome = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => p && existsSync(p));

// PNG (8-bit RGB/RGBA) decoder, без сторонних изображительных библиотек.
function pixels(bin) {
  const b = Buffer.from(bin);
  if (b.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error('Screenshot not PNG');
  let offset = 8, width = 0, height = 0, channels = 4;
  const chunks = [];
  while (offset + 12 <= b.length) {
    const len = b.readUInt32BE(offset), kind = b.toString('ascii', offset + 4, offset + 8);
    const data = b.subarray(offset + 8, offset + 8 + len);
    if (kind === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      channels = data[9] === 2 ? 3 : data[9] === 6 ? 4 : 0;
      if (data[8] !== 8 || !channels || data[12] !== 0) throw Error('PNG format unsupported');
    }
    if (kind === 'IDAT') chunks.push(data);
    offset += len + 12;
    if (kind === 'IEND') break;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * channels;
  const out = Buffer.allocUnsafe(height * stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++], row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[row + x - channels] : 0;
      const c = y ? out[row + x - stride] : 0;
      const d = y && x >= channels ? out[row + x - stride - channels] : 0;
      let v = raw[src++];
      if (filter === 1) v += a;
      else if (filter === 2) v += c;
      else if (filter === 3) v += (a + c) >> 1;
      else if (filter === 4) {
        const p = a + c - d, pa = Math.abs(p - a), pb = Math.abs(p - c), pc = Math.abs(p - d);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? c : d;
      } else if (filter !== 0) throw Error('PNG filter invalid');
      out[row + x] = v & 255;
    }
  }
  return {width, height, channels, data: out};
}
function diff(a, b, threshold = 32) {
  const n = Math.min(a.data.length, b.data.length);
  const s = a.channels, t = b.channels;
  let count = 0, all = 0;
  for (let p = 0; p < a.width * a.height; p += 4) {
    const i = p * s, j = p * t;
    if (i + 2 >= n || j + 2 >= b.data.length) break;
    const d = (Math.abs(a.data[i] - b.data[j]) +
               Math.abs(a.data[i + 1] - b.data[j + 1]) +
               Math.abs(a.data[i + 2] - b.data[j + 2])) / 3;
    if (d > threshold) count++;
    all++;
  }
  return count / Math.max(1, all);
}
// The alpha-like mask is the *changed object pixels*, not the background scene.
// Both accepted reference and candidate use the identical shown/hidden capture path.
function features(on0, on1, off0, off1, fps) {
  const w=on1.width,h=on1.height,c=on1.channels, n=w*h;
  if ([on0,off0,off1].some(x=>x.width!==w||x.height!==h||x.channels!==c))
    throw Error('HP10: mismatched isolation frames');
  const masks=[new Uint8Array(n),new Uint8Array(n)];
  const ons=[on0,on1],offs=[off0,off1];
  const sums=[{x:0,y:0,n:0},{x:0,y:0,n:0}];
  const rgbDistance=(a,ai,b,bi)=>(
    Math.abs(a[ai]-b[bi])+Math.abs(a[ai+1]-b[bi+1])+Math.abs(a[ai+2]-b[bi+2]))/3;
  for(let k=0;k<2;k++){
    const on=ons[k].data,off=offs[k].data;
    for(let y=2;y<h-2;y+=2)for(let x=2;x<w-2;x+=2){
      const p=y*w+x,i=p*c;
      if(rgbDistance(on,i,off,i)<23)continue;
      masks[k][p]=1;sums[k].x+=x;sums[k].y+=y;sums[k].n++;
    }
  }
  const active=masks[1],shown=on1.data;
  const count=sums[1].n;
  if(!count)return {visible:0,detail:0,motion:0,deformation:0,isolated:0,silhouette:0,
    colors:0,fps:Math.round(fps),palette:[0,0,0]};
  const center=[sums[1].x/count,sums[1].y/count];
  const radii=new Float64Array(24),touched=new Uint8Array(24);
  let edgeCount=0,shapeBoundary=0,validMotion=0,motionPixels=0;
  const colors=new Set(),rgbMean=[0,0,0];
  const dx=sums[0].n?2*Math.round(((sums[0].x/sums[0].n)-center[0])/2):0;
  const dy=sums[0].n?2*Math.round(((sums[0].y/sums[0].n)-center[1])/2):0;
  for(let y=2;y<h-2;y+=2)for(let x=2;x<w-2;x+=2){
    const p=y*w+x;if(!active[p])continue;
    const i=p*c,r=shown[i],g=shown[i+1],b=shown[i+2];
    colors.add(((r>>4)<<8)|((g>>4)<<4)|(b>>4));
    rgbMean[0]+=r;rgbMean[1]+=g;rgbMean[2]+=b;
    const neighbors=[p-2,p+2,p-2*w,p+2*w];
    if(neighbors.some(q=>!active[q])){
      shapeBoundary++;
      const phi=Math.atan2(y-center[1],x-center[0]);
      const bin=Math.min(23,Math.floor(((phi+Math.PI)/(2*Math.PI))*24));
      radii[bin]=Math.max(radii[bin],Math.hypot(x-center[0],y-center[1]));
      touched[bin]=1;
    }
    // Count texture edges ONLY where both adjacent samples belong to the object.
    for(const q of [p+2,p+2*w]){
      if(active[q] && rgbDistance(shown,i,shown,q*c)>17)edgeCount++;
    }
    const prevX=x+dx,prevY=y+dy;
    if(prevX>=2&&prevX<w-2&&prevY>=2&&prevY<h-2){
      const prev=prevY*w+prevX;
      if(masks[0][prev]){
        validMotion++;
        if(rgbDistance(on0.data,prev*c,shown,i)>19)motionPixels++;
      }
    }
  }
  // HP12: compare silhouette masks after cancelling motion of the entire object.
  // Pulsating light and color cannot impersonate animation of articulated parts.
  let differentShape=0,unionShape=0;
  for(let y=2;y<h-2;y+=2)for(let x=2;x<w-2;x+=2){
    const now=Boolean(masks[1][y*w+x]);
    const px=x+dx,py=y+dy;
    const before=px>=2&&px<w-2&&py>=2&&py<h-2&&Boolean(masks[0][py*w+px]);
    if(now||before){unionShape++;if(now!==before)differentShape++;}
  }
  const deformation=differentShape/Math.max(1,unionShape);
  const rad=Array.from(radii).filter((v,i)=>touched[i]);
  const avg=rad.reduce((x,y)=>x+y,0)/Math.max(1,rad.length);
  const varR=rad.reduce((x,y)=>x+(y-avg)**2,0)/Math.max(1,rad.length);
  // Regular circles, tori and hexagons have low angular silhouette variation.
  const silhouette=rad.length>=12?Math.sqrt(varR)/Math.max(1,avg):0;
  return {visible:+(count/(n/4)).toFixed(5),
    detail:+(edgeCount/Math.max(1,count*2)).toFixed(5),
    motion:+(motionPixels/Math.max(1,validMotion)).toFixed(5),
    deformation:+deformation.toFixed(5),
    silhouette:+silhouette.toFixed(5),
    colors:colors.size, fps:Math.round(fps),
    isolated:+(count/(n/4)).toFixed(5),
    palette:rgbMean.map(v=>Math.round(v/count)),
    boundary:shapeBoundary};
}

async function textOutsideMenu(page) {
  return page.evaluate(() => [...document.querySelectorAll('body *')].some(el => {
    if (el.closest('#pn') || el.closest('#mb') || el.closest('#err') ||
        ['SCRIPT', 'STYLE', 'CANVAS', 'SVG', 'PATH'].includes(el.tagName) || el.children.length) return false;
    if (!el.textContent.trim()) return false;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity !== 0 &&
           r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 &&
           r.left < innerWidth && r.top < innerHeight;
  }));
}
// Runtime-only copies: the tracked reference HTML is never modified.
function instrumentIsolation(source) {
  const marker='/* ============ РЕНДЕР ============ */';
  if(!source.includes(marker))throw Error('HP10: render insertion point absent');
  const hook=String.raw`
/* ASSET-CHECK ONLY: per-object isolation, never shipped into the reference. */
const __acArch=(tex)=>scene.children.filter(o=>o.material?.uniforms?.map?.value===tex);
const __acAllArch=[texCath,texObelisk,texWall,texAnt,texDome,texCliff,texGate];
const __acGroups={
 sky:[sky],fog:scene.children.filter(o=>o.material?.uniforms?.uSp),
 obelisk:__acArch(texObelisk),walls:__acArch(texWall),
 cathedral:__acArch(texCath),antenna:__acArch(texAnt),
 dome:__acArch(texDome),cliff:__acArch(texCliff),
 rubble:scene.children.filter(o=>o.material?.uniforms?.uFog&&
   o.material?.uniforms?.map&&!__acAllArch.includes(o.material.uniforms.map.value)),
 gate:[gate],hero:[hero],
 cape:hero.children.filter(o=>o.material?.uniforms?.uLen),
 blade:[bladeG,arcM],engine:[engine,trail],
 beast:[beast],mask:[mask],jaws:[beads],tendrils:[beads],
 explosion:[puffs],sparks:[sparks],petals:[petals],
 rain:[rain],dust:[dust],water:[],bokeh:[],post:[]
};
let __acHidden=null;let __acUndo=[];
window.__ISOLATE__=(id,shown)=>{
 const known=Object.prototype.hasOwnProperty.call(__acGroups,id)||
   !!scene.children.find(o=>o.name==='shpili-plus-'+id);
 if(!known)throw Error('HP10: isolation target not found '+id);
 __acHidden=shown?null:id;return true;
};
window.__AC_APPLY__=()=>{
 __acUndo=[];
 if(!__acHidden)return;
 const id=__acHidden;
 const objects=__acGroups[id]||scene.children.filter(o=>o.name==='shpili-plus-'+id);
 for(const o of objects){if(!o)continue;const was=o.visible;o.visible=false;
   __acUndo.push(()=>{o.visible=was});}
 if(id==='water'||id==='bokeh'){
   const u=waterMat.uniforms.uH,old=u.value;u.value=-1;
   __acUndo.push(()=>{u.value=old});
 }
 if(id==='post'){
   for(const key of ['uCA','uGrain','uGlitch','uBloom']){
     const u=finalMat.uniforms[key],old=u.value;u.value=0;
     __acUndo.push(()=>{u.value=old});
   }
 }
};
window.__AC_RESTORE__=()=>{for(const fn of __acUndo)fn();__acUndo=[]};
`;
  source=source.replace(marker,hook+'\n'+marker);
  const clockLine='const dt=Math.min(clock.getDelta(),.05);';
  if(!source.includes(clockLine))throw Error('HP10: clock insertion point absent');
  source=source.replace(clockLine,
    'const dt=window.__AC_FREEZE__?(clock.getDelta(),0):Math.min(clock.getDelta(),.05);');
  const packLine='update(t,dt);SHPILI_PLUS.tick(t,dt);';
  if(source.includes(packLine))source=source.replace(packLine,packLine+'window.__AC_APPLY__();');
  else{
    const refDraw=/update\(t,dt\);(\s*)renderer\.setRenderTarget\(rtA\);/;
    if(!refDraw.test(source))throw Error('HP10: reference render hook absent');
    source=source.replace(refDraw, 'update(t,dt);window.__AC_APPLY__();$1renderer.setRenderTarget(rtA);');
  }
  const outputLine='renderer.setRenderTarget(null);renderer.render(qScene,qCam);';
  if(!source.includes(outputLine))throw Error('HP10: render-restore insertion point absent');
  return source.replace(outputLine,outputLine+'window.__AC_RESTORE__();');
}
async function measure(browser,file){
 const page=await browser.newPage({viewport:{width:640,height:360},deviceScaleFactor:1});
 const report={items:{},errors:[],screen_text:false,previews:{}};
 page.on('pageerror',e=>report.errors.push('pageerror: '+e.message));
 page.on('console',e=>{if(e.type()==='error')report.errors.push('console: '+e.text());});
 try{
  await page.goto(pathToFileURL(resolve(file)).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.__PACK__?.items?.length>0&&!!window.__STATE__&&
    typeof window.__ISOLATE__==='function',{timeout:30000});
  const ids=await page.evaluate(()=>window.__PACK__.items.map(o=>o.id));
  for(const id of ids){
   await page.locator('#mb').click();
   await page.locator('#ls button[data-id="'+id+'"]').click();
   const fixedCamera=await page.evaluate(id=>{
     const asset=window.__PACK__.items.find(item=>item.id===id);
     return asset&&!asset.follow?asset.cam||null:null;
   },id);
   if(fixedCamera){
     await page.waitForFunction(({target,tolerance})=>{
       const p=window.__STATE__().cam;
       return Math.hypot(p[0]-target[0],p[1]-target[1],p[2]-target[2])<tolerance;
     },{target:fixedCamera,tolerance:CAMERA_TOLERANCE},{timeout:4500,polling:80});
   }else await page.waitForTimeout(1000);
   await page.waitForTimeout(100);
   const capture=async()=>{
     await page.evaluate(()=>{window.__AC_FREEZE__=true});
     await page.waitForTimeout(40);
     const png=await page.screenshot({type:'png'});
     const on=pixels(png);
     await page.evaluate(id=>window.__ISOLATE__(id,false),id);
     await page.waitForTimeout(35);
     const off=pixels(await page.screenshot({type:'png'}));
     await page.evaluate(id=>window.__ISOLATE__(id,true),id);
     await page.evaluate(()=>{window.__AC_FREEZE__=false});
     return {on,off,png};
   };
   const first=await capture();
   const fps=await page.evaluate(()=>new Promise(done=>{
     let frames=0,started=performance.now();
     function next(now){frames++;if(now-started>=500)done(frames*1000/(now-started));
     else requestAnimationFrame(next);}requestAnimationFrame(next);
   }));
   const second=await capture();
   report.items[id]=features(first.on,second.on,first.off,second.off,fps);
   const accepted=['hero','beast','gate','obelisk','sky','fog','rain','cathedral'];
   const selected=await page.evaluate(id=>!!window.__PACK__.items.find(it=>it.id===id)?.isNew,id);
   if(selected||accepted.includes(id))report.previews[id]=second.png.toString('base64');
   if(await textOutsideMenu(page))report.screen_text=true;
  }
 }finally{await page.close();}
 return report;
}

// Visual acceptance evidence: each new object next to two accepted reference scenes.
// Rendered by the same headless browser, not synthetic icons or full-screen averages.
async function compareSheet(browser,refShots,packShots,packFile){
  const newIds=Object.keys(packShots).filter(id=>!refShots[id]);
  if(!newIds.length)return;
  const pairs={
   'sable-beast':['beast','hero'],'mask-choir':['beast','hero'],
   'shattered-mast':['obelisk','cathedral'],'bell-spire':['obelisk','cathedral'],
   'gate-bridge':['gate','cathedral'],'dawn-sentinel':['hero','beast'],
   'lantern-moth':['hero','beast'],'mirror-seed':['hero','gate'],
   'echo-keystone':['hero','gate'],'storm-heart':['sky','rain'],
   'silver-squall':['sky','rain'],'mirror-whirlpool':['fog','gate']
  };
  const page=await browser.newPage({viewport:{width:1440,height:920}});
  try{
   const encoded=await page.evaluate(async ({newIds,refShots,packShots,pairs})=>{
    const w=480,h=270,top=33,gap=13,height=(h+top+gap)*newIds.length;
    const canvas=document.createElement('canvas');canvas.width=w*3;canvas.height=height;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#071627';ctx.fillRect(0,0,canvas.width,height);
    const load=async b64=>{
     const img=new Image();img.src='data:image/png;base64,'+b64;
     await img.decode();return img;
    };
    const cache={};
    const paint=async (key,b64,x,y,label)=>{
     if(!b64)return;
     const img=cache[key]||(cache[key]=await load(b64));
     ctx.drawImage(img,x,y+top,w,h);
     ctx.fillStyle='#0d2a44';ctx.fillRect(x,y,w,top);
     ctx.font='bold 17px sans-serif';ctx.fillStyle='#d8f0f6';
     ctx.fillText(label,x+12,y+22,w-20);
    };
    for(let i=0;i<newIds.length;i++){
     const id=newIds[i],y=i*(h+top+gap);
     const pair=pairs[id]||['hero','beast'];
     await paint('r:'+pair[0],refShots[pair[0]],0,y,'Эталон · '+pair[0]);
     await paint('r:'+pair[1],refShots[pair[1]],w,y,'Эталон · '+pair[1]);
     await paint('p:'+id,packShots[id],2*w,y,'Новый · '+id);
    }
    return canvas.toDataURL('image/png').split(',')[1];
   },{newIds,refShots,packShots,pairs});
   const filename=join(dirname(resolve(packFile)),'_check','compare.png');
   mkdirSync(dirname(filename),{recursive:true});
   writeFileSync(filename,Buffer.from(encoded,'base64'));
  }finally{await page.close();}
}
let browser;
try {
  if (!refPath || !packPath) throw Error('usage: harness reference.html pack.html');
  browser = await chromium.launch({headless: true, executablePath: chrome || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--enable-unsafe-swiftshader',
           '--use-gl=angle', '--use-angle=swiftshader']});
  const temp=mkdtempSync(join(tmpdir(),'shpili-isolate-'));
  try {
    const ref=join(temp,'reference.html'),cand=join(temp,'candidate.html');
    writeFileSync(ref,instrumentIsolation(readFileSync(refPath,'utf8')),'utf8');
    writeFileSync(cand,instrumentIsolation(readFileSync(packPath,'utf8')),'utf8');
    result.reference = await measure(browser,ref);
    result.candidate = resolve(refPath) === resolve(packPath) ? result.reference : await measure(browser,cand);
    if(resolve(refPath)!==resolve(packPath))
      await compareSheet(browser,result.reference.previews,result.candidate.previews,packPath);
    delete result.reference.previews;delete result.candidate.previews;
  } finally {rmSync(temp,{recursive:true,force:true});}
  result.ok = true;
} catch (err) {
  result.error = String(err?.stack || err);
} finally {
  if (browser) await browser.close();
}
process.stdout.write(JSON.stringify(result));
process.exitCode = result.ok ? 0 : 1;
