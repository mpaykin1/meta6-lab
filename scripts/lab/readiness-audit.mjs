// Independent acceptance-gate audit: no estimates, no branch-only credit.
// GitHub merged state is checked live for every PR used as passing evidence.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const data=JSON.parse(fs.readFileSync(path.join(root,'meta-games/readiness/gates.json'),'utf8'));
const assert=(condition,message)=>{if(!condition)throw Error(message)};
assert(data.schema===2&&Array.isArray(data.areas)&&data.areas.length===10,'Expected exactly three areas');
const now=Date.now(),date=Date.parse(data.as_of+'T00:00:00Z');
assert(Number.isFinite(date)&&date<=now+86400000,'Invalid audit date');
assert(now-date<=14*86400000,'Stale evidence: refresh audit before claiming current percentages');
const ids=new Set(),urls=new Map(),rows=[];
const approvedRepos=new Set(['mpaykin1/meta6','mpaykin1/meta6-lab','mpaykin1/World_server']);
const cache=new Map();
const headers={Accept:'application/vnd.github+json','User-Agent':'meta-games-readiness-gate','X-GitHub-Api-Version':'2022-11-28'};
if(process.env.GITHUB_TOKEN)headers.Authorization='Bearer '+process.env.GITHUB_TOKEN;
async function getJSON(url){
 if(!cache.has(url))cache.set(url,(async()=>{
  const r=await fetch(url,{headers,signal:AbortSignal.timeout(16000)});
  assert(r.ok,'Evidence inaccessible HTTP '+r.status+': '+url);
  return r.json();
 })());
 return cache.get(url);
}
async function checkEvidence(gate){
 const match=/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/.exec(gate.evidence);
 assert(match,'PASS requires exact PR: '+gate.id);
 const repo=match[1]+'/'+match[2];
 assert(approvedRepos.has(repo),'Untrusted repo: '+repo);
 const pr=await getJSON('https://api.github.com/repos/'+repo+'/pulls/'+match[3]);
 assert(pr.base?.repo?.full_name===repo&&pr.merged===true&&Boolean(pr.merged_at)&&Date.parse(pr.merged_at)<=now,'Unmerged PR: '+gate.id);
 const run=/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/actions\/runs\/(\d+)$/.exec(gate.run||'');
 assert(run && run[1]+'/'+run[2]===repo,'PASS requires a same-repo GitHub Action: '+gate.id);
 assert(typeof gate.workflow==='string'&&gate.workflow.length>3,'Missing required workflow name: '+gate.id);
 const action=await getJSON('https://api.github.com/repos/'+repo+'/actions/runs/'+run[3]);
 assert(action.repository?.full_name===repo&&action.name===gate.workflow,'Wrong workflow: '+gate.id);
 assert(action.status==='completed'&&action.conclusion==='success','Unsuccessful CI: '+gate.id);
 assert(action.head_sha===pr.head.sha||action.head_sha===pr.merge_commit_sha,'CI not on exact PR SHA: '+gate.id);
 assert(['push','pull_request','workflow_dispatch'].includes(action.event),'Untrusted workflow trigger: '+gate.id);
 if(gate.artifact){
  const a=gate.artifact;
  assert(approvedRepos.has(a.repo)&&['main','master'].includes(a.ref)&&/^[\w./-]+$/.test(a.path)&&!a.path.includes('..'),'Unsafe artifact: '+gate.id);
  const asset=await getJSON('https://api.github.com/repos/'+a.repo+'/contents/'+a.path+'?ref='+a.ref);
  assert((Array.isArray(asset) && asset.length>0) || (!Array.isArray(asset) && asset.path===a.path&&asset.type==='file'),'Artifact not present in main/master: '+gate.id);
 }
 return true;
}
for(const area of data.areas){
 assert(typeof area.id==='string'&&Array.isArray(area.gates)&&area.gates.length===10,'Exactly 10 gates per area');
 let passed=0;
 for(const gate of area.gates){
  assert(!ids.has(area.id+':'+gate.id),'Duplicate gate ID');
  ids.add(area.id+':'+gate.id);
  assert(['pass','pending'].includes(gate.status),'No unverifiable status');
  assert(typeof gate.label==='string'&&gate.label.length>12,'Missing gate criterion');
  assert(typeof gate.evidence==='string'&&gate.evidence.startsWith('https://'),'Missing evidence URL');
  if(gate.status==='pass'){
   assert(await checkEvidence(gate),'Passing gate references unmerged PR: '+gate.id);
   passed++;
  }
 }
 rows.push({name:area.title,percent:passed*10,passed,total:10});
}
const total=Math.round(rows.reduce((s,x)=>s+x.percent,0)/rows.length);
const result={as_of:data.as_of,method:'100 independently verified binary acceptance gates; passing PR, exact green CI and surviving paths; unverified work scores zero',areas:rows,overall_percent:total};
const json=JSON.stringify(result,null,2)+'\n';
const dest=path.join(root,'meta-games/readiness/score.json');
if(process.argv.includes('--check')){
 assert(fs.existsSync(dest)&&fs.readFileSync(dest,'utf8')===json,'Stale score: regenerate with node scripts/lab/readiness-audit.mjs');
 const report=fs.readFileSync(path.join(root,'meta-games/readiness/REPORT.md'),'utf8');
 for(const row of rows)assert(report.includes('| '+row.name+' | '+row.passed+' / 10 | **'+row.percent+'%** |'),'Report contradicts verified gate score: '+row.name);
 assert(report.includes('**'+total+'%**'),'Report contradicts overall gate score');
 const start='<!-- readiness-score:start -->'; const end='<!-- readiness-score:end -->';
 const table=[start,'| Подсистема | Пройдено | Готовность |','| --- | ---: | ---: |',...rows.map(r=>'| '+r.name+' | '+r.passed+' / 10 | **'+r.percent+'%** |'),'| **Общая готовность** | **'+rows.reduce((a,r)=>a+r.passed,0)+' / 100** | **'+total+'%** |',end].join('\n');
 assert(report.includes(table),'Report table does not exactly match verified 100 gates');
 assert(report.indexOf(start)===report.lastIndexOf(start),'Duplicate score table');
}else fs.writeFileSync(dest,json);
console.log(rows.map(x=>x.name+' '+x.percent+'%').join('\n')+'\nОбщая готовность '+total+'%');
