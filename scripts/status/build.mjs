// СВОДКА ДЛЯ CLAUDE: факты GitHub, без ИИ и сторонних пакетов.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const LAB = process.env.GITHUB_REPOSITORY || 'mpaykin1/meta6-lab';
const MG = 'mpaykin1/meta6';
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const UNKNOWN = 'нет данных';
const ROOT = 'https://api.github.com';
const LINK = 'https://github.com/';

export function runVerdict(run) {
  return run?.conclusion === 'success' ? 'зелёный' :
    run?.conclusion === 'failure' ? 'красный' : UNKNOWN;
}

export function prState(pr) {
  if (pr.merged_at) return 'merged';
  if (pr.state === 'open') return 'open';
  if (pr.state === 'closed') return 'closed';
  return UNKNOWN;
}

export function isProtectedFile(file) {
  return /^(scripts\/(meta-bot|meta-progress|kontur)\/|\.github\/workflows\/)/.test(file) ||
    /(^|\/)(meta-games-guard[^/]*|selftest[^/]*|test[^/]*\.(mjs|js|py))$/.test(file) ||
    /(^|\/)(verify-[^/]*|mutate-[^/]*|[^/]*\.spec\.(mjs|js|ts))$/.test(file);
}

export function progressMark(progress, id) {
  const entry = progress?.finish?.[id] ?? progress?.finish_2?.[id];
  if (entry === true || entry?.pass === true) return { value: 'готов', reason: '' };
  if (entry === false) return { value: 'не готов', reason: 'проверка не пройдена' };
  if (entry?.pass === false) {
    return { value: 'не готов', reason: entry.reason || entry.note || 'проверка не пройдена' };
  }
  return { value: UNKNOWN, reason: UNKNOWN };
}

export async function safeSection(fn) {
  try {
    return await fn();
  } catch (_error) {
    // Сбой одного источника не должен искажать другие секции.
    return UNKNOWN;
  }
}

export function enforceLimit(md) {
  if (md.split('\n').length > 150 || Buffer.byteLength(md, 'utf8') > 8192) {
    throw new Error('STATUS exceeds 150 lines or 8 KiB');
  }
  return md;
}

function read(path) {
  try { return fs.readFileSync(path, 'utf8'); } catch (_error) { return null; }
}

function json(path) {
  const value = read(path);
  if (value === null) return null;
  try { return JSON.parse(value); } catch (_error) { return null; }
}

async function request(path, mode = 'json') {
  const response = await fetch(ROOT + path, {
    headers: {
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(TOKEN ? { authorization: 'Bearer ' + TOKEN } : {})
    },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('GitHub ' + response.status + ' ' + path);
  return mode === 'text' ? response.text() : response.json();
}

async function pages(path, limit = 10) {
  const data = [];
  for (let page = 1; page <= limit; page++) {
    const separator = path.includes('?') ? '&' : '?';
    const batch = await request(path + separator + 'per_page=100&page=' + page);
    if (!Array.isArray(batch)) throw new Error('Expected array: ' + path);
    data.push(...batch);
    if (batch.length < 100) return data;
  }
  throw new Error('Pagination limit: ' + path);
}

async function branchSha(repo) {
  const branch = await request('/repos/' + repo + '/branches/main');
  return branch.commit.sha;
}

async function commitDate(repo, sha) {
  const data = await request('/repos/' + repo + '/commits/' + sha);
  return data.commit?.committer?.date || data.commit?.author?.date;
}

function checkedSha() {
  const line = (read('automation/CLAUDE_CHECKED.txt') || '').trim().split(/\s+/);
  if (line.length !== 2 || line.some(v => !/^[a-f0-9]{40}$/.test(v))) return [null, null];
  return line;
}

function filesGroup(file) {
  const parts = file.split('/');
  return parts[0] === 'games' && parts.length > 2 ? 'games/' + parts[1] : parts[0];
}

async function changed(repo, before) {
  if (!before) return { count: UNKNOWN, folders: UNKNOWN };
  const compare = await request('/repos/' + repo + '/compare/' + before + '...main?per_page=100');
  const count = compare.total_commits;
  const files = compare.files || [];
  if (!Number.isInteger(count)) return { count: UNKNOWN, folders: UNKNOWN };
  if (files.length >= 300) return { count, folders: UNKNOWN };
  const counts = new Map();
  for (const file of files) {
    const group = filesGroup(file.filename);
    counts.set(group, (counts.get(group) || 0) + 1);
  }
  return {
    count,
    folders: [...counts].sort((a, b) => a[0].localeCompare(b[0], 'en'))
      .map(([name, value]) => name + ':' + value).join(', ') || 'ничего'
  };
}

async function allPRs() {
  return pages('/repos/' + LAB + '/pulls?state=all&sort=updated&direction=desc');
}

async function prFiles(number) {
  const data = await pages('/repos/' + LAB + '/pulls/' + number + '/files', 5);
  return data.map(row => row.filename);
}

async function graphqlConflictCount() {
  let after = null;
  let conflicts = 0;
  for (let page = 0; page < 10; page++) {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + TOKEN,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        query: 'query($after:String){repository(owner:"mpaykin1",name:"meta6-lab"){' +
          'pullRequests(first:100,states:OPEN,after:$after){nodes{mergeable}' +
          'pageInfo{hasNextPage,endCursor}}}}',
        variables: { after }
      }),
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error('GraphQL ' + response.status);
    const result = await response.json();
    const prs = result.data?.repository?.pullRequests;
    if (!prs || result.errors?.length) throw new Error('GraphQL pull requests unavailable');
    if (prs.nodes.some(pr => pr.mergeable === 'UNKNOWN')) throw new Error('Mergeability unknown');
    conflicts += prs.nodes.filter(pr => pr.mergeable === 'CONFLICTING').length;
    if (!prs.pageInfo.hasNextPage) return conflicts;
    after = prs.pageInfo.endCursor;
  }
  throw new Error('Too many pull request pages');
}

