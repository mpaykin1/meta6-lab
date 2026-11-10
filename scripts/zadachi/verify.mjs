// Проверка сторожа ZADACHI (К1–К10): 10 случаев. Запуск из любого каталога: node scripts/zadachi/verify.mjs [путь к watch.mjs]
import {pathToFileURL} from 'node:url';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const {apply, parseRows, START, END, resolveMergeability} = await import(pathToFileURL(resolve(process.argv[2] || resolve(here, 'watch.mjs'))).href);
const now = Date.parse('2026-11-10T12:00:00Z'), H = 3600e3;
const row = (status, task, branch, taken) => `| ${status} | ${task} | МГЛ | чат ChatGPT | ${branch} | — | ${taken} | — |`;
const doc = rows => `# t\nСторож проверил: —\n${START}\n| Статус | Задача | Проект | Кто | Ветка | PR | Взято (UTC) | Последний коммит (UTC) |\n|---|---|---|---|---|---|---|---|\n${rows.join('\n')}\n${END}\nхвост\n`;
const pr = (number, o = {}) => ({number, title: 'T' + number, state: 'open', merged: false, sha: 'abcdef1234', created: now - 5 * H, lastCommit: now - 10 * 60e3, ...o});
const st = (rows, data) => Object.fromEntries(parseRows(apply(doc(rows), {repo: 'o/r', ...data}, now)).map(r => [r.task, r]));
let fail = 0; const ok = (name, cond) => { if (!cond) { fail++; console.log('FAIL', name); } };

