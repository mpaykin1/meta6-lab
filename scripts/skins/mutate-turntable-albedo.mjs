#!/usr/bin/env node
// K5: reject pixel-identical and recolored front images copied under a different side filename.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {inspectFaceArtwork} from './turntable-albedo.mjs';

const name=path.basename(process.argv[2]||'skins/sources/rusty-robot');
const pack=path.resolve('skins/packs',name);
const manifest=JSON.parse(fs.readFileSync(path.join(pack,'skin.json'),'utf8'));
const solid=manifest.parts.find(p=>p.id==='volume-body');
const art=manifest.parts.find(p=>p.id==='volume-body-front-art');
if(!solid?.faces||!art?.file)throw Error('IMAGE MUTATION: source torso volume missing');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'skin-image-mutation-'));
const fixture={parts:[solid,art]};
try{
 for(const file of [art.file,...['left','right','back'].map(f=>solid.faces[f])]){
  const out=path.join(tmp,file);
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.copyFileSync(path.join(pack,file),out);
 }
 await inspectFaceArtwork(fixture,tmp);
 for(const [label,brightness] of [['direct-copy',1],['darkened-copy',.78],['brightened-copy',1.18]]){
  const input=path.join(tmp,art.file),output=path.join(tmp,solid.faces.right);
  if(brightness===1)fs.copyFileSync(input,output);
  else await sharp(input).modulate({brightness}).png().toFile(output);
  let rejected=false;
  try{await inspectFaceArtwork(fixture,tmp);}
  catch(e){if(!/copied front pixels/.test(String(e.message)))throw e;rejected=true;}
  if(!rejected)throw Error('IMAGE MUTATION ESCAPED: '+label);
  console.log('RED IMAGE MUTATION: '+label);
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
