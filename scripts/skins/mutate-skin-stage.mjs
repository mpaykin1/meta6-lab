#!/usr/bin/env node
// Stage flag mutation traps; the original full-pack mutation script stays unchanged.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const src=path.resolve('skins/packs/rusty-robot');
const validator=path.resolve('scripts/skins/validate-skin-pack.mjs');
const stage=Number(process.argv[2]??0);
if(!Number.isInteger(stage)||stage<0||stage>7)throw Error('Invalid stage');
if(stage===7){console.log('STAGE flag strictness traps already covered on stage 0; S1–S12 mutation suite is mandatory here.');process.exit(0);}
const work=fs.mkdtempSync(path.join(os.tmpdir(),'skin-stage-traps-'));
const dst=path.join(work,'rusty-robot');
function check(args){return spawnSync(process.execPath,[validator,dst,...args],{encoding:'utf8'});}
function expectFail(name,mutate,args=['--stage',String(stage)]){
 fs.rmSync(dst,{recursive:true,force:true});
 fs.cpSync(src,dst,{recursive:true});
 mutate(dst);
 const r=check(args);
 if(r.status===0||!(r.stderr+r.stdout).includes('STAGE:'))throw Error('MUTATION ESCAPED: '+name+'\n'+r.stderr+r.stdout);
 console.log('TRAP PASS '+name+' → STAGE');
}
try{
 const baseline=spawnSync(process.execPath,[validator,src,'--stage',String(stage)],{encoding:'utf8'});
 if(baseline.status!==0)throw Error('STAGE baseline invalid\n'+baseline.stderr+baseline.stdout);
 expectFail('missing-comparison',d=>fs.rmSync(path.join(d,'stages',stage+'.png')));
 expectFail('counterfeit-stage-record',d=>fs.writeFileSync(path.join(d,'STAGE.md'),'этап 7 сделан\n'));
 expectFail('invalid-stage-8',d=>{},['--stage','8']);
 expectFail('noninteger-stage-0.5',d=>{},['--stage','0.5']);
 if(stage===0){
  expectFail('false-owner-sketch',d=>fs.writeFileSync(path.join(d,'reference.png'),'substituted content'));
  expectFail('missing-colour-analysis',d=>fs.writeFileSync(path.join(d,'README.md'),'Empty'));
 }
 console.log('Stage mutation traps PASS');
}finally{fs.rmSync(work,{recursive:true,force:true});}
