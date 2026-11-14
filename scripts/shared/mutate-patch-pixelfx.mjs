import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const gitBlob=bytes=>crypto.createHash('sha1')
  .update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const upstream=path.join(root,'shared/components/patch-pixelfx');

function run(attack){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'patch-pixelfx-mutations-'));
  try{
    const folder=path.join(tmp,'shared/components/patch-pixelfx');
    const script=path.join(tmp,'scripts/shared/build-index.mjs');
    fs.mkdirSync(path.dirname(script),{recursive:true});
    fs.mkdirSync(path.join(tmp,'integration/patch'),{recursive:true});
    fs.cpSync(upstream,folder,{recursive:true});
    fs.copyFileSync(path.join(root,'scripts/shared/build-index.mjs'),script);
    fs.copyFileSync(path.join(root,'integration/patch/REGISTRY.json'),
      path.join(tmp,'integration/patch/REGISTRY.json'));
    const effect=path.join(folder,'src/fx/fire/campfire.js');
    const passport=path.join(folder,'component.json');
    if(attack==='changed-effect')fs.appendFileSync(effect,'\n// unpinned drift\n');
    if(attack==='changed-license')fs.appendFileSync(path.join(folder,'LICENSE'),'\nchanged\n');
    if(attack==='forged-source'){
      const fake=Buffer.from('export const meta = {name:"Fake",duration:1}; export const create = () => ({draw(){}});\n');
      fs.writeFileSync(effect,fake);
      const json=JSON.parse(fs.readFileSync(passport,'utf8'));
      json.source.files.find(file=>file.path==='src/fx/fire/campfire.js').git_blob_sha=gitBlob(fake);
      fs.writeFileSync(passport,JSON.stringify(json,null,2)+'\n');
    }
    const result=spawnSync(process.execPath,[script],{
      cwd:tmp,encoding:'utf8',timeout:15000
    });
    return result;
  }finally{
    fs.rmSync(tmp,{recursive:true,force:true});
  }
}

const normal=run('clean');
assert.equal(normal.status,0,'licensed unmodified modules must index: '+normal.stderr);
for(const [attack,reason] of [
  ['changed-effect',/External original bytes drifted/],
  ['changed-license',/External MIT notice changed/],
  ['forged-source',/Unregistered or altered external source/]
]){
  const result=run(attack);
  assert.notEqual(result.status,0,attack+' was not rejected');
  assert.match(result.stderr,reason,attack+' rejected for an unexpected reason');
  console.log('PIXELFX_MUTATION_REJECTED',attack);
}
