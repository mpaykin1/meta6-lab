#!/usr/bin/env node
// Runner pin and on-push physical 3D regression/camera proof.
// All generated outputs stay inside skins/packs/rusty-robot/.
import fs from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as pause} from 'node:timers/promises';
const workflow='.github/workflows/skin-pack.yml';
const yaml=fs.readFileSync(workflow,'utf8');
if(!/^\s+runs-on:\s+ubuntu-24\.04\s*$/m.test(yaml) ||
   /runs-on:\s+ubuntu-latest/.test(yaml)){
 console.error('SKIN_CI_RUNNER: unsupported runner (requires ubuntu-24.04)');
 process.exit(1);
}
console.log('SKIN_CI_RUNNER PASS (ubuntu-24.04)');
if(process.env.GITHUB_ACTIONS!=='true' ||
   process.env.GITHUB_EVENT_NAME!=='push' ||
   process.env.GITHUB_REF!=='refs/heads/lab/skin-rusty-robot' ||
   process.env.SKIN_STAGE!=='1')process.exit(0);

function run(cmd,args){
 const r=spawnSync(cmd,args,{stdio:'inherit',env:process.env});
 if(r.status!==0)throw Error(cmd+' '+args.join(' ')+' exited '+r.status);
}
console.log('RUSTY_ROBOT_3D: installing headless Chromium for structural and four-view gate');
run('npm',['install','--no-save','--no-package-lock','playwright@1.56.1','sharp@0.34.4']);
run('npx',['playwright','install','--with-deps','chromium']);
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],
  {stdio:'ignore',detached:false});
try{
 let live=false;
 for(let i=0;i<50;i++){
   try{const r=await fetch('http://127.0.0.1:8765/games/skin-trainer/index.html',
     {signal:AbortSignal.timeout(1200)});if(r.ok){live=true;break;}}
   catch(e){}
   await pause(400);
 }
 if(!live)throw Error('local trainer HTTP unavailable');
 run('node',['scripts/skins/test-rusty-robot-3d.mjs']);
 run('node',['scripts/skins/capture-skin-preview.mjs']);
 console.log('RUSTY_ROBOT_3D PASS; real four-view proof staged for GitHub Actions commit');
}finally{server.kill('SIGTERM');}
