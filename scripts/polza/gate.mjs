// Trusted GitHub CLI runtime; policy logic is in gate-core.mjs.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {verdict,claim,unwrapPage} from './gate-core.mjs';
const REPO='mpaykin1/meta6-lab';
function parseFinish(text) {
  const result = {};
  for (const line of text.split(/\r?\n/)) {
    const cells = line.split('|').map(s=>s.trim());
    if (cells.length < 6) continue;
    const id=cells[1], scripts=cells[3]||'';
    if (!/^(M[1-6]|B[1-7]|L[1-4]|P1)$/.test(id)) continue;
    const names = [...scripts.matchAll(/(?:scripts\/[A-Za-z0-9/_-]+\/)?(?:verify|mutate)-[A-Za-z0-9._-]+\.mjs/g)].map(x=>x[0]);
    const normalize=s=>s.startsWith('scripts/')?s:'scripts/shared/'+s;
    const verify=names.filter(x=>/\/verify-/.test('/'+x)).map(normalize);
    const mutate=names.filter(x=>/\/mutate-/.test('/'+x)).map(normalize);
    const checked=[];
    for(const path of verify) if(fs.existsSync(path)) {
      const src=fs.readFileSync(path,'utf8');
      for(const hit of src.matchAll(/['"]((?:games|ink|shared|reference|meta-games|scripts)\/[A-Za-z0-9._/-]+\.[A-Za-z0-9]+)['"]/g)) checked.push(hit[1]);
    }
    result[id]={verify,mutate,checked};
  }
  return result;
}
async function api(path) {
 const data=execFileSync('gh',['api','repos/'+REPO+path],{encoding:'utf8',maxBuffer:16*1024*1024});
 return JSON.parse(data);
}
async function pages(path) {
  const out=[];
  for(let page=1;page<=10;page++){
    const data=await api(path+(path.includes('?')?'&':'?')+'per_page=100&page='+page);
    const list=unwrapPage(data);
    out.push(...list); if(list.length<100) break;
  }
  return out;
}
async function getRun(runUrl) {
  const m=runUrl.match(/\/actions\/runs\/([0-9]+)$/);
  if(!m) return null;
  const run=await api('/actions/runs/'+m[1]);
  const jobs=await pages('/actions/runs/'+m[1]+'/jobs');
  return {...run,jobsFailed:jobs.some(j=>j.conclusion==='failure')};
}
async function main() {
  const event=JSON.parse(fs.readFileSync(0,'utf8'));
  const pr=event.pull_request;
  if(!pr) throw Error('pull_request event required');
  const n=pr.number;
  const files=await pages('/pulls/'+n+'/files');
  const opened=await pages('/pulls?state=open');
  const allFlows=await pages('/contents/.github/workflows?ref=main').catch(()=>[]);
  let scheduled=0;
  for(const x of allFlows){
    if(!/\.ya?ml$/.test(x.name)) continue;
    const f=await api('/contents/'+x.path+'?ref=main');
    if(f.content && /^\s*schedule\s*:/m.test(Buffer.from(f.content,'base64').toString('utf8'))) scheduled++;
  }
  const newCronFiles=[];
  for(const f of files.filter(f=>f.status==='added'&&/^\.github\/workflows\/.*\.ya?ml$/.test(f.filename))){
    const src=await api('/contents/'+f.filename+'?ref='+pr.head.sha);
    if(src.content && /^\s*schedule\s*:/m.test(Buffer.from(src.content,'base64').toString('utf8'))) newCronFiles.push(f.filename);
  }
  const c=claim(pr.body);
  let botOK=false,redRun=null,repairPaths=[];
  if(c?.type==='game'){
    const runs=await pages('/actions/runs?head_sha='+pr.head.sha);
    botOK=runs.some(r=>r.head_sha===pr.head.sha && r.conclusion==='success' && r.event==='pull_request' && (r.path||'').includes('.github/workflows/meta-bot.yml'));
  }
  if(c?.type==='fix'){
    redRun=await getRun(c.value);
    if(redRun && redRun.head_branch==='main' && redRun.conclusion==='failure'){
      const path=(redRun.path||'').replace(/^.*?\.github\//,'.github/').replace(/@.*$/,'');
      if(/^\.github\/workflows\/[a-zA-Z0-9._-]+\.ya?ml$/.test(path)){
        repairPaths.push(path);
        const raw=await api('/contents/'+path+'?ref='+redRun.head_sha);
        const source=Buffer.from(raw.content||'','base64').toString('utf8');
        repairPaths.push(...[...source.matchAll(/(?:scripts|games|shared)\/[A-Za-z0-9_./-]+/g)].map(x=>x[0].replace(/\/\*\*$/,'')));
      }
    }
  }
  const ctx={body:pr.body,files,openPRs:opened.length,scheduledWorkflows:scheduled,newCronFiles,finish:parseFinish(fs.readFileSync('rules/09-platforma/FINISH.md','utf8')),botOK,redRun,repairPaths};
  const answer=verdict(ctx);
  execFileSync('gh',['api','--method','POST','repos/'+REPO+'/statuses/'+pr.head.sha,'--input','-'],{
    input:JSON.stringify({state:answer.ok?'success':'failure',context:'POLZA',description:answer.reason.slice(0,140),target_url:'https://github.com/'+REPO+'/actions'}),
    encoding:'utf8'
  });
  console.log(JSON.stringify({pr:n,head:pr.head.sha,openPRs:opened.length,scheduled,claim:c,answer},null,2));
  if(!answer.ok) process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
