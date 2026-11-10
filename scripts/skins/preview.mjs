#!/usr/bin/env node
// META GAMES: три угла героя в настоящем Chrome и сверка с эскизом владельца.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import sharp from 'sharp';
import {chromium} from 'playwright';
const src=path.resolve(process.argv[2]||'skins/sources/rusty-robot');
const id=path.basename(src);
const pack=path.resolve(process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:path.join('skins/packs',id));
const preview=path.join(pack,'preview.png');
const side=path.join(src,'side-by-side.png');
const metaFile=path.join(src,'preview-meta.json');
const fail=message=>{throw Error('ПРЕВЬЮ СКИНА: '+message);};
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function manifest(){
 const file=path.join(pack,'skin.json');
 if(!fs.existsSync(file))fail('нет skin.json');
 const m=JSON.parse(fs.readFileSync(file,'utf8'));
 if(m.source?.sheetSha256!==sha(path.join(src,'parts-sheet.png'))||
    m.source?.tableSha256!==sha(path.join(src,'parts-sheet.md')))fail('ОБМАН: загружен не тот лист деталей');
 for(const [rel,digest] of Object.entries(m.source?.assets||{})){
  const abs=path.resolve(pack,rel);
  if(!abs.startsWith(pack+path.sep)||!fs.existsSync(abs)||sha(abs)!==digest)
   fail('ОБМАН: устаревшая/подменённая часть скина '+rel);
 }
 if(!Object.keys(m.source?.assets||{}).length)fail('нет проверки происхождения изображений');
 return m;
}
async function verify(){
 const m=manifest();
 if(!fs.existsSync(metaFile)||!fs.existsSync(preview)||!fs.existsSync(side))fail('превью отсутствует');
 const meta=JSON.parse(fs.readFileSync(metaFile,'utf8'));
 if(meta.skinSha256!==sha(path.join(pack,'skin.json'))||
 meta.sketchSha256!==sha(path.join(pack,'reference.png'))||
 meta.previewSha256!==sha(preview)||meta.sideSha256!==sha(side)||
 meta.sheetSha256!==m.source.sheetSha256)fail('ОБМАН: скриншоты относятся к другому скину или изменены');
 console.log('ПРЕВЬЮ СКИНА: действительные скриншоты соответствуют текущим исходникам');
}
async function main(){
 if(process.argv.includes('--verify'))return verify();
 const m=manifest(),root=path.resolve('.');
 if(m.parts.length<30)fail('игровой герой получил менее 30 деталей');
 const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 let browser;
 try{
  const url='http://127.0.0.1:8765/games/skin-trainer/?skin=../../skins/packs/'+encodeURIComponent(id)+'/';
  let served=false;
  for(let i=0;i<80;i++){try{const r=await fetch(url);if(r.ok){served=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
  if(!served)fail('локальный сервер игры не запустился');
  browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
   '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:512,height:640},deviceScaleFactor:1,serviceWorkers:'block'});
  const errors=[],screens=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text());});
  for(const [name,yaw] of [['front',Math.PI],['side',Math.PI/2],['back',0]]){
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>Boolean(window.__SKIN||window.__SKIN_ERROR),undefined,{timeout:45000});
   const state=await page.evaluate(()=>({error:window.__SKIN_ERROR||null,parts:window.__SKIN?.manifest.parts?.length||0}));
   if(state.error||state.parts!==m.parts.length)fail('скин не применён ('+name+'): '+JSON.stringify(state));
   await page.evaluate(()=>{
    document.querySelectorAll('.hint,#fade,#joy').forEach(el=>el.style.display='none');
    const cv=document.querySelector('canvas#gl');
    cv.style.transform='scale(1.6)';cv.style.transformOrigin='50% 42%';
   });
   let move=Math.abs(yaw/.006);
   while(move>.1){const dx=Math.min(move,165);await page.mouse.move(470,310);await page.mouse.down();await page.mouse.move(470-dx,310,{steps:6});await page.mouse.up();move-=dx;}
   await page.waitForTimeout(1900);
   const shot=await page.screenshot({type:'png',animations:'disabled'});
   const {data,info}=await sharp(shot).resize(64,80).raw().toBuffer({resolveWithObject:true});
   let lit=0;for(let i=0;i<data.length;i+=info.channels)if(data[i]+data[i+1]+data[i+2]>65)lit++;
   if(lit<80)fail('чёрный экран или неотрисованная игра: '+name);
   screens.push(shot);
  }
  if(errors.length)fail('ошибки консоли Chrome:\n'+errors.join('\n'));
  const joined=await sharp({create:{width:512*3,height:640,channels:4,background:'#111720'}})
    .composite(screens.map((input,i)=>({input,left:i*512,top:0}))).png().toBuffer();
  await sharp(joined).resize(1152,480,{kernel:'nearest'})
    .png({palette:true,colours:96,dither:0,compressionLevel:9,effort:9}).toFile(preview);
  const ref=path.join(pack,'reference.png');
  if(!fs.existsSync(ref))fail('нет оригинального эскиза reference.png');
  const refPic=await sharp(ref).resize(512,640,{fit:'contain',background:'#111720'}).png().toBuffer();
  const compare=await sharp({create:{width:1024,height:640,channels:4,background:'#111720'}})
    .composite([{input:refPic,left:0,top:0},{input:screens[0],left:512,top:0}]).png().toBuffer();
  await sharp(compare).resize(1024,640).png({palette:true,colours:160,dither:0,compressionLevel:9,effort:9}).toFile(side);
  fs.writeFileSync(metaFile,JSON.stringify({
   skinSha256:sha(path.join(pack,'skin.json')),sketchSha256:sha(ref),
   sheetSha256:m.source.sheetSha256,previewSha256:sha(preview),sideSha256:sha(side),views:['front','side','back']
  },null,2)+'\n');
  await verify();
  console.log('ПРЕВЬЮ СКИНА: три угла в Chrome без ошибок и side-by-side по реальному эскизу');
 }finally{if(browser)await browser.close();server.kill('SIGTERM');}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
