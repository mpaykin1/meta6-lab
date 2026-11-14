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

export async function allPages(endpoint, key, request = api) {
  let items = [];
  const seen = new Set();
  for (let page = 1; ; page++) {
    const sep = endpoint.includes('?') ? '&' : '?';
    let value;
    try { value = await request(endpoint + sep + 'per_page=100&page=' + page); }
    catch (error) { throw new Error('GitHub API: нет данных: ' + error.message); }
    const chunk = key ? value?.[key] : value;
    if (!Array.isArray(chunk)) throw new Error('GitHub API: нет данных (' + endpoint + ')');
    if (chunk.length === 0) return items;
    const signature = JSON.stringify(chunk);
    if (seen.has(signature)) throw new Error('GitHub API: неполные данные, повтор страницы');
    seen.add(signature);
    items = items.concat(chunk);
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
  const branch = pr.head?.ref;
  const row = busy.split('\n').map(line => line.split('|').slice(1,-1).map(x => x.trim()))
    .find(cells => branch && cells[1]?.replaceAll('`','') === branch);
  const owner = row?.[2] || '';
  if (/MG-строитель|MG-ремонтник|автозадач/i.test(owner)) return actors[0];
  if (/чат ChatGPT|ChatGPT \(чат\)/i.test(owner)) return actors[1];
  const markers = [...String(pr.body || '').matchAll(
    /^(?:Исполнитель|Автор|Кто):\s*([^\n]+)|^Сделано \/ дальше \(([^,)]+)/gmi
  )].map(match => match[1] || match[2]);
  const found = new Set();
  for (const marker of markers) {
    if (/MG-строитель|MG-ремонтник|автозадач/i.test(marker)) found.add(actors[0]);
    if (/чат ChatGPT|обычный чат|ChatGPT \(чат\)/i.test(marker)) found.add(actors[1]);
  }
  return found.size === 1 ? [...found][0] : actors[2];
}

export function statusOf(pr, lastCommitTime, now = Date.now()) {
  if (pr.merged_at && pr.state === 'closed') return 'слито';
  if (pr.state === 'closed') return 'закрыто';
  if (pr.state !== 'open' || !lastCommitTime || Number.isNaN(Date.parse(lastCommitTime))) {
    throw new Error('PR state/commit: нет данных');
  }
  if (/НУЖЕН CLAUDE/i.test(pr.body || '')) return 'НУЖЕН CLAUDE';
  // #309: отложенный draft не равен невыполненной работе и не портит долю слияний.
  if (pr.draft === true) return 'отложено';
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
        active: count('активно'), deferred: count('отложено'), repeatedErrors: list.some(x => x.repeatedError),
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


// Claude 14.11.2026: один GraphQL-запрос на 25 PR вместо 4–20 REST-запросов на каждый PR.
// Прежний REST-обход (~300 PR × files/commit/runs) не укладывался ни в 10 минут, ни в квоту 1000/ч.
const PR_QUERY = `query($owner:String!,$name:String!,$cursor:String){repository(owner:$owner,name:$name){
pullRequests(first:25,after:$cursor,orderBy:{field:UPDATED_AT,direction:DESC},states:[OPEN,CLOSED,MERGED]){
pageInfo{hasNextPage endCursor}
nodes{number url state isDraft title body headRefName headRefOid createdAt updatedAt mergedAt changedFiles
files(first:100){nodes{path}}
commits(last:50){nodes{commit{committedDate statusCheckRollup{state}}}}}}}}`;

export function toRestShape(node) {
  if (!Number.isSafeInteger(node?.number) || !node.headRefOid || !node.createdAt || !node.updatedAt ||
      !['OPEN','CLOSED','MERGED'].includes(node.state) || !Array.isArray(node.files?.nodes) ||
      !Array.isArray(node.commits?.nodes)) throw new Error('GraphQL PR: нет данных');
  const commits = node.commits.nodes.map(x => x?.commit).filter(Boolean);
  const lastCommit = commits.at(-1)?.committedDate;
  if (!lastCommit) throw new Error('PR commit date: нет данных #' + node.number);
  return {
    pr: {number:node.number, html_url:node.url, state:node.state === 'OPEN' ? 'open' : 'closed',
      merged_at:node.mergedAt || null, draft:node.isDraft === true, title:node.title, body:node.body,
      head:{ref:node.headRefName, sha:node.headRefOid}, created_at:node.createdAt, updated_at:node.updatedAt},
    filenames: node.files.nodes.map(x => x.path),
    changedFiles: Number.isInteger(node.changedFiles) ? node.changedFiles : node.files.nodes.length,
    lastCommit,
    failedBeforeGreen: redPushesBeforeGreen(commits.map(x => x.statusCheckRollup?.state ?? null))
  };
}

// Сколько пушей PR были красными до первого зелёного (по итоговому статусу проверок коммита).
export function redPushesBeforeGreen(states) {
  if (!states.length || states.every(x => x === null)) return null;
  const firstGreen = states.indexOf('SUCCESS');
  return states.slice(0, firstGreen < 0 ? states.length : firstGreen)
    .filter(x => x === 'FAILURE' || x === 'ERROR').length;
}

export async function graphqlPulls(request = graphql) {
  const out = [];
  let cursor = null;
  for (let round = 0; round < 40; round++) {
    const data = await request(PR_QUERY, cursor);
    const page = data?.data?.repository?.pullRequests;
    if (!page || !Array.isArray(page.nodes)) {
      throw new Error('GitHub GraphQL: нет данных ' + JSON.stringify(data?.errors || '').slice(0, 300));
    }
    for (const node of page.nodes) {
      if (Date.parse(node?.updatedAt) < since.getTime()) return out;
      out.push(toRestShape(node));
    }
    if (!page.pageInfo?.hasNextPage) return out;
    cursor = page.pageInfo.endCursor;
  }
  throw new Error('GitHub GraphQL: неполная выборка PR');
}

async function graphql(query, cursor) {
  const [owner, name] = String(process.env.GITHUB_REPOSITORY || 'mpaykin1/meta6-lab').split('/');
  const args = ['api', 'graphql', '-f', 'query=' + query, '-F', 'owner=' + owner, '-F', 'name=' + name];
  if (cursor) args.push('-f', 'cursor=' + cursor);
  let stdout;
  try { ({stdout} = await gh('gh', args, {maxBuffer: 64 * 1024 * 1024})); }
  catch (error) { throw new Error('GitHub GraphQL: нет данных: ' + String(error.stderr || error.message).slice(0, 300)); }
  try { return JSON.parse(stdout); }
  catch { throw new Error('GitHub GraphQL JSON: нет данных'); }
}

async function snapshot() {
  const dictionary = validateDictionary(JSON.parse(
    await fs.readFile('scripts/karta-sil/types.json', 'utf8')));
  const busy = await fs.readFile('rules/09-platforma/ZANYATO.md', 'utf8');
  const journal = await fs.readFile('OSHIBKI.md', 'utf8');
  const prs = [];
  for (const item of await graphqlPulls()) {
    const {pr, filenames, changedFiles, lastCommit, failedBeforeGreen} = item;
    const matches = attributedErrors(journal, pr.number);
    prs.push(publishablePr({
      number:pr.number, url:pr.html_url, type:classify(pr,filenames,dictionary),
      actor:identifyActor(pr,busy), status:statusOf(pr,lastCommit),
      created_at:pr.created_at, merged_at:pr.merged_at || null,
      lastCommit, changedFiles, failedBeforeGreen, newErrors:matches.length,
      repeatedError:matches.some(isRepeatJournalError)
    }));
  }
  if (!prs.length) throw new Error('GitHub GraphQL: 0 PR за 14 дней — нет данных');
  prs.sort((a,b)=>a.number-b.number);
  return {schema:1, periodDays:14, source:'GitHub GraphQL API', status:'полная',
    types:dictionary.types.map(x=>({id:x.id,label:x.label})),
    metrics:compute(prs,dictionary), prs};
}

function markdown(data) {
  const lines=['<!-- KARTA:AUTO BEGIN -->','## Статистика GitHub за 14 дней',
    'Источник: GitHub PR, коммиты, Actions, OSHIBKI.md. Нет выборки — «нет данных», а не зелёный.',
    '',
    '| Тип | Исполнитель | Слито | Закрыто | Брошено | Отложено | Claude | Ошибки | До слияния, ч | Красные прогоны | Зона |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|'];
  for (const m of data.metrics) {
    if (!m.total) continue;
    lines.push('| '+m.type+' | '+m.actor+' | '+m.merged+' | '+m.closed+' | '+
      m.abandoned+' | '+m.deferred+' | '+m.claude+' | '+m.newErrors+' | '+
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
