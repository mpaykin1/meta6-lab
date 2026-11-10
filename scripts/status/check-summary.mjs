import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const [repo,id,state,nameArg,summaryFile]=process.argv.slice(2);
if(!repo||!id||!state||!summaryFile)throw Error('Missing required workflow arguments');
const name=(nameArg||'workflow').replace(/[\r\n|]/g,' ').slice(0,90);
let error='нет';
if(state!=='success'){
 error='смотри красный шаг в Actions';
 try {
  const raw=execFileSync('gh',['api','repos/'+repo+'/actions/runs/'+id+'/jobs?per_page=100'],{encoding:'utf8'});
  const jobs=JSON.parse(raw).jobs||[];
  const failed=jobs.find(j=>j.conclusion==='failure'||j.conclusion==='timed_out');
  error=failed?.steps?.find(s=>s.conclusion==='failure')?.name||failed?.name||error;
 }catch(e){console.error(e.message)}
}
const lines=['status: '+(state==='success'?'зелёный':'красный'),'workflow: '+name,'first_error: '+String(error).replace(/[\r\n]/g,' ').slice(0,150),'run: https://github.com/'+repo+'/actions/runs/'+id];
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/LAST_RUN.md',lines.join('\n')+'\n');
fs.appendFileSync(summaryFile,lines.join('\n')+'\n');
