import fs from 'node:fs';
import cp from 'node:child_process';
const run=(...args)=>cp.execFileSync('gh',args,{encoding:'utf8'}).trim();
const repo=process.env.GITHUB_REPOSITORY||'mpaykin1/meta6-lab';
const id=process.env.RUN_ID||process.env.GITHUB_RUN_ID;
const url='https://github.com/'+repo+'/actions/runs/'+id;
const state=process.env.RUN_CONCLUSION||'unknown';
let first='нет';
if(state!=='success'){
 try{
  const jobs=JSON.parse(run('api','repos/'+repo+'/actions/runs/'+id+'/jobs','--paginate'));
  const failed=(jobs.jobs||[]).find(j=>j.conclusion==='failure');
  first=failed?.steps?.find(s=>s.conclusion==='failure')?.name||failed?.name||'см. полный лог Actions';
 }catch{first='см. полный лог Actions';}
}
const status=state==='success'?'зелёный':'красный';
const name=(process.env.RUN_NAME||'Checks').replace(/[\r\n]/g,' ').slice(0,100);
const lines=['status: '+status,'workflow: '+name,'first_error: '+first.replace(/[\r\n]/g,' ').slice(0,160),'run: '+url];
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/LAST_RUN.md',lines.join('\n')+'\n');
fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
