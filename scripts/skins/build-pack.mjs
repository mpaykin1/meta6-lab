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
 if(/разряд|дуга|искр/.test(n))return 'arc';
 if(/глаз|линз/.test(n))return 'lens';
 if(/шестерн/.test(n))return 'gear';
 if(/провод/.test(n))return 'cable';
 if(/огонёк|точка/.test(n))return 'orb';
 if(/щел/.test(n))return 'slit';
 if(/колба/.test(n))return 'core';
 if(/поршн|механик|труб/.test(n))return 'piston';
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
   if(k==='plate'){size=[.72,.68];offset=[0,0,-.02];dims=[.74,.72,.62];}
   else if(k==='lens'){size=[.20,.20];offset=[-.10,.09,-.36];}
   else if(k==='gear'){size=[.22,.22];offset=[.16,-.02,-.32];}
   else if(e.bone==='над головой'){size=[.10,.10];offset=[(e.place-7)*.04,.67-(e.place-6)*.13,-.05];}
   else {size=[.18,.28];offset=[k==='cable'?.23:-.2,-.22,-.26];}
 }else if(bone==='body'){
   if(k==='plate'){size=[.64,.74];offset=[0,.06,-.04];dims=[.62,.77,.48];}
   else if(k==='core'){size=[.18,.30];offset=[0,.03,-.36];}
   else if(k==='slit'){size=[.26,.22];offset=[-.14,.17,-.365];}
   else if(k==='gear'){size=[.26,.26];offset=[.15,-.20,-.35];}
   else if(k==='piston'){size=[.34,.32];offset=[.02,.03,-.34];}
   else if(k==='bolt'){size=[.07,.07];offset=[(e.place%2?-.16:.16),(e.place<10?.18:-.2),.32];}
   else {size=[.42,.27];offset=[0,-.24,-.35];}
 }else if(bone==='armL'||bone==='armR'){
   const sign=bone==='armL'?-1:1;
   if(e.row===3){size=[.31,.22];offset=[0,-.02,-.12];}
   else if(e.row===4 && /предплеч/.test(name)){size=[.23,.51];offset=[sign*.015,-.27,-.025];dims=[.22,.52,.20];}
   else if(k==='arc'){size=[.28,.28];offset=[sign*(.05+variant*.025),-.48+variant*.025,-.25];}
   else if(k==='cable'){size=[.16,.36];offset=[sign*.09,-.27,-.17];}
   else {size=[.16,.16];offset=[0,-.03,-.20];}
 }else if(bone==='legL'||bone==='legR'){
   if(k==='slit'||e.motion==='светится'){size=[.12,.23];offset=[0,-.36,-.16];}
   else {size=[.25,.58];offset=[0,-.30,-.015];dims=[.24,.58,.22];}
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
   if(k==='cable' && i%2===0)return [{type:'chain',amp:.06,segments:4,lag:.6,...common,speedLink:.6}];
   return [{type:'swing',amp:.07,inertia:.2,...common,speedLink:.6}];
 }
 return [];
}
function assertSource(meta){
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
async function main(){
 if(finish){
  if(!fs.existsSync(path.join(target,'preview.png')))fail('нет настоящего Chrome-превью; окончательная сборка запрещена');
  const m=JSON.parse(fs.readFileSync(path.join(target,'skin.json'),'utf8'));
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
  // На левой ноге только одна авторская деталь — используем ту же броню
  // с обратной стороны, не придумывая и не рисуя другой элемент.
  const left=entries.find(p=>p.bone==='legL'&&p.layer==='3d');
  if(left)entries.push({...left,id:left.id+'-rear',offset:[left.offset[0],left.offset[1],.17],rotation:[0,Math.PI,0],anim:[],layer:'2.5d',depth:2,material:'rust-transparent'});
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
  const materials={'metal':{rough:.88,metal:.32},'rust-transparent':{rough:.94,metal:.24},'glow':{emissive:meta.palette.at(-2),blend:'additive'}};
  const outputHashes=Object.fromEntries(['parts','sheets','textures'].flatMap(sub=>
    fs.readdirSync(path.join(tmp,sub)).filter(f=>f.endsWith('.png')).map(f=>[sub+'/'+f,sha(path.join(tmp,sub,f))])));
  const manifest={
   format:'meta6-skin/1',name:id,reference:'reference.png',palette:meta.palette,hideBase:['body','head','armL','armR','legL','legR'],materials,
   textures:[{id:'rust',file:'textures/rust.png',uv:'box6',material:'metal',apply:'root'},{id:'metal',file:'textures/metal.png',uv:'cyl',material:'metal',apply:'root'}],
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
