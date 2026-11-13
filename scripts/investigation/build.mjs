// Hourly public snapshot. Reuses the existing ZADACHI parser; no database or external service.
import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseRows} from '../zadachi/watch.mjs';
import {publicationDecision} from './publish.mjs';

const LAB = 'mpaykin1/meta6-lab';
const MG = 'mpaykin1/meta6';
const now = new Date();
const notes = [];
const cache = new Map();

function api(route) {
  if (cache.has(route)) return cache.get(route);
  let value = null;
  try {
    value = JSON.parse(execFileSync('gh', ['api', route], {
      encoding: 'utf8', maxBuffer: 20000000, timeout: 25000, stdio: ['ignore', 'pipe', 'pipe']
    }));
  } catch (err) {
    notes.push('API недоступен: ' + route + ' (' + (err.status ?? 'error') + ')');
  }
  cache.set(route, value);
  return value;
}
function pullList(repo) {
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const batch = api('repos/' + repo + '/pulls?state=all&per_page=100&page=' + page);
    if (!Array.isArray(batch)) break;
    out.push(...batch);
    if (batch.length !== 100) break;
  }
  return out;
}
function age(date) {
  const s = String(date ?? '');
  const m = s.match(/\d{4}-\d\d-\d\d[ T]\d\d:\d\d/);
  const dateString = m && !s.includes('T') ? m[0].replace(' ', 'T') + ':00Z' : s;
  return (now.getTime() - Date.parse(dateString)) / 3600000;
}
function githubPr(markdown) {
  const m = String(markdown).match(/https:\/\/github\.com\/(mpaykin1\/(?:meta6-lab|meta6))\/pull\/(\d+)/);
  return m ? {repo: m[1], num: Number(m[2])} : null;
}
function checkState(repo, sha) {
  if (!sha) return {state: 'unknown', url: null, failed: []};
  const r = api('repos/' + repo + '/commits/' + sha + '/check-runs?per_page=100');
  const runs = Array.isArray(r?.check_runs) ? r.check_runs : [];
  const failed = runs.filter(x => ['failure', 'timed_out', 'action_required'].includes(x.conclusion));
  const pending = runs.some(x => x.status !== 'completed');
  const state = failed.length ? 'failure' : pending ? 'pending' :
    runs.length && runs.every(x => ['success', 'neutral', 'skipped'].includes(x.conclusion))
      ? 'success' : 'unknown';
  return {
    state, url: (failed[0] || runs[0])?.html_url || null,
    failed: failed.map(x => x.name).slice(0, 5)
  };
}
const taskMarkdown = readFileSync('ZADACHI.md', 'utf8');
const rows = parseRows(taskMarkdown);
const labPulls = pullList(LAB);
const mgPulls = pullList(MG);
const labNotes = readFileSync('automation/SLIYANIE.md', 'utf8');
const remaining = new Map();
for (const line of labNotes.split('\n')) {
  const m = line.match(/^\|\s*#(\d+)\s*\|/);
  if (!m) continue;
  const cols = line.split('|').map(x => x.trim());
  const note = cols[cols.length - 2];
  if (note && note !== '—') remaining.set(Number(m[1]), note);
}

const tasks = rows.map((row, index) => {
  const parsed = githubPr(row.pr);
  const repo = parsed?.repo || (row.project === 'МГ' ? MG : LAB);
  const list = repo === LAB ? labPulls : mgPulls;
  const listed = parsed ? list.find(x => x.number === parsed.num) :
    list.find(x => x.head?.ref === row.branch);
  const pr = listed ? (api('repos/' + repo + '/pulls/' + listed.number) || listed) :
    parsed ? api('repos/' + repo + '/pulls/' + parsed.num) : null;
  const checks = pr?.state === 'open' ? checkState(repo, pr.head?.sha) :
    {state: 'unknown', url: null, failed: []};
  const hours = age(row.last !== '—' ? row.last : row.taken);
  let status = 'в работе';
  if (pr?.merged_at || (!pr && /ГОТОВО:.*https:\/\//.test(row.status))) status = 'успех';
  else if (pr?.state === 'closed') status = 'ошибка';
  else if (pr?.mergeable_state === 'dirty') status = 'конфликт';
  else if (checks.state === 'failure') status = 'ошибка';
  else if (hours >= 3 || (!pr && /ЗАВИС|ЗАБРОШЕНО|НУЖЕН CLAUDE/i.test(row.status))) status = 'зависла';

  const next = status === 'успех' ? 'Ничего, задача закрыта' :
    status === 'конфликт' ? 'Разрешить конфликты с main и повторить проверки' :
    status === 'ошибка' ? pr?.state === 'closed' ?
      'PR закрыт без слияния: согласовать решение' :
      'Исправить красные проверки' + (checks.failed.length ? ': ' + checks.failed.join(', ') : '') :
    status === 'зависла' ? 'Возобновить работу с последнего коммита и проверить PR' :
    'Довести PR до зелёных проверок и слияния';
  return {
    id: index + 1, task: row.task, project: row.project, owner: row.who,
    branch: row.branch, status, original_status: row.status,
    pr: pr?.number || null, pr_state: pr?.state || null,
    check: checks.state, check_url: checks.url,
    url: pr?.html_url || parsed && 'https://github.com/' + parsed.repo + '/pull/' + parsed.num ||
      'https://github.com/' + LAB + '/blob/main/ZADACHI.md',
    taken_at: row.taken, last_commit_at: row.last, remaining:
      (pr && repo === LAB && remaining.get(pr.number)) || next
  };
});

function incident(repo, kind, number, label) {
  const route = kind === 'run' ? 'repos/' + repo + '/actions/runs/' + number :
    'repos/' + repo + '/' + (kind === 'pr' ? 'pulls/' : 'issues/') + number;
  const item = api(route);
  const base = 'https://github.com/' + repo;
  const url = kind === 'run' ? base + '/actions/runs/' + number :
    base + '/' + (kind === 'pr' ? 'pull/' : 'issues/') + number;
  return {
    label, repo, kind, number, url, title: item?.title || item?.name || label,
    state: item?.conclusion || item?.status || item?.state || 'нет данных',
    sha: item?.head_sha || item?.head?.sha || null,
    updated_at: item?.updated_at || item?.run_started_at || null
  };
}
const investigations = [
  incident('mpaykin1/World_server', 'pr', 594, 'PR #594'),
  incident(LAB, 'issue', 18, 'Измерение готовности'),
  incident('mpaykin1/World_server', 'run', 42344683879, 'automation-watchdog'),
  incident('mpaykin1/World_server', 'run', 42332797570, 'META BOT'),
  incident('mpaykin1/World_server', 'run', 42332660006, 'Quality Canary Deploy')
];
const errors = readFileSync('OSHIBKI.md', 'utf8').split('\n')
  .filter(x => /^\|\s*\d+\s*\|/.test(x))
  .map(x => {
    const c = x.split('|').map(v => v.trim());
    return {id: Number(c[1]), date: c[2], problem: c[3], detection: c[4], trap: c[5]};
  });
const finish = readFileSync('rules/09-platforma/FINISH.md', 'utf8');
const match = finish.match(/\*\*Готово:\s*(\d+)\s+из\s+(\d+)\./);
const snapshot = {
  schema_version: 1,
  generated_at: now.toISOString(),
  sources: ['ZADACHI.md', 'automation/SLIYANIE.md', 'OSHIBKI.md',
    'rules/09-platforma/FINISH.md'].map(x => ({
    path: x, url: 'https://github.com/' + LAB + '/blob/main/' + x
  })),
  readiness: match ? {done: Number(match[1]), total: Number(match[2])} : null,
  tasks, investigations, errors,
  warnings: notes.slice(0, 15)
};
if (!tasks.length) throw Error('ZADACHI.md is empty; refusing to replace valid snapshot');
let previous = null;
try { previous = JSON.parse(readFileSync('reports/investigation/data.json', 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const decision = publicationDecision(previous, snapshot, now.getTime());
if (decision !== 'publish') {
  console.log('Investigation snapshot preserved: ' + decision);
} else {
  writeFileSync('reports/investigation/data.json', JSON.stringify(snapshot, null, 2) + '\\n');
}
console.log('Investigation snapshot: ' + tasks.length + ' tasks, ' + errors.length + ' error entries');
