import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.join(here,'build-index.mjs'),'utf8');
const gitBlob=bytes=>crypto.createHash('sha1')
  .update('blob '+bytes.length+'\0').update(bytes).digest('hex');

function runCase(script,attack){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'shared-index-symlinks-'));
  try{
    const scriptDir=path.join(root,'scripts/shared');
    const components=path.join(root,'shared/components');
    const outside=path.join(root,'outside');
    fs.mkdirSync(scriptDir,{recursive:true});
    fs.mkdirSync(outside,{recursive:true});
    fs.writeFileSync(path.join(scriptDir,'build-index.mjs'),script);
    fs.writeFileSync(path.join(root,'package.json'),JSON.stringify({type:'module'}));
    const bytes=Buffer.from('export const fixture = 1;\n');
    const name=attack==='folder'?'linked':'honest';
    const manifest={
      id:name, title:'Fixture', kind:'code', entry:'entry.js',
      exports:['fixture'], license:'LicenseRef-Owner-Grant-META-GAMES-2026-11-06',
      source:{
        repository:'mpaykin1/meta6', path:'fixture/entry.js',
        commit:'a'.repeat(40), git_blob_sha:gitBlob(bytes)
      }
    };
    if(attack==='root'){
      const external=path.join(outside,'components');
      const folder=path.join(external,name);
      fs.mkdirSync(folder,{recursive:true});
      fs.writeFileSync(path.join(folder,'entry.js'),bytes);
      fs.writeFileSync(path.join(folder,'component.json'),JSON.stringify(manifest));
      fs.mkdirSync(path.join(root,'shared'),{recursive:true});
      fs.symlinkSync(external,components,'dir');
    }else{
      fs.mkdirSync(components,{recursive:true});
      const folder=attack==='folder'?path.join(outside,name):path.join(components,name);
      fs.mkdirSync(folder,{recursive:true});
      const entry=path.join(folder,'entry.js');
      if(attack==='entry'){
        const external=path.join(outside,'entry.js');
        fs.writeFileSync(external,bytes);
        fs.symlinkSync(external,entry,'file');
      }else fs.writeFileSync(entry,bytes);
      const componentJson=path.join(folder,'component.json');
      if(attack==='manifest'){
        const external=path.join(outside,'component.json');
        fs.writeFileSync(external,JSON.stringify(manifest));
        fs.symlinkSync(external,componentJson,'file');
      }else fs.writeFileSync(componentJson,JSON.stringify(manifest));
      if(attack==='folder')fs.symlinkSync(folder,path.join(components,name),'dir');
    }
    return spawnSync(process.execPath,[path.join(scriptDir,'build-index.mjs')],{
      cwd:root,encoding:'utf8',timeout:10000
    });
  }finally{
    fs.rmSync(root,{recursive:true,force:true});
  }
}

function verify(script){
  const baseline=runCase(script,'normal');
  assert.equal(baseline.status,0,'safe component must index: '+baseline.stderr);
  for(const attack of ['root','folder','manifest','entry']){
    const result=runCase(script,attack);
    assert.notEqual(result.status,0,'symlink escape accepted: '+attack);
    assert.match(result.stderr,/Unsafe component|Unexpected component/,
      'symlink rejected for the wrong reason: '+attack);
  }
}

verify(source);
const mutations=[
  ['folder link followed',s=>s.replace('fs.lstatSync(folder)','fs.statSync(folder)')],
  ['file link followed',s=>s.replace('fs.lstatSync(file)','fs.statSync(file)')],
  ['deceptive privileged ID',s=>s.replace(
    'if(folderType.isSymbolicLink()||!folderType.isDirectory())',
    "if((folderType.isSymbolicLink()||!folderType.isDirectory())&&id==='observer-audio')")]
];
for(const [name,mutate] of mutations){
  const broken=mutate(source);
  assert.notEqual(broken,source,'mutation anchor missing: '+name);
  let trapped=false;
  try{verify(broken);}catch(error){trapped=true;}
  assert.ok(trapped,'mutation survived: '+name);
}
console.log('SHARED_INDEX_SYMLINK_PASS: four attacks blocked; three mutations caught');
