// K3/K5: real META BOT failures found in workflow 42646187761.
// Dependency-free executable traps: menu, death retry, low-FPS mode, real route.
// Each mutant must fail the same check as the real source.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const games = ['twilight-isle-classic', 'twilight-isles'];
const functionSource = (html, name, params = '') => {
  const re = new RegExp('function ' + name + '\\(' + params + '\\)\\s*\\{[\\s\\S]*?^\\}', 'm');
  const matched = html.match(re);
  assert.ok(matched, name + ': implementation missing');
  return matched[0];
};
function checkMenu(html) {
  assert.match(html, /<button\\b[^>]*id="btnMenu"[^>]*aria-label="Menu"[^>]*>☰<\\/button>/,
    'visible named menu button required');
  assert.match(html, /#btnMenu\\s*\\{[^}]*top:[^;}]+;[^}]*right:/,
    'menu must remain at the top right');
  const handler = html.match(/\\$\\('btnMenu'\\)\\.addEventListener\\('click',[^\\n]+\\);/);
  assert.ok(handler, 'menu must have click handler');
  const G = { state: 'play' }; let listener = null;
  const sandbox = {
    G, $: id => ({ addEventListener: (event, fn) => {
      assert.equal(id, 'btnMenu'); assert.equal(event, 'click'); listener = fn;
    } }),
    setPaused: on => { G.state = on && G.state === 'play' ? 'paused' : 'play'; }
  };
  vm.runInNewContext(handler[0], sandbox, { timeout: 1000 });
  assert.equal(typeof listener, 'function', 'menu handler must be callable');
  listener();
  assert.equal(G.state, 'paused', 'menu must actually pause gameplay');
  listener();
  assert.equal(G.state, 'play', 'menu must actually resume gameplay');
}
function checkDeath(html) {
  const code = functionSource(html, 'die');
  const G = { state: 'play', endT: 21 };
  let endVisible = 0;
  const nodes = { touch: { hidden: false } };
  const sandbox = { G, $: id => nodes[id], PG: { play: () => {} },
    SFX: { die: () => {} }, stopBeam: () => {}, releaseAll: () => {},
    showEnd: won => { assert.equal(won, false); endVisible++; },
    emit: () => {} };
  const die = vm.runInNewContext('(' + code + ')', sandbox, { timeout: 1000 });
  die();
  assert.equal(G.state, 'dead', 'real death state preserved');
  assert.equal(nodes.touch.hidden, true, 'dead player loses touch controls');
  assert.equal(endVisible, 1, 'the actual replay menu must appear before 5-second death watchdog');
}
function checkPerformance(html) {
  const code = functionSource(html, 'perfMonitor', 'dt');
  const perf = { scale: 0.65, acc: 0, frames: 0, cool: 0, lowFx: false, sampledAt: 0 };
  let now = 1000, resized = 0;
  const sandbox = { perf, Math, performance: { now: () => now }, resize: () => { resized++; } };
  const monitor = vm.runInNewContext('(' + code + ')', sandbox, { timeout: 1000 });
  for (let k = 0; k < 12; k++) { now += 333; monitor(0.05); }
  assert.equal(perf.lowFx, true, 'real 3 FPS must activate lower-cost render path');
  assert.ok(perf.scale < 0.65 && resized > 0, 'real 3 FPS must reduce render resolution');
  assert.match(html, /if \\(perf\\.lowFx\\) renderer\\.render\\(scene, camera\\);/,
    'low-FPS branch must actually skip the expensive composer');
  // Recovery is based on live FPS, not a forced low-quality test mode.
  for (let k = 0; k < 300; k++) { now += 16.7; monitor(0.0167); }
  assert.equal(perf.lowFx, false, 'quality must recover on fast devices');
}
function checkRoute(adapter) {
  const side = 8, reach = new Uint8Array(side * side).fill(1);
  for (let z = 0; z < side - 1; z++) reach[3 + z * side] = 0;
  const world = { seed: 1951, biome: 'dusk',
    spawn: { x: 1.5, z: 2.5 }, beacon: { x: 6, z: 6 },
    ring: { x: 6, z: 6 }, reach, stand: new Int16Array(side * side).fill(4),
    coins: [{ x: 6.5, z: 2.5 }] };
  const coin = { x: 6.5, z: 2.5, alive: true };
  const player = { pos: { x: 1.5, y: 4, z: 2.5 }, hp: 6 };
  const G = { state: 'play', all: false, warden: null, collected: 0, kills: 0, wardenDown: false };
  const api = { G, world, player, coins: [coin], foes: [], combat: { arsenal: ['fists'] } };
  const window = { __isle: api };
  vm.runInNewContext(adapter, { window, document: { title: 'Twilight' }, Math, Uint8Array, Int32Array }, { timeout: 2000 });
  const bot = window.__META_BOT__;
  const s = bot.state();
  assert.ok(s.goal && Number.isFinite(s.goal.x) && Number.isFinite(s.goal.y));
  assert.deepEqual([s.hero.x, s.hero.y], [1.5, 2.5], 'hero must reflect the actual player');
  assert.equal(player.pos.x, 1.5, 'read-only bot must not move the real player');
  assert.ok(s.goal.x < 3, 'first waypoint must go AROUND the blocked wall, not through it');
  // Move the simulated real player following the returned waypoints; every returned waypoint
  // must be a reachable world cell. This proves that the route is not invented.
  let completed = false;
  for (let k = 0; k < 80; k++) {
    const next = bot.state().goal;
    const x = Math.floor(next.x), z = Math.floor(next.y);
    assert.ok(x >= 0 && x < side && z >= 0 && z < side && reach[x + z * side],
      'route selected a blocked/nonexistent cell');
    player.pos.x = next.x; player.pos.z = next.y;
    if (Math.hypot(player.pos.x - coin.x, player.pos.z - coin.z) < 0.1) {
      completed = true; break;
    }
  }
  assert.ok(completed, 'real reachable coin must be reachable through the public goal sequence');
}
function checkStrategy(source) {
  assert.match(source, /if \\(!state\\.alive\\)/, 'strategy must detect actual death');
  assert.match(source, /await ctx\\.key\\('Enter', 120\\)/, 'strategy must use real visible restart input');
  assert.match(source, /await ctx\\.jump\\(\\)/, 'strategy must jump across real terraces');
  assert.doesNotMatch(source, /__isle|page\\.evaluate|forceWin|teleport\\(/, 'strategy cannot cheat');
}
const mutate = (source, label, a, b, checker) => {
  assert.ok(source.includes(a), label + ': missing mutation anchor');
  const broken = source.replace(a, b);
  assert.notEqual(broken, source, label + ': failed mutation');
  assert.throws(() => checker(broken), undefined, 'MUTATION ESCAPED ' + label);
  console.log('KONTUR_MUTATION_CAUGHT ' + label);
};
for (const game of games) {
  const html = fs.readFileSync(path.join(root, 'games', game, 'index.html'), 'utf8');
  const adapter = fs.readFileSync(path.join(root, 'games', game, 'bot-adapter.js'), 'utf8');
  const strategy = fs.readFileSync(path.join(root, 'games', game, 'bot-strategy.mjs'), 'utf8');
  checkMenu(html); checkDeath(html); checkPerformance(html); checkRoute(adapter); checkStrategy(strategy);
  mutate(html, game + '/menu-missing', 'id="btnMenu"', 'id="btnFake"', checkMenu);
  mutate(html, game + '/menu-no-op', "() => setPaused(G.state === 'play')", '() => {}', checkMenu);
  mutate(html, game + '/deceptive-menu', "() => setPaused(G.state === 'play')",
    "() => { if (false) setPaused(G.state === 'play'); }", checkMenu);
  mutate(html, game + '/death-no-replay', '  showEnd(false); //', '  // showEnd(false); //', checkDeath);
  mutate(html, game + '/death-fake-replay', '  showEnd(false); //',
    '  if (false) showEnd(false); //', checkDeath);
  mutate(html, game + '/fps-disabled', 'if (fps < 18) perf.lowFx = true;',
    'if (fps < 0) perf.lowFx = true;', checkPerformance);
  mutate(html, game + '/fps-wrong-clock', 'perf.acc += Math.min(2, (now - perf.sampledAt) / 1000);',
    'perf.acc += dt;', checkPerformance);
  mutate(html, game + '/fps-fake-fallback', 'if (perf.lowFx) renderer.render(scene, camera);',
    'if (false) renderer.render(scene, camera);', checkPerformance);
  mutate(adapter, game + '/unrouted-coin', 'navigate(world, p, coin)', 'coin', checkRoute);
  mutate(adapter, game + '/ignore-wall', 'if (!reach[j] || prev[j] !== -1',
    'if (prev[j] !== -1', checkRoute);
  mutate(adapter, game + '/fake-hero', 'hero: { x: p.x, y: p.z }',
    'hero: { x: 0, y: 0 }', checkRoute);
  mutate(strategy, game + '/no-restart', "await ctx.key('Enter', 120);",
    'await ctx.wait(120);', checkStrategy);
}
console.log('MUTATE_BOT_RECOVERY_PASS: navigation, menu, death and FPS traps caught');
