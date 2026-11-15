import {execFileSync,spawnSync} from 'node:child_process';
import {validateSourceOnly} from './source-only-gate.mjs';

try{
 const changes=execFileSync('git',['diff','--name-status','origin/main...HEAD'],{
  encoding:'utf8',stdio:['ignore','pipe','pipe']});
 const result=validateSourceOnly(changes,id=>{
  // `git cat-file -e` exits 128 (not 1) for a path that is not on main, so a brand-new game crashed this gate.
  // ls-tree answers both cases with status 0: empty output = the game is new.
  const probe=spawnSync('git',['ls-tree','--name-only','origin/main','games/'+id],{
   encoding:'utf8',stdio:['ignore','pipe','pipe']});
  if(probe.error)throw probe.error;
  if(probe.status!==0)throw Error('Cannot read base game tree: '+probe.status+' '+(probe.stderr||'').trim());
  return probe.stdout.trim()!=='';
 });
 console.log('Source-only PR: '+result.game+'; '+result.sourceFiles+' original files; catalog verified in CI');
}catch(error){console.error(error.stack||error);process.exitCode=1}
