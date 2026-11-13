import fs from 'node:fs/promises';
import {execFile as runCommand} from 'node:child_process';
import {promisify} from 'node:util';

const gh = promisify(runCommand);
const root = 'repos/{owner}/{repo}';
const since = new Date(Date.now() - 14 * 86400000);
const actors = ['автозадача', 'чат ChatGPT', 'неизвестно'];

export function requireResponse(response, endpoint) {
  if (!response || !Number.isInteger(response.status) || !response.ok) {
    throw new Error('GitHub API ' + (response?.status ?? 'нет данных') + ': ' + endpoint);
  }
  return response;
}

async function api(endpoint) {
  let stdout;
  try {
    ({stdout} = await gh('gh', ['api', root + endpoint], {maxBuffer: 32 * 1024 * 1024}));
  } catch (error) {
    const status = Number(/HTTP\s+(\d+)/.exec(String(error.stderr || ''))?.[1] || 0);
    requireResponse({status, ok:false}, endpoint);
    throw error;
  }
  let value;
  try { value = JSON.parse(stdout); }
  catch { throw new Error('GitHub API JSON: нет данных (' + endpoint + ')'); }
  if (value === null) throw new Error('GitHub API null: ' + endpoint);
  return value;
}

async function allPages(endpoint, key) {
  let items = [];
  for (let page = 1; page <= 20; page++) {
    const sep = endpoint.includes('?') ? '&' : '?';
    const value = await api(endpoint + sep + 'per_page=100&page=' + page);
    const chunk = key ? value?.[key] : value;
    if (!Array.isArray(chunk)) throw new Error('GitHub API: нет данных (' + endpoint + ')');
    items = items.concat(chunk);
    if (chunk.length < 100) return items;
  }
  throw new Error('GitHub API: pagination incomplete (' + endpoint + ')');
}

export function validateDictionary(dictionary) {
  if (!Array.isArray(dictionary?.types) || !dictionary.types.length) {
    throw new Error('Type dictionary missing');
  }
  const ids = new Set();
  for (const t of dictionary.types) {
    if (!t.id || ids.has(t.id) || !Array.isArray(t.paths) || !Array.isArray(t.words) ||
        (!t.paths.length && !t.words.length)) throw new Error('Invalid type dictionary');
    ids.add(t.id);
  }
  return dictionary;
}

export function classify(pr, filenames, dictionary) {
  validateDictionary(dictionary);
  const words = String(pr.title || '') + ' ' + String(pr.head?.ref || '');
  const normalized = words.toLowerCase();
  let best = { id: 'unclassified', score: 0 };
  for (const t of dictionary.types) {
    const pathMatches = filenames.filter(p => t.paths.some(prefix => p.startsWith(prefix))).length;
    const wordMatches = t.words.filter(w => normalized.includes(w.toLowerCase())).length;
    const score = pathMatches * 3 + wordMatches;
    if (score > best.score) best = { id: t.id, score };
  }
  return best.id;
}

export function identifyActor(pr, busy) {
  const body = String(pr.body || '');
  const label = String(pr.title || '');
  const row = busy.split('\n').find(l => l.startsWith('|') &&
    l.includes(pr.head?.ref || '\u0000')) || '';
  if (/MG-строитель|MG-ремонтник|автозадач|автоматическ/i.test(body + row + label)) return actors[0];
  if (/чат ChatGPT|обычный чат|ChatGPT \(чат\)/i.test(body + row)) return actors[1];
  return actors[2];
}

export function statusOf(pr, lastCommitTime, now = Date.now()) {
  if (pr.merged_at && pr.state === 'closed') return 'слито';
  if (pr.state === 'closed') return 'закрыто';
  if (pr.state !== 'open' || !lastCommitTime || Number.isNaN(Date.parse(lastCommitTime))) {
    throw new Error('PR state/commit: нет данных');
  }
  if (/НУЖЕН CLAUDE/i.test(pr.body || '')) return 'НУЖЕН CLAUDE';
  return now - Date.parse(lastCommitTime) > 86400000 ? 'брошено' : 'активно';
}

