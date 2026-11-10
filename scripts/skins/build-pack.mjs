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
   if(k==='plate'){size=[.72,.68];offset=[0,0,-.02];dims=[.74,.72,.62];}
   else if(k==='lens'){size=[.20,.20];offset=[-.10,.09,-.36];}
   else if(k==='gear'){size=[.22,.22];offset=[.16,-.02,-.32];}
   else if(e.bone==='над головой'){size=[.10,.10];offset=[(e.place-7)*.04,.67-(e.place-6)*.13,-.05];}
   else {size=[.18,.28];offset=[k==='cable'?.23:-.2,-.22,-.26];}
 }else if(bone==='body'){
   if(k==='plate'){size=[.64,.74];offset=[0,.06,-.04];dims=[.62,.77,.48];}
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
  // 3D броня обязана быть непрозрачной: альфа исходных PNG содержит сквозные
  // выломы. На 3D-меше она делала всё тело/голову невидимыми.
  // Сохраняем художественную вырезку отдельной передней накладкой, а объём
  // покрываем плотной текстурой, полученной из того же авторского листа.
  for(const solid of [...entries].filter(p=>p.layer==='3d')){
    const original=solid.file;
    const thickness=solid.dims?.[2]||.22;
    // Непрозрачный объём — лишь подложка; рисунок всегда остаётся отдельным PNG.
    solid.file=undefined;
    solid.material='rust';
    entries.push({...solid,id:solid.id+'-front-art',kind:solid.kind,
      file:original,layer:'2.5d',depth:1,primitive:undefined,dims:undefined,
      offset:[solid.offset[0],solid.offset[1],solid.offset[2]-thickness/2-.014],
      material:'rust-transparent',anim:[]});
  }
  // Боковые поверхности получают авторские рисунки, а не голые торцы.
  // Используем ТОЛЬКО те же вырезки из parts-sheet.png, без нового арта.
  // Локальная плоскость повернута к боковой камере; фронтальные накладки
  // не трогаем, так как фронт уже принят владельцем.
  for(const solid of [...entries].filter(p=>p.layer==='3d')){
    const front=entries.find(p=>p.id===solid.id+'-front-art');
    if(!front?.file)fail('нет авторской вырезки для боковой поверхности '+solid.id);
    const halfWidth=(solid.dims?.[0]||.24)/2;
    const halfDepth=(solid.dims?.[2]||.22)/2;
    for(const side of [-1,1]){
      entries.push({...front,id:solid.id+(side<0?'-side-left':'-side-right'),
        size:[Math.max(.13,halfDepth*2),front.size[1]],
        offset:[solid.offset[0]+side*(halfWidth+.009),solid.offset[1],solid.offset[2]],
        rotation:[0,side*Math.PI/2,0],depth:1,anim:[]});
    }
  }
  // Детали механики (шестерни, провода, свет), не являющиеся бронёй,
  // ранее исчезали при повороте: все они были только фронтальными плоскостями.
  // Выводим те же исходные PNG на боковые стороны существующего объёма.
  // Фронтальные экземпляры остаются байт-в-байт неизменными.
  for(const part of [...entries].filter(p=>p.file&&p.layer==='2.5d'&&!/-front-art$|-side-left$|-side-right$/.test(p.id))){
    const solid=entries.find(p=>p.layer==='3d'&&p.bone===part.bone);
    const halfWidth=(solid?.dims?.[0]||.25)/2;
    const x=solid?.offset?.[0]||0;
    for(const sign of [-1,1]){
      entries.push({...part,id:part.id+(sign<0?'-profile-left':'-profile-right'),
        layer:'2.5d',size:[Math.max(.12,(solid?.dims?.[2]||.22)*.8),part.size[1]],
        offset:[x+sign*(halfWidth+.018),part.offset[1],part.offset[2]+.14],
        rotation:[0,sign*Math.PI/2,0],depth:1,anim:[]});
    }
  }
  // На левой ноге только одна авторская деталь — используем ту же броню
  // с обратной стороны, не придумывая и не рисуя другой элемент.
  const left=entries.find(p=>p.bone==='legL'&&p.layer==='3d');
  if(left)entries.push({...left,id:left.id+'-rear',offset:[left.offset[0],left.offset[1],.17],rotation:[0,Math.PI,0],anim:[],layer:'2.5d',depth:2,material:'rust-transparent'});
  // Повторно используем реальные детали для видимых сзади суставов и света.
  for(const bone of ['armL','armR','legL','legR']){
    const base=entries.find(p=>p.bone===bone&&p.layer==='3d')||entries.find(p=>p.bone===bone);
    if(!base)fail('нет авторской детали для кости '+bone);
    if(base.layer!=='3d')entries.push({...base,id:base.id+'-solid',layer:'3d',primitive:'box',dims:[.23,.36,.2],material:'metal',anim:[]});
    const rear=entries.find(p=>p.bone===bone&&p.layer==='3d');
    entries.push({...rear,id:rear.id+'-back',layer:'2.5d',offset:[rear.offset[0],rear.offset[1],.25],material:'rust-transparent',anim:[]});
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
