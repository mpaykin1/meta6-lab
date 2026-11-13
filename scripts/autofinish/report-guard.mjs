import {execFileSync} from 'node:child_process';
import {violations} from './report-guard-core.mjs';
const paths=['SMENA.md','DOVODKA.md','docs/progress','automation/chat',
  'journal/entries/SMENA','journal/entries/docs/progress'];
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:1e7});
const head=process.env.REPORT_GUARD_HEAD || 'HEAD';
if(head!=='HEAD'&&!/^[a-f0-9]{40}$/.test(head))throw Error('Invalid report audit HEAD SHA');
const diff=git('diff','--unified=0','origin/main...'+head,'--',...paths);
const errors=violations(diff);
if(errors.length){
  for(const err of errors)console.error('::error::Отчёт без ссылки на попытку: '+err);
  process.exitCode=1;
}else console.log('REPORT_GUARD_PASS: все новые пункты с попыткой или без запретных ожиданий');