export function publishablePr(pr) {
  const {lastCommit, ...facts} = pr;
  return facts;
}

export function stableJson(data) {
  return JSON.stringify(data, null, 2) + '\n';
}

export function grade(merged, closed, abandoned, claude, repeated) {
  const resolved = merged + closed + abandoned + claude;
  if (resolved === 0) return 'нет данных';
  const share = merged / resolved;
  if (repeated || share < 0.4) return 'красная';
  if (share < 0.7) return 'жёлтая';
  return 'зелёная';
}

export function compute(prs, dictionary) {
  const metrics = [];
  for (const type of [...dictionary.types.map(x => x.id), 'unclassified']) {
    for (const actor of actors) {
      const list = prs.filter(x => x.type === type && x.actor === actor);
      const count = status => list.filter(x => x.status === status).length;
      const merged = count('слито'), closed = count('закрыто'), abandoned = count('брошено');
      const claude = count('НУЖЕН CLAUDE');
      const mergedDurations = list.filter(x => x.status === 'слито' && x.merged_at && x.created_at)
        .map(x => (Date.parse(x.merged_at) - Date.parse(x.created_at)) / 3600000);
      const failedRuns = list.map(x => x.failedBeforeGreen).filter(Number.isFinite);
      metrics.push({
        type, actor, total: list.length, merged, closed, abandoned, claude,
        active: count('активно'), repeatedErrors: list.some(x => x.repeatedError),
        avgMergeHours: mergedDurations.length ? Number((mergedDurations.reduce((a,b)=>a+b,0) /
          mergedDurations.length).toFixed(1)) : null,
        failedBeforeGreen: failedRuns.length === list.length && list.length ?
          failedRuns.reduce((a,b)=>a+b,0) : null,
        newErrors: list.reduce((n,x)=>n+x.newErrors,0),
        zone: grade(merged, closed, abandoned, claude, list.some(x=>x.repeatedError))
      });
    }
  }
  return metrics;
}

export function isRepeatJournalError(line) {
  if (/без повтор|нет повтор|без регресс|нет регресс|не повторилась/i.test(line)) return false;
  return /повтор|снова|регресс|слома?л[аио]?сь? существующ|старую ловушк|старой проверк/i
    .test(line);
}

function attributedErrors(journal, number) {
  return journal.split('\n').filter(line => line.startsWith('|') &&
    line.includes('PR #' + number + ' ') && line.match(/20\d\d-\d\d-\d\d/));
}

async function redBeforeGreen(pr) {
  const runs = await allPages('/actions/runs?branch=' + encodeURIComponent(pr.head.ref) +
    '&created=>=' + since.toISOString().slice(0, 10), 'workflow_runs');
  const related = runs.filter(run => run.head_branch === pr.head.ref &&
    Date.parse(run.created_at) >= Date.parse(pr.created_at)).sort((a,b) =>
      Date.parse(a.created_at) - Date.parse(b.created_at));
  if (!related.length) return null;
  const firstGreen = related.findIndex(x=>x.conclusion==='success');
  return related.slice(0, firstGreen < 0 ? related.length : firstGreen)
    .filter(x=>['failure','timed_out','action_required'].includes(x.conclusion)).length;
}

