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
  assert.equal(bot.info(), original.info());
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
