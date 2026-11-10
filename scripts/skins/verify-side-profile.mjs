#!/usr/bin/env node
// The accepted front view must not hide missing 3D side surfaces.
import fs from 'node:fs';
import path from 'node:path';
const src=process.argv[2]||'skins/sources/rusty-robot';
const manifest=JSON.parse(fs.readFileSync(path.join('skins/packs',path.basename(src),'skin.json'),'utf8'));
export function checkSide(parts){
 const solids=parts.filter(p=>p.layer==='3d');
 if(!solids.length)throw Error('SIDE PROFILE: no solid geometry');
 for(const p of solids){
  const front=parts.find(x=>x.id===p.id+'-front-art');
  if(!front?.file)throw Error('SIDE PROFILE: missing front reference '+p.id);
  for(const [name,sign] of [['side-left',-1],['side-right',1]]){
   const side=parts.find(x=>x.id===p.id+'-'+name);
   if(!side||side.file!==front.file||side.layer!=='2.5d')
    throw Error('SIDE PROFILE: missing authored '+name+' '+p.id);
   if(Math.abs(Math.abs(side.rotation?.[1]||0)-Math.PI/2)>.01)
    throw Error('SIDE PROFILE: side plane edge-on '+p.id);
   if(sign*(side.offset?.[0]-p.offset?.[0])<=0)
    throw Error('SIDE PROFILE: incorrect side placement '+p.id);
  }
 }
 return true;
}
checkSide(manifest.parts);
console.log('SIDE PROFILE: authored side panels on '+manifest.parts.filter(p=>p.layer==='3d').length+' solid parts');