async function snapshot() {
  const dictionary = validateDictionary(JSON.parse(
    await fs.readFile('scripts/karta-sil/types.json', 'utf8')));
  const busy = await fs.readFile('rules/09-platforma/ZANYATO.md', 'utf8');
  const journal = await fs.readFile('OSHIBKI.md', 'utf8');
  const listing = await allPages('/pulls?state=all&sort=updated&direction=desc');
  const recent = listing.filter(pr => Date.parse(pr.updated_at) >= since.getTime());
  const prs = [];
  for (const pr of recent) {
    if (!pr.number || !pr.head?.sha || !pr.created_at || !pr.updated_at) {
      throw new Error('PR fields: нет данных');
    }
    if (pr.state === 'open') {
      let detail = await api('/pulls/' + pr.number);
      for (let retry=0; detail.mergeable === null && retry<3; retry++) {
        await new Promise(resolve=>setTimeout(resolve,1000));
        detail = await api('/pulls/' + pr.number);
      }
      if (detail.mergeable === null || detail.mergeable === undefined) {
        throw new Error('GitHub mergeable=null: PR #' + pr.number);
      }
    }
    const filenames = (await allPages('/pulls/' + pr.number + '/files')).map(x=>x.filename);
    const commit = await api('/commits/' + pr.head.sha);
    const lastCommit = commit?.commit?.committer?.date;
    if (!lastCommit) throw new Error('PR commit date: нет данных #' + pr.number);
    const matches = attributedErrors(journal, pr.number);
    prs.push(publishablePr({
      number:pr.number, url:pr.html_url, type:classify(pr,filenames,dictionary),
      actor:identifyActor(pr,busy), status:statusOf(pr,lastCommit),
      created_at:pr.created_at, merged_at:pr.merged_at || null,
      lastCommit, changedFiles:filenames.length,
      failedBeforeGreen:await redBeforeGreen(pr), newErrors:matches.length,
      repeatedError:matches.some(isRepeatJournalError)
    }));
  }
  prs.sort((a,b)=>a.number-b.number);
  return {schema:1, periodDays:14, source:'GitHub REST API', status:'полная',
    types:dictionary.types.map(x=>({id:x.id,label:x.label})),
    metrics:compute(prs,dictionary), prs};
}

function markdown(data) {
  const lines=['<!-- KARTA:AUTO BEGIN -->','## Статистика GitHub за 14 дней',
    'Источник: GitHub PR, коммиты, Actions, OSHIBKI.md. Нет выборки — «нет данных», а не зелёный.',
    '',
    '| Тип | Исполнитель | Слито | Закрыто | Брошено | Claude | Ошибки | До слияния, ч | Красные прогоны | Зона |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---|'];
  for (const m of data.metrics) {
    if (!m.total) continue;
    lines.push('| '+m.type+' | '+m.actor+' | '+m.merged+' | '+m.closed+' | '+
      m.abandoned+' | '+m.claude+' | '+m.newErrors+' | '+
      (m.avgMergeHours ?? 'нет данных')+' | '+
      (m.failedBeforeGreen ?? 'нет данных')+' | '+m.zone+' |');
  }
  lines.push('', '<!-- KARTA:AUTO END -->');
  return lines.join('\n');
}

export async function main() {
  const data = await snapshot();
  const path = 'rules/09-platforma/KARTA_SIL.md';
  const before = await fs.readFile(path, 'utf8');
  const start = '<!-- KARTA:AUTO BEGIN -->', end = '<!-- KARTA:AUTO END -->';
  if (!before.includes(start) || !before.includes(end)) throw new Error('Map markers missing');
  const after = before.slice(0,before.indexOf(start)) + markdown(data) +
    before.slice(before.indexOf(end)+end.length);
  if (before !== after) await fs.writeFile(path,after);
  const json = stableJson(data);
  const old = await fs.readFile('automation/karta-sil.json','utf8');
  if (json !== old) await fs.writeFile('automation/karta-sil.json', json);
}
export async function markNoData() {
  const filename = 'automation/karta-sil.json';
  const previous = JSON.parse(await fs.readFile(filename,'utf8'));
  const failed = stableJson({schema:1,status:'нет данных',periodDays:14,
    types:previous.types,metrics:[],prs:[]});
  if (stableJson(previous) !== failed) await fs.writeFile(filename,failed);
}
