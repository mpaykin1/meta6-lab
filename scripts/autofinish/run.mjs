// Fail-closed PR finisher. Only the trusted main checkout executes this file.
import {execFileSync} from 'node:child_process';
const repo=process.env.AUTOFINISH_REPO,token=process.env.AUTOFINISH_TOKEN;
if(!repo||!token)throw Error('Missing AUTOFINISH credentials');
const base='https://api.github.com/repos/'+repo;
const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28'};
async function api(path,method='GET',data){
  const r=await fetch(base+path,{method,headers,...(data?{body:JSON.stringify(data)}:{})});
  const raw=await r.text();let json;
  try{json=raw?JSON.parse(raw):{};}catch{json={message:raw.slice(0,200)};}
  if(!r.ok)throw Error(method+' '+path+' HTTP '+r.status+': '+(json.message||''));
  return json;
}
const protectedPaths=[/^\.github\//,/^scripts\/meta-bot\//,/^scripts\/kontur\//,
  /^scripts\/zadachi\//,/^scripts\/meta-games-guard\.sh$/, /^reference\//,
  /^rules\/09-platforma\/(?:FINISH|ZANYATO)\.md$/,
  /^rules\/06-rabota-ii-s-kodom\/KONTUR_BEZ_OSHIBOK\.md$/,
  /(?:^|\/)(?:test|verify|mutate|selftest)[^/]*\.[cm]?js$/];
export const safeFiles=files=>files.length>0&&files.length<500&&
  files.every(f=>!protectedPaths.some(re=>re.test(f.filename)));
