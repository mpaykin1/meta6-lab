// K5 mutations: a null goal, deceptive constant hero, false target and gameplay side-effect.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verifyFiles, verifyObserver } from './verify-broken-copy.mjs';

verifyFiles();
const source = readFileSync(
  fileURLToPath(new URL('../../games/broken-city-copy/bot-observer.js', import.meta.url)),
  'utf8'
);

const cases = [
  [
    'missing goal',
    'goal: { x: 0, y: 0, z: endpoint }',
    'goal: null'
  ],
  [
    'deception: hardcoded hero coordinates',
    'hero: { x: position.x, y: position.y, z: position.z }',
    'hero: { x: 2, y: 4, z: 4 }'
  ],
  [
    'wrong target is the visual shaft, not the level finish',
    'const endpoint = config.goal + 6;',
    'const endpoint = config.goal + 100;'
  ],
  [
    'observer increments gameplay counter',
    'const { G, heroState, LEVELS } = engine;',
    'const { G, heroState, LEVELS } = engine; G.caught += 1;'
  ],
  [
    'false end of game on second level',
    'Boolean(G.ending) && level === LEVELS.length - 1;',
    'Boolean(G.ending) && level >= 1;'
  ]
];

for (const [label, anchor, broken] of cases) {
  assert.ok(source.includes(anchor), 'missing mutation anchor: ' + label);
  const mutant = source.replace(anchor, broken);
  assert.notEqual(mutant, source, label + ' must actually mutate');
  assert.throws(() => verifyObserver(mutant), undefined, 'escaped mutation: ' + label);
  console.log('TRAPPED:', label);
}
console.log('MUTATE Broken City copy rule 13: 5/5');
