// Independent read-only Archer META BOT layout snapshots and negative mutations.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const file = new URL('../../games/archer-in-the-fog/bot-adapter.js', import.meta.url);
const source = fs.readFileSync(file, 'utf8');
const blocks = Array.from({length: 24}, (_, i) => ({
  x: i % 5, y: -(i % 4), z: (i * 3) % 7, s: i % 4, t: i % 5,
}));
const variant = blocks.map((block, i) => i === 12 ? {...block, s: 12} : {...block});

function snapshot(code, geometry) {
  const runtime = {
    G: {mode: 'play', level: 1, depth: 1, phase: 'fight',
      lives: 3, dead: false, paused: false, hits: 2},
    archer: {root: {position: {x: 1, y: 10, z: 2}}},
    dragon: {root: {position: {x: 8, y: 12, z: -9}}},
    tower: {origin: {x: 0, y: 0, z: 0}, size: 5, blocks: geometry},
    SAVE: {owned: ['bow', 'twin']},
  };
  const context = {window: {__A: runtime},
    document: {getElementById: () => ({hidden: true})}};
  vm.runInNewContext(code, context, {timeout: 1000});
  const bridge = context.window.__META_BOT__;
  assert.equal(Object.isFrozen(bridge), true, 'META BOT must be frozen');
  assert.deepEqual(Object.keys(bridge).sort(), ['info','state','version']);
  assert.equal(bridge.version, 1);
  assert.equal(bridge.info().levels, 1);
  return bridge.state();
}
function valid(code) {
  const first = snapshot(code, blocks);
  const second = snapshot(code, blocks.map(b => ({...b})));
  const different = snapshot(code, variant);
  assert.equal(first.started, true);
  assert.equal(first.level, 0);
  assert.equal(first.goal.x, 8, 'real dragon position should be the target');
  assert.equal(first.goal.y, -9, 'horizontal ground coordinate must use dragon z');
  assert.equal(first.weapons, 2, 'show real unlocked weapon count');
  assert.equal(first.progress, 2);
  assert.equal(first.layoutHash, second.layoutHash, 'same geometry must hash identically');
  assert.notEqual(first.layoutHash, different.layoutHash, 'different generated blocks must change layout');
}
valid(source);
const changes = [
  ['geometry-hidden', 'hash ^= value | 0;', 'hash ^= 0;'],
  ['fake-waypoint', 'goal: started && dragon ? { x: dragon.x, y: dragon.z } : null,', 'goal: { x: 0, y: 0 },'],
  ['fixed-weapons', 'Array.isArray(a?.SAVE?.owned) ? Math.max(1, a.SAVE.owned.length) : 1', '1'],
];
for (const [name, before, after] of changes) {
  assert.equal(source.split(before).length - 1, 1, 'missing anchor for ' + name);
  const mutant = source.replace(before, after);
  assert.throws(() => valid(mutant), undefined, 'mutation escaped: ' + name);
  console.log('MUTATION_CAUGHT ' + name);
}
console.log('ARCHER_BOT_LAYOUT_PASS: actual tower geometry, 3 mutations');
