// ANTISUETA: trusted GitHub facts, zero dependencies, no AI.
import fs from 'node:fs';
const API = 'https://api.github.com/repos/';
const REPO = process.env.GITHUB_REPOSITORY || 'mpaykin1/meta6-lab';
const OWN = REPO.split('/')[0], NAME = REPO.split('/')[1];
const GATE_FILES = new Set(['.github/workflows/polza-gate.yml','scripts/polza/gate.mjs','scripts/polza/verify-polza.mjs','scripts/polza/mutate-polza.mjs']);
const prefixes = ['games/','ink/','reference/','shared/','meta-games/'];
const DOCUMENT = /(^|\/)(?:readme|changelog|license|agents|oshibki|zadachi|zanyato|dlya_claude)(?:[._-]|$)|\.(?:md|mdx|txt|rst|adoc|pdf|log|csv)$/i;
export function isDoc(path) {
  return DOCUMENT.test(path) || /^(?:automation\/(?:prompts|progress|reports)\/|reports\/|docs\/|journal\/|progress\/|rules\/)/.test(path) || /(^|\/)(?:prompts|reports|logs)\/[^/]+$/i.test(path);
}
export function isCodeChange(f) {
  if (!f || !f.filename || f.status === 'removed') return false;
  if (f.status === 'renamed' && !(f.additions > 0)) return false;
  return !isDoc(f.filename) && !isDoc(f.previous_filename || f.filename) && (f.status !== 'renamed' || f.changes > 0);
}
function hasSelfChange(f) { return GATE_FILES.has(f.filename) || GATE_FILES.has(f.previous_filename); }
const fail = reason => ({ok:false,reason});
const pass = reason => ({ok:true,reason});
function claim(body) {
  const rows = String(body || '').split(/\r?\n/).filter(line=>/^\s*ПОЛЬЗА\s*:/.test(line));
  if (rows.length !== 1) return null;
  const line = rows[0].trim();
  let m = /^ПОЛЬЗА: FINISH (M[1-6]|B[1-7]|L[1-4]|P1)$/.exec(line);
  if (m) return {type:'finish',value:m[1]};
  m = /^ПОЛЬЗА: ИГРА ((?:games|ink|reference|shared|meta-games)\/[a-zA-Z0-9._/-]+)$/.exec(line);
  if (m && !m[1].split('/').includes('..') && !m[1].split('/').includes('.') && !m[1].endsWith('/')) return {type:'game',value:m[1]};
  m = /^ПОЛЬЗА: ПОЧИНКА (https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/actions\/runs\/[0-9]+)$/.exec(line);
  if (m) return {type:'fix',value:m[1]};
  return null;
}
export function verdict(ctx) {
  const files = ctx.files || [], changes = files.flatMap(f=>[f.filename,f.previous_filename].filter(Boolean));
  const c = claim(ctx.body);
  if (!c) return fail('Ровно одна непустая строка ПОЛЬЗА: с допустимым форматом обязательна');
  if (!files.length) return fail('Нет diff');
  if (files.some(hasSelfChange)) return fail('Самоизменение ворот в PR запрещено (в том числе переименование)');
  if (!files.some(isCodeChange)) return fail('Только документы/таблицы/промпты или переименования без изменения кода');
  if (ctx.openPRs > 10) return fail('Открыто более 10 PR: ограничение очереди');
  const addedFlows = files.filter(f=>f.status==='added' && /^\.github\/workflows\/[^/]+\.ya?ml$/.test(f.filename));
  if (addedFlows.length && c.type !== 'finish') return fail('Новый workflow требует ПОЛЬЗА: FINISH');
  if (addedFlows.some(f=>ctx.newCronFiles?.includes(f.filename)) && ctx.scheduledWorkflows > 8)
    return fail('Новый workflow с cron запрещён при числе расписаний > 8');
  if (c.type === 'finish') {
    const item = ctx.finish?.[c.value];
    if (!item) return fail('FINISH ID отсутствует в таблице');
    const filenames = new Set(files.filter(isCodeChange).map(f=>f.filename));
    const scriptsOK = (item.verify||[]).some(p=>filenames.has(p)) && (item.mutate||[]).some(p=>filenames.has(p));
    const sourceOK = (item.checked||[]).some(p=>filenames.has(p));
    if (!scriptsOK && !sourceOK) return fail('FINISH: diff не меняет проверку с ловушкой или проверяемый исходник');
    return pass('FINISH '+c.value+' подтверждён по diff');
  }
  if (c.type === 'game') {
    if (!prefixes.some(p=>c.value.startsWith(p))) return fail('Неподдерживаемый корень игры');
    const scoped = files.filter(isCodeChange).some(f=>f.filename.startsWith(c.value+'/') && (f.status !== 'renamed' || (f.previous_filename||'').startsWith(c.value+'/')));
    if (!scoped) return fail('Изменена чужая игра или только переименование');
    if (!ctx.botOK) return fail('Нет успешного прогона полного META BOT для SHA PR');
    return pass('ИГРА '+c.value+' и BOT PASS');
  }
  if (c.type === 'fix') {
    const m = /\/actions\/runs\/([0-9]+)$/.exec(c.value);
    if (!c.value.startsWith('https://github.com/'+REPO+'/actions/runs/') || !m || String(ctx.redRun?.id)!==m[1]) return fail('Ссылка на прогон не принадлежит этому репозиторию');
    if (ctx.redRun?.conclusion !== 'failure' || ctx.redRun?.head_branch !== 'main') return fail('Прогон не красный на main');
    if (!ctx.redRun?.jobsFailed) return fail('Не найдена упавшая работа');
    if (!files.filter(isCodeChange).some(f=>(ctx.repairPaths||[]).includes(f.filename))) return fail('Diff не исправляет упавший workflow или его источник');
    return pass('ПОЧИНКА красного main '+m[1]);
  }
  return fail('Неизвестный тип пользы');
}
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
  const r=await fetch(API+REPO+path,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28'}});
  if(!r.ok) throw Error('GitHub API '+r.status+' '+path);
  return r.json();
}
async function pages(path) {
  const out=[];
  for(let page=1;page<=10;page++){
    const data=await api(path+(path.includes('?')?'&':'?')+'per_page=100&page='+page);
    const list=Array.isArray(data)?data:(data.jobs||data.workflow_runs||[]);
    if(!Array.isArray(list)) throw Error('GitHub did not return an array');
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
  const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
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
  const status=await fetch(API+REPO+'/statuses/'+pr.head.sha,{
    method:'POST',
    headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
    body:JSON.stringify({state:answer.ok?'success':'failure',context:'POLZA',description:answer.reason.slice(0,140),target_url:'https://github.com/'+REPO+'/actions'})
  });
  if(!status.ok) throw Error('Cannot publish required POLZA status: '+status.status);
  console.log(JSON.stringify({pr:n,head:pr.head.sha,openPRs:opened.length,scheduled,claim:c,answer},null,2));
  if(!answer.ok) process.exitCode=1;
}
if(process.argv[1] && import.meta.url===new URL('file://'+process.argv[1]).href) main().catch(e=>{console.error(e);process.exitCode=1});
