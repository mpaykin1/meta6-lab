// ZADACHI watcher (Claude, 10.11.2026). No AI. Keeps ZADACHI.md honest: every task ChatGPT took
// on МГ/МГЛ is a row; the real status comes from GitHub (PR merged / closed / last commit time),
// not from what the agent wrote. Tasks the agent forgot to write are added from open PRs and ZANYATO.md.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const START = '<!-- ZADACHI:START -->', END = '<!-- ZADACHI:END -->';
const HEAD = '| Статус | Задача | Проект | Кто | Ветка | PR | Взято (UTC) | Последний коммит (UTC) |';
const SEP = '|---|---|---|---|---|---|---|---|';
const DONE_KEEP = 60;
const clean = s => String(s ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const fmt = t => Number.isFinite(t) ? new Date(t).toISOString().slice(0, 16).replace('T', ' ') : '—';
const parseT = s => { const m = /(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/.exec(s || ''); return m ? Date.parse(`${m[1]}T${m[2]}:00Z`) : NaN; };
const noBranch = b => !b || b === '—' || b === '-';

export function ageStatus(minutes) {
  if (!Number.isFinite(minutes)) return '❓ нет данных — ТОЛКНУТЬ';
  if (minutes < 60) return '🔨 В РАБОТЕ';
  if (minutes < 180) return '⚠ молчит больше часа';
  if (minutes < 2880) { const h = minutes / 60; return `🛑 ЗАВИС ${h >= 24 ? 24 : h >= 12 ? 12 : h >= 6 ? 6 : 3}+ ч — ТОЛКНУТЬ`; }
  return `💤 ЗАБРОШЕНО ${Math.floor(minutes / 1440)} дн — продолжить или закрыть`;
}
const rank = s => /ЗАВИС|нет данных/.test(s) ? 0 : /молчит/.test(s) ? 1 : /В РАБОТЕ/.test(s) ? 2 : /НУЖЕН CLAUDE/.test(s) ? 3 : /ЗАБРОШЕНО/.test(s) ? 4 : /ЗАКРЫТО/.test(s) ? 6 : /ГОТОВО/.test(s) ? 7 : 5;

export function parseRows(text) {
  const a = text.indexOf(START), b = text.indexOf(END);
  if (a < 0 || b < a) throw new Error('ZADACHI.md: нет меток ZADACHI:START / ZADACHI:END');
  const rows = [];
  for (const line of text.slice(a + START.length, b).split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const c = line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
    if (c.length < 8 || c[0] === 'Статус' || /^-+$/.test(c[0])) continue;
    rows.push({status: c[0], task: c[1], project: c[2], who: c[3], branch: c[4].replace(/`/g, ''), pr: c[5], taken: c[6], last: c[7]});
  }
  return rows;
}

// data: {repo, pulls: {branch: {number, title, state, merged, sha, created, lastCommit}}, branches: {branch: ms}, zanyato: [{item, branch, who, at}]}

const repoFor=(r,d)=>r.project==='МГ'?(d.mgRepo||'mpaykin1/meta6'):d.repo;
function pullFor(r,d) {
 const p=d.pulls?.[repoFor(r,d)+'::'+r.branch]||d.pulls?.[r.branch];
 return p && (!p.repo||p.repo===repoFor(r,d))?p:null;
}
export function failedChecks(p) {
 const latest=new Map();
 for(const c of p?.checkRuns||[]) {
  const name=clean(c.name),when=Date.parse(c.started_at||c.completed_at||'')||0;
  if(name && (!latest.has(name)||latest.get(name).when<=when))latest.set(name,{conclusion:c.conclusion,when});
 }
 return [...latest].filter(([,v])=>['failure','timed_out','cancelled'].includes(v.conclusion)).map(([n])=>n);
}
export function apply(text,data,now) {
 const rows=parseRows(text),tick=String.fromCharCode(96);
 const seen=new Set(rows.filter(r=>!noBranch(r.branch)).map(r=>repoFor(r,data)+'::'+r.branch));
 for(const z of data.zanyato||[]){
  const id=data.repo+'::'+z.branch;if(seen.has(id))continue;seen.add(id);
  rows.push({status:'',task:clean(z.item),project:'МГЛ',who:clean(z.who.replace(/^свободно \(зависло[^,]*, было: (.*)\)$/,'$1').replace(/\s*⚠.*$/,''))||'ChatGPT',branch:z.branch,pr:'—',taken:z.at,last:'—'});
 }
 for(const [id,p] of Object.entries(data.pulls||{})) {
  const rp=p.repo||(id.includes('::')?id.split('::')[0]:data.repo);
  const branch=p.branch||(id.includes('::')?id.split('::').slice(1).join('::'):id);
  if(p.state!=='open'||seen.has(rp+'::'+branch))continue;seen.add(rp+'::'+branch);
  rows.push({status:'',task:clean(p.title),project:rp===(data.mgRepo||'mpaykin1/meta6')?'МГ':'МГЛ',who:'ChatGPT (сам не записал — добавил сторож)',branch,pr:'—',taken:fmt(p.created),last:'—'});
 }
 for(const r of rows) {
  const p=noBranch(r.branch)?null:pullFor(r,data),rp=repoFor(r,data);
  if(p)r.pr='[#'+p.number+'](https://github.com/'+rp+'/pull/'+p.number+')';
  const t=p?.lastCommit??data.branches?.[rp+'::'+r.branch]??data.branches?.[r.branch];
  if(Number.isFinite(t))r.last=fmt(t);
  const age=(now-(Number.isFinite(t)?t:parseT(r.taken)))/60000;
  if(p?.merged)r.status='✅ ГОТОВО · слито '+String(p.sha||'').slice(0,7);
  else if(p&&p.state==='closed')r.status='✖ ЗАКРЫТО без слияния';
  else if(/НУЖЕН CLAUDE/i.test(r.status))r.status='🙋 '+r.status.replace(/^🙋\s*/,'');
  else if(p?.duplicateOf&&age>=2880)r.status='✖ ЗАКРЫТЬ: дубль #'+p.duplicateOf;
  else if(p?.supersededBy&&age>=2880)r.status='✖ ЗАКРЫТЬ: заменён #'+p.supersededBy;
  else if(p?.mergeable_state==='dirty')r.status='⚔ КОНФЛИКТ';
  else if(p&&failedChecks(p).length)r.status='❌ КРАСНЫЕ: '+failedChecks(p).join(', ');
  else if(noBranch(r.branch)&&/ГОТОВО/.test(r.status)&&/https?:\/\//.test(r.status)){}
  else r.status=ageStatus(age);
  r.task=clean(r.task);r.who=clean(r.who)||'ChatGPT';r.project=clean(r.project)||'МГЛ';
 }
 const dedup=new Map(),unique=[];
 for(const r of rows){
  const href=/https:\/\/github\.com\/[^\s)]+\/pull\/\d+/.exec(r.pr||'')?.[0];
  const id=!noBranch(r.branch)?repoFor(r,data)+'::'+r.branch:href;
  if(!id||!dedup.has(id)){unique.push(r);if(id)dedup.set(id,r);continue;}
  const old=dedup.get(id);
  old.who=[...new Set((old.who+', '+r.who).split(/,\s*/).filter(Boolean))].join(', ');
  if(/НУЖЕН CLAUDE/.test(r.status)&&!/ГОТОВО|ЗАКРЫТО/.test(old.status))old.status=r.status;
  if(parseT(r.taken)<parseT(old.taken))old.taken=r.taken;
 }
 const rank=s=>/ЗАВИС|нет данных/.test(s)?0:/^⚔|^❌|ЗАКРЫТЬ/.test(s)?1:/молчит/.test(s)?2:/В РАБОТЕ/.test(s)?3:/НУЖЕН CLAUDE/.test(s)?4:/ЗАБРОШЕНО/.test(s)?5:/ЗАКРЫТО/.test(s)?6:/ГОТОВО/.test(s)?7:8;
 const when=r=>Number.isFinite(parseT(r.last))?parseT(r.last):parseT(r.taken)||0;
 unique.sort((x,y)=>rank(x.status)-rank(y.status)||when(y)-when(x));
 const n=re=>unique.filter(r=>re.test(r.status)).length;
 const push=unique.filter(r=>/ЗАВИС|нет данных/.test(r.status)),fix=unique.filter(r=>/^⚔|^❌|ЗАКРЫТЬ/.test(r.status));
 const summary='**Итог:** 🛑 зависло '+push.length+' · ⚠ молчит '+n(/молчит/)+' · 🔨 в работе '+n(/В РАБОТЕ/)+' · 🙋 нужен Claude '+n(/НУЖЕН CLAUDE/)+' · 💤 заброшено '+n(/ЗАБРОШЕНО/)+' · ⚔ конфликт '+n(/КОНФЛИКТ/)+' · ❌ красные '+n(/КРАСНЫЕ/)+' · ✖ закрыто '+n(/ЗАКРЫТО/)+' · ✅ готово '+n(/ГОТОВО/);
 const line=r=>r.task+' ('+(noBranch(r.branch)?r.who:tick+r.branch+tick)+')';
 const repair='**Чинить сейчас:** '+(fix.length?fix.map(line).join('; '):'никого');
 const toPush='**Толкнуть сейчас:** '+(push.length?push.map(line).join('; '):'никого');
 const table=[HEAD,SEP,...unique.map(r=>'| '+r.status+' | '+r.task+' | '+r.project+' | '+r.who+' | '+(noBranch(r.branch)?'—':tick+r.branch+tick)+' | '+(r.pr||'—')+' | '+(r.taken||'—')+' | '+(r.last||'—')+' |')].join('\n');
 const body=START+'\n'+summary+'\n\n'+repair+'\n\n'+toPush+'\n\n'+table+'\n'+END;
 let out=text.slice(0,text.indexOf(START))+body+text.slice(text.indexOf(END)+END.length);
 if(out!==text)out=out.replace(/^Сторож проверил: .*$/m,'Сторож проверил: '+fmt(now)+' UTC');
 return out;
}


async function collect(rows) {
 const repo=process.env.GITHUB_REPOSITORY||'mpaykin1/meta6-lab',mgRepo='mpaykin1/meta6';
 const {execFile}=await import('node:child_process');
 const {promisify}=await import('node:util');
 const {setTimeout:delay}=await import('node:timers/promises');
 const run=promisify(execFile);
 const api=async path=>{
  try {const {stdout}=await run('gh',['api',path],{maxBuffer:64e6});return JSON.parse(stdout);}
  catch(e){console.error('ZADACHI_API_WARNING '+path+': '+String(e.message).slice(0,180));return null;}
 };
 const loadOpen=async rp=>{
  const found=[];
  for(let page=1;page<=20;page++){
   const group=await api('repos/'+rp+'/pulls?state=open&per_page=100&page='+page);
   if(!Array.isArray(group))break;found.push(...group);if(group.length<100)break;
  }
  return found;
 };
 const [lab,mg]=await Promise.all([loadOpen(repo),loadOpen(mgRepo)]);
 const items=[...lab.map(p=>({rp:repo,p})),...mg.map(p=>({rp:mgRepo,p}))],pulls={},branches={};
 // History: discover PRs closed since the previous watchdog run.
 for(const r of rows){
  if(noBranch(r.branch)||items.some(x=>x.rp===(r.project==='МГ'?mgRepo:repo)&&x.p.head?.ref===r.branch))continue;
  if(/ГОТОВО · слито|ЗАКРЫТО без/.test(r.status))continue;
  const rp=r.project==='МГ'?mgRepo:repo;
  const list=await api('repos/'+rp+'/pulls?state=all&head='+rp.split('/')[0]+':'+encodeURIComponent(r.branch)+'&per_page=5');
  const p=Array.isArray(list)?(list.find(x=>x.merged_at)||list[0]):null;
  if(p)items.push({rp,p});
  else {
   const c=await api('repos/'+rp+'/commits/'+encodeURIComponent(r.branch));
   if(c?.commit?.committer?.date)branches[rp+'::'+r.branch]=Date.parse(c.commit.committer.date);
  }
 }
 let next=0;
 const workers=Array.from({length:8},async()=>{
  while(next<items.length){
   const {rp,p}=items[next++];if(!p.head?.ref)continue;
   let detailed=p;
   // GitHub may return mergeable=null until the mergeability computation finishes.
   for(let attempt=0;attempt<=3;attempt++){
    const x=await api('repos/'+rp+'/pulls/'+p.number);if(x)detailed=x;
    if(detailed.mergeable!==null&&detailed.mergeable!==undefined&&detailed.mergeable_state!=null)break;
    if(attempt<3)await delay(3000);
   }
   const sha=p.head.sha;
   const [checks,commit]=await Promise.all([
    api('repos/'+rp+'/commits/'+sha+'/check-runs?per_page=100'),
    api('repos/'+rp+'/commits/'+sha)
   ]);
   const body=String(detailed.body||'');
   const dup=/(?:duplicate(?: of)?|дубл(?:ь|ирует)(?: PR)?)\s*#(\d+)/i.exec(body);
   const replaced=/(?:superseded(?: by)?|replaced(?: by)?|замен[её]н(?: на)?)\s*#(\d+)/i.exec(body);
   pulls[rp+'::'+p.head.ref]={
    repo:rp,branch:p.head.ref,number:p.number,title:p.title,state:detailed.state,
    merged:!!detailed.merged_at,sha:detailed.merge_commit_sha,created:Date.parse(detailed.created_at),
    lastCommit:Date.parse(commit?.commit?.committer?.date||commit?.commit?.author?.date||p.updated_at),
    mergeable_state:detailed.mergeable_state,
    checkRuns:checks?.check_runs||[],
    duplicateOf:dup?Number(dup[1]):undefined,supersededBy:replaced?Number(replaced[1]):undefined
   };
  }
 });
 await Promise.all(workers);
 const zanyato=[],zf='rules/09-platforma/ZANYATO.md';
 if(existsSync(zf))for(const line of readFileSync(zf,'utf8').split('\n')){
  const c=line.split('|').map(x=>x.trim());
  if(c.length>=6&&/^lab\//.test(c[2]))zanyato.push({item:c[1],branch:c[2],who:c[3],at:c[4].replace(' UTC','')});
 }
 for(const z of zanyato)if(!pulls[repo+'::'+z.branch]&&!rows.some(r=>r.branch===z.branch)){
  const c=await api('repos/'+repo+'/commits/'+encodeURIComponent(z.branch));
  if(c?.commit?.committer?.date)branches[repo+'::'+z.branch]=Date.parse(c.commit.committer.date);
 }
 return {repo,mgRepo,pulls,branches,zanyato};
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const file = 'ZADACHI.md', text = readFileSync(file, 'utf8');
  const out = apply(text, await collect(parseRows(text)), Date.parse(process.env.WATCH_NOW || new Date().toISOString()));
  if (out !== text) writeFileSync(file, out);
  console.log(out !== text ? 'ZADACHI_UPDATED' : 'ZADACHI_OK');
  console.log((/^\*\*Итог:.*$/m.exec(out) || [''])[0]);
}