async function prSummary(all, since) {
  if (!Array.isArray(all)) return { open: UNKNOWN, conflicts: UNKNOWN, merged: UNKNOWN,
    closed: UNKNOWN, mergedItems: [], protectedItems: [] };
  const open = all.filter(pr => prState(pr) === 'open');
  const newer = since ? all.filter(pr => pr.closed_at && Date.parse(pr.closed_at) > Date.parse(since)) : [];
  const merged = newer.filter(pr => prState(pr) === 'merged');
  const closed = newer.filter(pr => prState(pr) === 'closed');
  const conflicts = await safeSection(graphqlConflictCount);
  const protectedItems = [];
  for (const pr of merged) {
    const paths = await safeSection(() => prFiles(pr.number));
    if (paths === UNKNOWN) {
      protectedItems.push({ number: pr.number, sha: pr.merge_commit_sha, paths: UNKNOWN });
    } else {
      const critical = paths.filter(isProtectedFile);
      if (critical.length) protectedItems.push({
        number: pr.number, sha: pr.merge_commit_sha, paths: critical
      });
    }
  }
  return {
    open: open.length,
    conflicts,
    merged: since ? merged.length : UNKNOWN,
    closed: since ? closed.length : UNKNOWN,
    mergedItems: merged.map(pr => ({
      number: pr.number, title: (pr.title || '').slice(0, 60),
      sha: pr.merge_commit_sha || UNKNOWN
    })),
    protectedItems
  };
}

async function lastRedRuns(repo) {
  const data = await request('/repos/' + repo +
    '/actions/runs?branch=main&status=completed&per_page=100');
  if (!Array.isArray(data.workflow_runs)) throw new Error('Missing workflow_runs');
  const seen = new Set();
  const failed = [];
  for (const run of data.workflow_runs) {
    if (run.head_branch !== 'main' || seen.has(run.workflow_id)) continue;
    seen.add(run.workflow_id);
    if (runVerdict(run) !== 'красный') continue;
    const details = await safeSection(() =>
      request('/repos/' + repo + '/actions/runs/' + run.id + '/jobs?per_page=100'));
    const steps = details === UNKNOWN ? UNKNOWN :
      (details.jobs || []).flatMap(job => (job.steps || [])
        .filter(step => step.conclusion === 'failure').map(step => step.name)).join(', ') || UNKNOWN;
    failed.push({ workflow: run.name, url: run.html_url, step: steps });
  }
  return failed;
}

function linesContaining(content, token) {
  if (content === null) return UNKNOWN;
  return content.split('\n').filter(line => line.startsWith('|') && line.includes(token));
}

function stalled(content) {
  if (content === null) return UNKNOWN;
  return content.split('\n').filter(line => line.startsWith('|') &&
    (/зависло|ЗАВИС|⚠/.test(line)) && !/^\|[- ]+\|/.test(line));
}

function finishIds(content) {
  if (content === null) return null;
  return [...content.matchAll(/^\|\s*([MBLPЛСЭ]\d+)\s*\|/gm)].map(match => match[1]);
}

