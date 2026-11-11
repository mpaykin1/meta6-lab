// Executed ONLY from trusted main on schedule / manual dispatch.
import {execFileSync, spawnSync} from 'node:child_process';
import {conflictFiles, reconcileSection} from './core.mjs';
import {openPulls} from './gh-list.mjs';

const repo = process.env.STOROZHA_REPO;
const token = process.env.STOROZHA_TOKEN;
if (!repo || !token || !/^[\w.-]+\/[\w.-]+$/.test(repo)) throw Error('Missing trusted repo/token');
const base = 'https://api.github.com/repos/' + repo;
const headers = {Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'};
async function api(path, method = 'GET', body) {
  const r = await fetch(base + path, {method, headers,
    ...(body === undefined ? {} : {body: JSON.stringify(body)})});
  const result = await r.text();
  let json;
  try { json = result ? JSON.parse(result) : {}; } catch (e) { throw Error('Bad JSON ' + path + ': ' + e); }
  if (!r.ok) throw Error('GitHub API ' + method + ' ' + path + ': ' + r.status + ' ' + json.message);
  return json;
}
async function all(path) {
  const records = [];
  for (let page = 1; page <= 20; page++) {
    const chunk = await api(path + (path.includes('?') ? '&' : '?') +
      'per_page=100&page=' + page);
    records.push(...chunk);
    if (chunk.length < 100) return records;
  }
  throw Error('PR pagination exceeded safe limit');
}
async function conflictPaths(pr, mainSha) {
  try {
    execFileSync('git', ['fetch', '--no-tags', 'origin', 'refs/pull/' + pr.number + '/head'],
      {stdio: 'pipe', timeout: 60000});
    const result = spawnSync('git', ['merge-tree', '--write-tree', mainSha, pr.head.sha],
      {encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024});
    if (result.error) throw result.error;
    if (result.status === 0) return [];
    const files = conflictFiles(result.stdout + '\n' + result.stderr);
    if (!files.length) throw Error('merge-tree reported conflict without filenames');
    return files;
  } catch (error) {
    throw Error('Failed to retrieve exact conflict paths for PR #' + pr.number + ': ' + error);
  }
}
async function writeQueue(rows) {
  for (let attempt = 1; attempt <= 7; attempt++) {
    const current = await api('/contents/DLYA_CLAUDE.md').catch(e => {
      if (/404/.test(String(e))) return null;
      throw e;
    });
    const before = current ? Buffer.from(current.content, 'base64').toString('utf8') :
      '# Для Claude — только подтверждённые блокировки\n';
    const after = reconcileSection(before, 'CONFLICTS', rows);
    if (before === after) return;
    const payload = {message: 'chore(storozha): reconcile PR merge conflicts',
      content: Buffer.from(after).toString('base64'), branch: 'main',
      ...(current ? {sha: current.sha} : {})};
    try { await api('/contents/DLYA_CLAUDE.md', 'PUT', payload); return; }
    catch (error) {
      if (!/409|422/.test(String(error)) || attempt === 7) throw error;
      console.log('main moved; refreshing DLYA_CLAUDE attempt ' + attempt);
    }
  }
}
const main = await api('/git/ref/heads/main');
const mainSha = main.object.sha;
const opened = await openPulls(repo, token);
const rows = [];
let unsure = false;
for (const pr of opened) {
  if (pr.head.repo?.full_name !== repo) {
    console.log('External PR not writable: #' + pr.number);
    continue;
  }
  if (pr.mergeable === 'MERGEABLE') continue;
  try {
    const fresh = await api('/pulls/' + pr.number);
    if (fresh.mergeable_state === 'dirty') {
      const paths = await conflictPaths(fresh, mainSha);
      if (paths.length) rows.push({id: pr.number, text: '| #' + pr.number + ' | ' +
        fresh.head.ref + ' | ' + paths.join(', ') + ' | ' + new Date().toISOString().slice(0, 10) + ' |'});
      continue;
    }
    if (!['clean','unstable','blocked','behind','has_hooks'].includes(fresh.mergeable_state)) {
      // GitHub ещё считает (unknown): очередь в этот раз не трогаем, чтобы строки не мигали.
      unsure = true;
    }
    // NO_HEAD_PUSH (Claude, 11.11.2026): сторож НЕ вливает main в ветки PR.
    // Пуш от GITHUB_TOKEN не запускает проверки — PR остался бы без CI,
    // а «свежий» merge-коммит мешал бы находить заброшенные PR.
    // Сторож только находит настоящие конфликты и пишет их в DLYA_CLAUDE.md.
  } catch (error) {
    // Fail closed: a malformed API response must not silently remove a conflict row.
    console.error('PR #' + pr.number + ': ' + String(error));
    process.exitCode = 1;
  }
}
if (unsure && !process.exitCode) { console.log('mergeability unknown; queue kept'); process.exit(0); }
if (!process.exitCode) await writeQueue(rows);
