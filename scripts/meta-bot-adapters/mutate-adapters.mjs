// K5 — dependency-free mutation runner for KONTUR Guard.
// Execute the real adapter in an isolated JS realm against simulated live game objects.
// Headless Chromium checks are separate in verify-adapters.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const GAMES = ['twilight-isle-classic', 'twilight-isles'];

const mutations = [
  { name: 'hero-always-origin', find: /hero:\s*\{\s*x:\s*p\.x,\s*y:\s*p\.z\s*\}/,
    replace: 'hero: { x: 0, y: 0 }' },
  { name: 'cheat-hero-equals-goal', find: /hero:\s*\{\s*x:\s*p\.x,\s*y:\s*p\.z\s*\}/,
    replace: 'hero: { x: goal?.x ?? p.x, y: goal?.y ?? p.z }' },
  { name: 'cheat-level-always-complete', find: /levelDone:\s*G\.state\s*===\s*'victory'/,
    replace: 'levelDone: true' },
  { name: 'state-throws', find: /state\(\)\s*\{/,
    replace: "state() { throw new Error('state corrupted');" }
];

function checkAdapter(code) {
  const G = { state: 'play', all: false, warden: null,
    collected: 0, kills: 0, wardenDown: false };
  const player = { pos: { x: 5, y: 2, z: 8 }, hp: 3 };
  const world = {
    seed: 1491, biome: 'dusk',
    spawn: { x: 5, z: 8 }, beacon: { x: 40, z: 38 },
    ring: { x: 39, z: 38 },
    coins: [{ x: 12, z: 15 }, { x: 22, z: 24 }]
  };
  const api = { G, player, world,
    combat: { arsenal: ['fists'] }, foes: [],
    coins: world.coins.map(c => ({ ...c, alive: true })) };
  const win = { __isle: api };
  vm.runInNewContext(code, { window: win, document: { title: 'Twilight Isle' } }, {
    timeout: 3000, filename: 'mutated-bot-adapter.js'
  });
  const bot = win.__META_BOT__;
  assert.deepEqual(Object.keys(bot).sort(), ['info', 'state', 'version']);
  assert.ok(Object.isFrozen(bot), 'mutable bot interface');
  assert.equal(bot.version, 1);
  assert.equal(bot.info().levels, 1);
  function inspect() {
    const s = bot.state();
    assert.equal(s.started, true);
    assert.equal(s.level, 0);
    assert.equal(s.levelDone, G.state === 'victory', 'false completion');
    assert.equal(s.gameDone, G.state === 'victory', 'false game completion');
    assert.deepEqual([s.hero.x, s.hero.y], [player.pos.x, player.pos.z],
      'reported hero differs from actual player');
    assert.ok(s.goal && Number.isFinite(s.goal.x) && Number.isFinite(s.goal.y));
    assert.ok(Math.hypot(s.hero.x - s.goal.x, s.hero.y - s.goal.y) > 1,
      'hero falsely at destination');
    assert.ok(s.layoutHash.includes(String(world.seed)), 'incorrect layout hash');
    assert.ok(s.alive && s.weapons === 1 && s.enemies === 0);
  }
  inspect();
  // Independent true movement; a fake origin or goal cannot track it.
  player.pos.x += 3.1; player.pos.z += 1.3;
  inspect();
  G.state = 'victory';
  assert.equal(bot.state().levelDone, true, 'missed genuine completion');
}

for (const game of GAMES) {
  const src = fs.readFileSync(path.join(ROOT, 'games', game, 'bot-adapter.js'), 'utf8');
  checkAdapter(src);
  for (const m of mutations) {
    assert.match(src, m.find, game + ': missing mutation anchor ' + m.name);
    const corrupted = src.replace(m.find, m.replace);
    assert.notEqual(corrupted, src, game + ': ineffective mutation');
    assert.throws(() => checkAdapter(corrupted),
      undefined, game + ': escaped mutation ' + m.name);
    console.log('KONTUR_MUTATION_CAUGHT ' + game + '/' + m.name);
  }
}
console.log('MUTATE_ADAPTERS_PASS: all corruption variants rejected');
