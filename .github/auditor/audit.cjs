'use strict';
// META GAMES auditor. Read-only source analysis; writes only to ONE issue on main.
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('.github/auditor/config.yml', 'utf8'));
const BASE = 'https://github.com/mpaykin1/meta6-lab';
function matchProtected(path, patterns = config.protected_paths) {
  return patterns.some((p) => p.endsWith('/**') ? path.startsWith(p.slice(0, -3)) : path === p);
}
function parseTable(content) {
  return content.split('\n').flatMap((line, ix) => {
    if (!line.startsWith('|') || line.includes('|---')) return [];
    const cells = line.split('|').slice(1, -1).map((s) => s.trim());
    if (cells.length < 8 || !/^MG-(строитель-[1-4]|ремонтник)$/.test(cells[3])) return [];
    const pr = (cells[5].match(/\/pull\/(\d+)/) || [])[1];
    const branch = (cells[4].match(/`([^`]+)`/) || [])[1] || '';
    const taken = cells[6].match(/20\d\d-\d\d-\d\d \d\d:\d\d/);
    return [{
      role: cells[3], task: cells[1], branch, pr: pr ? Number(pr) : null,
      takenAt: taken ? Date.parse(taken[0].replace(' ', 'T') + ':00Z') : 0,
      evidence: BASE + '/blob/main/ZADACHI.md#L' + (ix + 1)
    }];
  });
}
function safe(s) { return String(s || '').replace(/\|/g, ' / ').replace(/[\r\n]+/g, ' ').slice(0, 180); }
function link(label, url) { return '[' + safe(label).replace(/\]/g, '') + '](' + url + ')'; }
function timeMs(c) { return Date.parse(c.commit?.committer?.date || c.commit?.author?.date || '') || 0; }
function isPlan(body) { return /(?:план улучшения|следующее улучшение|next improvement|формулировка улучшения)\s*[:—-]/i.test(body || ''); }
function checksLabel(checks, sha) {
  const at = BASE + '/commit/' + sha + '/checks';
  if (!checks.length) return link('⚠️ нет данных CI', at);
  const failed = checks.filter((c) => ['failure', 'timed_out', 'action_required'].includes(c.conclusion));
  if (failed.length) return link('❌ ' + failed.map((c) => c.name).join(', '), failed[0].html_url || at);
  if (checks.some((c) => c.status !== 'completed' || !['success','neutral','skipped'].includes(c.conclusion))) {
    return link('⚠️ проверки не завершены', at);
  }
  if (checks.some((c) => c.conclusion === 'skipped')) return link('⚠️ есть пропущенные проверки', at);
  return link('✅ завершённые проверки', at);
}
function recentOwnWork(rows, allRows, windowStart, prInfo) {
  if (!prInfo) return false;
  const commits = prInfo.commits.filter((c) => timeMs(c) >= windowStart);
  if (!commits.length) return false;
  const roles = new Set(allRows.filter((x) => x.branch === prInfo.branch && x.takenAt >= windowStart)
    .map((x) => x.role));
  return roles.size === 1 && roles.has(rows.role) && rows.takenAt >= windowStart;
}
async function fetchPR(github, owner, repo, number) {
  const {data: pr} = await github.rest.pulls.get({owner,repo,pull_number:number});
  const [files, commits, checkResult] = await Promise.all([
    github.paginate(github.rest.pulls.listFiles, {owner,repo,pull_number:number,per_page:100}),
    github.paginate(github.rest.pulls.listCommits, {owner,repo,pull_number:number,per_page:100}),
    github.rest.checks.listForRef({owner,repo,ref:pr.head.sha,per_page:100})
  ]);
  return {
    url: pr.html_url, branch: pr.head.ref, updatedAt: Date.parse(pr.updated_at),
    state: pr.state, body: pr.body || '', sha: pr.head.sha,
    files: files.map((f) => f.filename), commits, checks: checkResult.data.check_runs || []
  };
}
async function main({github, context, core}) {
  const {owner, repo} = context.repo;
  const onMain = context.ref === 'refs/heads/main' &&
    ['schedule','workflow_dispatch'].includes(context.eventName);
  const start = Date.now() - config.window_minutes * 60 * 1000;
  const {data: raw} = await github.rest.repos.getContent({owner,repo,path:config.sources.task_table,ref:'main'});
  if (Array.isArray(raw) || !raw.content) throw new Error('Cannot read ZADACHI.md');
  const table = Buffer.from(raw.content, 'base64').toString('utf8');
  const rows = parseTable(table);
  const prCache = new Map();
  const lineItems = [], alerts = [], completed = [], findings = [];
  let recognized = 0;
  for (const task of config.tasks) {
    const mine = rows.filter((x) => x.role === task.name).sort((a,b) => b.takenAt - a.takenAt);
    if (mine.length) recognized++;
    const row = mine[0];
    if (!row) {
      alerts.push('⚠️ Нет записи роли ' + task.name + ' в ' + link('таблице', BASE + '/blob/main/ZADACHI.md') +
        '; это НЕ доказательство простоя.');
      lineItems.push('| ' + task.name + ' ' + link('источник', BASE + '/blob/main/ZADACHI.md') +
        ' | ⚠️ | ⚠️ | — | — |');
      continue;
    }
    let p = null, error = null;
    if (row.pr) {
      try {
        if (!prCache.has(row.pr)) prCache.set(row.pr, await fetchPR(github,owner,repo,row.pr));
        p = prCache.get(row.pr);
      } catch(e) { error = e.message; }
    }
    const evidence = link('строка', row.evidence);
    const prLink = p ? link('PR #' + row.pr, p.url) : (row.pr ?
      link('PR #' + row.pr, BASE + '/pull/' + row.pr) : 'PR не указан ' + evidence);
    const plan = p && isPlan(p.body) && (p.updatedAt >= start || row.takenAt >= start)
      ? '✅ ' + prLink : '⚠️ ' + evidence;
    const executed = recentOwnWork(row, rows, start, p) ? '✅ ' +
      link('commit ' + p.sha.slice(0,7), BASE + '/commit/' + p.sha) : '⚠️ ' + evidence;
    const check = p ? checksLabel(p.checks, p.sha) : '⚠️ ' + evidence;
    const protectedFiles = p ? p.files.filter((f) => matchProtected(f)) : [];
    if (protectedFiles.length) {
      const msg = '❌ ' + task.name + ': ' + prLink + ' затрагивает защищённые файлы (' +
        protectedFiles.map(safe).join(', ') + ')';
      alerts.push(msg);
      findings.push(msg + '; не сливать без Claude.');
    }
    if (error) alerts.push('⚠️ ' + task.name + ': не удалось прочитать ' + prLink + ' — ' + safe(error));
    const recentPRs = [...new Set(mine.filter((x) => x.takenAt >= start && x.pr).map((x) => x.pr))];
    if (recentPRs.length > 1) {
      alerts.push('⚠️ ' + task.name + ': ' + recentPRs.length +
        ' PR в окне; проверь правило одного улучшения по ' + evidence +
        ' (одного этого факта недостаточно для ❌).');
    }
    if (!executed.startsWith('✅')) findings.push(task.name + ': выполнение не подтверждено: ' + evidence +
      '; ' + prLink);
    if (!plan.startsWith('✅')) findings.push(task.name + ': формулировка улучшения не подтверждена: ' + evidence);
    if (p && p.checks.some((c) => ['failure','timed_out','action_required'].includes(c.conclusion))) {
      findings.push(task.name + ': красная проверка: ' + check + '; ' + prLink);
    }
    const status = protectedFiles.length ? '❌ ' + prLink : (p ? prLink : evidence);
    const entry = '| ' + task.name + ' ' + evidence + ' | ' + plan + ' | ' + executed +
      ' | ' + status + ' | ' + check + ' |';
    if (plan.startsWith('✅') && executed.startsWith('✅') &&
        !protectedFiles.length && p?.checks.length &&
        p.checks.every((c) => c.status === 'completed' && c.conclusion === 'success')) {
      completed.push(entry);
    } else lineItems.push(entry);
  }
  const runUrl = BASE + '/actions/runs/' + context.runId;
  const title = '# 🤖 Ревизия META GAMES — ' + new Date().toISOString();
  const concern = alerts.length ? alerts.map((x) => '- ' + x).join('\n') :
    '- ⚠️ Нарушения не подтверждены по доступным данным: ' + link('источник', BASE + '/blob/main/ZADACHI.md');
  const todo = [...new Set(findings)].slice(0,16).map((x) => '- ' + x).join('\n') ||
    '- Проверить следующую часовую выборку: ' + link('таблица', BASE + '/blob/main/ZADACHI.md');
  const header = '| Автозадача | Цикл 1: план | Цикл 2: выполнение | PR / защищённое | CI |\n' +
    '|---|---|---|---|---|\n';
  const body = [title, '**Источник:** ' + link('run',runUrl) + ' · ' +
    link('правила', BASE + '/blob/main/automation/prompts/MG_PYAT_AVTOZADACH.md'),
    'Распознано по таблице: **' + recognized + '/5**. Окно: ' + config.window_minutes +
    ' минут. ⚠️ означает недостаток доказательств, а не доказанную ошибку.',
    '## Нарушения и риски', concern, '## Осталось сделать', todo,
    '## Активная ревизия', header + (lineItems.join('\n') || '| — | — | — | — | — |'),
    '<details><summary>Завершённое по доступным доказательствам (' +
    completed.length + ')</summary>\n\n' + header + completed.join('\n') + '\n\n</details>',
    'Сверка SHA: ' + link('текущий main',BASE + '/commits/main') +
    '. Один запуск ChatGPT не сопоставим с одним GitHub commit без явной атрибуции.'
  ].join('\n\n').slice(0,61000);
  await core.summary.addRaw(body).write();
  if (!onMain) {
    core.info('Branch check: issue left unchanged. ' + runUrl);
    return;
  }
  let issue;
  try {
    const {data} = await github.rest.issues.get({owner,repo,issue_number:config.issue_number});
    if (data.pull_request || data.title !== config.issue_title) throw new Error('Issue title mismatch');
    issue = data;
  } catch(e) {
    if (e.status !== 404) throw e;
    const {data} = await github.rest.issues.create({owner,repo,title:config.issue_title,body});
    issue = data;
  }
  await github.rest.issues.update({owner,repo,issue_number:issue.number,body});
  try {
    await github.graphql('mutation($id:ID!){pinIssue(input:{issueId:$id}){issue{id}}}', {id:issue.node_id});
  } catch(e) {
    core.warning('Issue exists but pin was not confirmed: ' + e.message);
  }
  core.info('Issue updated: ' + issue.html_url);
}
module.exports = {main, matchProtected, parseTable, isPlan, recentOwnWork};