let r = st([row('взято', 'a', 'lab/a', '2026-11-10 11:50')], {pulls: {'lab/a': pr(1)}});
ok('свежий коммит = в работе', /В РАБОТЕ/.test(r.a.status) && /#1/.test(r.a.pr));
r = st([row('взято', 'a', 'lab/a', '2026-11-10 07:00')], {pulls: {'lab/a': pr(1, {lastCommit: now - 2 * H})}});
ok('2 часа без коммитов = молчит', /молчит/.test(r.a.status));
r = st([row('🔨 В РАБОТЕ', 'a', 'lab/a', '2026-11-10 07:00')], {pulls: {'lab/a': pr(1, {lastCommit: now - 4 * H})}});
ok('4 часа без коммитов = ЗАВИС, даже если записано «в работе»', /ЗАВИС 3\+ ч — ТОЛКНУТЬ/.test(r.a.status));
r = st([row('ГОТОВО: https://github.com/o/r/pull/1', 'a', 'lab/a', '2026-11-10 07:00')], {pulls: {'lab/a': pr(1, {lastCommit: now - 4 * H})}});
ok('обман: «ГОТОВО» без слияния не принимается', /ЗАВИС/.test(r.a.status) && !/ГОТОВО/.test(r.a.status));
r = st([row('взято', 'a', 'lab/a', '2026-11-10 07:00')], {pulls: {'lab/a': pr(1, {state: 'closed', merged: true, lastCommit: undefined})}});
ok('слитый PR = ГОТОВО с SHA', /ГОТОВО · слито abcdef1/.test(r.a.status));
r = st([row('взято', 'a', 'lab/a', '2026-11-10 07:00')], {pulls: {'lab/a': pr(1, {state: 'closed'})}});
ok('закрытый без слияния ≠ готово', /ЗАКРЫТО без слияния/.test(r.a.status));
r = st([], {pulls: {'lab/x': pr(7, {lastCommit: now - 5 * H})}, zanyato: [{item: 'M6', branch: 'lab/z', who: 'свободно (зависло 6 ч, было: MG-строитель-3)', at: '2026-11-09 22:25'}], branches: {'lab/z': now - 80 * H}});
ok('незаписанный PR добавлен сторожем', r.T7 && /сам не записал/.test(r.T7.who) && /ЗАВИС/.test(r.T7.status));
ok('пункт из ZANYATO добавлен, 80 ч = заброшено', r.M6 && r.M6.who === 'MG-строитель-3' && /ЗАБРОШЕНО 3 дн/.test(r.M6.status));
r = st([row('взято', 'чат', '—', '2026-11-10 06:00'), row('ГОТОВО: https://github.com/o/r/commit/1', 'чат2', '—', '2026-11-10 06:00'), row('НУЖЕН CLAUDE: причина', 'c', 'lab/c', '2026-11-10 06:00')], {pulls: {'lab/c': pr(3, {lastCommit: now - 9 * H})}});
ok('задача без ветки зависает по времени взятия', /ЗАВИС 6\+ ч/.test(r['чат'].status));
ok('без ветки готово только со ссылкой; НУЖЕН CLAUDE сохраняется', /^ГОТОВО: https/.test(r['чат2'].status) && /НУЖЕН CLAUDE: причина/.test(r.c.status));
const out = apply(doc([row('взято', 'b', 'lab/b', '2026-11-10 11:00'), row('взято', 'a', 'lab/a', '2026-11-10 07:00')]), {repo: 'o/r', pulls: {'lab/a': pr(1, {lastCommit: now - 4 * H}), 'lab/b': pr(2)}}, now);
ok('зависшие наверху, итог и список «толкнуть»', out.indexOf('| a |') < out.indexOf('| b |') && /зависло 1 · /.test(out) && /Толкнуть сейчас:\*\* a \(`lab\/a`\)/.test(out) && out.endsWith('хвост\n') && /Сторож проверил: 2026-11-10 12:00 UTC/.test(out));
ok('повторный прогон ничего не меняет', apply(out, {repo: 'o/r', pulls: {'lab/a': pr(1, {lastCommit: now - 4 * H}), 'lab/b': pr(2)}}, now) === out);

/* К10: новые ловушки обязаны сначала краснеть на старом стороже. */
r = st([row('взято', 'dirty', 'lab/dirty', '2026-11-10 11:50')],
  {pulls: {'lab/dirty': pr(31, {mergeable: false, mergeable_state: 'dirty'})}});
ok('dirty PR с коммитом 5 минут назад = конфликт', /⚔ КОНФЛИКТ с main/.test(r.dirty.status));

r = st([row('взято', 'red', 'lab/red', '2026-11-10 11:50')],
  {pulls: {'lab/red': pr(32, {failedChecks: ['lint / validate']})}});
ok('красная проверка и имя проверки', /❌ КРАСНЫЕ ПРОВЕРКИ: lint \/ validate/.test(r.red.status));

r = st([row('взято', 'merged-red', 'lab/merged-red', '2026-11-10 07:00')],
  {pulls: {'lab/merged-red': pr(33, {state: 'closed', merged: true, failedChecks: ['lint']})}});
ok('слияние приоритетнее красной проверки', /✅ ГОТОВО/.test(r['merged-red'].status));

const mgOut = apply(doc([]), {repo: 'o/r', mgRepo: 'o/meta6',
  mgPulls: {'lab/mg': pr(34, {mergeable: true})}}, now);
const mgRow = parseRows(mgOut).find(x => x.branch === 'lab/mg');
ok('открытый PR из meta6 появляется как МГ и с правильной ссылкой',
  !!mgRow && mgRow.project === 'МГ' && /o\/meta6\/pull\/34/.test(mgRow.pr));

let attempts = 0, waits = [];
const unresolved = typeof resolveMergeability === 'function' ?
  resolveMergeability(() => { attempts++; return {mergeable: null, mergeable_state: 'unknown'}; },
    ms => waits.push(ms)) : null;
r = st([row('взято', 'pending', 'lab/pending', '2026-11-10 11:50')],
  {pulls: {'lab/pending': pr(35, {mergeable: null, mergeable_state: 'unknown',
    failedChecks: []})}});
ok('mergeable=null 3 раза: 3 запроса, 2 паузы по 3 с, статус по времени',
  attempts === 3 && waits.join(',') === '3000,3000' &&
  unresolved?.mergeable === null && /🔨 В РАБОТЕ/.test(r.pending.status));

const severity = apply(doc([row('взято', 'bad', 'lab/bad', '2026-11-10 11:50')]),
  {repo: 'o/r', pulls: {'lab/bad': pr(36, {mergeable: false,
    mergeable_state: 'dirty', failedChecks: ['lint']})}}, now);
ok('сводка конфликтов и список Чинить сейчас', /⚔ конфликт 1 · ❌ красные 0/.test(severity) &&
  /Чинить сейчас:.*#36.*lab\/bad/.test(severity));

console.log(fail ? `ZADACHI_VERIFY_FAIL ${fail}` : 'ZADACHI_VERIFY_OK');
process.exit(fail ? 1 : 0);
