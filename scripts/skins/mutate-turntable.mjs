#!/usr/bin/env node
// K3/K5: each historical failure must be rejected, including a fake-volume cheat.
// Dependency free so KONTUR can execute it even on a clean runner.
import fs from 'node:fs';
import path from 'node:path';
import {inspectGeometry} from './turntable-geometry.mjs';
import {LIMITS} from './turntable-thresholds.mjs';

const minimum={sideTorsoWidth:.5,bodyDepthToWidth:.6,sideFaceHashSimilarity:.9,
 outlineCoverage:.8,silhouetteContrast:2.5,maximumLargeComponents:1,
 largeComponentFraction:.015,outlineColor:'#1a0f14'};
for(const [key,floor] of Object.entries(minimum)){
 if(LIMITS[key]!==floor)throw Error('UNAUTHORIZED TURNTABLE THRESHOLD CHANGE: '+key);
}
if(LIMITS.angles.join(',')!=='0,45,90,135,180,225,270,315')
 throw Error('8 required view angles were downgraded');
const name=path.basename(process.argv[2]||'skins/sources/rusty-robot');
const input=path.resolve('skins/packs',name,'skin.json');

function fixture(){
 const anchors=['body','head','armL','armR','legL','legR'];
 const defs={body:[[.74,.94,.70],[0,.05,0]],head:[[.82,.82,.82],[0,0,0]],
 armL:[[.34,.74,.42],[.075,-.24,0]],armR:[[.34,.74,.42],[-.075,-.24,0]],
 legL:[[.32,.74,.43],[0,-.32,0]],legR:[[.32,.74,.43],[0,-.32,0]]};
 const parts=[];
 for(const bone of anchors){
  const [dims,offset]=defs[bone];
  const prefix='volume-'+bone;
  parts.push({id:prefix,layer:'3d',kind:'plate',bone,
   primitive:bone==='head'?'sphere':'box',dims,offset,rotation:[0,0,0],
   material:'rust',outline:true,faces:Object.fromEntries(
    ['right','left','top','bottom','back','front',...(bone==='head'?['panorama']:[])].map(side=>
     [side,'textures/'+prefix+'-'+side+'.png']))});
  parts.push({id:prefix+'-front-art',layer:'2.5d',kind:'plate',bone,
    file:'parts/'+bone+'.png'});
 }
 return {parts,materials:{rust:{rough:.92}}};
}
let baseline=fixture();
if(fs.existsSync(input)){
 const file=JSON.parse(fs.readFileSync(input,'utf8'));
 if(file.parts?.some(p=>p.id==='volume-body'))baseline=file;
}
inspectGeometry(baseline);

const cases=[
 ['thin plate instead of box',m=>{m.parts.find(p=>p.id==='volume-body').dims[2]=.04;},/paper-thin/],
 ['front photograph copied onto a side',m=>{
  const v=m.parts.find(p=>p.id==='volume-body');
  v.faces.right=m.parts.find(p=>p.id==='volume-body-front-art').file;
 },/copy of front/],
 ['black outline switched off',m=>{m.parts.find(p=>p.id==='volume-head').outline=false;},/outline missing/],
 ['gap between torso and leg',m=>{m.parts.find(p=>p.id==='volume-legL').offset[1]-=1.2;},/disconnected joint/],
 ['emissiveMap on armor',m=>{m.parts.find(p=>p.id==='volume-body').emissiveMap='textures/rust.png';},/emissiveMap/],
 ['cheat with fake profileVolume instead of depth',m=>{
  const v=m.parts.find(p=>p.id==='volume-body');
  v.dims[2]=.02;v.profileVolume=50;
 },/paper-thin|forbidden/]
];
for(const [label,change,expected] of cases){
 const mutant=structuredClone(baseline);change(mutant);
 let failed=false;
 try{inspectGeometry(mutant);}catch(e){
  if(!expected.test(String(e.message)))throw Error(label+': wrong failure: '+e.message);
  failed=true;
 }
 if(!failed)throw Error('MUTATION ESCAPED: '+label);
 console.log('RED MUTATION: '+label);
}
console.log('TURN TABLE K5: all 6 deliberate corruptions rejected');
