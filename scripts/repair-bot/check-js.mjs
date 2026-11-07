import {execFileSync,spawnSync} from 'node:child_process';
import fs from 'node:fs';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
let bad=0,checked=0;
for(const file of files){
 if(!/\.(?:js|mjs|cjs)$/.test(file)||/(^|\/)(?:node_modules|vendor|dist|build|coverage)(\/|$)/.test(file))continue;
 if(!fs.existsSync(file))continue;
 const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 checked++;
 if(result.status!==0){bad++;console.error('INVALID_JS '+file+'\n'+(result.stderr||''));}
}
console.log('JS syntax checked='+checked+' invalid='+bad);
if(bad)process.exitCode=2;
