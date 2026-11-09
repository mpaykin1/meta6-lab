#!/usr/bin/env node
// Mutate a fresh, private pack copy and demand validator reject every failure.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
const src=path.resolve(process.argv[2]||'skins/packs/rusty-robot');
const validator=path.resolve('scripts/skins/validate-skin-pack.mjs');
function run(args,cwd){const p=spawnSync(args[0],args.slice(1),{cwd,encoding:'utf8',maxBuffer:10*1024*1024});if(p.error)throw p.error;return p;}
function zip(root){const dest=path.join(root,'rusty-robot.zip');fs.rmSync(dest,{force:true});const z=run(['zip','-qrX','rusty-robot.zip','rusty-robot'],root);if(z.status!==0)throw Error('zip build: '+z.stderr);}
function json(dir,fn){const file=path.join(dir,'skin.json'),m=JSON.parse(fs.readFileSync(file));fn(m);fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');}
function checksum(buf){let crc=~0;for(const b of buf){crc^=b;for(let i=0;i<8;i++)crc=(crc&1)?(crc>>>1)^0xedb88320:crc>>>1;}return (~crc)>>>0;}
function chunk(t,d){const n=Buffer.alloc(4);n.writeUInt32BE(d.length);const q=Buffer.concat([Buffer.from(t),d]);const crc=Buffer.alloc(4);crc.writeUInt32BE(checksum(q));return Buffer.concat([n,q,crc]);}
function makeTwoFrameSheet(file){
 const b=fs.readFileSync(file);let ptr=8,ih=null,idat=[];
 while(ptr+12<=b.length){const len=b.readUInt32BE(ptr),tag=b.toString('ascii',ptr+4,ptr+8),data=b.subarray(ptr+8,ptr+8+len);if(tag==='IHDR')ih=Buffer.from(data);if(tag==='IDAT')idat.push(data);ptr+=12+len;if(tag==='IEND')break;}
 const w=ih.readUInt32BE(0),h=ih.readUInt32BE(4),raw=zlib.inflateSync(Buffer.concat(idat)),fw=w/8;
 if(w!==256||h!==32||raw.length!==(w*4+1)*h)throw Error('sheet mutation expects 256x32 generated PNG');
 for(let y=0;y<h;y++){const off=y*(w*4+1)+1;for(let frame=2;frame<8;frame++){const from=off+(frame%2)*fw*4,to=off+frame*fw*4;raw.copy(raw,to,from,from+fw*4);}}
 fs.writeFileSync(file,Buffer.concat([b.subarray(0,8),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]));
}
const cases=[
 ['stale-zip-deception','S1',(d)=>json(d,m=>{m.palette.reverse();}),false],
 ['missing-declared-asset','S2',(d)=>fs.rmSync(path.join(d,'parts','gear.png')),true],
 ['opaque-part-corners','S3',(d)=>fs.copyFileSync(path.join(d,'textures','metal.png'),path.join(d,'parts','plate.png')),true],
 ['false-sketch-palette','S5',(d)=>json(d,m=>{m.palette=['#0a00f0','#0b00f0','#0c00f0','#0d00f0','#0e00f0','#0f00f0'];}),true],
 ['insufficient-parts','S6',(d)=>json(d,m=>{m.parts=m.parts.slice(0,8);}),true],
 ['missing-electric-arc-kind','S7',(d)=>json(d,m=>{for(const p of m.parts)if(p.kind==='arc')p.kind='decoration';}),true],
 ['missing-rear-details','S8',(d)=>json(d,m=>{for(const p of m.parts)if(p.offset[2]>0)p.offset[2]*=-1;}),true],
 ['synchronous-phase-deception','S10',(d)=>json(d,m=>{for(const p of m.parts)for(const a of p.anim||[]){a.freq=1;a.phase=.5;}}),true],
 ['hidden-skull-no-mesh','S11',(d)=>json(d,m=>{m.parts=m.parts.filter(p=>p.id!=='skull-shell');}),true],
 ['two-real-frames-claim-eight','S12',(d)=>makeTwoFrameSheet(path.join(d,'sheets','arc.png')),true],
];
const ok=run(['node',validator,src]);if(ok.status!==0)throw Error('Baseline invalid; cannot run mutations:\n'+ok.stderr);
for(const [name,id,mutate,repack] of cases){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'meta-skin-mutate-')),dir=path.join(root,'rusty-robot');
 try{
  fs.cpSync(src,dir,{recursive:true});fs.copyFileSync(src+'.zip',path.join(root,'rusty-robot.zip'));
  mutate(dir);if(repack)zip(root);
  const r=run(['node',validator,dir]);const output=r.stdout+r.stderr;
  if(r.status===0||!output.includes(id+':'))throw Error('MUTATION ESCAPED: '+name+' expected '+id+'\n'+output);
  console.log('TRAP PASS '+name+' → '+id);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
}
console.log('All',cases.length,'independent mutation traps passed');
