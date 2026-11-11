// Trusted-main only. Periodic stale cleanup + daily short summary, and PR quota status.
import {alive, quota, reconcileSection, THREE_DAYS, staleDecision} from './core.mjs';

const repo = process.env.STOROZHA_REPO;
const token = process.env.STOROZHA_TOKEN;
const mode = process.env.STOROZHA_MODE;
if (!repo || !token || !/^[\w.-]+\/[\w.-]+$/.test(repo)) throw Error('Missing trusted repo/token');
if (!['quota', 'maintenance'].includes(mode)) throw Error('Expected quota or maintenance');
const base = 'https://api.github.com/repos/' + repo;
const headers = {Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'};
async function api(path, method = 'GET', body) {
  const r = await fetch(base + path, {method, headers,
    ...(body === undefined ? {} : {body: JSON.stringify(body)})});
  const raw = await r.text();
  let json;
  try { json = raw ? JSON.parse(raw) : {}; } catch (e) { throw Error('Invalid JSON at ' + path); }
  if (!r.ok) throw Error(method + ' ' + path + ' HTTP ' + r.status + ': ' + json.message);
  return json;
}
async function all(path, maximum = 15) {
  const records = [];
  for (let page = 1; page <= maximum; page++) {
    const pageData = await api(path + (path.includes('?') ? '&' : '?') +
      'per_page=100&page=' + page);
    records.push(...pageData);
    if (pageData.length < 100) return records;
  }
  throw Error('Refusing truncated GitHub pagination: ' + path);
}
async function enriched() {
  const prs = await all('/pulls?state=open&base=main');
  // GET /commits/sha, not PR.updated_at (comments can change it without commits).
  for (const pr of prs) {
    const commit = await api('/commits/' + pr.head.sha);
    pr.lastCommitAt = commit.commit?.committer?.date || commit.commit?.author?.date || '';
    if (!pr.lastCommitAt) throw Error('Unknown last commit date for PR #' + pr.number);
  }
  return prs;
}
async function updateMain(path, build, message) {
  for (let attempt = 0; attempt < 7; attempt++) {
    let current;
    try { current = await api('/contents/' + path); }
    catch (error) {
      if (!/HTTP 404/.test(String(error))) throw error;
      current = null;
    }
    const before = current ? Buffer.from(current.content, 'base64').toString('utf8') : '';
    const after = build(before);
    if (before === after) return;
    const payload = {message,branch: 'main',content: Buffer.from(after).toString('base64'),
      ...(current ? {sha: current.sha} : {})};
    try { await api('/contents/' + path, 'PUT', payload); return; }
    catch (error) {
      if (attempt === 6 || !/HTTP (409|422)/.test(String(error))) throw error;
      console.log('REBASE RETRY ' + path + ' #' + attempt);
    }
  }
}
function currentRows(document, key) {
  const begin = '<!-- STOROZHA:' + key + ':BEGIN -->';
  const end = '<!-- STOROZHA:' + key + ':END -->';
  const first = document.indexOf(begin), last = document.indexOf(end);
  if (first < 0 && last < 0) return [];
  if (first < 0 || last < first) throw Error('Malformed ' + key + ' section');
  return document.slice(first + begin.length, last).split('\n').filter(x => x.trim())
    .map(text => ({id: Number((text.match(/#(\d+)/) || [])[1]), text}))
    .filter(x => Number.isInteger(x.id));
}
const now = Date.now();
const prs = await enriched();
if (mode === 'quota') {
  const number = Number(process.env.STOROZHA_PR_NUMBER);
  if (!Number.isInteger(number) || number < 1) throw Error('Quota requires a PR number');
  const verdict = quota(prs, number, now);
  console.log('LIVE=' + verdict.living + ', earliest=' + verdict.oldest.join(','));
  if (verdict.reject) {
    console.error('::error title=Неделя без Claude::' + verdict.message);
    process.exitCode = 1;
  } else {
    console.log('STOROZHA_QUOTA_PASS PR #' + number);
  }
} else {
  const expired = prs.filter(pr => staleDecision(pr, now).close);
  for (const pr of expired) {
    const age = now - Date.parse(pr.lastCommitAt);
    if (age < THREE_DAYS || !Number.isFinite(age)) continue;
    const row = '| #' + pr.number + ' | ' + pr.head.ref +
      ' | закрыт сторожем как заброшенный; ветка сохранена | ' +
      new Date(now).toISOString().slice(0, 10) + ' |';
    // Queue record MUST be persisted before the close API call.
    await updateMain('DLYA_CLAUDE.md', before => {
      const initial = before || '# Для Claude — только подтверждённые блокировки\n';
      const entries = currentRows(initial, 'STALE');
      if (!entries.some(x => x.id === pr.number)) entries.push({id: pr.number, text: row});
      return reconcileSection(initial, 'STALE', entries);
    }, 'chore(storozha): record abandoned PR #' + pr.number);
    const fresh = await api('/pulls/' + pr.number);
    if (fresh.state !== 'open' || fresh.head.sha !== pr.head.sha) continue;
    const commit = await api('/commits/' + fresh.head.sha);
    const date = Date.parse(commit.commit?.committer?.date || commit.commit?.author?.date || '');
    if (now - date < THREE_DAYS) continue;
    await api('/issues/' + pr.number + '/comments', 'POST',
      {body: 'закрыт сторожем как заброшенный, ветка сохранена'});
    await api('/pulls/' + pr.number, 'PATCH', {state: 'closed'});
    console.log('CLOSED_STALE #' + pr.number + ' (branch preserved)');
  }
  const day = new Date(now).toISOString().slice(0, 10);
  // Run after 03:00 UTC; delayed schedule invocations still produce exactly one dated section.
  if (new Date(now).getUTCHours() >= 3) {
    const since = new Date(now - 24 * 3600 * 1000).toISOString();
    const closed = await all('/pulls?state=closed&sort=updated&direction=desc');
    const merged = closed.filter(pr => pr.merged_at && pr.merged_at >= since);
    const pending = (await enriched());
    const aliveCount = pending.filter(pr => alive(pr, now)).length;
    const staleCount = pending.length - aliveCount;
    const queue = await api('/contents/DLYA_CLAUDE.md').catch(error => {
      if (/HTTP 404/.test(String(error))) return null;
      throw error;
    });
    const queueText = queue ? Buffer.from(queue.content, 'base64').toString('utf8') : '';
    const lines = queueText.split('\n').filter(line => /^\|\s*#\d+\s*\|/.test(line));
    const body = '## ' + day + '\n' +
      '- Слито за последние 24 часа: ' + merged.length +
      (merged.length ? ' (' + merged.map(pr => '[#' + pr.number + '](' + pr.html_url + ')').join(', ') + ')' : '') + '\n' +
      '- Бот: данные о названиях пройденных игр не подтверждены отдельными протоколами.\n' +
      '- В DLYA_CLAUDE.md: ' + lines.length + ' записей' +
      (lines.length ? ', PR ' + lines.slice(0, 15).map(line => (line.match(/#\d+/) || ['?'])[0]).join(', ') : '') + '\n' +
      '- Открытых живых PR: ' + aliveCount + '; зависших: ' + staleCount + '.\n';
    await updateMain('reports/ITOG_NEDELI.md', before => {
      const heading = '# Итоги недели без Claude\n\n';
      const rest = (before || '').replace(/^# Итоги недели без Claude\s*/, '');
      if (rest.includes('## ' + day + '\n')) return before;
      return heading + body + '\n' + rest;
    }, 'chore(storozha): daily summary ' + day);
  }
}
