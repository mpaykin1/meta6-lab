#!/usr/bin/env node
// КОНТУР К5: независимые испорченные копии исходного художественного листа.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {spawnSync} from 'node:child_process';
const src=path.resolve(process.argv[2]||'skins/sources/rusty-robot');
const tool=path.resolve('scripts/skins/cut-sheet.mjs');
const sheet=path.join(src,'parts-sheet.png');
const table=path.join(src,'parts-sheet.md');
const palette=JSON.parse(fs.readFileSync(path.resolve('skins/packs',path.basename(src),'skin.json'),'utf8')).palette;
if(!fs.existsSync(sheet)||!fs.existsSync(table))throw Error('ЛОВУШКИ: нет оригинального листа/таблицы');
function run(dir,verify=false){
 const r=spawnSync('node',[tool,dir,...(verify?['--verify']:[])],{encoding:'utf8',maxBuffer:16e6});
 if(r.error)throw r.error;return r;
}
function copy(){
 const dir=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'skin-cut-')),path.basename(src));
 fs.mkdirSync(dir,{recursive:true});
 fs.copyFileSync(sheet,path.join(dir,'parts-sheet.png'));
 fs.copyFileSync(table,path.join(dir,'parts-sheet.md'));
 fs.writeFileSync(path.join(dir,'README.md'),'Одобренная палитра из исходного пакета: '+palette.join(' ')+'\n');
 return dir;
}
const cleanup=dir=>fs.rmSync(path.dirname(dir),{recursive:true,force:true});
function expectedFailure(label,r){
 if(r.status===0||!(r.stderr+r.stdout).includes('НОЖНИЦЫ:'))throw Error('ЛОВУШКА ПРОПУЩЕНА '+label+': '+r.stderr+' '+r.stdout);
 console.log('ЛОВУШКА СРАБОТАЛА: '+label);
}
async function patch(dir,composites){
 const target=path.join(dir,'parts-sheet.png');
 const im=sharp(target),m=await im.metadata();
 const result=await im.ensureAlpha().composite(composites(m.width,m.height)).png().toBuffer();
 fs.writeFileSync(target,result);
}
async function exercise(label,action,{verify=false,baseline=true}={}){
 const dir=copy();
 try {
  if(baseline){
   const r=run(dir);if(r.status!==0)throw Error('Оригинальный лист не прошёл ножницы, нельзя считать ловушки: '+r.stderr);
  }
  await action(dir);
  expectedFailure(label,run(dir,verify));
 } finally {cleanup(dir);}
}
const rectangle=(w,h,x,y,c)=>({input:Buffer.from('<svg width="'+w+'" height="'+h+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/></svg>'),left:0,top:0});
const bbox=async dir=>JSON.parse(fs.readFileSync(path.join(dir,'cut','cut-manifest.json'),'utf8')).parts;
await exercise('не розовый фон',async dir=>{
 await patch(dir,(w,h)=>[rectangle(w,h,0,0,'#004060')]);
},{baseline:false});
await exercise('одна деталь пропала',async dir=>{
 const parts=await bbox(dir),p=parts.find(x=>x.row===2&&x.place===1)||parts[0],r=Array.isArray(p.rect)?p.rect[0]:p.rect;
 await patch(dir,(w,h)=>[{input:Buffer.from('<svg width="'+w+'" height="'+h+'"><rect x="'+Math.max(0,r.x0-2)+'" y="'+Math.max(0,r.y0-2)+'" width="'+(r.x1-r.x0+5)+'" height="'+(r.y1-r.y0+5)+'" fill="#ff00ff"/></svg>'),left:0,top:0}]);
});
await exercise('лишняя деталь или подпись вверху',async dir=>{
 await patch(dir,(w,h)=>[{input:Buffer.from('<svg width="'+w+'" height="'+h+'"><text x="'+Math.round(w*.11)+'" y="'+Math.round(h*.025)+'" font-size="'+Math.round(h*.022)+'" fill="#000000">EXTRA TEXT</text><rect x="'+Math.round(w*.86)+'" y="'+Math.round(h*.03)+'" width="22" height="22" fill="#111111"/></svg>'),left:0,top:0}]);
});
await exercise('устаревшие файлы (обман)',async dir=>{
 const f=path.join(dir,'parts-sheet.png'),img=await sharp(f).png().toBuffer();
 const overlay=await sharp(img).composite([{input:Buffer.from('<svg width="20" height="20"><rect width="20" height="20" fill="#111111"/></svg>'),left:50,top:50}]).png().toBuffer();
 fs.writeFileSync(f,overlay);
},{verify:true});
await exercise('подмена готового вырезанного PNG (обман)',async dir=>{
 const meta=JSON.parse(fs.readFileSync(path.join(dir,'cut','cut-manifest.json'),'utf8'));
 const first=Object.keys(meta.assetHashes)[0];
 fs.writeFileSync(path.join(dir,'cut',first),Buffer.from('old cached image'));
},{verify:true});
await exercise('исчезновение таблицы',async dir=>fs.writeFileSync(path.join(dir,'parts-sheet.md'),'| ряд | место |\n'));
console.log('К5: все 6 сценариев ножниц обнаружены');