function finishSummary(progress) {
  const files = ['rules/09-platforma/FINISH.md', 'rules/09-platforma/FINISH_2.md'];
  const ids = files.map(finishFile => finishIds(read(finishFile)));
  if (ids.some(list => list === null)) return UNKNOWN;
  const ready = [];
  const pending = [];
  for (const id of ids.flat()) {
    const mark = progressMark(progress, id);
    if (mark.value === 'готов') ready.push(id);
    else pending.push({ id, value: mark.value, reason: mark.reason });
  }
  return { ready, pending };
}

async function lastBotGameStates() {
  const answer = await request('/repos/' + LAB +
    '/actions/workflows/meta-bot.yml/runs?branch=main&status=completed&per_page=1');
  const run = answer.workflow_runs?.[0];
  if (!run) return {};
  const jobs = await request('/repos/' + LAB + '/actions/runs/' + run.id + '/jobs?per_page=50');
  const gameResults = {};
  let readable = false;
  for (const job of jobs.jobs || []) {
    const log = await safeSection(() =>
      request('/repos/' + LAB + '/actions/jobs/' + job.id + '/logs', 'text'));
    if (log === UNKNOWN) continue;
    readable = true;
    let current = null;
    for (const line of log.split('\n')) {
      const name = line.match(/▶\s+(games\/[a-z0-9-]+)/i);
      if (name) { current = name[1].slice(6); gameResults[current] ||= []; }
      const result = line.match(/(✅|❌)\s+(mobile|desktop)(?:\s+\(2-й запуск\))?:/);
      if (current && result) gameResults[current].push(result[1] === '✅');
    }
  }
  if (!readable) throw new Error('META BOT logs unavailable');
  return gameResults;
}

async function gameSummary() {
  const entries = await request('/repos/' + LAB + '/contents/games?ref=main');
  if (!Array.isArray(entries)) throw new Error('Missing game folders');
  const games = entries.filter(item => item.type === 'dir').map(item => item.name).sort();
  const html = read('meta-games/index.html');
  const bot = await safeSection(lastBotGameStates);
  return games.map(name => {
    const entries = bot === UNKNOWN ? null : bot[name];
    const verdict = bot === UNKNOWN ? UNKNOWN : !entries ? 'не запускалась' :
      entries.length >= 3 && entries.every(Boolean) ? 'прошла' : 'не прошла';
    return { name, bot: verdict, storefront: html === null ? UNKNOWN :
      html.includes('../games/' + name + '/') ? 'да' : 'нет' };
  });
}

