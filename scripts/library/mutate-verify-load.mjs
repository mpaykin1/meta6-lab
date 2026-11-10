import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {verifyCatalog} from './verify-catalog.mjs';
import {rangeBytes} from './machine.mjs';

const sha=x=>createHash('sha256').update(x).digest('hex');
const cli=fileURLToPath(new URL('./verify-load.mjs',import.meta.url));
const scenarios=[
 ['forged-entrypoint',false,'nonexistentFog'],
 ['missing-required-helper',true,'weatherFog'],
 ['fake-canvas-effect',false,'weatherFog'],
 ['transparent-draw-deception',false,'weatherFog',true]
];
for(const [scenario,missingDependency,entrypoint,transparentDraw] of scenarios){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'meta-l3-mutation-'));
 try{
  const sourcePath=path.join(root,'games/demo/game.js');
  fs.mkdirSync(path.dirname(sourcePath),{recursive:true});
  const lines=['function weatherFog(){'];
  if(missingDependency)lines.push('missingDependency();');
  if(transparentDraw)lines.push('const ctx=document.getElementById("game").getContext("2d");',
   'ctx.fillStyle="rgba(0,0,0,0)";',
   'ctx.fillRect(0,0,640,360);');
  while(lines.length<28)lines.push('const value'+lines.length+'='+lines.length+';');
  lines.push('return 7;','}');
  const source=lines.join('\n')+'\n';
  fs.writeFileSync(sourcePath,source);
  const item={id:'demo:weather',game:'demo',system:'weather',source_path:'games/demo/game.js',
   lines:[{source_path:'games/demo/game.js',start:1,end:lines.length}],
   sha256:sha(rangeBytes(source,1,lines.length)),depends_on:[],
   how_to_connect:{entrypoint},load_ok:true,load_error:null,
   load_evidence:{chromium_run:'chromium-original-source-load-v1',sha256:sha(source)}};
  const dir=path.join(root,'shared/library');
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.json'),JSON.stringify({entries:[]}));
  fs.writeFileSync(path.join(dir,'catalog-solutions.json'),JSON.stringify({schema_version:1,solution_count:1,solutions:[item]}));
  verifyCatalog(root);
  const run=spawnSync(process.execPath,[cli,'--root',root,'--verify'],{
   encoding:'utf8',timeout:30000,maxBuffer:3*1024*1024});
  assert.equal(run.status,1,'Forged positive outcome was accepted: '+scenario+' '+run.stderr);
  assert.match(run.stderr,/Recorded load_ok or evidence disagrees with real Chromium execution/,
   'Rejection must be due to real browser probe, not missing tooling: '+scenario+' '+run.stderr);
  console.log('CAUGHT actual-Chromium '+scenario);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
}
