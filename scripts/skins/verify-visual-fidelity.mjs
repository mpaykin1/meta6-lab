#!/usr/bin/env node
// Строгий визуальный gate: технически корректный скин не равен похожему скину.
// Сравниваем детализацию, видимый размер и палитру героя с эскизом.
// Не подменяет визуальную приёмку: при сомнении сборка блокируется.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const src=path.resolve(process.argv[2]||'skins/sources/rusty-robot');
const pack=path.resolve(process.argv[3]||'skins/packs/'+path.basename(src));
const fail=s=>{throw Error('ВИЗУАЛЬНОЕ СООТВЕТСТВИЕ: '+s);};
export function validateArchitecture(manifest,runtime){
 if(!manifest?.parts?.length)fail('нет деталей');
 if(/emissiveMap:emit\|\|map/.test(runtime))fail('авторская текстура ошибочно используется как свечение');
 const solids=manifest.parts.filter(p=>p.layer==='3d');
 for(const p of solids){
  if(p.file&&/textures\/rust\.png/.test(p.file))fail('3D-объём замаскирован шумовой текстурой вместо авторской накладки');
  const art=manifest.parts.find(x=>x.id===p.id+'-front-art');
  if(!art||!art.file?.startsWith('parts/')||art.layer!=='2.5d')
   fail('утрачена исходная художественная накладка '+p.id);
 }
 for(const p of manifest.parts.filter(x=>x.layer==='2.5d'&&x.id.endsWith('-front-art'))){
  if(p.material==='glow')fail('броня ошибочно светится: '+p.id);
 }
 return true;
}
async function measure(file){
 const {data,info}=await sharp(file).resize(256,320,{fit:'contain',background:'#100d18'})
  .removeAlpha().raw().toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height,mask=new Uint8Array(w*h);
 let count=0,minX=w,minY=h,maxX=0,maxY=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*3,r=data[i],g=data[i+1],b=data[i+2];
  // Ржавчина: отделяем объект от холодного фона; яркое свечение учитывается отдельно.
  if(r>g*1.27&&r>b*1.22&&r>70&&g>20){
   mask[y*w+x]=1;count++;minX=Math.min(x,minX);minY=Math.min(y,minY);
   maxX=Math.max(x,maxX);maxY=Math.max(y,maxY);
  }
 }
 if(count<120)fail('не найден оранжевый корпус героя: '+path.basename(file));
 let edges=0,variation=0,pairs=0,bright=0;
 for(let y=minY+1;y<maxY;y++)for(let x=minX+1;x<maxX;x++){
  const k=y*w+x;if(!mask[k])continue;
  const i=k*3,left=(k-1)*3,up=(k-w)*3;
  if(mask[k-1]&&mask[k-w]){
   const d=(Math.abs(data[i]-data[left])+Math.abs(data[i+1]-data[left+1])+
     Math.abs(data[i+2]-data[left+2])+Math.abs(data[i]-data[up])+
     Math.abs(data[i+1]-data[up+1])+Math.abs(data[i+2]-data[up+2]))/6;
   variation+=d;pairs++;if(d>19)edges++;
  }
  if(data[i]>240&&data[i+1]>105)bright++;
 }
 return {width:maxX-minX+1,height:maxY-minY+1,area:count,
  detail:pairs?variation/pairs:0,edges:pairs?edges/pairs:0,
  bright:bright/count};
}
export function assertVisual(reference,render){
 if(render.width<reference.width*.57||render.height<reference.height*.57)
  fail('герой слишком мал относительно эскиза; увеличить модель/камеру');
 if(render.detail<reference.detail*.62)
  fail('потеряны мелкие детали: '+render.detail.toFixed(1)+' вместо '+reference.detail.toFixed(1));
 if(render.edges<reference.edges*.58)
  fail('потеряны шестерёнки/провода/трещины: '+render.edges.toFixed(3)+' вместо '+reference.edges.toFixed(3));
 if(render.bright>.53)
  fail('пересвет уничтожил фактуру: '+Math.round(render.bright*100)+'% корпуса');
 return true;
}
async function main(){
 const manifest=JSON.parse(fs.readFileSync(path.join(pack,'skin.json'),'utf8'));
 const runtime=fs.readFileSync('skins/runtime/skin-runtime.js','utf8');
 validateArchitecture(manifest,runtime);
 const ref=path.join(pack,'reference.png');
 const screenshot=path.join(src,'side-by-side.png');
 if(!fs.existsSync(ref)||!fs.existsSync(screenshot))fail('нет сравнения с эскизом');
 const refStat=await measure(ref);
 // Правая половина сравнения — именно фронтальный скрин Chrome.
 const front=await sharp(screenshot).extract({left:512,top:0,width:512,height:640}).png().toBuffer();
 const tmp=await measure(front);
 assertVisual(refStat,tmp);
 console.log('ВИЗУАЛЬНОЕ СООТВЕТСТВИЕ: OK '+JSON.stringify({reference:refStat,render:tmp}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname))
 main().catch(e=>{console.error(e.message);process.exitCode=1;});
