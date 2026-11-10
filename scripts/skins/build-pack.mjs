#!/usr/bin/env node
// META GAMES: сборка skin.json исключительно из нового cut-manifest и листа деталей.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import sharp from 'sharp';
const src=path.resolve(process.argv[2]||'skins/sources/rusty-robot');
const id=path.basename(src),cut=path.join(src,'cut'),target=path.resolve(process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:path.join('skins/packs',id));
const finish=process.argv.includes('--finalize');
const fail=m=>{throw Error('СБОРКА СКИНА: '+m);};
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const boneOf={'голова':'head','тело':'body','левая рука':'armL','правая рука':'armR','левая нога':'legL','правая нога':'legR','над головой':'head'};
function kindOf(n) {
 n=n.toLowerCase();
 if(/провод/.test(n))return 'cable';
 if(/разряд|дуга|искр/.test(n))return 'arc';
 if(/глаз|линз/.test(n))return 'lens';
 if(/шестерн/.test(n))return 'gear';
 if(/провод/.test(n))return 'cable';
 if(/огонёк|точка/.test(n))return 'orb';
 if(/щел/.test(n))return 'slit';
 if(/колба/.test(n))return 'core';
 if(/поршн|механик|труб/.test(n))return 'piston';
 if(/^нагрудник/.test(n))return 'plate';
 if(/заклёп/.test(n))return 'bolt';
 if(/полос|панел/.test(n))return 'panel';
 return 'plate';
}
function layerOf(e,k) {
 const full = (e.row===1&&e.place===1)||
 (e.row===2&&e.place===1)||
 (e.row===4&&[1,2,5,6].includes(e.place));
 if(full)return '3d';
 if(['arc','orb','slit','core'].includes(k) || e.motion==='светится')return '2d';
 return '2.5d';
}
function pose(e,k,index,variant=0){
 const bone=boneOf[e.bone],name=e.name.toLowerCase();
 let size=[.20,.20],offset=[0,0,-.29],dims;
 if(bone==='head'){
   if(k==='plate'){size=[.72,.68];offset=[0,0,-.02];dims=[.74,.72,.74];}
   else if(k==='lens'){size=[.20,.20];offset=[-.10,.09,-.36];}
   else if(k==='gear'){size=[.22,.22];offset=[.16,-.02,-.32];}
   else if(e.bone==='над головой'){size=[.10,.10];offset=[(e.place-7)*.04,.67-(e.place-6)*.13,-.05];}
   else {size=[.18,.28];offset=[k==='cable'?.23:-.2,-.22,-.26];}
 }else if(bone==='body'){
   if(k==='plate'){size=[.64,.74];offset=[0,.06,-.04];dims=[.62,.77,.68];}
   else if(k==='core'){size=[.18,.30];offset=[0,.03,-.36];}
   else if(k==='slit'){size=[.26,.22];offset=[-.14,.17,-.365];}
   else if(k==='gear'){size=[.26,.26];offset=[.15,.16,-.35];}
   else if(k==='piston'){size=[.34,.32];offset=[.02,.03,-.34];}
   else if(k==='bolt'){size=[.07,.07];offset=[(e.place%2?-.16:.16),(e.place<10?.18:-.2),.32];}
   else if(e.row===3&&e.place===1){size=[.32,.30];offset=[-.11,-.2,-.37];}
   else {size=[.42,.27];offset=[.10,-.26,-.37];}
 }else if(bone==='armL'||bone==='armR'){
   const sign=bone==='armL'?-1:1;
   if(e.row===3){size=[.31,.22];offset=[0,-.02,-.12];}
   else if(e.row===4 && /предплеч/.test(name)){size=[.23,.51];offset=[sign*.015,-.27,-.025];dims=[.22,.52,.36];}
   else if(k==='arc'){size=[.28,.28];offset=[sign*(.05+variant*.025),-.48+variant*.025,-.25];}
   else if(k==='cable'){size=[.16,.36];offset=[sign*.09,-.27,-.17];}
   else {size=[.16,.16];offset=[0,-.03,-.20];}
 }else if(bone==='legL'||bone==='legR'){
   if(k==='slit'||e.motion==='светится'){size=[.12,.23];offset=[0,-.36,-.16];}
   else {size=[.25,.58];offset=[0,-.30,-.015];dims=[.24,.58,.38];}
 }
 if(variant)offset=[offset[0]+variant*.025,offset[1]+variant*.025,offset[2]-variant*.006];
 return {size,offset,dims};
}
function animation(e,k,i){
 const freq=Number((.18+i*.037).toFixed(4)),phase=Number((((i*29)%101)/101).toFixed(5));
 const common={freq,phase,speedLink:i%3===0?.65:0,pulseLink:i%4===0?.42:0};
 if(e.motion==='кадры')return [{type:'flipbook',frames:8,fps:8+i%5,duty:.45,...common,pulseLink:.8}];
 if(e.motion==='светится')return [{type:'pulse',amp:.13,...common,pulseLink:.65}];
 if(e.motion==='вращается')return [{type:'rotate',axis:'z',amp:.07,...common,speedLink:.7}];
 if(e.motion==='качается'){
   if(k==='cable')return [{type:'chain',amp:.06,segments:4,lag:.6,...common,speedLink:.6}];
   return [{type:'swing',amp:.07,inertia:.2,...common,speedLink:.6}];
 }
 // Пассивное покачивание бронепластин и механических элементов на движущемся герое.
 if(['gear','piston'].includes(k))return [{type:'rotate',axis:'z',amp:.025,...common,speedLink:.45}];
 if(k==='cable')return [{type:'chain',amp:.035,segments:4,lag:.5,...common,speedLink:.4}];
 return [{type:'swing',amp:.012,...common,speedLink:.3}];
}
function assertSource(meta){
 const md=fs.readFileSync(path.join(src,'parts-sheet.md'),'utf8');
 const table=md.split(/\r?\n/).map(line=>line.split('|').slice(1,-1).map(x=>x.trim()))
  .filter(c=>c.length>=5&&/^\d+$/.test(c[0])&&/^\d+$/.test(c[1]))
  .map(c=>({row:+c[0],place:+c[1],name:c[2],bone:c[3],motion:c[4]}))
  .sort((a,b)=>a.row-b.row||a.place-b.place);
 if(meta.parts?.length!==table.length||table.some((e,i)=>Object.keys(e).some(k=>meta.parts[i]?.[k]!==e[k])))
   fail('ОБМАН: список вырезанных деталей не соответствует parts-sheet.md');
 const colours=[...new Set([...md.matchAll(/#[a-fA-F0-9]{6}\b/g)].map(m=>m[0].toLowerCase()))];
 const readme=path.join(src,'README.md');
 if(colours.length<6&&fs.existsSync(readme))colours.push(...[...fs.readFileSync(readme,'utf8').matchAll(/#[a-fA-F0-9]{6}\b/g)].map(m=>m[0].toLowerCase()));
 const approved=path.resolve('skins/packs',id,'skin.json');
 if(colours.length<6&&fs.existsSync(approved))colours.push(...JSON.parse(fs.readFileSync(approved,'utf8')).palette.map(x=>x.toLowerCase()));
 if(meta.palette.join('|')!==[...new Set(colours)].join('|'))
   fail('ОБМАН: палитра вырезок отличается от источника');
 if(meta.format!=='meta6-cut/1'||meta.sourceSheetSha256!==sha(path.join(src,'parts-sheet.png'))||
 meta.sourceTableSha256!==sha(path.join(src,'parts-sheet.md')))fail('ОБМАН: лист или таблица изменены после ножниц');
 for(const [f,digest] of Object.entries(meta.assetHashes||{})){
  const p=path.resolve(cut,f);
  if(!p.startsWith(cut+path.sep)||!fs.existsSync(p)||sha(p)!==digest)fail('ОБМАН: чужая или старая деталь '+f);
 }
 if(!Object.keys(meta.assetHashes||{}).length||!Array.isArray(meta.parts)||meta.parts.length<1)fail('нет настоящих вырезок');
}
function addPart(e,file,i,variant=0){
 const k=kindOf(e.name),layer=layerOf(e,k),bone=boneOf[e.bone],pos=pose(e,k,i,variant);
 const result={id:'part-'+String(i).padStart(2,'0')+(variant?'-'+variant:''),kind:k,layer,bone,file,
   size:pos.size,pivot:bone.startsWith('leg')||bone.startsWith('arm')?[.5,1]:[.5,.5],
   offset:pos.offset,rotation:[0,0,0],depth:k==='cable'?4:3,
   material: e.motion==='светится'||e.motion==='кадры'?'glow':layer==='3d'?'metal':'rust-transparent',
   anim:animation(e,k,i)};
 if(layer==='3d'){result.primitive=k==='plate'&&bone==='head'?'sphere':'box';result.dims=pos.dims||[.22,.35,.2];}
 return result;
}
function runValidator(args){
 const r=spawnSync('node',[path.resolve('scripts/skins/validate-skin-pack.mjs'),target,...args],{encoding:'utf8',maxBuffer:8e6});
 if(r.status!==0)fail('валидатор: '+r.stdout+r.stderr);
 console.log(r.stdout.trim());
}
async function buildFlipbook(frames,destination){
 if(frames.length<6)fail('нужны как минимум 6 разных кадров разряда');
 const tiles=frames.map(f=>path.join(cut,f));
 while(tiles.length<8)tiles.push(tiles[tiles.length%frames.length]);
 const composites=[],signatures=[];
 for(let i=0;i<8;i++){
  const flip=i>=frames.length;
  const im=sharp(tiles[i]);
  const raw=await (flip?im.flop():im).resize(32,32,{kernel:'nearest'}).ensureAlpha().raw().toBuffer();
  const hash=crypto.createHash('sha256').update(raw).digest('hex');
  if(signatures.includes(hash))fail('кадры разряда одинаковые, нельзя собирать флипбук '+i);
  signatures.push(hash);
  const png=await sharp(raw,{raw:{width:32,height:32,channels:4}}).png({palette:false}).toBuffer();
  composites.push({input:png,left:i*32,top:0});
 }
 await sharp({create:{width:256,height:32,channels:4,background:'#00000000'}}).composite(composites)
   .png({palette:false}).toFile(destination);
}

const VOLUMES={
 body:{dims:[.74,.94,.70],offset:[0,.05,0]},
 head:{dims:[.82,.82,.82],offset:[0,0,0]},
 armL:{dims:[.34,.74,.42],offset:[.075,-.24,0]},
 armR:{dims:[.34,.74,.42],offset:[-.075,-.24,0]},
 legL:{dims:[.32,.74,.43],offset:[0,-.32,0]},
 legR:{dims:[.32,.74,.43],offset:[0,-.32,0]}
};
async function bakeFaces(tmp,bone,source,palette){
 const {data,info}=await sharp(path.join(tmp,source)).resize(64,64,{kernel:'nearest',fit:'contain',
  background:'#00000000'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const tones=palette.map(hex=>[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)));
 const nearest=rgb=>tones.reduce((a,c)=>Math.hypot(...c.map((v,i)=>v-rgb[i]))<
  Math.hypot(...a.map((v,i)=>v-rgb[i]))?c:a,tones[0]);
 const tone=(rgb,f)=>nearest(rgb.map(v=>Math.max(0,Math.min(255,Math.round(v*f)))));
 // Transparent borders are NOT the material: choose the actual opaque outline
 // nearest the left/right edge; fall back to a strong warm midtone, not black.
 const fall=tones.find(x=>x[0]>=200&&x[0]<=240&&x[0]>x[1]*1.45)||
  tones.reduce((a,c)=>c[0]>a[0]&&c[0]<235?c:a,tones[0]);
 const black=tones[1]||tones[0],rivet=tones.at(-3)||tones.at(-1);
 function coloredEdge(y,right,depthX){
  let first=null,at=0;
  for(let x=right?63:0;right?x>=0:x<64;right?x--:x++){
   const k=(y*64+x)*info.channels;
   if(data[k+3]>128){
    const rgb=[data[k],data[k+1],data[k+2]];
    if(rgb[0]>80&&rgb[0]>rgb[1]*1.2){first=rgb;at=x;break;}
   }
  }
  if(!first)return fall;
  // Extrude a narrow strip from the owner's edge, never the full front image.
  // Retain painted rust wear and scratches rather than a flat brown swatch.
  const inset=Math.min(12,Math.floor(depthX*.18)+Math.floor(y/7)%3);
  const x=Math.max(0,Math.min(63,at+(right?-inset:inset)));
  const k=(y*64+x)*info.channels;
  const sample=data[k+3]>128&&data[k]>80&&data[k]>data[k+1]*1.2?
   [data[k],data[k+1],data[k+2]]:first;
  return sample.map((v,i)=>Math.round(v*.72+first[i]*.18+fall[i]*.10));
 }
 const faces={};
 for(const [face,factor,edge] of [['right',.75,63],['left',1.15,0],['top',1.15,0],
   ['bottom',.75,63],['back',.9,0],['front',1.55,63]]){
  const dst=Buffer.alloc(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
   const srcRgb=coloredEdge(y,face==='right'||(face==='back'&&y%2===0),x);
   let rgb=tone(srcRgb,(x%11===0&&y%9>3)?factor*.85:factor);
   // AO at mechanical joints, a dark side seam, pale upper lip, rivets.
   if(y>=59||y<=1||x<=1||x>=62||((face==='left'||face==='right'||face==='back')&&x===5))rgb=black;
   if(y===2&&x>2&&x<62)rgb=tone(srcRgb,1.15);
   if((face==='left'||face==='right'||face==='back')&&(x===3||x===60)&&
       [10,23,36,49].some(yy=>Math.abs(yy-y)<=1))rgb=rivet;
   const out=(y*64+x)*4;dst[out]=rgb[0];dst[out+1]=rgb[1];dst[out+2]=rgb[2];dst[out+3]=255;
  }
  const rel='textures/volume-'+bone+'-'+face+'.png';
  await sharp(dst,{raw:{width:64,height:64,channels:4}}).png({palette:false}).toFile(path.join(tmp,rel));
  faces[face]=rel;
 }
 return faces;
}

async function bakeSpherePanorama(tmp,faces){
 // True 360-degree painted material: preserve six independently baked surfaces.
 // SphereGeometry U positions: left 0, back .25, right .50, front .75.
 const strips=[];
 for(const [index,face] of ['left','back','right','front'].entries()){
  const input=await sharp(path.join(tmp,faces[face])).resize(64,64,{kernel:'nearest'}).png().toBuffer();
  strips.push({input,left:index*64,top:32});
 }
 for(const [face,top] of [['top',0],['bottom',96]]){
  const input=await sharp(path.join(tmp,faces[face])).resize(256,32,{kernel:'nearest'}).png().toBuffer();
  strips.push({input,left:0,top});
 }
 const rel='textures/volume-head-panorama.png';
 await sharp({create:{width:256,height:128,channels:4,background:'#1a0f14'}})
  .composite(strips).png({palette:false}).toFile(path.join(tmp,rel));
 return rel;
}

async function main(){
 if(finish){
  if(!fs.existsSync(path.join(target,'preview.png'))||!fs.existsSync(path.join(target,'turntable.png')))
    fail('нет настоящего Chrome-превью и листа turntable.png; ZIP запрещён');
  const m=JSON.parse(fs.readFileSync(path.join(target,'skin.json'),'utf8'));
  const turnMeta=path.join(src,'turntable-meta.json');
  if(!fs.existsSync(turnMeta))fail('нет подтверждённых восьми ракурсов Chrome');
  const capture=JSON.parse(fs.readFileSync(turnMeta,'utf8'));
  if(capture.manifest!==sha(path.join(target,'skin.json'))||
   capture.image!==sha(path.join(target,'turntable.png'))||
   capture.views?.join(',')!=='0,45,90,135,180,225,270,315')
   fail('устаревший, чужой или неподтверждённый Chrome turntable');
  if(m.source?.sheetSha256!==sha(path.join(src,'parts-sheet.png'))||m.source?.tableSha256!==sha(path.join(src,'parts-sheet.md')))
    fail('ОБМАН: пакет собран из устаревшего листа');
  if(!Object.keys(m.source?.assets||{}).length)fail('ОБМАН: отсутствуют контрольные суммы скина');
  for(const [rel,h] of Object.entries(m.source.assets||{})){
    const abs=path.resolve(target,rel);
    if(!abs.startsWith(target+path.sep)||!fs.existsSync(abs)||sha(abs)!==h)fail('ОБМАН: старый либо подменённый файл пакета '+rel);
  }
  const zip=path.join(path.dirname(target),id+'.zip');
  fs.rmSync(zip,{force:true});
  execFileSync('zip',['-qrX',path.basename(zip),id],{cwd:path.dirname(target)});
  runValidator([]);
  console.log('СБОРКА СКИНА: ZIP и пакет прошли S1–S12');
  return;
 }
 const metaPath=path.join(cut,'cut-manifest.json');
 if(!fs.existsSync(metaPath))fail('сначала запустите cut-sheet.mjs');
 const meta=JSON.parse(fs.readFileSync(metaPath,'utf8'));assertSource(meta);
 if(meta.palette.length<6||meta.palette.length>16)fail('недопустимая палитра');
 const old=target,backup=target+'-old-'+process.pid,tmp=target+'-new-'+process.pid;
 fs.rmSync(tmp,{recursive:true,force:true});
 for(const sub of ['parts','sheets','textures','stages'])fs.mkdirSync(path.join(tmp,sub),{recursive:true});
 const files=[],entries=[];
 try{
  for(let i=0;i<meta.parts.length;i++){
   const e=meta.parts[i];
   if(!boneOf[e.bone])fail('неизвестная кость: '+e.bone);
   if(e.file){
    const destination='parts/'+path.basename(e.file);
    fs.copyFileSync(path.join(cut,e.file),path.join(tmp,destination));
    entries.push(addPart(e,destination,i+1));
    files.push({entry:e,file:destination});
   }else if(e.files?.length){
    const destination='sheets/arc-'+String(i+1).padStart(2,'0')+'.png';
    await buildFlipbook(e.files,path.join(tmp,destination));
    for(let v=0;v<3;v++)entries.push(addPart(e,destination,i+1+v,v));
   }else fail('нет вырезанной картинки: '+e.name);
  }
  // A complete body volume per bone; never use rotated copies of front artwork.
  // The source drawings remain on the front as shallow embossed decals.
  const original=[...entries];
  const volumes=[];
  for(const bone of Object.keys(VOLUMES)){
    const spec=VOLUMES[bone],owned=original.filter(p=>p.bone===bone&&p.file);
    if(!owned.length)fail('не хватает исходных рисунков для объёмной кости '+bone);
    const source=owned.find(p=>p.kind==='plate')||owned[0];
    const reference=source.file;
    const faces=await bakeFaces(tmp,bone,reference,meta.palette);
    if(bone==='head')faces.panorama=await bakeSpherePanorama(tmp,faces);
    const solid={id:'volume-'+bone,kind:'plate',layer:'3d',bone,
      primitive:bone==='head'?'sphere':'box',dims:spec.dims,size:spec.dims.slice(0,2),
      offset:spec.offset,rotation:[0,0,0],depth:3,material:'rust',faces,
      outline:true,anim:[]};
    volumes.push(solid);
    const frontY=bone==='body'?.04:bone==='head'?0:-.22;
    entries.push({id:solid.id+'-front-art',kind:source.kind,layer:'2.5d',bone,
      file:reference,size:bone==='head'?[.72,.68]:bone==='body'?[.66,.77]:
        bone.startsWith('arm')?[.29,.55]:[.28,.59],
      pivot:[.5,.5],offset:[spec.offset[0],frontY,spec.offset[2]-spec.dims[2]/2-.022],
      rotation:[0,0,0],depth:3,material:'rust-transparent',anim:[]});
    // Original author's bolt, not a mirrored full-front picture, may decorate rear.
    const rivet=owned.find(p=>p.kind==='bolt');
    if(rivet){
      entries.push({...rivet,id:solid.id+'-rear-bolt',layer:'2.5d',
        size:[.09,.09],offset:[spec.offset[0],frontY,spec.dims[2]/2+.028],
        rotation:[0,Math.PI,0],depth:2,material:'rust-transparent',anim:[]});
    }
  }
  // The original 3D source pieces are now represented by their true
  // volume + one curved/embossed front-art layer. Keeping them as extra
  // 2D planes causes the notorious square head and side flap to reappear.
  for(const part of original.filter(p=>p.layer==='3d')){
    const index=entries.indexOf(part);
    if(index>=0)entries.splice(index,1);
  }
  entries.push(...volumes);
  // Four genuinely rear-facing details, but never a full-front picture pasted on a side.
  for(const bone of ['body','armL','armR','legL','legR']){
    const v=volumes.find(x=>x.bone===bone);
    const srcPart=original.find(p=>p.bone===bone&&p.kind==='bolt'&&p.file);
    if(srcPart)continue;
    const small=original.find(p=>p.bone===bone&&p.file&&p.kind!=='arc'&&p.kind!=='core');
    if(small)entries.push({...small,id:'rear-detail-'+bone,layer:'2.5d',size:[.09,.09],
      offset:[v.offset[0],v.offset[1],v.dims[2]/2+.028],
      rotation:[0,Math.PI,0],depth:2,material:'rust-transparent',anim:[]});
  }
  const lights=entries.filter(p=>['arc','orb','slit','core','lens'].includes(p.kind));
  for(const p of lights.slice(0,Math.max(0,5-entries.filter(x=>x.material==='glow').length)))
    entries.push({...p,id:p.id+'-light',offset:[p.offset[0]+.03,p.offset[1],p.offset[2]-.012],material:'glow',layer:'2d'});
  const chains=entries.filter(p=>(p.anim||[]).some(a=>a.type==='chain'));
  for(const p of chains.slice(0,Math.max(0,2-chains.length)))
    entries.push({...p,id:p.id+'-inertia',offset:[p.offset[0]+.03,p.offset[1],p.offset[2]-.02],anim:p.anim.map(a=>({...a,freq:a.freq+.017,phase:(a.phase+.31)%1}))});
  const required=['plate','gear','cable','arc','slit','core','lens','orb','bolt','panel','piston'];
  for(const k of required)if(!entries.some(p=>p.kind===k))fail('нет обязательного вида детали '+k+' в parts-sheet.md');
  const rusty=files.find(x=>x.entry.row===1&&x.entry.place===1)||files[0];
  const metal=files.find(x=>kindOf(x.entry.name)==='gear')||files[0];
  for(const [name,source] of [['rust.png',rusty.file],['metal.png',metal.file]]){
   await sharp(path.join(tmp,source)).flatten({background:meta.palette[3]}).ensureAlpha().resize(64,64,{kernel:'nearest'})
     .png({palette:false}).toFile(path.join(tmp,'textures',name));
  }
  const originalPack=path.resolve('skins/packs',id);
  const ownerReference=fs.existsSync(path.join(src,'sketch.png'))?path.join(src,'sketch.png'):
    fs.existsSync(path.join(old,'reference.png'))?path.join(old,'reference.png'):path.join(originalPack,'reference.png');
  if(!fs.existsSync(ownerReference))fail('отсутствует оригинальный эскиз reference.png/sketch.png');
  fs.copyFileSync(ownerReference,path.join(tmp,'reference.png'));
  const record=fs.existsSync(path.join(old,'STAGE.md'))?path.join(old,'STAGE.md'):path.join(originalPack,'STAGE.md');
  if(fs.existsSync(record)){
   fs.copyFileSync(record,path.join(tmp,'STAGE.md'));
   for(const n of [0,1]){
      const image=fs.existsSync(path.join(old,'stages',n+'.png'))?path.join(old,'stages',n+'.png'):path.join(originalPack,'stages',n+'.png');
      if(fs.existsSync(image))fs.copyFileSync(image,path.join(tmp,'stages',n+'.png'));
    }
  }
  const warm=meta.palette.filter(c=>{const n=parseInt(c.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;return r>g&&g>b&&g>120;})
    .sort((a,b)=>parseInt(b.slice(1),16)-parseInt(a.slice(1),16))[0]||meta.palette.at(-2);
  const rustTone=meta.palette.find(c=>{const n=parseInt(c.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;return r>=150&&r<210&&g>=75&&g<155&&r>g*1.6&&g>b;})||meta.palette[5];
  const materials={'metal':{rough:.88,metal:.32},'rust':{rough:.92,metal:.24,color:rustTone},
   'rust-transparent':{rough:.94,metal:.24},
   'glow':{emissive:warm,blend:'additive'}};
  const surfaceTextures=volumes.flatMap(v=>Object.entries(v.faces).map(([face,file])=>
    ({id:v.id+'-'+face,file,uv:'plane',material:'rust'})));
  const outputHashes=Object.fromEntries(['parts','sheets','textures'].flatMap(sub=>
    fs.readdirSync(path.join(tmp,sub)).filter(f=>f.endsWith('.png')).map(f=>[sub+'/'+f,sha(path.join(tmp,sub,f))])));
  const manifest={
   format:'meta6-skin/1',name:id,reference:'reference.png',palette:meta.palette,hideBase:['body','head','armL','armR','legL','legR'],materials,
   textures:[{id:'rust',file:'textures/rust.png',uv:'box6',material:'metal',apply:'root'},{id:'metal',file:'textures/metal.png',uv:'cyl',material:'metal',apply:'root'},...surfaceTextures],
   parts:entries,source:{sheetSha256:meta.sourceSheetSha256,tableSha256:meta.sourceTableSha256,assets:outputHashes}};
  fs.writeFileSync(path.join(tmp,'skin.json'),JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(path.join(tmp,'README.md'),[
   '# '+id,'Пакет meta6-skin/1 из авторского листа деталей.',
   'Исходник: skins/sources/'+id+'/parts-sheet.png',
   'SHA256 листа: '+meta.sourceSheetSha256,
   'Палитра: '+meta.palette.join(', '),
   'Костей: 6; деталей на скелете: '+entries.length+'.',
   'Дуги: 6 исходных рисунков, 2 отражённых фазы, 3 экземпляра.',
   'Все художественные элементы взяты из листа и эскиза владельца.',
   'Собрано GitHub Actions, без Canva и внешних изображений.'].join('\n')+'\n');
  fs.rmSync(backup,{recursive:true,force:true});
  if(fs.existsSync(old))fs.renameSync(old,backup);
  fs.renameSync(tmp,old);
  fs.rmSync(backup,{recursive:true,force:true});
  console.log('СБОРКА СКИНА: '+entries.length+' настоящих/повторно используемых деталей; ожидается Chrome preview.png');
  // Строгий stage-1 gate существующего валидатора, без ослабления S1–S12.
  if(fs.existsSync(path.join(target,'STAGE.md')))runValidator(['--stage','1']);
 }catch(e){
  fs.rmSync(tmp,{recursive:true,force:true});
  if(fs.existsSync(backup)&&!fs.existsSync(old))fs.renameSync(backup,old);
  throw e;
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