async function newErrors(baseline) {
  const current = read('OSHIBKI.md');
  if (!baseline || current === null) return UNKNOWN;
  const oldFile = await request('/repos/' + LAB + '/contents/OSHIBKI.md?ref=' + baseline);
  const oldText = Buffer.from(oldFile.content || '', 'base64').toString('utf8');
  const oldIds = new Set([...oldText.matchAll(/^\|\s*#?(\d+)\s*\|/gm)].map(m => m[1]));
  return current.split('\n').filter(line => {
    const match = line.match(/^\|\s*#?(\d+)\s*\|/);
    return match && !oldIds.has(match[1]);
  });
}

function shortLine(line, max = 280) {
  return line.length <= max ? line : line.slice(0, max - 20) + '… (сокращено)';
}

function bounded(list, max, link) {
  if (list === UNKNOWN) return [UNKNOWN];
  const a = list.slice(0, max);
  if (list.length > max) a.push('ещё ' + (list.length - max) + ': ' + link);
  return a;
}

function render(data) {
  const md = [
    '# СВОДКА ДЛЯ CLAUDE',
    'UTC: ' + data.generated_at + ' | МГЛ: ' + data.sha.lab +
      ' | МГ: ' + data.sha.mg + ' | ' + data.run,
    '## ПРОВЕРИТЬ CLAUDE'
  ];
  const review = data.review;
  const tasks = [
    ...bounded(review.protected, 12, LINK + LAB + '/pulls').map(x =>
      typeof x === 'string' ? x : 'PR #' + x.number + ' ' + x.sha + ': ' +
        (Array.isArray(x.paths) ? x.paths.join(', ') : UNKNOWN)),
    ...['МГЛ', 'МГ'].flatMap((label, i) =>
      bounded(i === 0 ? review.redLab : review.redMg, 10,
        LINK + (i === 0 ? LAB : MG) + '/actions').map(x =>
        typeof x === 'string' ? label + ': ' + x :
          label + ': ' + x.workflow + ' | ' + x.url + ' | ' + x.step)),
    ...bounded(review.sliyanie, 8, LINK + LAB + '/blob/main/automation/SLIYANIE.md'),
    ...bounded(review.stalled, 8, LINK + LAB + '/blob/main/rules/09-platforma/ZANYATO.md')
  ];
  md.push(...(tasks.length ? tasks.map(x => '- ' + shortLine(x)) : ['ничего']));
  md.push('## ФИНИШ');
  if (data.finish === UNKNOWN) md.push(UNKNOWN);
  else {
    md.push('готовы: ' + (data.finish.ready.join(', ') || 'ничего'));
    md.push(...data.finish.pending.map(x =>
      x.id + ' — ' + x.value + (x.reason ? ': ' + shortLine(x.reason, 130) : '')));
  }
  md.push('## PR МГЛ');
  const pr = data.pr;
  md.push('открыто: ' + pr.open + ' | конфликт: ' + pr.conflicts +
    ' | слито: ' + pr.merged + ' | закрыто: ' + pr.closed);
  md.push(...bounded(pr.mergedItems || [], 16, LINK + LAB + '/pulls?q=is%3Apr+is%3Amerged')
    .map(x => typeof x === 'string' ? x :
      '#' + x.number + ' ' + x.title + ' | ' + x.sha));
  md.push('## ИЗМЕНИЛОСЬ ПОСЛЕ ПРОВЕРКИ CLAUDE');
  md.push('МГЛ: ' + data.changes.lab.count + ' коммитов | ' + data.changes.lab.folders);
  md.push('МГ: ' + data.changes.mg.count + ' коммитов | ' + data.changes.mg.folders);
  md.push('## ИГРЫ');
  if (data.games === UNKNOWN) md.push(UNKNOWN);
  else md.push(...data.games.map(x => x.name + ' — ' + x.bot + ' | витрина: ' + x.storefront));
  md.push('## НОВЫЕ ОШИБКИ');
  if (data.errors === UNKNOWN) md.push(UNKNOWN);
  else md.push(...(data.errors.length ? bounded(data.errors, 12,
    LINK + LAB + '/blob/main/OSHIBKI.md').map(x => shortLine(x)) : ['ничего']));
  return enforceLimit(md.join('\n') + '\n');
}

export async function build() {
  const [labChecked, mgChecked] = checkedSha();
  const [labSha, mgSha] = await Promise.all([
    safeSection(() => branchSha(LAB)), safeSection(() => branchSha(MG))
  ]);
  const [labDate, mgDate] = await Promise.all([
    labChecked ? safeSection(() => commitDate(LAB, labChecked)) : UNKNOWN,
    mgChecked ? safeSection(() => commitDate(MG, mgChecked)) : UNKNOWN
  ]);
  const [prs, redLab, redMg, changeLab, changeMg, games, errors] = await Promise.all([
    safeSection(allPRs), safeSection(() => lastRedRuns(LAB)),
    safeSection(() => lastRedRuns(MG)),
    safeSection(() => changed(LAB, labChecked)),
    safeSection(() => changed(MG, mgChecked)),
    safeSection(gameSummary), safeSection(() => newErrors(labChecked))
  ]);
  const pr = await safeSection(() => prSummary(prs, labDate === UNKNOWN ? null : labDate));
  const prData = pr === UNKNOWN ? { open: UNKNOWN, conflicts: UNKNOWN, merged: UNKNOWN,
    closed: UNKNOWN, mergedItems: [], protectedItems: [] } : pr;
  const sl = linesContaining(read('automation/SLIYANIE.md'), 'НУЖЕН CLAUDE');
  const st = stalled(read('rules/09-platforma/ZANYATO.md'));
  const data = {
    generated_at: new Date().toISOString(),
    sha: { lab: labSha, mg: mgSha },
    checked: { lab: labChecked || UNKNOWN, mg: mgChecked || UNKNOWN },
    run: process.env.GITHUB_RUN_ID ?
      LINK + LAB + '/actions/runs/' + process.env.GITHUB_RUN_ID : UNKNOWN,
    review: { protected: prData.protectedItems, redLab, redMg, sliyanie: sl, stalled: st },
    finish: finishSummary(json('progress.json')),
    pr: prData,
    changes: { lab: changeLab, mg: changeMg },
    games,
    errors
  };
  const markdown = render(data);
  fs.mkdirSync('automation', { recursive: true });
  fs.writeFileSync('automation/STATUS.md', markdown);
  fs.writeFileSync('automation/status.json', JSON.stringify(data, null, 2) + '\n');
  console.log('STATUS: ' + markdown.trimEnd().split('\n').length + ' lines, ' +
    Buffer.byteLength(markdown) + ' bytes');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch(error => { console.error(error); process.exitCode = 1; });
}
