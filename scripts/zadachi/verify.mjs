// Проверка сторожа ZADACHI (К1–К10): 10 случаев. Запуск из любого каталога: node scripts/zadachi/verify.mjs [путь к watch.mjs]
import {pathToFileURL} from 'node:url';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const {apply, parseRows, START, END} = await import(pathToFileURL(resolve(process.argv[2] || resolve(here, 'watch.mjs'))).href);
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

// 1.1–1.6: новые регрессии, которые обязаны падать на старом стороже.
const src = (await import('node:fs')).readFileSync(resolve(process.argv[2] || resolve(here, 'watch.mjs')), 'utf8');
ok('1.1 GitHub check-runs API', src.includes('/check-runs'));
ok('1.1 GitHub mergeable_state и повторное получение', src.includes('mergeable_state:detailed.mergeable_state') && src.includes('attempt<=3') && src.includes('delay(3000)'));
r = st([row('взято', 'conflict', 'lab/dirty', '2026-11-10 07:00')], {pulls: {'lab/dirty': pr(20, {mergeable_state: 'dirty', lastCommit: now - 7 * H})}});
ok('1.2 конфликт имеет приоритет над временем', /^⚔ КОНФЛИКТ/.test(r.conflict.status));
r = st([row('взято', 'red', 'lab/red', '2026-11-10 07:00')], {pulls: {'lab/red': pr(21, {mergeable_state: 'clean', checkRuns: [{name: 'KONTUR Guard', conclusion: 'failure'}, {name: 'Portal Visited', conclusion: 'cancelled'}]})}});
ok('1.2 красные проверки с именами', /^❌ КРАСНЫЕ:/.test(r.red.status) && /KONTUR Guard/.test(r.red.status) && /Portal Visited/.test(r.red.status));
r = st([row('взято', 'cancelled', 'lab/cancelled', '2026-11-10 07:00')], {pulls: {'lab/cancelled': pr(23, {checkRuns: [{name:'Cancelled CI', conclusion:'cancelled'}]})}});
ok('1.2 отменённая проверка считается красной', /^❌/.test(r.cancelled.status) && /Cancelled CI/.test(r.cancelled.status));
r = st([row('НУЖЕН CLAUDE: ручная проверка', 'claude', 'lab/claude', '2026-11-10 07:00')], {pulls: {'lab/claude': pr(22, {mergeable_state:'dirty',checkRuns:[{name:'red',conclusion:'failure'}]})}});
ok('1.2 CLAUDE сохраняется до проверки конфликтов', /^🙋 НУЖЕН CLAUDE/.test(r.claude.status));
const mgRow = '| взято | mg | МГ | MG-ремонтник | lab/mg | — | 2026-11-10 07:00 | — |';
r = st([mgRow], {mgRepo:'mpaykin1/meta6', pulls: {'lab/mg': pr(91,{repo:'mpaykin1/meta6'})}});
ok('1.4 МГ PR с правильной ссылкой', r.mg.project === 'МГ' && r.mg.pr.includes('mpaykin1/meta6/pull/91'));
const duplicateDoc = doc([
  '| взято | alpha | МГЛ | чат ChatGPT | lab/dup | — | 2026-11-10 07:00 | — |',
  '| взято | alpha | МГЛ | MG-строитель-1 | lab/dup | — | 2026-11-10 08:00 | — |',
]);
const dedupRows = parseRows(apply(duplicateDoc, {repo:'o/r',pulls:{'lab/dup':pr(92)}}, now));
ok('1.5 одна строка на ветку, все исполнители', dedupRows.length === 1 && dedupRows[0].who.includes('чат ChatGPT') && dedupRows[0].who.includes('MG-строитель-1'));
r = st([row('взято', 'obsolete', 'lab/old', '2026-11-07 07:00')], {pulls:{'lab/old':pr(93, {lastCommit:now-73*H, duplicateOf:94})}});
ok('1.6 устаревший подтверждённый дубль', /^✖ ЗАКРЫТЬ: дубль #94/.test(r.obsolete.status));
const rich = apply(doc([row('взято','conflict','lab/dirty','2026-11-10 07:00'),row('взято','red','lab/red','2026-11-10 07:00')]),{repo:'o/r',pulls:{'lab/dirty':pr(20,{mergeable_state:'dirty'}),'lab/red':pr(21,{checkRuns:[{name:'x',conclusion:'timed_out'}]})}},now);
ok('1.3 итог и списки чинить/толкнуть', /⚔.*1/.test(rich) && /❌.*1/.test(rich) && /\*\*Чинить сейчас:/.test(rich) && /\*\*Толкнуть сейчас:/.test(rich));

console.log(fail ? `ZADACHI_VERIFY_FAIL ${fail}` : 'ZADACHI_VERIFY_OK');
process.exit(fail ? 1 : 0);
