// ANTISUETA: trusted GitHub facts, zero dependencies, no AI.
const REPO = 'mpaykin1/meta6-lab';
const isGateFile = p => p === '.github/workflows/polza-gate.yml' || p.startsWith('scripts/polza/');
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
function hasSelfChange(f) { return isGateFile(f.filename||'') || isGateFile(f.previous_filename||''); }
const fail = reason => ({ok:false,reason});
const pass = reason => ({ok:true,reason});
export function claim(body) {
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
  if (ctx.isNewPR && ctx.openPRs > 10) return fail('Открыто более 10 PR: ограничение очереди');
  const addedFlows = files.filter(f=>f.status==='added' && /^\.github\/workflows\/[^/]+\.ya?ml$/.test(f.filename));
  if (addedFlows.length && c.type !== 'finish') return fail('Новый workflow требует ПОЛЬЗА: FINISH');
  if (addedFlows.some(f=>ctx.newCronFiles?.includes(f.filename)) && (ctx.scheduledWorkflows + (ctx.newCronFiles?.length||0)) > 8)
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

export function unwrapPage(data) {
 const list=Array.isArray(data)?data:(data?.jobs||data?.workflow_runs||[]);
 if(!Array.isArray(list)) throw Error('GitHub did not return an array');
 return list;
}
