#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {checkSide} from './verify-side-profile.mjs';
const src=process.argv[2]||'skins/sources/rusty-robot';
const original=JSON.parse(fs.readFileSync(path.join('skins/packs',path.basename(src),'skin.json'),'utf8')).parts;
const solid=original.find(p=>p.layer==='3d');
if(!solid)throw Error('No solid to mutate');
for(const [label,change] of [
 ['missing left side',parts=>parts.splice(parts.findIndex(p=>p.id===solid.id+'-side-left'),1)],
 ['side viewed edge-on',parts=>{parts.find(p=>p.id===solid.id+'-side-right').rotation=[0,0,0];}],
 ['wrong side position',parts=>{parts.find(p=>p.id===solid.id+'-side-left').offset[0]=solid.offset[0]+1;}]
]){
 const parts=structuredClone(original);
 change(parts);
 let caught=false;
 try{checkSide(parts);}catch{caught=true;}
 if(!caught)throw Error('Mutation escaped: '+label);
 console.log('SIDE MUTATION CAUGHT: '+label);
}
