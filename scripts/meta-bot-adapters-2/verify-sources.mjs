import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const games = ['broken-city', 'rainbow-acceleration', 'sumerki-i-pepel-2'];
const read = id => fs.readFileSync(path.join(root, 'games', id, 'bot-adapter.js'), 'utf8');
const copy = o => JSON.parse(JSON.stringify(o));

function probe(id, source, env) {
  const win = {};
  let reference, engine;
  if (id === 'sumerki-i-pepel-2') {
    engine = {
      G: { state: 'title', seed: 137, biome: 'dusk', collected: 0, kills: 0 },
      player: { pos: { x: 2, z: 3 }, hp: 3 },
      combat: { arsenal: ['fists'] },
      world: { beacon: { x: 16, z: 21 }, coins: [{ x: 6, z: 7 }] },
      coins: [{ x: 6, z: 7, alive: true }],
      foes: [],
      rig: { yaw: 0.4 }
    };
    win.__isle = engine;
  } else {
    engine = {
      started: false, level: 0, levelDone: false, gameDone: false, alive: true,
      hero: { x: 2, y: 3, z: 3 }, goal: { x: 10, y: 20 },
      enemies: 0, weapons: 0, layoutHash: 'real-layout-1', menuOpen: true,
      lane: 0, velocity: 15
    };
    reference = { info: () => ({ name: id, levels: 1 }), state: () => copy(engine) };
    win[id === 'broken-city' ? '__BC_BOT_SOURCE__' : '__RR_BOT_SOURCE__'] = reference;
  }
  vm.runInNewContext(source, { window: win, process: { env } }, { timeout: 1000, filename: id + '/bot-adapter.js' });
  const bot = win.__META_BOT__, d = Object.getOwnPropertyDescriptor(win, '__META_BOT__');
  assert.ok(bot && Object.isFrozen(bot) && d && d.writable === false && d.configurable === false && !d.set, id + ': immutable handle');
  assert.deepEqual(Object.keys(bot).sort(), ['info', 'state', 'version'].sort(), id + ': permitted handle keys');
  assert.equal(bot.version, 1);
  assert.equal(typeof bot.info, 'function'); assert.equal(typeof bot.state, 'function');
  assert.equal(bot.info().levels, 1);
  const before = copy(engine);
  const first = bot.state();
  assert.deepEqual(copy(engine), before, id + ': observer modified gameplay state');
  assert.equal(first.hero.x, 2); assert.equal(first.hero.y, 3);
  assert.equal(first.started, false, id + ': fabricated started flag');
  assert.equal(first.goal.x, id === 'sumerki-i-pepel-2' ? 6 : 10, id + ': fabricated goal');
  if (id === 'sumerki-i-pepel-2') {
    engine.G.state = 'play'; engine.player.pos.x = 4.25;
    engine.player.pos.z = 5.75; engine.G.collected = 1;
    engine.coins[0].alive = false;
    engine.G.kills = 2;
    assert.equal(bot.state().progress, 1.02, id + ': actual progress');
  } else {
    engine.started = true; engine.hero.x = 4.25; engine.hero.y = 5.75;
    engine.goal.x = 14.25;
  }
  const updatedBefore = copy(engine), next = bot.state();
  assert.deepEqual(copy(engine), updatedBefore, id + ': observer wrote into world');
  assert.equal(next.hero.x, 4.25); assert.equal(next.hero.y, 5.75);
  assert.equal(next.started, true, id + ': observer did not follow actual start');
  assert.equal(next.goal.x, id === 'sumerki-i-pepel-2' ? 16 : 14.25, id + ': observer did not follow goal');
  if (id === 'sumerki-i-pepel-2') {
    engine.G.state = 'dead'; engine.player.hp = 0;
    assert.equal(bot.state().alive, false, id + ': fake immortality');
    engine.G.state = 'victory'; engine.player.hp = 3;
    assert.equal(bot.state().gameDone, true, id + ': fake victory');
  }
}
export function verifySources(overrides = {}) {
  for (const id of games) {
    const source = overrides[id] ?? read(id);
    for (const env of [{ CI: 'true', GITHUB_ACTIONS: 'true' }, {}]) probe(id, source, env);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifySources();
  console.log('3 real-source META BOT adapters: PASS (CI and non-CI)');
}
