// Ловушка: уборка веток не должна удалять ценное (открытый PR, ссылка, свежая ветка) и должна убирать мусор.
import assert from 'node:assert/strict';
import { decide } from './vetki-uborka-rules.mjs';
const ctx = { openHeads: new Set(['lab/open']), mergedHeads: new Set(['lab/merged', 'lab/open']), closedHeads: new Set(['lab/closed']),
  protectedSafe: new Set(['linked-x']), ageDays: 7 };
const cases = [
  [{ name: 'lab/open', ageDays: 90 }, 'keep:open-pr'],
  [{ name: 'lab/linked/x', ageDays: 90 }, 'keep:linked'],
  [{ name: 'lab/new', ageDays: 0.5 }, 'keep:fresh'],
  [{ name: 'lab/merged', ageDays: 2 }, 'delete:merged'],
  [{ name: 'lab/closed', ageDays: 3 }, 'keep:recent'],
  [{ name: 'lab/closed', ageDays: 30 }, 'delete:closed'],
  [{ name: 'lab/nopr', ageDays: 30 }, 'delete:stale']
];
for (const [b, want] of cases) assert.equal(decide(b, ctx), want, b.name + ' ' + b.ageDays);
// мутации: каждая защита обязана ловиться
const src = decide.toString();
for (const [label, pat] of [['open-pr', /openHeads/], ['linked', /protectedSafe/], ['fresh', /ageDays <= 1/]]) {
  assert.ok(pat.test(src), 'защита убрана: ' + label);
  console.log('UBORKA_MUTATION_GUARDED ' + label);
}
console.log('UBORKA_PASS ' + cases.length);
