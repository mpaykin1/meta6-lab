import fs from 'node:fs/promises';
const {GITHUB_REPOSITORY: repo='mpaykin1/meta6-lab',GITHUB_TOKEN: token}=process.env;
const root='https://api.github.com/repos/'+repo;
const headers={'Accept':'application/vnd.github+json','User-Agent':'meta-games-dispatcher','Authorization':'Bearer '+token};
export async function api(path,{request=fetch,wait=ms=>new Promise(done=>setTimeout(done,ms)),
 now=()=>Date.now()}={}){
 for(let attempt=0;attempt<2;attempt++){
  const response=await request(root+path,{headers});
  if(response.ok)return response.json();
  const remaining=Number(response.headers.get('x-ratelimit-remaining'));
  const reset=Number(response.headers.get('x-ratelimit-reset'))*1000;
  if((response.status===403||response.status===429)&&remaining===0&&Number.isFinite(reset)&&reset>0){
   const waitMs=reset-now();
   if(waitMs>0&&waitMs<=8*60*1000&&attempt===0){await wait(waitMs+1000);continue}
   throw Error('нет данных: квота GitHub API до '+new Date(reset).toISOString().slice(11,16)+' UTC');
  }
  throw Error('нет данных: GitHub HTTP '+response.status+' ('+path+')');
 }
 throw Error('нет данных: GitHub API не ответил после повтора ('+path+')');
}
export async function listOpenPullRequests(request = api) {
 const result = new Map();
 for(let page=1;;page++){
  let batch;
  try { batch=await request('/pulls?state=open&per_page=100&page='+page); }
  catch(error) { throw Error('GitHub API open PRs: нет данных: '+error.message); }
  if(!Array.isArray(batch))throw Error('GitHub API open PRs: нет данных');
  for(const pr of batch){
   if(!Number.isInteger(pr.number)||pr.state!=='open'||!pr.head?.sha||!pr.head?.ref||
      result.has(pr.number))throw Error('GitHub API open PRs: неполные данные');
   result.set(pr.number,pr);
  }
  if(batch.length===0)return result;
 }
 throw Error('GitHub API open PRs: неполная пагинация');
}
export function indexOpened(opened) {
 if(!Array.isArray(opened))throw Error('нет данных: открытые PR не получены');
 const openPrs=new Map();
 for(const pr of opened){
  if(!Number.isSafeInteger(pr?.number)||pr.number<1||pr.state!=='open'||
     !pr.head?.sha||!pr.head?.ref||openPrs.has(pr.number)){
   throw Error('нет данных: неполный или повторный GraphQL PR');
  }
  openPrs.set(pr.number,pr);
 }
 const openNumbers=new Set(openPrs.keys());
 return {openNumbers,openPrs};
}
export function parseTasks(md){
 const lines=md.split('\n').filter(x=>x.startsWith('|')&&!x.startsWith('|---')&&!x.includes('| Статус |'));
 const map=new Map();
 for(const line of lines){const c=line.split('|').slice(1,-1).map(s=>s.trim());if(c.length<8)continue;
 const m=c[5].match(/pull\/(\d+)/);if(!m)continue;
 const id=Number(m[1]),old=map.get(id);
 const entry={id,title:c[1],status:c[0],branch:c[4].replaceAll('`',''),taken:c[6]};
 if(!old||(/ЗАВИС|ЗАБРОШЕНО/.test(entry.status)&&!/ЗАВИС|ЗАБРОШЕНО/.test(old.status)))map.set(id,entry);
 }return [...map.values()];
}
export function available(taken,latest,now=Date.now()){
 const m=String(taken||'').match(/Взял:\s*(.*?)\s+(\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?Z)/);
 if(!m)return true;
 const time=Date.parse(m[2]);return now-time>7200000&&(!latest||Date.parse(latest)<=time);
}
export function render(cards,claude=[],previous='',now=Date.now()){
 const old=new Map([...previous.matchAll(/### PR #(\d+)[\s\S]*?Взял:\s*([^\n]+)/g)].map(m=>[Number(m[1]),m[2].trim()]));
 const ordered=cards.filter(c=>!c.claude).sort((a,b)=>a.priority-b.priority||Number(b.finish)-Number(a.finish)||a.id-b.id);
 const counts={stalled:cards.filter(c=>c.stalled).length,conflicts:cards.filter(c=>c.conflict).length,unknown:cards.filter(c=>c.conflictUnknown).length,red:cards.filter(c=>c.red).length,claude:claude.length};
 let s='# ДИСПЕТЧЕР МГ/МГЛ\n\nИтог: зависло '+counts.stalled+' · конфликт '+counts.conflicts+' · непроверено '+counts.unknown+' · красные проверки '+counts.red+' · нужен Claude '+counts.claude+'\n\n';
 for(const c of ordered){const claimed=old.get(c.id)||'—';const claim=claimed!=='—'&&!available('Взял: '+claimed,c.lastCommit,now)?claimed:'—';
 s+='### PR #'+c.id+'\n- PR: https://github.com/'+repo+'/pull/'+c.id+'\n- Ветка: `'+c.branch+'`\n- SHA: `'+c.headSha+'` · последний коммит: '+c.lastCommit+'\n- Проблема: '+c.problem+'\n- Задание: '+c.action+'\n- Взял: '+claim+'\n\n';
 }
 s+='## НУЖЕН CLAUDE\n'+(claude.map(c=>'- [#'+c.id+'](https://github.com/'+repo+'/pull/'+c.id+') '+c.title).join('\n')||'—')+'\n';
 return s;
}
export function previousConflict(previous,id){
 const marker='### PR #'+id+'\n';
 const start=previous.indexOf(marker);
 if(start<0)return null;
 const block=previous.slice(start+marker.length).split(/\n(?:### PR #|## НУЖЕН CLAUDE)/)[0];
 const problem=block.match(/^- Проблема:\s*([^\n]+)/m);
 return problem&&problem[1].includes('Конфликт с main')?true:null;
}
export async function resolveConflict(pr,reload,prior,sleep=ms=>new Promise(done=>setTimeout(done,ms))){
 let current=pr, retries=0;
 while(current.mergeable===null && retries<3){
  await sleep(5000);
  current=await reload();
  retries++;
 }
 if(current.mergeable===null)return {pr:current,conflict:prior,unresolved:true,retries};
 return {pr:current,conflict:current.mergeable===false||current.mergeable_state==='dirty',unresolved:false,retries};
}
export function assertNotEmpty(tasksMarkdown,cards){
 if(tasksMarkdown.split('\n').some(line=>/^\|\s*🛑/.test(line))&&!cards.length)throw Error('Empty dispatcher with stalled tasks');
}
export async function main(){
 const tasks=parseTasks(await fs.readFile('ZADACHI.md','utf8'));
 const finish=await fs.readFile('rules/09-platforma/FINISH.md','utf8');
 const finishIds=[...finish.matchAll(/^\|\s*([MBLP]\d+)\s*\|[^|]*\|[^|]*\|\s*НЕТ\b/gm)].map(m=>m[1]);
 let previous='';try{previous=await fs.readFile('DISPETCHER.md','utf8')}catch{}
 const map=JSON.parse(await fs.readFile('automation/karta-sil.json','utf8'));
 const {routeFor}=await import('../karta-sil/route.mjs');
 const forChat=[];
 const cards=[],claude=[];
 const {openPulls}=await import('../storozha/gh-list.mjs');
 const opened=await openPulls(repo,token);
 if(!Array.isArray(opened))throw Error('нет данных: открытые PR не получены');
 const {openNumbers,openPrs}=indexOpened(opened);
 for(const t of tasks){
 if(!openNumbers.has(t.id))continue;
 const listed=openPrs.get(t.id);
 if(!listed)throw Error('нет данных: GraphQL PR исчез из индекса');
 if(/НУЖЕН CLAUDE/.test(t.status)||/НУЖЕН CLAUDE/.test(listed.body||'')){
  claude.push({...t,title:listed.title,branch:listed.head.ref});
  continue;
 }
 let pr;try{pr=await api('/pulls/'+t.id)}catch(e){console.error('PR '+t.id,e.message);throw e}
 if(pr.state!=='open')continue;
 const resolution=await resolveConflict(pr,()=>api('/pulls/'+t.id),previousConflict(previous,t.id));
 pr=resolution.pr;
 const checks=await api('/commits/'+pr.head.sha+'/check-runs?per_page=100');
 const statuses=await api('/commits/'+pr.head.sha+'/status');
 const failed=checks.check_runs.filter(x=>['failure','timed_out','action_required'].includes(x.conclusion)).map(x=>({name:x.name,url:x.html_url}));
 failed.push(...statuses.statuses.filter(x=>['failure','error'].includes(x.state)).map(x=>({name:x.context,url:x.target_url})));
 const conflict=resolution.conflict===true,conflictUnknown=resolution.conflict===null;
 const commit=await api('/commits/'+pr.head.sha);
 const lastCommit=commit.commit.committer.date;
 const stale=Date.now()-Date.parse(lastCommit)>172800000;
 const stalled=/ЗАВИС/.test(t.status),isClaude=/НУЖЕН CLAUDE/.test(t.status)||/НУЖЕН CLAUDE/.test(pr.body||'');
 const label=t.title+' '+(pr.title||'');
 const isFinish=finishIds.some(id=>new RegExp('(^|[^A-Z0-9])'+id+'([^A-Z0-9]|$)','i').test(label));
 if(!Number.isInteger(pr.changed_files)||pr.changed_files<0)throw Error('PR changed_files: нет данных');
 const c={...t,changedFiles:pr.changed_files,branch:pr.head.ref,headSha:pr.head.sha,
  conflict,conflictUnknown,red:failed.length>0,stalled,finish:isFinish,lastCommit,body:pr.body||''};
 if(isClaude){claude.push(c);continue}
 if(!conflict&&!conflictUnknown&&!failed.length&&!stalled&&!stale)continue;
 c.priority=(conflict||conflictUnknown)?0:failed.length?1:stalled?2:3;
 c.problem=conflict?(resolution.unresolved?'Конфликт с main (прошлый статус, mergeable=null)':'Конфликт с main'):conflictUnknown?'Статус конфликта неизвестен: mergeable=null после 3 повторов':failed.length?'Красная проверка: '+failed.map(x=>x.name+' ('+x.url+')').join(', '):stalled?'🛑 ЗАВИС':'💤 ЗАБРОШЕНО более 2 суток';
 c.action=conflict?'Смержи актуальный main в ветку. Разреши файлы из git diff --name-only --diff-filter=U и перезапусти CI.':conflictUnknown?'Проверь конфликт вручную: GitHub не ответил после 3 повторов; не считай PR бесконфликтным.':failed.length?'Исправь '+failed[0].name+' по логу '+failed[0].url+' и повтори CI.':stalled?'Продолжи работу по PR, проверь CI и доведи до слияния.':c.finish?'Доведи пункт FINISH.md до зелёных проверок.':'Закрой устаревший PR с причиной в OSHIBKI.md либо доведи его.';
 const routing=routeFor(c,map);
 c.routing=routing;
 if(routing.target==='claude'){claude.push(c);continue;}
 if(routing.target==='chat'){forChat.push(c);continue;}
 c.action+=' Режим: '+routing.note;
 cards.push(c);
 }
 const output=render(cards,claude,previous);
 assertNotEmpty(await fs.readFile('ZADACHI.md','utf8'),[...cards,...forChat,...claude]);
 await fs.writeFile('DISPETCHER.md',output);
 const chat='# ТОЛКНУТЬ — обычный чат ChatGPT\n\n'+forChat.map(c=>
 '- [PR #'+c.id+'](https://github.com/'+repo+'/pull/'+c.id+') · '+c.routing.zone+
 ' · '+c.routing.note+' · '+c.problem).join('\n')+'\n';
 await fs.writeFile('TOLKNUT.md',chat);
 console.log(output.slice(0,250));
}
