#!/usr/bin/env node
// КОНТУР К5: независимые повреждения превью и обман чужим скриншотом.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const src=path.resolve(process.argv[2]||'skins/sources/rusty-robot');
const id=path.basename(src),pack=path.resolve('skins/packs',id);
const checker=path.resolve('scripts/skins/preview.mjs');
function clone(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'skin-preview-mutations-'));
 const source=path.join(root,'sources',id),target=path.join(root,'packs',id);
 fs.mkdirSync(path.dirname(source),{recursive:true});fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.cpSync(src,source,{recursive:true});fs.cpSync(pack,target,{recursive:true});
 return{root,source,target};
}
function verify(t){
 const r=spawnSync('node',[checker,t.source,t.target,'--verify'],{encoding:'utf8'});
 if(r.error)throw r.error;return r;
}
function expect(r,name){
 if(r.status===0||!(r.stdout+r.stderr).includes('ПРЕВЬЮ СКИНА:'))throw Error('ЛОВУШКА ПРОПУЩЕНА '+name+'\n'+r.stdout+r.stderr);
 console.log('ЛОВУШКА СРАБОТАЛА: '+name);
}
const cases=[
 ['потерянное сравнение с эскизом',t=>fs.rmSync(path.join(t.source,'side-by-side.png'))],
 ['чужое изображение вместо нового героя',t=>fs.copyFileSync(path.join(t.source,'cut-preview.png'),path.join(t.target,'preview.png'))],
 ['устаревший скин после Chrome',t=>{
   const p=path.join(t.target,'skin.json'),m=JSON.parse(fs.readFileSync(p,'utf8'));
   m.parts[0].size=[.01,.01];fs.writeFileSync(p,JSON.stringify(m));
 }],
 ['подменённый исходный эскиз',t=>fs.writeFileSync(path.join(t.target,'reference.png'),'fake reference')],
 ['ложная запись об источнике',t=>{
   const p=path.join(t.source,'preview-meta.json'),m=JSON.parse(fs.readFileSync(p,'utf8'));
   m.sheetSha256='0'.repeat(64);fs.writeFileSync(p,JSON.stringify(m));
 }],
];
for(const [name,mutation] of cases){
 const t=clone();
 try{
  const base=verify(t);if(base.status!==0)throw Error('настоящий Chrome-превью не прошёл базу '+base.stderr);
  mutation(t);expect(verify(t),name);
 }finally{fs.rmSync(t.root,{recursive:true,force:true});}
}
console.log('К5: все пять мутаций Chrome-превью обнаружены');
