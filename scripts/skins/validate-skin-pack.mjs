#!/usr/bin/env node
// S1–S12, exhaustive pack/ZIP comparison, PNG color/alpha/flipbook diagnostics.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const dir=path.resolve(process.argv[2]||'skins/packs/rusty-robot'),errors=new Set();
const fail=(id,msg)=>{errors.add(id);console.error(id+': '+msg);};
const exists=(p)=>fs.existsSync(path.join(dir,p));
const walk=(root,p='')=>fs.readdirSync(root,{withFileTypes:true}).flatMap(x=>{const rel=path.posix.join(p,x.name);return x.isDirectory()?walk(path.join(root,x.name),rel):[rel];});
const isPow2=n=>n>0&&(n&(n-1))===0;
const addFile=(a,file,id)=>{if(typeof file!=='string'||file.startsWith('/')||file.includes('..')||!file.match(/^(textures|parts|sheets)\/[\w.-]+\.png$/)){fail(id,'illegal asset path '+file);}else a.add(file);};
function decode(file){
 const b=fs.readFileSync(file),sig=Buffer.from([137,80,78,71,13,10,26,10]);if(!b.subarray(0,8).equals(sig))throw Error('bad PNG signature');
 let pos=8,w=0,h=0,type=-1,depth=0,dat=[];
 while(pos+12<=b.length){const n=b.readUInt32BE(pos),tag=b.toString('ascii',pos+4,pos+8);if(pos+12+n>b.length)throw Error('truncated PNG');
 const v=b.subarray(pos+8,pos+8+n);if(tag==='IHDR'){w=v.readUInt32BE(0);h=v.readUInt32BE(4);depth=v[8];type=v[9];}if(tag==='IDAT')dat.push(v);pos+=n+12;if(tag==='IEND')break;}
 if(type!==6||depth!==8)throw Error('not PNG RGBA 8-bit');
 if(w>4096||h>4096||!w||!h)throw Error('unreasonable dimensions');
 const raw=zlib.inflateSync(Buffer.concat(dat)),pitch=w*4, pixels=Buffer.alloc(w*h*4);let offset=0;
 for(let y=0;y<h;y++){const filter=raw[offset++];for(let x=0;x<pitch;x++){
 const v=raw[offset++];const prev=x>=4?pixels[y*pitch+x-4]:0,up=y?pixels[(y-1)*pitch+x]:0,diag=y&&x>=4?pixels[(y-1)*pitch+x-4]:0;
 let n;if(filter===0)n=v;else if(filter===1)n=v+prev;else if(filter===2)n=v+up;else if(filter===3)n=v+Math.floor((prev+up)/2);else if(filter===4){const p=prev+up-diag,pa=Math.abs(p-prev),pb=Math.abs(p-up),pc=Math.abs(p-diag);n=v+(pa<=pb&&pa<=pc?prev:pb<=pc?up:diag);}else throw Error('unknown PNG filter '+filter);
 pixels[y*pitch+x]=n&255;
 }}
 return {w,h,pixels};
}
function compareZip(){
 const zip=dir+'.zip';if(!fs.existsSync(zip)){fail('S1','ZIP missing');return;}
 try{
 const bytes=fs.statSync(zip).size;if(bytes>3*1024*1024)fail('S1','ZIP exceeds 3 MB');
 const names=execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 const prefix=path.basename(dir)+'/';
 const stored=names.filter(x=>!x.endsWith('/')).map(x=>{if(!x.startsWith(prefix))throw Error('unexpected ZIP root '+x);return x.slice(prefix.length);});
 const onDisk=walk(dir);
 if(stored.length!==new Set(stored).size||stored.sort().join('|')!==onDisk.sort().join('|'))fail('S1','ZIP entry list differs from folder');
 for(const name of onDisk){const packed=execFileSync('unzip',['-p',zip,prefix+name],{maxBuffer:4*1024*1024});if(!packed.equals(fs.readFileSync(path.join(dir,name))))fail('S1','ZIP stale at '+name);}
 }catch(e){fail('S1','ZIP parse '+e.message);}
}
let manifest;
try{manifest=JSON.parse(fs.readFileSync(path.join(dir,'skin.json'),'utf8'));}catch(e){fail('S1','manifest unreadable: '+e.message);process.exit(1);}
if(manifest.format!=='meta6-skin/1'||manifest.name!==path.basename(dir))fail('S1','format/name mismatch');

