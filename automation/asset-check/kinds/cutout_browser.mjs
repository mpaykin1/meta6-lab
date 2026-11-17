// Browser gate for animated original-art cutout games.
// Run: node cutout_browser.mjs /absolute/path/to/asset-pack/index.html
import {chromium} from 'playwright-core';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {inflateSync} from 'node:zlib';

const entry=process.argv[2],out={ok:false,errors:[],facts:{}};
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser']
 .find(x=>x&&existsSync(x));
let browser;
function imageColors(png){
 const bytes=Buffer.from(png),chunks=[];let off=8,w=0,h=0,channels=0;
 if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('screenshot is not PNG');
 while(off+12<=bytes.length){
  const length=bytes.readUInt32BE(off),name=bytes.toString('ascii',off+4,off+8);
  const data=bytes.subarray(off+8,off+8+length);
  if(name==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);
   channels=data[9]===6?4:data[9]===2?3:0;
   if(data[8]!==8||!channels)throw Error('unsupported PNG pixel format');}
  if(name==='IDAT')chunks.push(data);off+=length+12;
  if(name==='IEND')break;
 }
 const raw=inflateSync(Buffer.concat(chunks)), stride=w*channels;
 const pixels=new Uint8Array(stride*h);let pos=0;
 for(let y=0;y<h;y++){
  const type=raw[pos++],row=y*stride;
  for(let x=0;x<stride;x++){
   const left=x>=channels?pixels[row+x-channels]:0;
   const up=y?pixels[row+x-stride]:0;
   const diag=y&&x>=channels?pixels[row+x-stride-channels]:0;
   let n=raw[pos++];
   if(type===1)n+=left;
   if(type===2)n+=up;
   if(type===3)n+=Math.floor((left+up)/2);
   if(type===4){
    const p=left+up-diag,a=Math.abs(p-left),b=Math.abs(p-up),c=Math.abs(p-diag);
    n+=a<=b&&a<=c?left:b<=c?up:diag;
   }
   pixels[row+x]=n&255;
  }
 }
 const colors=new Set();
 for(let i=0;i<pixels.length;i+=Math.max(channels,channels*37)){
  const r=pixels[i]??0,g=pixels[i+1]??0,b=pixels[i+2]??0;
  colors.add(((r>>4)<<8)|((g>>4)<<4)|(b>>4));
 }
 return {width:w,height:h,colors:colors.size};
}
try{
 if(!entry||!existsSync(entry))throw Error('missing pack index.html');
 browser=await chromium.launch({headless:true,executablePath:chrome||undefined,args:[
  '--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader',
  '--use-gl=angle','--use-angle=swiftshader','--allow-file-access-from-files'
 ]});
 const page=await browser.newPage({viewport:{width:960,height:540},deviceScaleFactor:1});
 page.on('pageerror',err=>out.errors.push('JS: '+err.message));
 page.on('console',msg=>{if(msg.type()==='error')out.errors.push('Console: '+msg.text())});
 await page.goto(pathToFileURL(resolve(entry)).href,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>window.__PACK__?.items?.length===26&&
  !!window.__PACK_PROBE__?.assets?.crow&&!!window.__PACK_PROBE__?.assets?.stalker,
  {timeout:20000});
 await page.waitForTimeout(1700);
 const first=imageColors(await page.screenshot({type:'png'}));
 out.facts={...first,entries:await page.evaluate(()=>window.__PACK__.items.length),
  scene:await page.evaluate(()=>({crowParts:window.__PACK_PROBE__.assets.crow.children.length,
   stalkerParts:window.__PACK_PROBE__.assets.stalker.children.length}))};
 if(first.colors<36)out.errors.push('blank or almost empty frame');
 if(out.facts.scene.crowParts<2||out.facts.scene.stalkerParts<2)
  out.errors.push('original artwork did not become hinged cutout sprites');
 await page.keyboard.press('ArrowRight');
 await page.waitForTimeout(1100);
 await page.keyboard.press('ArrowUp');
 const second=imageColors(await page.screenshot({type:'png'}));
 out.facts.second_colors=second.colors;
 if(second.colors<36)out.errors.push('flight scene disappeared after controls');
 await page.close();out.ok=out.errors.length===0;
}catch(error){out.errors.push(String(error?.stack||error));}
finally{if(browser)await browser.close();}
process.stdout.write(JSON.stringify(out));
process.exitCode=out.ok?0:1;
