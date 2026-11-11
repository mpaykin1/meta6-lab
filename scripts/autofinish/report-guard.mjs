import {execFileSync} from 'node:child_process';
import {violations} from './report-guard-core.mjs';
const paths=['SMENA.md','DOVODKA.md','docs/progress','automation/chat'];
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:1e7});
const diff=git('diff','--unified=0','origin/main...HEAD','--',...paths);
const errors=violations(diff);
if(errors.length){
  for(const err of errors)console.error('::error::Отчёт без ссылки на попытку: '+err);
  process.exitCode=1;
}else console.log('REPORT_GUARD_PASS: все новые пункты с попыткой или без запретных ожиданий');
