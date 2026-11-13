// A task without a pull request must still reserve its game's source.
import assert from 'node:assert/strict';
import { blockersFor, taskLocksFor } from './claim.mjs';

const row = (status, task, branch) =>
  `| ${status} | ${task} | МГЛ | другая задача | \`${branch}\` | — | 2026-11-13 | — |`;
const table = rows => [
  '<!-- ZADACHI:START -->',
  '| Статус | Задача | Проект | Кто | Ветка | PR | Взято (UTC) | Последний коммит (UTC) |',
  '|---|---|---|---|---|---|---|---|',
  ...rows,
  '<!-- ZADACHI:END -->'
].join('\n');
const base = {
  game: 'games/skin-trainer',
  branch: 'lab/uluchshatel-preflight',
  prs: [],
  lastCommitAt: '2026-11-11T12:00:00Z',
  nowMs: Date.parse('2026-11-11T14:30:00Z')
};
export function verifyTaskLocks(parse = taskLocksFor, blockers = blockersFor) {
  const claimed = parse(table([row('взято', 'games/skin-trainer × правило 13', 'lab/other')]), base.game);
  assert.equal(claimed.length, 1, 'a task reservation must be read');
  assert.equal(blockers({ ...base, locks: claimed }).length, 1,
    'a task without PR must block another agent');
  assert.equal(claimed[0].source, 'ZADACHI.md');
  assert.equal(parse(table([row('✅ ГОТОВО', 'games/skin-trainer №13', 'lab/done')]), base.game)[0].free,
    true, 'completed task must release the game');
  assert.equal(parse(table([row('✖ ЗАКРЫТО', 'games/skin-trainer №13', 'lab/closed')]), base.game)[0].free,
    true, 'closed task must release the game');
  assert.equal(blockers({ ...base, locks: parse(table([
    row('взято', 'games/skin-trainer №13', base.branch)
  ]), base.game) }).length, 0, 'own task must not block continuation');
  assert.equal(parse(table([row('взято', 'games/skin-trainer-copy №13', 'lab/other')]), base.game).length,
    0, 'neighboring copy must not block this game');
  assert.equal(parse(table([row('взято', 'veil-terraces × правило 13', 'lab/other')]),
    'games/veil-terraces').length, 1, 'bare slug must be checked without a hardcoded game');
  assert.throws(() => parse('task table missing', base.game), /Incomplete ZADACHI/,
    'missing task table must fail closed');
  assert.throws(() => parse(table([row('взято', 'games/skin-trainer №13', 'lab/other')])
    .replace('| Ветка |', '| Unknown |'), base.game), /Unexpected ZADACHI/,
    'changed task-table schema must fail closed');
  return true;
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  verifyTaskLocks();
  console.log('verify-task-locks: task reservations and schema failures caught');
}
