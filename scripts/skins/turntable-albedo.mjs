// Real pixel guard: names and JSON fields cannot prove independent side textures.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {LIMITS} from './turntable-thresholds.mjs';

const fail=s=>{throw Error('TURNTABLE FAIL: '+s);};
const similarity=(a,b)=>a.reduce((n,v,i)=>n+(v===b[i]?1:0),0)/a.length;
export async function inspectFaceArtwork(manifest,pack){
 const root=path.resolve(pack),cache=new Map();
 const resolve=rel=>{
  if(typeof rel!=='string')fail('missing face texture path');
  const full=path.resolve(root,rel);
  if(!full.startsWith(root+path.sep)||!fs.existsSync(full))
   fail('missing or unsafe face texture '+rel);
  return full;
 };
 async function fingerprint(rel){
  const file=resolve(rel);
  if(cache.has(file))return cache.get(file);
  const pixels=await sharp(file).flatten({background:LIMITS.outlineColor})
   .resize(16,16,{fit:'fill',kernel:'lanczos3'}).greyscale().raw().toBuffer();
  const mean=pixels.reduce((s,v)=>s+v,0)/pixels.length;
  const bits=Array.from(pixels,v=>v>mean?1:0);
  cache.set(file,bits);return bits;
 }
 for(const solid of manifest.parts.filter(p=>p.layer==='3d'&&p.faces)){
  const front=manifest.parts.find(p=>p.id===solid.id+'-front-art');
  if(!front?.file)fail('missing original front art for '+solid.id);
  const source=await fingerprint(front.file);
  for(const face of ['left','right','back']){
   const score=similarity(source,await fingerprint(solid.faces[face]));
   if(score>LIMITS.sideFaceHashSimilarity)
    fail('copied front pixels on '+solid.id+' '+face+': similarity '+score.toFixed(3));
  }
 }
 return true;
}
