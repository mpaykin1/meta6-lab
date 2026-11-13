import assert from 'node:assert/strict';
import { blockersFor } from './claim.mjs';

const nowMs = Date.parse('2026-11-11T14:30:00Z');
const base = {
  game: 'games/skin-trainer',
  branch: 'lab/uluchshatel-preflight',
  prs: [],
  lastCommitAt: '2026-11-11T12:00:00Z',
  locks: [],
  nowMs
};
const pr = (files, branch = 'lab/skin-factory', repo = 'mpaykin1/meta6-lab') => ({
  number: 210,
  url: 'https://github.com/mpaykin1/meta6-lab/pull/210',
  branch,
  repo,
  files
});

assert.equal(blockersFor(base).length, 0, 'свободная игра');
assert.equal(blockersFor({ ...base, prs: [pr(['games/skin-trainer/index.html'])] }).length, 1,
  'изменённый индекс заблокирован');
assert.equal(blockersFor({ ...base, prs: [pr(['games/skin-trainer-copy/index.html'])] }).length, 0,
  'соседняя игра не заблокирована');
assert.equal(blockersFor({ ...base, prs: [pr(['games/skin-trainer/index.html'], base.branch)] }).length, 0,
  'свой PR можно продолжать');
assert.equal(blockersFor({ ...base, prs: [pr(['games/skin-trainer/index.html'], base.branch, 'fork/repo')] }).length, 1,
  'чужой PR с той же веткой не становится своим');
assert.equal(blockersFor({
  ...base, game: 'games/veil-terraces', prs: [pr(['games/veil-terraces/index.html'])]
}).length, 1, 'алгоритм не привязан к конкретному названию игры');
assert.equal(blockersFor({ ...base, lastCommitAt: '2026-11-11T14:29:59Z' }).length, 1,
  'последний коммит внутри 60 минут');
assert.equal(blockersFor({ ...base, lastCommitAt: '2026-11-11T13:30:00Z' }).length, 0,
  'ровно 60 минут назад — можно');
assert.equal(blockersFor({
  ...base, locks: [{ game: base.game, branch: 'lab/skin-factory', free: false }]
}).length, 1, 'занято чужой задачей');
assert.equal(blockersFor({
  ...base, locks: [{ game: base.game, branch: 'lab/skin-factory', free: true }]
}).length, 0, 'освобождённая задача не блокирует');
assert.throws(() => blockersFor({ ...base, prs: [{ files: null }] }), /полный список/);
assert.throws(() => blockersFor({ ...base, lastCommitAt: null }), /точной даты/);
console.log('verify-preflight: 12 PASS');

const { verifyPagination } = await import('./verify-paginate.mjs');
await verifyPagination();
console.log('verify-paginate: late PR and file page verified');

const { verifyTaskLocks } = await import('./verify-task-locks.mjs');
verifyTaskLocks();
console.log('verify-task-locks: active ZADACHI reservation without PR is blocked');