const stageFlag=process.argv.indexOf('--stage');
const stage=stageFlag<0?null:Number(process.argv[stageFlag+1]);
if(stageFlag>=0&&(stageFlag!==3||!Number.isInteger(stage)||stage<0||stage>7||process.argv.length!==5)){
 fail('STAGE','use exactly: validate-skin-pack.mjs <folder> --stage N (N=0..7)');
 process.exit(1);
}
if(stage!==null){
 const record=path.join(dir,'STAGE.md');
 const recordText=fs.existsSync(record)?fs.readFileSync(record,'utf8'):'';
 if(!recordText.includes('этап '+stage+' сделан'))fail('STAGE','STAGE.md missing current completed stage '+stage);
 for(let i=0;i<=stage;i++){
  const file='stages/'+i+'.png';
  if(!exists(file)){fail('STAGE','missing comparison '+file);continue;}
  try{const im=decode(path.join(dir,file));if(im.w<640||im.h<480)fail('STAGE','comparison too small '+file);}
  catch(e){fail('STAGE','invalid comparison '+file+': '+e.message);}
 }
 if(stage===0){
  const readme=exists('README.md')?fs.readFileSync(path.join(dir,'README.md'),'utf8'):'';
  if(readme.split('\n').filter(l=>l.startsWith('| ')&&l.includes(' | ')).length<30)fail('STAGE','stage 0 requires full detail table and 12 source colour samples');
  if(!readme.includes('Палитра')||!readme.includes('Точка'))fail('STAGE','stage 0 palette source points missing');
  const ref=path.join(dir,'reference.png');
  if(!fs.existsSync(ref))fail('STAGE','original sketch missing');
  else{
   const bytes=fs.readFileSync(ref),head=Buffer.from('blob '+bytes.length+'\0');
   const h=crypto.createHash('sha1').update(head).update(bytes).digest('hex');
   if(h!=='f66ad0f0cf976b86600e91efd3e819cb81afe8d1')fail('STAGE','original owner sketch hash mismatch');
  }
 }
 if(stage>=1){
  for(const file of ['textures/rust.png','textures/metal.png']){
   if(!exists(file)){fail('STAGE','missing stage-1 material '+file);continue;}
   try{
    const im=decode(path.join(dir,file));
    if(im.w!==64||im.h!==64)fail('STAGE','material must be exactly 64x64: '+file);
    const colors=new Set();
    for(let j=0;j<im.pixels.length;j+=4){
     if(im.pixels[j+3]!==255)fail('STAGE','material must be opaque: '+file);
     const col='#'+Buffer.from(im.pixels.subarray(j,j+3)).toString('hex');
     colors.add(col);
     if(!(manifest.palette||[]).includes(col))fail('STAGE','material uses unapproved colour '+col);
    }
    if(colors.size>12)fail('STAGE','too many material colours: '+file);
   }catch(e){fail('STAGE','invalid stage-1 PNG '+file+': '+e.message);}
  }
 }
 if(stage>=2&&!(manifest.parts||[]).some(p=>p.layer==='3d'))fail('STAGE','silhouette 3d parts absent');
 if(stage>=3&&!['gear','piston','cable'].every(k=>(manifest.parts||[]).some(p=>p.kind===k)))fail('STAGE','mechanics absent');
 if(stage>=4&&!['core','slit','orb'].every(k=>(manifest.parts||[]).some(p=>p.kind===k)))fail('STAGE','illumination absent');
 if(stage>=5&&!(manifest.parts||[]).some(p=>(p.anim||[]).some(a=>a.type==='chain')))fail('STAGE','cable inertia absent');
 if(stage>=6&&!(manifest.parts||[]).some(p=>(p.anim||[]).some(a=>a.type==='flipbook')))fail('STAGE','arc flipbooks absent');
 if(errors.size){console.error('VIOLATIONS '+[...errors].sort().join(', '));process.exit(1);}
 if(stage<7){console.log('STAGE '+stage+' PASS: staged checks; full S1–S12 mandatory at stage 7.');process.exit(0);}
}