export function green(checks,statuses,files){
  if(!checks.length||checks.some(c=>c.status!=='completed'||c.conclusion!=='success'))return false;
  const names=new Set(checks.map(c=>c.name));
  if(!['mutate-kontur-guard','kontur-guard','guard'].every(n=>names.has(n)))return false;
  if(files.some(f=>/^(games|meta-games)\//.test(f.filename))&&!names.has('bot'))return false;
  return statuses.every(s=>s.state==='success');
}
export function independentReview(reviews,pr,verified){
  return reviews.some(r=>r.state==='APPROVED'&&r.commit_id===pr.head.sha&&
    r.user?.login!==pr.user?.login&&verified.has(r.user?.login)&&
    /ПЕРЕКРЁСТНАЯ ПРОВЕРКА:\s*PASS/i.test(r.body||'')&&
    /МУТАЦИИ:\s*3\/3/i.test(r.body||'')&&
    /https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/actions\/runs\/\d+/.test(r.body||''));
}
async function changedFiles(number){
  const all=[];for(let page=1;page<=5;page++){
    const data=await api('/pulls/'+number+'/files?per_page=100&page='+page);
    all.push(...data);if(data.length<100)return all;
  }return [];
}
async function checks(sha){
  const result=[];for(let page=1;page<=5;page++){
    const p=await api('/commits/'+sha+'/check-runs?per_page=100&page='+page);
    result.push(...p.check_runs);if(p.check_runs.length<100)break;
  }
  const raw=await api('/commits/'+sha+'/statuses?per_page=100');
  const latest=new Map();for(const item of raw)if(!latest.has(item.context))latest.set(item.context,item);
  return {checks:result,statuses:[...latest.values()]};
}
async function approvedReview(pr){
  const reviews=await api('/pulls/'+pr.number+'/reviews?per_page=100');
  const verified=new Set();
  for(const login of new Set(reviews.map(r=>r.user?.login).filter(Boolean))){
    try{
      const p=await api('/collaborators/'+encodeURIComponent(login)+'/permission');
      if(['admin','write','maintain'].includes(p.permission))verified.add(login);
    }catch(e){console.log('reviewer permission unavailable '+String(e));}
  }
  return independentReview(reviews,pr,verified);
}
const infra=s=>/(?:HTTP|status(?: code)?)\s*(?:403|429|5\d\d)\b|ETIMEDOUT|timed out|rate limit/i.test(s);
async function retryInfrastructure(pr,changed){
  if(!safeFiles(changed)||pr.head.repo?.full_name!==repo)return;
  const runs=await api('/actions/runs?branch='+encodeURIComponent(pr.head.ref)+'&per_page=100');
  for(const r of runs.workflow_runs.filter(x=>x.head_sha===pr.head.sha)){
    if(r.status==='action_required'){
      if(pr.head.repo?.full_name!==repo||!(await approvedReview(pr))){
        console.log('NEEDS_CLAUDE action_required '+r.html_url);continue;
      }
      try{await api('/actions/runs/'+r.id+'/approve','POST');
        console.log('APPROVED_TRUSTED '+r.html_url);
      }catch(e){console.log('NEEDS_CLAUDE approval blocked '+r.html_url+' '+String(e));}
      continue;
    }
    if(!['failure','cancelled','timed_out'].includes(r.conclusion)||(r.run_attempt||1)>3)continue;
    let infrastructure=['cancelled','timed_out'].includes(r.conclusion);
    if(!infrastructure){
      const jobs=await api('/actions/runs/'+r.id+'/jobs?per_page=100');
      for(const job of jobs.jobs.filter(j=>j.conclusion==='failure')){
        try{
          const rlog=await fetch(base+'/actions/jobs/'+job.id+'/logs',{headers});
          if(rlog.ok)infrastructure ||= infra((await rlog.text()).slice(-100000));
        }catch(e){console.log('log inaccessible '+String(e));}
      }
    }
    if(!infrastructure)continue;
    await api('/actions/runs/'+r.id+'/rerun-failed-jobs','POST');
    console.log('RERUN '+r.html_url+' attempt '+((r.run_attempt||1)+1));
  }
}
async function finish(pr,main){
  if(pr.draft||pr.base.ref!=='main'||pr.head.repo?.full_name!==repo)return;
  const files=await changedFiles(pr.number);
  if(!safeFiles(files)){console.log('NEEDS_CLAUDE protected '+pr.html_url);return;}
  await retryInfrastructure(pr,files);
  const fresh=await api('/pulls/'+pr.number);
  const compare=await api('/compare/'+main+'...'+fresh.head.sha);
  if(compare.behind_by>0){
    if(fresh.mergeable_state==='dirty'||fresh.mergeable===false){
      console.log('NEEDS_CLAUDE conflict '+fresh.html_url);return;
    }
    if(fresh.mergeable===true){
      await api('/pulls/'+fresh.number+'/update-branch','PUT',{expected_head_sha:fresh.head.sha});
      console.log('UPDATED_BRANCH '+fresh.html_url);
    }return;
  }
  if(fresh.mergeable!==true||!['clean','unstable'].includes(fresh.mergeable_state))return;
  const result=await checks(fresh.head.sha);
  if(!green(result.checks,result.statuses,files))return;
  const revert=/^lab\/auto-revert-[a-f0-9]{12}$/.test(fresh.head.ref)&&
    fresh.user?.login==='github-actions[bot]'&&
    /^AUTO_REVERT_OF: [a-f0-9]{40}$/m.test(fresh.body||'');
  if(!revert&&!(await approvedReview(fresh)))return;
  if((await api('/git/ref/heads/main')).object.sha!==main)return;
  await api('/pulls/'+fresh.number+'/merge','PUT',{sha:fresh.head.sha,merge_method:'squash'});
  console.log('MERGED '+fresh.html_url);
}
async function revertIfRed(main){
  const commit=await api('/commits/'+main);
  if(commit.parents.length!==1||Date.now()-Date.parse(commit.commit.committer.date)>7200000)return;
  const prs=await api('/commits/'+main+'/pulls?per_page=20');
  const merged=prs.find(p=>p.merged_at&&p.merge_commit_sha===main);
  if(!merged||!safeFiles(await changedFiles(merged.number)))return;
  const curr=await checks(main),prev=await checks(commit.parents[0].sha);
  const former=new Set(prev.checks.filter(c=>c.conclusion==='success').map(c=>c.name));
  const failures=curr.checks.filter(c=>c.conclusion==='failure'&&former.has(c.name));
  if(!failures.length||(await api('/git/ref/heads/main')).object.sha!==main)return;
  const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
  git('fetch','origin','main');
  if(git('rev-parse','origin/main')!==main)return;
  const name='lab/auto-revert-'+main.slice(0,12);
  git('config','user.name','github-actions[bot]');
  git('config','user.email','41898282+github-actions[bot]@users.noreply.github.com');
  git('checkout','-b',name,'origin/main');
  try{git('revert','--no-edit',main);}catch(e){
    git('revert','--abort');console.log('NEEDS_CLAUDE revert conflict '+String(e));return;
  }
  git('push','-u','origin',name);
  const body='AUTO_REVERT_OF: '+main+'\nRegression: '+failures.map(c=>c.details_url).join('\n');
  const pr=await api('/pulls','POST',{title:'revert: main red after '+main.slice(0,12),
    body,head:name,base:'main'});
  console.log('REVERT_PR '+pr.html_url);
}
const main=(await api('/git/ref/heads/main')).object.sha;
try{await revertIfRed(main);}catch(e){console.log('REVERT_BLOCKED '+String(e));}
const opened=await api('/pulls?state=open&base=main&per_page=100');
const offset=Math.floor(Date.now()/900000)%Math.max(1,opened.length);
for(let i=0;i<Math.min(20,opened.length);i++){
  const pr=opened[(offset+i)%opened.length];
  try{await finish(pr,main);}catch(e){console.log('BLOCKED PR #'+pr.number+' '+String(e));}
}
