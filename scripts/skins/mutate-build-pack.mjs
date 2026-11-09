#!/usr/bin/env node
// Контур К5: испорченные входы сборщика и обман старым пакетом.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const input=path.resolve(process.argv[2]||'skins/sources/rusty-robot');
const id=path.basename(input),originalPack=path.resolve('skins/packs',id);
const builder=path.resolve('scripts/skins/build-pack.mjs');
function setup(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'skin-pack-mutations-'));
 const src=path.join(root,'sources',id),pack=path.join(root,'packs',id);
 fs.mkdirSync(path.dirname(src),{recursive:true});fs.mkdirSync(path.dirname(pack),{recursive:true});
 fs.cpSync(input,src,{recursive:true});fs.cpSync(originalPack,pack,{recursive:true});
 return {root,src,pack};
}
function run(src,pack,finish=false){
 const r=spawnSync('node',[builder,src,pack,...(finish?['--finalize']:[])],{encoding:'utf8',maxBuffer:16e6});
 if(r.error)throw r.error;return r;
}
const mustPass=(name,r)=>{if(r.status!==0)throw Error('ПАКЕТ: исходная сборка не прошла '+name+'\n'+r.stdout+r.stderr);};
const mustFail=(name,r)=>{if(r.status===0||!(r.stdout+r.stderr).includes('СБОРКА СКИНА:'))throw Error('ЛОВУШКА ПРОПУЩЕНА '+name+'\n'+r.stdout+r.stderr);console.log('ЛОВУШКА СРАБОТАЛА: '+name);};
async function test(name,mutate,{afterBuild=false,finish=false}={}){
 const t=setup();
 try{
  if(afterBuild)mustPass(name,run(t.src,t.pack));
  await mutate(t);
  mustFail(name,run(t.src,t.pack,finish));
 }finally{fs.rmSync(t.root,{recursive:true,force:true});}
}
const metaFile=t=>path.join(t.src,'cut','cut-manifest.json');
const editMeta=(t,fn)=>{const f=metaFile(t),j=JSON.parse(fs.readFileSync(f,'utf8'));fn(j);fs.writeFileSync(f,JSON.stringify(j,null,2));};
await test('не тот лист, старые ножницы',t=>fs.appendFileSync(path.join(t.src,'parts-sheet.md'),'\nизменена таблица\n'));
await test('вырезка пропала',t=>{
 const m=JSON.parse(fs.readFileSync(metaFile(t),'utf8')),rel=Object.keys(m.assetHashes)[0];
 fs.rmSync(path.join(t.src,'cut',rel));
});
await test('подложная палитра',t=>editMeta(t,m=>{m.palette.reverse();}));
await test('подложное количество деталей',t=>editMeta(t,m=>{m.parts.pop();}));
await test('подмена мест в авторской таблице',t=>editMeta(t,m=>{[m.parts[1],m.parts[2]]=[m.parts[2],m.parts[1]];}));
await test('старый PNG в готовом пакете',t=>{
 const m=JSON.parse(fs.readFileSync(path.join(t.pack,'skin.json'),'utf8'));
 const rel=Object.keys(m.source.assets).find(x=>x.startsWith('parts/'));
 fs.writeFileSync(path.join(t.pack,rel),'old asset from another build');
 fs.copyFileSync(path.join(originalPack,'preview.png'),path.join(t.pack,'preview.png'));
},{afterBuild:true,finish:true});
console.log('К5: шесть ловушек сборщика сработали');
