import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {contentRevision,finishCount,git} from './revision.mjs';
const repo=process.env.GITHUB_REPOSITORY||'mpaykin1/meta6-lab';
const run=(...a)=>execFileSync('gh',a,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
function check() {
 if (process.env.SOURCE_RUN_ID && process.env.SOURCE_RUN_CONCLUSION) {
  return {id:process.env.SOURCE_RUN_ID,conclusion:process.env.SOURCE_RUN_CONCLUSION};
 }
 try {
  const data=JSON.parse(run('api','repos/'+repo+'/actions/runs?per_page=50&status=completed'));
  const item=data.workflow_runs.find(x=>!['STATUS compact guard','Checks compact summary','LAB Pages','Sync from meta6'].includes(x.name) && ['success','failure','timed_out','cancelled','action_required'].includes(x.conclusion));
  if(item)return {id:item.id,conclusion:item.conclusion};
 }catch(e){console.error('GitHub API failed: '+e.message)}
 const old=fs.readFileSync('STATUS.md','utf8');
 const m=old.match(/^checks: (зелёный|красный) — https:\/\/github\.com\/mpaykin1\/meta6-lab\/actions\/runs\/(\d+)$/m);
 if(m)return {id:m[2],conclusion:m[1]==='зелёный'?'success':'failure'};
 throw Error('No verified completed Actions run');
}
const sha=contentRevision('HEAD');
const change=git('show','-s','--format=%cI',sha).replace(/\+00:00$/,'Z');
const count=finishCount(fs.readFileSync('rules/09-platforma/FINISH.md','utf8'));
const c=check();
const fields={
 last_change:change,last_sha:sha,finish:count+'/18',
 checks:(c.conclusion==='success'?'зелёный':'красный')+' — https://github.com/'+repo+'/actions/runs/'+c.id
};
const lines=fs.readFileSync('STATUS.md','utf8').trimEnd().split(/\r?\n/);
for(const [k,v] of Object.entries(fields)){
 const n=lines.findIndex(s=>s.startsWith(k+':'));
 if(n===-1)throw Error('STATUS missing '+k);
 lines[n]=k+': '+v;
}
fs.writeFileSync('STATUS.md',lines.join('\n')+'\n');
console.log('Generated STATUS for substantive main '+sha);
