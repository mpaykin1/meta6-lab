import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../games/broken-city/bot-adapter.js', import.meta.url), 'utf8');

function verify(script) {
  const timers = new Map();
  let sequence = 0;
  const window = {};
  const context = {
    window,
    setInterval(callback, delay) {
      assert.equal(delay, 100, 'ready polling cadence must remain bounded');
      timers.set(++sequence, callback);
      return sequence;
    },
    clearInterval(id) { timers.delete(id); }
  };
  vm.runInNewContext(script, context, { timeout: 1000 });

  assert.equal(window.__META_BOT__, undefined, 'bot must not appear before the engine');
  assert.equal(timers.size, 1, 'engine readiness must have a real retry');
  const engineInfo = { name: 'actual-engine', levels: 9 };
  const engineState = { started: false, hero: { x: 12, z: 34 } };
  Object.defineProperty(window, '__BC_BOT_SOURCE__', {
    value: { info: () => engineInfo, state: () => engineState },
    writable: false,
    configurable: false
  });

  for (const poll of [...timers.values()]) poll();
  assert.equal(timers.size, 0, 'ready poll must stop after installation');
  const bot = window.__META_BOT__;
  assert.ok(bot, 'bot must appear when the real engine is ready');
  assert.equal(bot.version, 1);
  assert.strictEqual(bot.info(), engineInfo, 'info must be passed through from the real engine');
  assert.strictEqual(bot.state(), engineState, 'state must be passed through from the real engine');
  assert.equal(Object.isFrozen(bot), true);
  const descriptor = Object.getOwnPropertyDescriptor(window, '__META_BOT__');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
}
verify(source);

const mutations = [
  [
    'premature-publication',
    "if (!source || typeof source.info !== 'function' || typeof source.state !== 'function') {",
    'if (false) {'
  ],
  [
    'no-ready-retry',
    'if (!expose()) {',
    'if (false) {'
  ],
  [
    'fake-hardcoded-info',
    'return window.__BC_BOT_SOURCE__.info();',
    "return { name: 'actual-engine', levels: 9 };"
  ],
  [
    'fake-hardcoded-state',
    'return window.__BC_BOT_SOURCE__.state();',
    "return { started: false, hero: { x: 12, z: 34 } };"
  ]
];
for (const [label, before, after] of mutations) {
  assert.ok(source.includes(before), label + ': mutation target must exist');
  const mutant = source.replace(before, after);
  assert.notEqual(mutant, source);
  assert.throws(() => verify(mutant), undefined, label + ': guard must reject the mutation');
}
console.log('Broken City META BOT readiness: original PASS, 4 mutations caught (2 hardcoded decoys).');
