import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifyCatalog} from './verify-catalog.mjs';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const sample=Array.from({length:30},(_,i)=>'function cameraStep'+i+'(){return '+(i===0?JSON.stringify('fog.png'):i)+';}').join('\n')+'\n';
const scenarios=[
 ['vendor-code',(root,entry)=>{entry.lines[0].source_path='games/demo/lib/three.module.js';fs.mkdirSync(path.join(root,'games/demo/lib'),{recursive:true});fs.writeFileSync(path.join(root,'games/demo/lib/three.module.js'),sample);}],
 ['tiny-function',(root,entry)=>{entry.lines[0].end=3;entry.sha256=sha(Buffer.from(sample.split('\n').slice(0,3).join('\n')+'\n'));}],
 ['deception-false-load-ok',(root,entry)=>{entry.load_ok=true;entry.load_evidence=undefined;}],
 ['missing-dependency',(root,entry)=>{entry.depends_on=['demo:missing'];}],
 ['truncated-sha',(root,entry)=>{entry.lines[0].end=29;}],
 ['assemble-writes-main',(root,entry)=>{entry.assembly_target='main';}],
 ['matched-hash-but-invalid-syntax',(root,entry)=>{
  const file=path.join(root,'games/demo/index.js');
  const changed=sample.replace('function cameraStep0()','function cameraStep0(');
  fs.writeFileSync(file,changed);
  entry.sha256=sha(Buffer.from(changed));
 }],
 ['missing-referenced-asset',(root,entry)=>{entry.asset_ids=[];}],
 ['invented-asset',(root,entry)=>{entry.asset_ids=['fake-id'];}],
 ['deceptive-all-unloadable',(root,entry,catalog)=>{
  catalog.solutions.push({...entry,id:'demo:weather'},{...entry,id:'demo:controls'});
  catalog.solution_count=catalog.solutions.length;
  catalog.load_evidence_type='chromium-original-source-load-v1';
 }]
];
let caught=0;
for(const [name,damage] of scenarios){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'catalog-mutation-'));
 try{
  const source='games/demo/index.js',absolute=path.join(root,source);
  fs.mkdirSync(path.dirname(absolute),{recursive:true});fs.writeFileSync(absolute,sample);
  const entry={id:'demo:camera',game:'demo',system:'camera',source_path:source,
   lines:[{source_path:source,start:1,end:30}],sha256:sha(Buffer.from(sample)),
   depends_on:[],asset_ids:['fog-id'],how_to_connect:{entrypoint:'cameraStep0'},load_ok:false};
  const catalog={schema_version:1,solution_count:1,solutions:[entry]};
  const target=path.join(root,'shared/library/catalog-solutions.json');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(path.join(root,'games/demo/fog.png'),'real original asset');
  fs.writeFileSync(path.join(root,'shared/library/index.json'),JSON.stringify({entries:[
   {id:'fog-id',game:'demo',kind:'image',source_path:'games/demo/fog.png'}
  ]}));
  const write=()=>fs.writeFileSync(target,JSON.stringify(catalog));
  write();verifyCatalog(root);
  damage(root,entry,catalog);write();
  let rejected=false;
  try{verifyCatalog(root);}catch{rejected=true;}
  if(!rejected)throw Error('Mutation escaped: '+name);
  console.log('CAUGHT '+name);caught++;
 }finally{fs.rmSync(root,{recursive:true,force:true});}
}
if(caught!==scenarios.length)throw Error('Incomplete mutation suite');
