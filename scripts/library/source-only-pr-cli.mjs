import {execFileSync} from 'node:child_process';
import {validateSourceOnly} from './source-only-gate.mjs';
import {baseGameExists} from './source-only-base.mjs';

try{
 const changes=execFileSync('git',['diff','--name-status','origin/main...HEAD'],{
  encoding:'utf8',stdio:['ignore','pipe','pipe']});
 const result=validateSourceOnly(changes,baseGameExists);
 console.log('Source-only PR: '+result.game+'; '+result.sourceFiles+' original files; catalog verified in CI');
}catch(error){console.error(error.stack||error);process.exitCode=1}