for(const file of ['skin.json','reference.png','preview.png','turntable.png','README.md'])if(!exists(file))fail('S2','missing '+file);
compareZip();
const used=new Set(),allImages=walk(dir).filter(f=>f.endsWith('.png'));
for(const t of manifest.textures||[]){addFile(used,t.file,'S2');if(t.emit)addFile(used,t.emit,'S2');if(!['sphere','box6','cyl','plane'].includes(t.uv))fail('S2','invalid uv '+t.uv);}
for(const p of manifest.parts||[])if(p.file)addFile(used,p.file,'S2');
for(const name of used)if(!exists(name))fail('S2','missing image '+name);
for(const name of allImages)if(!used.has(name)&&!['reference.png','preview.png','turntable.png'].includes(name)&&!/^stages\/[0-7]\.png$/.test(name))fail('S2','unreferenced PNG '+name);
for(const name of walk(dir))if(!name.match(/^(skin\.json|reference\.png|preview\.png|turntable\.png|README\.md|STAGE\.md|stages\/[0-7]\.png|(textures|parts|sheets)\/[\w.-]+\.png)$/))fail('S2','unauthorized file '+name);
const palette=(manifest.palette||[]).map(hex=>typeof hex==='string'&&/^#[0-9a-fA-F]{6}$/.test(hex)?[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]:null);
if(palette.length<6||palette.length>16||palette.some(x=>!x)||new Set((manifest.palette||[]).map(x=>x.toLowerCase())).size!==palette.length)fail('S5','palette must contain 6–16 distinct #RRGGBB colors');
const imageData=new Map();
for(const name of used){if(!exists(name))continue;
 try{
 const img=decode(path.join(dir,name));imageData.set(name,img);
 if(!isPow2(img.w)||!isPow2(img.h)||img.w>256||img.h>256)fail('S3','image dimensions '+name+': '+img.w+'x'+img.h);
 if(name.startsWith('parts/')||name.startsWith('sheets/')){
  for(const [x,y] of [[0,0],[img.w-1,0],[0,img.h-1],[img.w-1,img.h-1]])if(img.pixels[(y*img.w+x)*4+3])fail('S3','opaque image corner '+name);
 }
 const colors=new Set();let colored=0,semi=0,matched=0;
 for(let j=0;j<img.pixels.length;j+=4){const r=img.pixels[j],g=img.pixels[j+1],b=img.pixels[j+2],alpha=img.pixels[j+3];
 if(!alpha)continue;if(alpha!==255)semi++;
 colors.add(r+','+g+','+b);colored++;
 if(palette.some(c=>c&&Math.hypot(c[0]-r,c[1]-g,c[2]-b)<=28))matched++;
 }
 if(colors.size>48)fail('S4','more than 48 colors '+name);
 const additive=(manifest.parts||[]).some(p=>p.file===name&&manifest.materials?.[p.material]?.blend==='additive');
 if(colored&&semi/colored>.05&&!additive)fail('S4','excess translucency '+name);
 if(colored&&matched/colored<.9)fail('S5','colors outside approved palette '+name+' ratio='+matched/colored);
 }catch(e){fail('S3','bad PNG '+name+': '+e.message);}
}
const parts=manifest.parts||[],kinds=new Set(parts.map(p=>p.kind)),layer={};
let animated=0;for(const p of parts){layer[p.layer]=(layer[p.layer]||0)+1;if(p.anim?.length)animated++;}
if(parts.length<30||animated<24||kinds.size<8||(layer['3d']||0)<6||(layer['2.5d']||0)<8||(layer['2d']||0)<6)fail('S6','part count, animated count, kind variety or layer threshold');
const required=['plate','gear','cable','arc','slit','core','lens','orb','bolt','panel','piston'];
if(required.some(k=>!kinds.has(k)))fail('S7','missing required kind: '+required.filter(k=>!kinds.has(k)));
const bones=['root','body','head','armL','armR','legL','legR','antenna'],real=['body','head','armL','armR','legL','legR'];
for(const p of parts)if(!bones.includes(p.bone)||!['3d','2.5d','2d'].includes(p.layer))fail('S8','invalid bone/layer '+p.id);
if(real.some(b=>parts.filter(p=>p.bone===b).length<2)||parts.filter(p=>p.offset?.[2]>0).length<4)fail('S8','missing body/limb coverage or rear details');
const anim=parts.flatMap(p=>(p.anim||[]).map(a=>({...a,_id:p.id})));
const count=type=>anim.filter(a=>a.type===type).length;
if(count('rotate')<3||count('chain')<2||count('flipbook')<3||anim.filter(a=>a.speedLink>0).length<4||anim.filter(a=>a.pulseLink>0).length<3||
 parts.filter(p=>manifest.materials?.[p.material]?.blend==='additive').length<5||anim.filter(a=>a.type==='chain').some(a=>!(a.segments>=3&&a.segments<=6)))fail('S9','missing animation coverage, links or additive');
for(const a of anim)if(!(a.freq>=.05&&a.freq<=12&&a.phase>=0&&a.phase<=1))fail('S9','invalid frequency/phase '+a._id);
if(anim.length&&new Set(anim.map(a=>a.freq+'|'+a.phase)).size/anim.length<.9)fail('S10','too many synchronous (freq,phase) animations');
for(const bone of manifest.hideBase||[])if(!parts.some(p=>p.bone===bone&&p.layer==='3d'))fail('S11','hidden '+bone+' without replacement 3d');
for(const p of parts)for(const a of p.anim||[])if(a.type==='flipbook'){
 const img=imageData.get(p.file);if(!img){fail('S12','missing flipbook '+p.file);continue;}
 const frames=a.frames;
 if(!Number.isInteger(frames)||frames<6||img.w%frames!==0){fail('S12','incorrect frame count/width '+p.id);continue;}
 const fw=img.w/frames;
 if(!isPow2(fw)){fail('S12','non-pow2 frame '+p.id);continue;}
 const signatures=[];
 for(let f=0;f<frames;f++){
  const tile=Buffer.alloc(fw*img.h*4);
  for(let y=0;y<img.h;y++)img.pixels.copy(tile,y*fw*4,(y*img.w+f*fw)*4,(y*img.w+(f+1)*fw)*4);
  signatures.push(tile);
  if(f){
   let diff=0;for(let k=0;k<tile.length;k+=4){if(tile[k]!==signatures[f-1][k]||tile[k+1]!==signatures[f-1][k+1]||tile[k+2]!==signatures[f-1][k+2]||tile[k+3]!==signatures[f-1][k+3])diff++;}
   if(diff<8)fail('S12','identical/nearly identical adjacent frame '+p.id+' '+f);
  }
 }
 if(new Set(signatures.map(t=>t.toString('base64'))).size<frames)fail('S12','repeated non-adjacent frames '+p.id);
}
if(errors.size){console.error('VIOLATIONS '+[...errors].sort().join(', '));process.exit(1);}
console.log('S1–S12 PASS:',parts.length,'parts;',animated,'animated;',anim.length,'phased animations;',used.size,'PNG assets; ZIP identical.');
