/** Permanent wrapper for PNG sprite-stack quality fixtures.
 * The Python suite additionally runs from ASSET CHECK CI with mutation tests. */
import {spawnSync} from 'node:child_process';
const cmd = ['-m','unittest','discover','-s','automation/asset-check','-p','test_spritestack.py','-v'];
const run=spawnSync('python3',cmd,{encoding:'utf8',stdio:'inherit'});
if(run.error)throw run.error;
if(run.status!==0)process.exit(run.status||1);
