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
  if (dictionary.branchActors !== undefined) {
    if (!Array.isArray(dictionary.branchActors)) throw new Error('Invalid branch actor rules');
    for (const rule of dictionary.branchActors) {
      if (!rule.pattern?.startsWith('^') || !actors.includes(rule.actor) ||
          rule.actor === 'неизвестно') throw new Error('Invalid branch actor rule');
      new RegExp(rule.pattern);
    }
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

function actorLabel(value) {
  const found = new Set();
  if (/MG-строитель|MG-ремонтник|автозадач/i.test(value)) found.add(actors[0]);
  if (/чат ChatGPT|ChatGPT \(чат\)|обычный чат/i.test(value)) found.add(actors[1]);
  return found.size === 1 ? [...found][0] : actors[2];
}

export function identifyActor(pr, busy, dictionary = {}) {
  const branch = String(pr.head?.ref || '');
  const explicit = [...String(pr.body || '').matchAll(
    /^(?:Исполнитель|Автор|Кто):\s*([^\n]+)/gmi
  )];
  if (explicit.length) {
    const kinds = new Set(explicit.map(match => actorLabel(match[1])));
    if (kinds.size > 1) return actors[2];
    const known = [...kinds][0];
    if (known && known !== actors[2]) return known;
  }
  const owners = busy.split('\n').map(line => line.split('|').slice(1,-1).map(x => x.trim()))
    .filter(cells => (branch && cells[1]?.replaceAll('`','') === branch) ||
      (Number.isInteger(pr.number) &&
       new RegExp('\\bPR\\s*#' + pr.number + '\\b', 'i').test(cells[0] || '')))
    .map(cells => actorLabel(cells[2] || ''))
    .filter(owner => owner !== actors[2]);
  const unique = new Set(owners);
  if (unique.size === 1) return [...unique][0];
  if (unique.size > 1) return actors[2];
  const matched = (dictionary.branchActors || []).filter(rule =>
    new RegExp(rule.pattern).test(branch));
  const inferred = new Set(matched.map(rule => rule.actor));
  return inferred.size === 1 ? [...inferred][0] : actors[2];
}

export function watchdogClosed(comments) {
  if (!Array.isArray(comments)) throw new Error('PR comments: нет данных');
  return comments.some(comment =>
    /^(?:github-actions\[bot\]|github-actions)$/i.test(comment?.author?.login || '') &&
    /закрыт сторожем как заброшенн/i.test(comment?.body || ''));
}

export function statusOf(pr, lastCommitTime, now = Date.now()) {
  if (pr.merged_at && pr.state === 'closed') return 'слито';
  if (pr.state === 'closed') {
    if (watchdogClosed(pr.comments || [])) return 'брошено';
    if (pr.closed_at && lastCommitTime &&
        !Number.isNaN(Date.parse(pr.closed_at)) &&
        !Number.isNaN(Date.parse(lastCommitTime)) &&
        Date.parse(pr.closed_at) - Date.parse(lastCommitTime) > 86400000) {
      return 'брошено';
    }
    return 'закрыто';
  }
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
      const failures = failedRuns.length === list.length && list.length ?
        failedRuns.reduce((a,b)=>a+b,0) : null;
      const resolved = merged + closed + abandoned;
      const closedShare = resolved ?
        Number(((closed + abandoned) * 100 / resolved).toFixed(1)) : null;
      const redPerMerge = merged && failures !== null ?
        Number((failures / merged).toFixed(1)) : null;
      metrics.push({
        type, actor, total: list.length, merged, closed, abandoned, claude,
        active: count('активно'), deferred: count('отложено'), repeatedErrors: list.some(x => x.repeatedError),
        avgMergeHours: mergedDurations.length ? Number((mergedDurations.reduce((a,b)=>a+b,0) /
          mergedDurations.length).toFixed(1)) : null,
        failedBeforeGreen: failures,
        redPerMerge, closedShare,
        action: (redPerMerge !== null && redPerMerge > 5) ||
          (closedShare !== null && closedShare > 30) ?
          'дробить задачи / тесты до пуша' : '—',
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

export function attributedErrors(journal, pr, commitShas = [], runToSha = new Map()) {
  const commits = new Set([pr.head?.sha, ...commitShas]
    .filter(sha => /^[a-f0-9]{7,40}$/i.test(sha || ''))
    .map(sha => sha.toLowerCase()));
  return journal.split('\n').filter(line => {
    if (!/^\|\s*\d+\s*\|\s*(?:\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})\s*\||^-\s*\d{4}-\d{2}-\d{2}/.test(line)) {
      return false;
    }
    const refs = [...line.matchAll(/(?:\bPR\s*#|\/pull\/|(?<![\w/])#)(\d+)(?!\d)/gi)];
    if (refs.some(match => Number(match[1]) === pr.number)) return true;
    const runs = [...line.matchAll(/\/actions\/runs\/(\d+)/g)];
    if (runs.some(match => commits.has(String(runToSha.get(match[1]) || '').toLowerCase()))) {
      return true;
    }
    const withoutRuns = line.replace(/\/actions\/runs\/\d+/g, '');
    return [...withoutRuns.matchAll(/\b[a-f0-9]{7,40}\b/gi)]
      .some(match => [...commits].some(sha => sha.startsWith(match[0].toLowerCase())));
  });
}

async function actionRunHeads(journal) {
  // Только уникальные ссылки из журнала; не опрашиваем Actions для каждого PR.
  const ids = [...new Set([...journal.matchAll(/\/actions\/runs\/(\d+)/g)]
    .map(match => match[1]))];
  const heads = new Map();
  for (let i = 0; i < ids.length; i += 4) {
    const group = await Promise.all(ids.slice(i, i + 4).map(async id => {
      const run = await api('/actions/runs/' + id);
      if (!/^[a-f0-9]{40}$/i.test(run?.head_sha || '')) {
        throw new Error('GitHub Actions: нет данных ' + id);
      }
      return [id, run.head_sha];
    }));
    for (const [id, sha] of group) heads.set(id, sha);
  }
  return heads;
}

async function busyHistory() {
  const file = 'rules/09-platforma/ZANYATO.md';
  let log;
  try {
    ({stdout:log} = await gh('git',['log','--format=%H','--',file],
      {maxBuffer:2 * 1024 * 1024}));
  } catch (error) {
    throw new Error('ZANYATO history: нет данных ' + error.message);
  }
  const commits = log.trim().split('\n').filter(Boolean);
  if (!commits.length) throw new Error('ZANYATO history: нет данных');
  const versions = [];
  for (const sha of commits) {
    try {
      const {stdout} = await gh('git',['show',sha + ':' + file],
        {maxBuffer:2 * 1024 * 1024});
      versions.push(stdout);
    } catch (error) {
      throw new Error('ZANYATO history: нет данных ' + error.message);
    }
  }
  return versions.join('\n');
}


// Claude 14.11.2026: один GraphQL-запрос на 25 PR вместо 4–20 REST-запросов на каждый PR.
// Прежний REST-обход (~300 PR × files/commit/runs) не укладывался ни в 10 минут, ни в квоту 1000/ч.
const PR_QUERY = `query($owner:String!,$name:String!,$cursor:String){repository(owner:$owner,name:$name){
pullRequests(first:25,after:$cursor,orderBy:{field:UPDATED_AT,direction:DESC},states:[OPEN,CLOSED,MERGED]){
pageInfo{hasNextPage endCursor}
nodes{number url state isDraft title body headRefName headRefOid createdAt updatedAt mergedAt closedAt changedFiles
files(first:100){nodes{path}}
comments(last:5){nodes{author{login} body}}
commits(last:50){nodes{commit{oid committedDate statusCheckRollup{state}}}}}}}}`;

export function toRestShape(node) {
  if (!Number.isSafeInteger(node?.number) || !node.headRefOid || !node.createdAt || !node.updatedAt ||
      !['OPEN','CLOSED','MERGED'].includes(node.state) || !Array.isArray(node.files?.nodes) ||
      !Array.isArray(node.commits?.nodes)) throw new Error('GraphQL PR: нет данных');
  if (node.state === 'CLOSED' && (!node.closedAt || !Array.isArray(node.comments?.nodes))) {
    throw new Error('Closed PR details: нет данных #' + node.number);
  }
  const commits = node.commits.nodes.map(x => x?.commit).filter(Boolean);
  const lastCommit = commits.at(-1)?.committedDate;
  if (!lastCommit) throw new Error('PR commit date: нет данных #' + node.number);
  return {
    pr: {number:node.number, html_url:node.url, state:node.state === 'OPEN' ? 'open' : 'closed',
      merged_at:node.mergedAt || null, draft:node.isDraft === true, title:node.title, body:node.body,
      head:{ref:node.headRefName, sha:node.headRefOid}, created_at:node.createdAt,
      updated_at:node.updatedAt, closed_at:node.closedAt || null,
      comments:node.comments?.nodes || []},
    commitShas: commits.map(x => x.oid).filter(Boolean),
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
  const [owner, name] = String(process.env.KARTA_REPO || 'mpaykin1/meta6-lab').split('/');
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
  const busy = await busyHistory();
  const journal = await fs.readFile('OSHIBKI.md', 'utf8');
  const runHeads = await actionRunHeads(journal);
  const prs = [];
  for (const item of await graphqlPulls()) {
    const {pr, filenames, changedFiles, lastCommit, failedBeforeGreen, commitShas} = item;
    const matches = attributedErrors(journal, pr, commitShas, runHeads);
    prs.push(publishablePr({
      number:pr.number, url:pr.html_url, type:classify(pr,filenames,dictionary),
      actor:identifyActor(pr,busy,dictionary), status:statusOf(pr,lastCommit),
      created_at:pr.created_at, merged_at:pr.merged_at || null,
      lastCommit, changedFiles, failedBeforeGreen, newErrors:matches.length,
      repeatedError:matches.some(isRepeatJournalError)
    }));
  }
  if (!prs.length) throw new Error('GitHub GraphQL: 0 PR за 14 дней — нет данных');
  prs.sort((a,b)=>a.number-b.number);
  const metrics = compute(prs,dictionary);
  // Короткий срез — по дате создания PR, но маршрутизация диспетчера остаётся 14-дневной.
  const metrics3 = compute(recentCohort(prs,3),dictionary).map(m => ({
    ...m, trend:trendFor(m,metrics.find(x => x.type === m.type && x.actor === m.actor))
  }));
  return {schema:1, periodDays:14, recentDays:3, source:'GitHub GraphQL API',
    status:'полная', types:dictionary.types.map(x=>({id:x.id,label:x.label})),
    metrics, metrics3, prs};
}

export function recentCohort(prs, days, now = Date.now()) {
  return prs.filter(pr => {
    const created = Date.parse(pr.created_at);
    if (!Number.isFinite(created)) throw new Error('PR creation date: нет данных');
    return created >= now - days * 86400000;
  });
}

export function trendFor(recent, baseline) {
  if (!baseline) return 'нет данных';
  const n3 = recent.merged + recent.closed + recent.abandoned;
  const n14 = baseline.merged + baseline.closed + baseline.abandoned;
  if (n3 < 3 || n14 < 3) return 'мало данных';
  const delta = recent.merged / n3 - baseline.merged / n14;
  return delta > 0.01 ? '↑ лучше' : delta < -0.01 ? '↓ хуже' : '→ так же';
}

function markdown(data) {
  const lines=['<!-- KARTA:AUTO BEGIN -->',
    '## Статистика GitHub за 14 дней',
    'Источник: GitHub PR, коммиты, Actions, OSHIBKI.md. Нет выборки — «нет данных».',
    'Зона диспетчера по-прежнему рассчитывается только по 14 дням.', ''];
  const headings=['Тип','Исполнитель','Слито','Закрыто','Брошено','Отложено',
    'Claude','Ошибки','До слияния, ч','Красные прогоны','Красных/слияние',
    'Закрыто без слияния','Действие','Зона'];
  function print(metrics, recent) {
    const cols = recent ? [...headings,'Тренд к 14 дням'] : headings;
    lines.push('| ' + cols.join(' | ') + ' |');
    lines.push('|' + cols.map((_,i) => i < 2 || i >= 12 ? '---' : '---:').join('|') + '|');
    for (const m of metrics) {
      if (!m.total) continue;
      const values=[m.type,m.actor,m.merged,m.closed,m.abandoned,m.deferred,m.claude,
        m.newErrors,m.avgMergeHours ?? 'нет данных',m.failedBeforeGreen ?? 'нет данных',
        m.redPerMerge ?? 'нет данных',
        m.closedShare === null ? 'нет данных' : m.closedShare + '%',
        m.action,m.zone];
      if (recent) values.push(m.trend);
      lines.push('| ' + values.join(' | ') + ' |');
    }
  }
  print(data.metrics,false);
  lines.push('', '## Статистика GitHub за 3 дня',
    'Когорта по дате создания PR. Для тренда нужно не меньше трёх завершённых PR.',
    '');
  print(data.metrics3,true);
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
  const failed = stableJson({schema:1,status:'нет данных',periodDays:14,recentDays:3,
    types:previous.types,metrics:[],metrics3:[],prs:[]});
  if (stableJson(previous) !== failed) await fs.writeFile(filename,failed);
}
