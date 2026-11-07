// Independent acceptance-gate audit: no estimates, no branch-only credit.
// GitHub merged state is checked live for every PR used as passing evidence.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const data=JSON.parse(fs.readFileSync(path.join(root,'meta-games/readiness/gates.json'),'utf8'));
const assert=(condition,message)=>{if(!condition)throw Error(message)};
assert(data.schema===1&&Array.isArray(data.areas)&&data.areas.length===3,'Expected exactly three areas');
const now=Date.now(),date=Date.parse(data.as_of+'T00:00:00Z');
assert(Number.isFinite(date)&&date<=now+86400000,'Invalid audit date');
assert(now-date<=14*86400000,'Stale evidence: refresh audit before claiming current percentages');
const ids=new Set(),urls=new Map(),rows=[];
async function checkEvidence(url){
 const match=/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/.exec(url);
 if(!match)throw Error('Passing gate needs a merged GitHub PR: '+url);
 const key=match.slice(1).join('/');
 if(urls.has(key))return urls.get(key);
 const api='https://api.github.com/repos/'+match[1]+'/'+match[2]+'/pulls/'+match[3];
 const response=await fetch(api,{headers:{Accept:'application/vnd.github+json','User-Agent':'meta-games-readiness-gate','X-GitHub-Api-Version':'2022-11-28'}});
 assert(response.ok,'Cannot independently verify PR '+url+' HTTP '+response.status);
 const pr=await response.json();
 const accepted=pr.merged===true&&Boolean(pr.merged_at);
 urls.set(key,accepted);return accepted;
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
   assert(await checkEvidence(gate.evidence),'Passing gate references unmerged PR: '+gate.id);
   passed++;
  }
 }
 rows.push({name:area.title,percent:passed*10,passed,total:10});
}
const total=Math.round(rows.reduce((s,x)=>s+x.percent,0)/rows.length);
const result={as_of:data.as_of,method:'30 independently checked binary acceptance gates; unmerged and unverified work scores zero',areas:rows,overall_percent:total};
const json=JSON.stringify(result,null,2)+'\n';
const dest=path.join(root,'meta-games/readiness/score.json');
if(process.argv.includes('--check')){
 assert(fs.existsSync(dest)&&fs.readFileSync(dest,'utf8')===json,'Stale score: regenerate with node scripts/lab/readiness-audit.mjs');
}else fs.writeFileSync(dest,json);
console.log(rows.map(x=>x.name+' '+x.percent+'%').join('\n')+'\nОбщая готовность '+total+'%');
