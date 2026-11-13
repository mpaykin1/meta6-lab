// Three independent regression mutations, including forging the passport.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {PINNED,gitBlobSHA,verifyGuardian} from './check-guardian-v1.mjs';
const root=process.cwd(),tests=[
  dir=>fs.appendFileSync(path.join(dir,'demos/living-watercolor/ink-fallen-robot.js'),'\n// mutation\n'),
  dir=>fs.rmSync(path.join(dir,'demos/living-watercolor/ink-forest.js')),
  dir=>{
    const file=path.join(dir,'demos/living-watercolor/ink-fallen-robot.js');
    fs.appendFileSync(file,'\n// forged passport attempt\n');
    const manifest=path.join(dir,'shared/references/ink-fallen-guardian.json');
    const json=JSON.parse(fs.readFileSync(manifest,'utf8'));
    json.source.files.find(x=>x.path==='demos/living-watercolor/ink-fallen-robot.js').git_blob_sha=gitBlobSHA(fs.readFileSync(file));
    fs.writeFileSync(manifest,JSON.stringify(json));
  }
];
for(let i=0;i<tests.length;i++){
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ink-v1-mut-'));
  try{
    for(const file of [...Object.keys(PINNED),'shared/references/ink-fallen-guardian.json']){
      fs.mkdirSync(path.dirname(path.join(temp,file)),{recursive:true});
      fs.copyFileSync(path.join(root,file),path.join(temp,file));
    }
    tests[i](temp);
    let caught=false;try{verifyGuardian(temp);}catch{caught=true;}
    if(!caught)throw Error('MUTATION_'+(i+1)+'_UNDETECTED');
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
console.log('INK_GUARDIAN_V1_3_MUTATIONS_PASS');
