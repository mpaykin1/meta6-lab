// K5: three mutations, including a hardcoded fake state (deception).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyFiles, verifyObserver } from './verify-sumerki-copy.mjs';

const source = readFileSync(
  fileURLToPath(new URL('../../games/sumerki-i-pepel-2-copy/bot-observer.js', import.meta.url)),
  'utf8'
);

verifyFiles();

const cases = [
  [
    'missing goal',
    'goal: { x: target.x, y: target.y, z: target.z }',
    'goal: null'
  ],
  [
    'hardcoded hero coordinates (deception)',
    'hero: { x: p.x, y: p.y, z: p.z }',
    'hero: { x: 4, y: 4, z: 9 }'
  ],
  [
    'mutate game state while reading',
    'const { G, player, world } = engine;',
    'const { G, player, world } = engine;\n    G.kills += 1;'
  ]
];

for (const [label, before, after] of cases) {
  assert.ok(source.includes(before), 'mutation anchor missing: ' + label);
  const mutated = source.replace(before, after);
  assert.notEqual(mutated, source);
  assert.throws(() => verifyObserver(mutated), undefined, 'undetected regression: ' + label);
  console.log('TRAPPED: ' + label);
}
console.log('MUTATE sumerki copy rule 13: 3/3');
