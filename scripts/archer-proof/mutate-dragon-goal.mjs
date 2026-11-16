import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source = readFileSync(
  new URL('../../games/archer-in-the-fog/bot-adapter.js', import.meta.url), 'utf8'
);

function exercise(code) {
  const position = {x: 31, y: 15, z: -14};
  const window = {__A: {
    G: {mode: 'play', phase: 'fight', level: 1, lives: 3, hits: 1},
    archer: {root: {position: {x: -3, y: 4, z: 6}}},
    dragon: {root: {position}},
    tower: {origin: {x: 0, y: 0, z: 0}, size: 12, type: 'stone'},
    SAVE: {owned: [1]}
  }};
  runInNewContext(code, {window, document: {getElementById: () => null}});
  const adapter = window.__META_BOT__;
  assert.ok(adapter, 'the public META BOT adapter must exist');
  const one = adapter.state();
  assert.equal(one.started, true);
  assert.equal(one.goal?.x, 31, 'goal X must be the real dragon world X');
  assert.equal(one.goal?.y, -14, 'goal Y must map to real dragon world Z');
  assert.equal(one.hero.x, -3, 'do not confuse dragon and player coordinates');
  position.x = -23;
  position.z = 28;
  const moved = adapter.state();
  assert.equal(moved.goal?.x, -23, 'moving dragon must not be frozen to a seed');
  assert.equal(moved.goal?.y, 28, 'moving dragon Z must be observed continuously');
  window.__A.G.mode = 'menu';
  assert.equal(adapter.state().goal, null, 'inactive game must not fabricate target');
}
exercise(source);
const anchor = 'goal: started && dragon ? { x: dragon.x, y: dragon.z } : null,';
assert.ok(source.includes(anchor), 'real moving-target source invariant missing');
const mutants = [
  ['null-goal', 'goal: null,'],
  ['constant-target', 'goal: started ? {x: 0, y: 0} : null,'],
  ['player-as-target', 'goal: started ? {x: p?.x, y: p?.z} : null,'],
  ['wrong-axis', 'goal: started && dragon ? {x: dragon.x, y: dragon.x} : null,']
];
for (const [name, mutation] of mutants) {
  let killed = false;
  try { exercise(source.replace(anchor, mutation)); } catch { killed = true; }
  assert.ok(killed, 'moving-target regression escaped: ' + name);
  console.log('MUTATION_CAUGHT ' + name);
}
console.log('PASS: real dragon target + four negative bot mutations');
