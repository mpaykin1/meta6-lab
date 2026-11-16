import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./bot-adapter.js', import.meta.url), 'utf8');

function verify(code) {
  const window = {};
  const frame = [];
  vm.runInNewContext(code, {
    window,
    requestAnimationFrame: callback => { frame.push(callback); },
    Object,
    Error
  }, {timeout: 1000});
  assert.equal(Object.hasOwn(window, '__META_BOT__'), false,
    'Do not expose the bot before the game engine is initialized');

  const original = Object.freeze({
    info: () => ({name: 'broken-city', levels: 9}),
    state: () => ({started: false, hero: {x: 4, y: 6}, alive: true})
  });
  window.__BC_BOT_SOURCE__ = original;
  assert.equal(frame.length, 1, 'Deferred boot must poll for the real source');
  frame.shift()();
  const bot = window.__META_BOT__;
  assert.ok(bot, 'Bot API must appear once the real engine is available');
  assert.equal(bot.version, 1);
  assert.deepEqual(bot.info(), original.info());
  assert.deepEqual(bot.state(), original.state());
  assert.ok(Object.isFrozen(bot));
  const descriptor = Object.getOwnPropertyDescriptor(window, '__META_BOT__');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
}

verify(source);
const mutations = [
  ['early publication', source.replace(
    'if (!source) {', 'if (false) {'
  )],
  ['lost deferred installation', source.replace(
    'requestAnimationFrame(install);', 'return;'
  )],
  ['writable public API', source.replace(
    'writable: false, configurable: false', 'writable: true, configurable: true'
  )],
  ['invented progress', source.replace(
    'state: () => source.state()', 'state: () => ({started: true, hero: {x: 0, y: 0}})'
  )]
];
for (const [label, mutant] of mutations) {
  assert.notEqual(mutant, source, label + ': mutation did not apply');
  assert.throws(() => verify(mutant), undefined, label + ': false PASS escaped');
}
console.log('BROKEN_CITY_BOT_BOOT_PASS: deferred real engine; 4 mutants rejected');


// Real layout generation and pixel-budget adaptation must be observable in gameplay.
const gameHtml = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
function between(source, first, last) {
  const a = source.indexOf(first);
  assert.ok(a >= 0, 'Missing first game marker: ' + first);
  const b = source.indexOf(last, a + first.length);
  assert.ok(b > a, 'Missing last game marker: ' + last);
  return source.slice(a, b);
}
function verifyWorldAndQuality(gameSource) {
  const firstRuin = between(gameSource, 'function toysStart() {', '\nfunction toysUpdate(');
  let randomIndex = 0;
  const sandbox = {
    G: { cfg: { goal: -66 } },
    toyBg: { children: [], visible: false },
    memClear() {},
    Math: { random: () => (++randomIndex % 2 ? .1 : .9) }
  };
  const start = vm.runInNewContext(firstRuin + '\ntoysStart;', sandbox);
  start();
  const original = sandbox.G.firstBarrier;
  assert.equal(sandbox.G.nextBarrier, original,
    'First obstacle must really be built at the observed seed coordinate');
  start();
  assert.notEqual(sandbox.G.firstBarrier, original,
    'Consecutive runs must build different first obstacle positions');
  assert.equal(sandbox.G.nextBarrier, sandbox.G.firstBarrier);

  const layoutCode = between(gameSource, 'const layout = c ? [', '\n    return {');
  const layout = firstBarrier => vm.runInNewContext(layoutCode + '\nlayout;', {
    G: { li: 0, cycle: 1, firstBarrier },
    c: { mode: 'toys', goal: -66, gaps: [] },
    truins: []
  });
  assert.notEqual(layout(-26.1), layout(-27.9),
    'Pre-spawn layout signature must reflect the real obstacle position');

  const tune = between(gameSource, 'function tuneRenderQuality(', '\nfunction perfTick(');
  const changes = [];
  let resized = 0;
  const q = vm.runInNewContext(
    'let renderScale = 1; const maxRenderScale = 1; const DPR = 1;\n' +
    'const QUALITY = {last:0, elapsed:0, frames:0, goodWindows:0};\n' +
    tune + '\n({tick:tuneRenderQuality, scale:()=>renderScale});',
    {
      document: { hidden: false },
      renderer: { setPixelRatio: value => changes.push(value) },
      resize: () => { resized++; },
      Math
    }
  );
  for (let time = 350; time <= 6300; time += 350) q.tick(time, true);
  assert.ok(q.scale() < .8, 'Sustained low frame rate must reduce render pixels');
  assert.ok(changes.length >= 1 && resized >= 1,
    'Reducing quality must actually resize the WebGL renderer and its targets');
  const reduced = q.scale();
  for (let time = 6310; time <= 31000; time += 10) q.tick(time, true);
  assert.ok(q.scale() > reduced, 'Stable high FPS must gradually restore image quality');
  assert.ok(q.scale() <= 1, 'Quality must not exceed the device pixel budget');
}
verifyWorldAndQuality(gameHtml);
for (const [name, source, before, after] of [
  ['fake-layout-id', gameHtml,
    "G.firstBarrier.toFixed(4)", "'decorative'"],
  ['repeat-identical-ruins', gameHtml,
    'G.firstBarrier = -27 + (Math.random() - .5) * 2.4;', 'G.firstBarrier = -27;'],
  ['layout-not-used-for-geometry', gameHtml,
    'G.nextBarrier = G.firstBarrier;', 'G.nextBarrier = -27;'],
  ['low-fps-ignored', gameHtml,
    'if (fps < 26) scale = Math.max(.38, scale * .78);',
    'if (false) scale = Math.max(.38, scale * .78);'],
  ['render-size-not-applied', gameHtml,
    'renderer.setPixelRatio(DPR * renderScale);\n    resize();', 'resize();']
]) {
  assert.ok(source.includes(before), name + ': mutation source missing');
  const mutant = source.replace(before, after);
  assert.throws(() => verifyWorldAndQuality(mutant), undefined,
    name + ': defect was not rejected');
}
console.log('BROKEN_CITY_WORLD_QUALITY_PASS: real varied ruins, adaptive pixels, five mutants rejected');
