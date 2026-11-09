// B7: rules green on main may not turn red on this PR.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {audit,formatReport} from './run.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const dir=path.join(root,'games/.rules-bot-mutation-baseline');
const current=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const prior=await audit({gameDir:dir});
const key=r=>r.rule+' / '+r.screen;
const now=new Map(current.map(r=>[key(r),r]));
const regressions=prior.filter(p=>p.status==='ВЫПОЛНЕНО'&&now.get(key(p))?.status!=='ВЫПОЛНЕНО');
if(regressions.length){console.error('REGRESSION: '+formatReport(regressions));process.exitCode=1;}
else console.log('NO_REGRESSION for '+prior.length+' browser-rule measurements');