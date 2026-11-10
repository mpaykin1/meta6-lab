// Каркас Claude. Проверка честности отчёта ChatGPT. ChatGPT этот файл НЕ меняет (сторож meta-games-guard).
// Запуск: node scripts/meta-progress/verify-report.mjs report.md progress.json   (env: GH_TOKEN)
// Каждая строка отчёта с утверждением проверяется по GitHub: PR, коммит, прогон. Проценты сверяются с измеренными.
import fs from 'node:fs';

const [reportFile, progressFile] = process.argv.slice(2);
const text = fs.readFileSync(reportFile, 'utf8');
const measured = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const api = async p => { const r = await fetch('https://api.github.com/' + p, { headers: { accept: 'application/vnd.github+json', ...(TOKEN ? { authorization: 'Bearer ' + TOKEN } : {}) } }); return r.ok ? r.json() : null; };
const errors = [], checked = [];
const bad = (line, why) => errors.push(`${why} — «${line.trim().slice(0, 140)}»`);

const CLAIM = /(слит|merged|исправлен|fixed|прош[её]л|pass|✅|готово|done|задеплоен|deployed|опубликован|published|удал[её]н)/i;
const FAILWORD = /(fail|❌|не прош|не слит|открыт|в работе|blocked)/i;
for (const line of text.split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  const prs = [...line.matchAll(/github\.com\/([\w.-]+\/[\w.-]+)\/pull\/(\d+)/g)];
  const runs = [...line.matchAll(/github\.com\/([\w.-]+\/[\w.-]+)\/actions\/runs\/(\d+)/g)];
  const shas = [...line.matchAll(/github\.com\/([\w.-]+\/[\w.-]+)\/commit\/([0-9a-f]{7,40})/g)];
  const claims = CLAIM.test(line) && !FAILWORD.test(line);
  if (claims && !prs.length && !runs.length && !shas.length) { bad(line, 'утверждение без PR, SHA или прогона'); continue; }
  for (const [, repo, n] of prs) { const pr = await api(`repos/${repo}/pulls/${n}`); checked.push('PR ' + repo + '#' + n);
    if (!pr) bad(line, `PR ${repo}#${n} не существует`);
    else if (/(слит|merged)/i.test(line) && !pr.merged_at) bad(line, `PR ${repo}#${n} назван слитым, но не слит`); }
  for (const [, repo, id] of runs) { const run = await api(`repos/${repo}/actions/runs/${id}`); checked.push('run ' + id);
    if (!run) bad(line, `прогон ${id} не существует`);
    else if (claims && run.conclusion !== 'success') bad(line, `прогон ${id} назван успешным, а его итог: ${run.conclusion ?? run.status}`); }
  for (const [, repo, sha] of shas) { const c = await api(`repos/${repo}/commits/${sha}`); checked.push('commit ' + sha.slice(0, 7));
    if (!c) bad(line, `коммит ${sha} не найден в ${repo}`); }
}
// Проценты в отчёте обязаны совпадать с измеренными (progress.json) — никаких оценок на глаз.
for (const [name, p] of Object.entries({ ...measured.parts, 'Общая': { percent: measured.total } })) {
  const m = text.match(new RegExp(name + '[^\\n\\d]{0,20}(\\d{1,3})\\s*%', 'i'));
  if (!m) errors.push(`в отчёте нет процента «${name}» (измерено ${p.percent}%)`);
  else if (Number(m[1]) !== p.percent) errors.push(`«${name}»: в отчёте ${m[1]}%, измерено ${p.percent}%`);
}
const lines = ['## Проверка честности отчёта', '', `Проверено ссылок: ${checked.length}. Ошибок: ${errors.length}.`, '', ...errors.map(e => '- ❌ ' + e)];
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
fs.writeFileSync('honesty.md', lines.join('\n') + '\n');
if (process.env.GITHUB_ACTIONS) for (const e of errors) console.log(`::error title=Отчёт нечестен::${e.replace(/\r?\n/g, ' ')}`);
console.log(lines.join('\n'));
process.exit(errors.length ? 1 : 0);
