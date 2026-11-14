import {execFileSync,spawnSync} from 'node:child_process';
import {validateSourceOnly} from './source-only-gate.mjs';

try{
 const changes=execFileSync('git',['diff','--name-status','origin/main...HEAD'],{
  encoding:'utf8',stdio:['ignore','pipe','pipe']});
 const result=validateSourceOnly(changes,id=>{
  const probe=spawnSync('git',['cat-file','-e','origin/main:games/'+id],{
   stdio:'ignore'});
  if(probe.error)throw probe.error;
  if(probe.status===0)return true;
  if(probe.status===1)return false;
  throw Error('Cannot read base game tree: '+probe.status);
 });
 console.log('Source-only PR: '+result.game+'; '+result.sourceFiles+' original files; catalog verified in CI');
}catch(error){console.error(error.stack||error);process.exitCode=1}
