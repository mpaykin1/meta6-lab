import fs from 'node:fs/promises';
const repo=process.env.GITHUB_REPOSITORY||'mpaykin1/meta6-lab';
const token=process.env.GITHUB_TOKEN;
const root='https://api.github.com/repos/'+repo;
const headers={'Accept':'application/vnd.github+json','User-Agent':'meta-games-dispatcher',...(token?{'Authorization':'Bearer '+token}:{})};
async function api(path){const r=await fetch(root+path,{headers});if(!r.ok)throw Error(path+': '+r.status);return r.json();}
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
 const counts={stalled:cards.filter(c=>c.stalled).length,conflicts:cards.filter(c=>c.conflict).length,red:cards.filter(c=>c.red).length,claude:claude.length};
 let s='# ДИСПЕТЧЕР МГ/МГЛ\n\nИтог: зависло '+counts.stalled+' · конфликт '+counts.conflicts+' · красные проверки '+counts.red+' · нужен Claude '+counts.claude+'\n\n';
 for(const c of ordered){const claimed=old.get(c.id)||'—';const claim=claimed!=='—'&&!available('Взял: '+claimed,c.lastCommit,now)?claimed:'—';
 s+='### PR #'+c.id+'\n- PR: https://github.com/'+repo+'/pull/'+c.id+'\n- Ветка: `'+c.branch+'`\n- Проблема: '+c.problem+'\n- Задание: '+c.action+'\n- Взял: '+claim+'\n\n';
 }
 s+='## НУЖЕН CLAUDE\n'+(claude.map(c=>'- [#'+c.id+'](https://github.com/'+repo+'/pull/'+c.id+') '+c.title).join('\n')||'—')+'\n';
 return s;
}
async function main(){
 const tasks=parseTasks(await fs.readFile('ZADACHI.md','utf8'));
 const finish=await fs.readFile('rules/09-platforma/FINISH.md','utf8');
 let previous='';try{previous=await fs.readFile('DISPETCHER.md','utf8')}catch{}
 const cards=[],claude=[];
 for(const t of tasks){
 let pr;try{pr=await api('/pulls/'+t.id)}catch(e){console.error('PR '+t.id,e.message);throw e}
 if(pr.state!=='open')continue;
 const checks=await api('/commits/'+pr.head.sha+'/check-runs?per_page=100');
 const statuses=await api('/commits/'+pr.head.sha+'/status');
 const failed=checks.check_runs.filter(x=>['failure','timed_out','action_required'].includes(x.conclusion)).map(x=>({name:x.name,url:x.html_url}));
 failed.push(...statuses.statuses.filter(x=>['failure','error'].includes(x.state)).map(x=>({name:x.context,url:x.target_url})));
 const conflict=pr.mergeable===false||pr.mergeable_state==='dirty';
 const stale=Date.now()-Date.parse(pr.head.repo?.pushed_at||pr.updated_at)>172800000;
 const stalled=/ЗАВИС/.test(t.status),isClaude=/НУЖЕН CLAUDE/.test(t.status)||/НУЖЕН CLAUDE/.test(pr.body||'');
 const c={...t,branch:pr.head.ref,conflict,red:failed.length>0,stalled,finish:finish.includes(t.title),lastCommit:pr.head.repo?.pushed_at||pr.updated_at};
 if(isClaude){claude.push(c);continue}
 if(!conflict&&!failed.length&&!stalled&&!stale)continue;
 c.priority=conflict?0:failed.length?1:stalled?2:3;
 c.problem=conflict?'Конфликт с main':failed.length?'Красная проверка: '+failed.map(x=>x.name+' ('+x.url+')').join(', '):stalled?'🛑 ЗАВИС':'💤 ЗАБРОШЕНО более 2 суток';
 c.action=conflict?'Обнови ветку из main, разреши конфликт, затем проверь CI.':failed.length?'Исправь '+failed[0].name+' по логу '+failed[0].url+' и повтори CI.':stalled?'Продолжи работу по PR, проверь CI и доведи до слияния.':c.finish?'Доведи пункт FINISH.md до зелёных проверок.':'Закрой устаревший PR с причиной в OSHIBKI.md либо доведи его.';
 cards.push(c);
 }
 const output=render(cards,claude,previous);
 if(/ЗАВИС/.test(await fs.readFile('ZADACHI.md','utf8'))&&!cards.length)throw Error('Empty dispatcher with stalled tasks');
 await fs.writeFile('DISPETCHER.md',output);
 console.log(output.slice(0,250));
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)main().catch(e=>{console.error(e);process.exitCode=1});
