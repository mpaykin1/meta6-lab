// Ловушки ОДИН PR НА ДЕЛО (OSHIBKI 2026111802): дубли PR и журнал внутри PR.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('./core.mjs', import.meta.url), 'utf8');
const load = async code => import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const now = Date.parse('2026-11-18T03:00:00Z');
const hoursAgo = h => new Date(now - h * 3600e3).toISOString();

async function check(m) {
  // журнал и карточки в PR — нарушение; новые файлы — можно
  assert.deepEqual(m.journalViolations([
    {filename: 'automation/NADZOR.md', status: 'modified'},
    {filename: 'automation/zadachi/Z01_ZAVALY.md', status: 'modified'},
    {filename: 'automation/zadachi/Z99_NEW.md', status: 'added'},
    {filename: 'scripts/dispetcher/build.mjs', status: 'modified'}
  ]), ['automation/NADZOR.md', 'automation/zadachi/Z01_ZAVALY.md']);
  // реальный случай 17.11: #407 и #404 правят build.mjs → #407 дубль #404
  const others = [
    {number: 404, title: 'fix(dispatcher): avoid quota stall', updated_at: hoursAgo(5), files: ['scripts/dispetcher/build.mjs', 'OSHIBKI.md']},
    {number: 363, title: 'НУЖЕН CLAUDE: CI', updated_at: hoursAgo(1), files: ['scripts/dispetcher/build.mjs']},
    {number: 200, title: 'old', updated_at: hoursAgo(24 * 10), files: ['scripts/dispetcher/build.mjs']}
  ];
  assert.deepEqual(m.findDuplicate({number: 407, files: ['scripts/dispetcher/build.mjs']}, others, now),
    {number: 404, files: ['scripts/dispetcher/build.mjs']});
  // старший PR не закрывается из-за младшего
  assert.equal(m.findDuplicate({number: 404, files: ['scripts/dispetcher/build.mjs']},
    [{number: 407, title: 'x', updated_at: hoursAgo(1), files: ['scripts/dispetcher/build.mjs']}], now), null);
  // общие таблицы и журнал — не повод считать дублем
  assert.equal(m.findDuplicate({number: 410, files: ['OSHIBKI.md', 'automation/NADZOR.md', 'games/a.html']},
    [{number: 409, title: 'y', updated_at: hoursAgo(1), files: ['OSHIBKI.md', 'automation/NADZOR.md', 'games/b.html']}], now), null);
  // «НУЖЕН CLAUDE» и давно заброшенные PR не блокируют
  assert.equal(m.findDuplicate({number: 410, files: ['x.mjs']},
    [{number: 1, title: 'НУЖЕН CLAUDE: z', updated_at: hoursAgo(1), files: ['x.mjs']},
     {number: 2, title: 'z', updated_at: hoursAgo(100), files: ['x.mjs']}], now), null);
  assert.match(m.closeComment({number: 404, files: ['a']}), /#404/);
}

await check(await load(source));
console.log('ODIN_PR_TESTS_PASS');

const mutants = [
  ['journal-allowed', "f.status !== 'added' && isJournal(f.filename)", 'false'],
  ['added-forbidden', "f.status !== 'added' && ", ''],
  ['younger-blocks-older', '.filter(o => o.number < self.number)', '.filter(o => o.number !== self.number)'],
  ['claude-blocks', '.filter(o => !waitsForClaude(o.title))', '.filter(o => true)'],
  ['stale-blocks', '<= freshHours * 3600e3', '<= Infinity'],
  ['shared-table-dup', '!SHARED_OK.has(n) && ', ''],
  ['no-dup-detected', 'if (shared.length) return', 'if (false) return']
];
for (const [name, from, to] of mutants) {
  assert.ok(source.includes(from), 'Missing mutation anchor: ' + name);
  const mutant = await load(source.replace(from, to));
  await assert.rejects(() => check(mutant), {name: 'AssertionError'}, 'Undetected mutation: ' + name);
  console.log('ODIN_PR_MUTATION_CAUGHT ' + name);
}
console.log('ODIN_PR_MUTATIONS_PASS: ' + mutants.length + ' caught');
