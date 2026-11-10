// ZADACHI watcher (Claude, 10.11.2026). No AI. Keeps ZADACHI.md honest: every task ChatGPT took
// on МГ/МГЛ is a row; the real status comes from GitHub (PR merged / closed / last commit time),
// not from what the agent wrote. Tasks the agent forgot to write are added from open PRs and ZANYATO.md.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const START = '<!-- ZADACHI:START -->', END = '<!-- ZADACHI:END -->';
const HEAD = '| Статус | Задача | Проект | Кто | Ветка | PR | Взято (UTC) | Последний коммит (UTC) |';
const SEP = '|---|---|---|---|---|---|---|---|';
const DONE_KEEP = 60;
const clean = s => String(s ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const fmt = t => Number.isFinite(t) ? new Date(t).toISOString().slice(0, 16).replace('T', ' ') : '—';
const parseT = s => { const m = /(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/.exec(s || ''); return m ? Date.parse(`${m[1]}T${m[2]}:00Z`) : NaN; };
const noBranch = b => !b || b === '—' || b === '-';

export function ageStatus(minutes) {
  if (!Number.isFinite(minutes)) return '❓ нет данных — ТОЛКНУТЬ';
  if (minutes < 60) return '🔨 В РАБОТЕ';
  if (minutes < 180) return '⚠ молчит больше часа';
  if (minutes < 2880) { const h = minutes / 60; return `🛑 ЗАВИС ${h >= 24 ? 24 : h >= 12 ? 12 : h >= 6 ? 6 : 3}+ ч — ТОЛКНУТЬ`; }
  return `💤 ЗАБРОШЕНО ${Math.floor(minutes / 1440)} дн — продолжить или закрыть`;
}
const rank = s => /КОНФЛИКТ/.test(s) ? 0 : /КРАСНЫЕ ПРОВЕРКИ/.test(s) ? 1 :
  /ЗАВИС|нет данных/.test(s) ? 2 : /молчит/.test(s) ? 3 :
  /В РАБОТЕ/.test(s) ? 4 : /НУЖЕН CLAUDE/.test(s) ? 5 :
  /ЗАБРОШЕНО/.test(s) ? 6 : /ЗАКРЫТО/.test(s) ? 8 :
  /ГОТОВО/.test(s) ? 9 : 7;

export function parseRows(text) {
  const a = text.indexOf(START), b = text.indexOf(END);
  if (a < 0 || b < a) throw new Error('ZADACHI.md: нет меток ZADACHI:START / ZADACHI:END');
  const rows = [];
  for (const line of text.slice(a + START.length, b).split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const c = line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
    if (c.length < 8 || c[0] === 'Статус' || /^-+$/.test(c[0])) continue;
    rows.push({status: c[0], task: c[1], project: c[2], who: c[3], branch: c[4].replace(/`/g, ''), pr: c[5], taken: c[6], last: c[7]});
  }
  return rows;
}

// data: {repo, pulls: {branch: {number, title, state, merged, sha, created, lastCommit}}, branches: {branch: ms}, zanyato: [{item, branch, who, at}]}
export function apply(text, data, now) {
  const rows = parseRows(text);
  const identityKey = (project, branch) => `${project}:${branch}`;
  const seen = new Set(rows.filter(r => !noBranch(r.branch)).map(r => identityKey(r.project, r.branch)));
  for (const z of data.zanyato || []) if (!seen.has(identityKey('МГЛ', z.branch))) {
    seen.add(identityKey('МГЛ', z.branch));
    rows.push({status: '', task: clean(z.item), project: 'МГЛ', who: clean(z.who.replace(/^свободно \(зависло[^,]*, было: (.*)\)$/, '$1').replace(/\s*⚠.*$/, '')) || 'ChatGPT', branch: z.branch, pr: '—', taken: z.at, last: '—'});
  }
  for (const [project, source] of [['МГЛ', data.pulls], ['МГ', data.mgPulls]]) {
    for (const [branch, p] of Object.entries(source || {})) {
      if (p.state !== 'open' || seen.has(identityKey(project, branch))) continue;
      seen.add(identityKey(project, branch));
      rows.push({
        status: '', task: clean(p.title), project,
        who: 'ChatGPT (сам не записал — добавил сторож)', branch,
        pr: '—', taken: fmt(p.created), last: '—',
      });
    }
  }
  for (const r of rows) {
    const source = r.project === 'МГ' ? data.mgPulls : data.pulls;
    const repository = r.project === 'МГ' ? data.mgRepo : data.repo;
    const p = noBranch(r.branch) ? null : (source || {})[r.branch];
    if (p) r.pr = `[#${p.number}](https://github.com/${p.repo || repository}/pull/${p.number})`;
    const t = p?.lastCommit ??
      (data.branches || {})[`${repository}:${r.branch}`] ??
      (data.branches || {})[r.branch];
    if (Number.isFinite(t)) r.last = fmt(t);
    if (p?.merged) r.status = `✅ ГОТОВО · слито ${String(p.sha || '').slice(0, 7)}`;
    else if (p && p.state === 'closed') r.status = '✖ ЗАКРЫТО без слияния';
    else if (/НУЖЕН CLAUDE/i.test(r.status)) r.status = '🙋 ' + r.status.replace(/^🙋\s*/, '');
    else if (p?.mergeable !== null && p?.mergeable !== undefined &&
             p?.mergeable_state === 'dirty') r.status = '⚔ КОНФЛИКТ с main — нужен rebase';
    else if (p?.failedChecks?.length) {
      r.status = `❌ КРАСНЫЕ ПРОВЕРКИ: ${p.failedChecks.map(clean).join(', ')}`;
    }
    else if (noBranch(r.branch) && /ГОТОВО/.test(r.status) && /https?:\/\//.test(r.status)) { /* задача без ветки: готово только со ссылкой-доказательством */ }
    else r.status = ageStatus((now - (Number.isFinite(t) ? t : parseT(r.taken))) / 60000);
    r.task = clean(r.task); r.who = clean(r.who) || 'ChatGPT'; r.project = clean(r.project) || 'МГЛ';
  }
  const key = r => Number.isFinite(parseT(r.last)) ? parseT(r.last) : parseT(r.taken) || 0;
  rows.sort((x, y) => rank(x.status) - rank(y.status) || key(y) - key(x));
  let done = 0;
  const kept = rows.filter(r => rank(r.status) < 8 || ++done <= DONE_KEEP);
  const n = re => kept.filter(r => re.test(r.status)).length;
  const push = kept.filter(r => /ЗАВИС|нет данных/.test(r.status));
  const fix = kept.filter(r => /КОНФЛИКТ|КРАСНЫЕ ПРОВЕРКИ/.test(r.status));
  const summary = `**Итог:** ⚔ конфликт ${n(/КОНФЛИКТ/)} · ❌ красные ${n(/КРАСНЫЕ ПРОВЕРКИ/)} · 🛑 зависло ${push.length} · ⚠ молчит ${n(/молчит/)} · 🔨 в работе ${n(/В РАБОТЕ/)} · 🙋 нужен Claude ${n(/НУЖЕН CLAUDE/)} · 💤 заброшено ${n(/ЗАБРОШЕНО/)} · ✅ готово ${n(/ГОТОВО/)}`;
  const pushList = push.length ? '**Толкнуть сейчас:** ' + push.map(r => `${r.task} (${noBranch(r.branch) ? r.who : '`' + r.branch + '`'})`).join('; ') : '**Толкнуть сейчас:** никого';
  const fixList = fix.length ? '**Чинить сейчас:** ' + fix.map(r =>
    `${r.pr} (${r.project}, \`${r.branch}\`, ${/КОНФЛИКТ/.test(r.status) ? '⚔ конфликт' : '❌ красные'})`)
    .join('; ') : '**Чинить сейчас:** никого';
  const table = [HEAD, SEP, ...kept.map(r => `| ${r.status} | ${r.task} | ${r.project} | ${r.who} | ${noBranch(r.branch) ? '—' : '`' + r.branch + '`'} | ${r.pr || '—'} | ${r.taken || '—'} | ${r.last || '—'} |`)].join('\n');
  const body = `${START}\n${summary}\n\n${fixList}\n\n${pushList}\n\n${table}\n${END}`;
  const a = text.indexOf(START), b = text.indexOf(END) + END.length;
  let out = text.slice(0, a) + body + text.slice(b);
  if (out !== text) out = out.replace(/^Сторож проверил: .*$/m, `Сторож проверил: ${fmt(now)} UTC`);
  return out;
}

// Retry GitHub's asynchronous mergeability calculation exactly three times.
export function resolveMergeability(fetchOne, pause = ms => execFileSync('sleep', [String(ms / 1000)])) {
  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) pause(3000);
    result = fetchOne();
    if (result?.mergeable !== null && result?.mergeable !== undefined) return result;
  }
  // Unknown is not a conflict: fall back to last commit time.
  return {...(result || {}), mergeable: null, mergeable_state: null};
}

export function collect(rows, options = {}) {
  const repo = options.repo || process.env.GITHUB_REPOSITORY || 'mpaykin1/meta6-lab';
  const mgRepo = options.mgRepo || process.env.MG_REPOSITORY || 'mpaykin1/meta6';
  const api = options.api || (p => {
    try {
      return JSON.parse(execFileSync('gh', ['api', p], {maxBuffer: 64e6}).toString());
    } catch (error) {
      console.error('ZADACHI API unavailable:', p, error.message);
      return null;
    }
  });
  const last = (repository, ref) => {
    const c = api(`repos/${repository}/commits?sha=${encodeURIComponent(ref)}&per_page=1`);
    return c?.[0] ? Date.parse(c[0].commit.committer.date) : undefined;
  };
  const pulls = {}, mgPulls = {}, branches = {};
  const put = (repository, p, withCommit) => {
    const open = p.state === 'open';
    const detail = open ? resolveMergeability(
      () => api(`repos/${repository}/pulls/${p.number}`), options.pause) : p;
    const checkRuns = [];
    if (open) for (let page = 1; page <= 10; page++) {
      const checks = api(
        `repos/${repository}/commits/${p.head.sha}/check-runs?per_page=100&page=${page}`);
      if (!checks?.check_runs) break;
      checkRuns.push(...checks.check_runs);
      if (checks.check_runs.length < 100) break;
    }
    const failedChecks = [...new Set(checkRuns
      .filter(c => ['failure', 'timed_out', 'cancelled'].includes(c.conclusion))
      .map(c => clean(c.name)))];
    const item = {
      number: p.number, title: p.title, state: p.state, merged: !!p.merged_at,
      sha: p.merge_commit_sha, repo: repository,
      mergeable: detail?.mergeable ?? null,
      mergeable_state: detail?.mergeable_state ?? null,
      failedChecks, created: Date.parse(p.created_at),
      lastCommit: withCommit ? last(repository, p.head.sha) : undefined,
    };
    (repository === mgRepo ? mgPulls : pulls)[p.head.ref] = item;
  };
  for (const repository of [repo, mgRepo]) {
    for (let page = 1; page < 6; page++) {
      const l = api(`repos/${repository}/pulls?state=open&per_page=100&page=${page}`) || [];
      l.forEach(p => put(repository, p, true));
      if (l.length < 100) break;
    }
  }
  for (const r of rows) {
    const repository = r.project === 'МГ' ? mgRepo : repo;
    const source = r.project === 'МГ' ? mgPulls : pulls;
    if (noBranch(r.branch) || source[r.branch] ||
        /ГОТОВО · слито|ЗАКРЫТО без/.test(r.status)) continue;
    const owner = repository.split('/')[0];
    const l = api(`repos/${repository}/pulls?state=all&head=${owner}:${encodeURIComponent(r.branch)}&per_page=5`) || [];
    const p = l.find(x => x.merged_at) || l[0];
    if (p) put(repository, p, false);
    else {
      const t = last(repository, r.branch);
      if (t) branches[`${repository}:${r.branch}`] = t;
    }
  }
  const zanyato = options.zanyato ?? [], zf = 'rules/09-platforma/ZANYATO.md';
  if (options.zanyato === undefined && existsSync(zf)) for (const line of readFileSync(zf, 'utf8').split('\n')) {
    const c = line.split('|').map(s => s.trim());
    if (c.length >= 6 && /^lab\//.test(c[2])) {
      zanyato.push({item: c[1], branch: c[2], who: c[3], at: c[4].replace(' UTC', '')});
    }
  }
  for (const z of zanyato) {
    if (!pulls[z.branch] && !rows.some(r => r.branch === z.branch && r.project !== 'МГ')) {
      const t = last(repo, z.branch);
      if (t) branches[`${repo}:${z.branch}`] = t;
    }
  }
  return {repo, mgRepo, pulls, mgPulls, branches, zanyato};
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const file = 'ZADACHI.md', text = readFileSync(file, 'utf8');
  const out = apply(text, collect(parseRows(text)), Date.parse(process.env.WATCH_NOW || new Date().toISOString()));
  if (out !== text) writeFileSync(file, out);
  console.log(out !== text ? 'ZADACHI_UPDATED' : 'ZADACHI_OK');
  console.log((/^\*\*Итог:.*$/m.exec(out) || [''])[0]);
}
