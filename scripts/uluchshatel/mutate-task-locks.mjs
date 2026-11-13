// K5: three failures, including a hardcoded-game deception, must be caught.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { verifyTaskLocks } from './verify-task-locks.mjs';

const source = readFileSync(new URL('./claim.mjs', import.meta.url), 'utf8');
verifyTaskLocks();
const mutants = [
  ['ignore task rows',
    'if (!taskTokens.includes(game) && !taskTokens.includes(slug)) continue;',
    'if (true) continue;'],
  ['ignore active task status',
    'const free = /✅|✖|свободно/i.test(status);',
    'const free = true;'],
  ['deception: hardcode only one game',
    "const slug = game.slice('games/'.length);",
    "const slug = 'skin-trainer';"]
];
for (const [label, before, after] of mutants) {
  assert.ok(source.includes(before), 'mutation anchor missing: ' + label);
  const changed = source.replace(before, after);
  const { taskLocksFor, blockersFor } = await import(
    'data:text/javascript;charset=utf-8,' + encodeURIComponent(changed)
  );
  assert.throws(() => verifyTaskLocks(taskLocksFor, blockersFor),
    undefined, 'escaped mutation: ' + label);
  console.log('TRAPPED:', label);
}
console.log('mutate-task-locks: 3/3');
