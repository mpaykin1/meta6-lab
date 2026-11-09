// Permanent B2 no-repeat trap. No Playwright or network required (runs in KONTUR Guard).
// Verify that the real game uses the supplied deterministic seed when present,
// but generates independent seeds for separate ordinary play sessions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const games = ['twilight-isle-classic', 'twilight-isles'];
const expression = /(buildWorld\(Number\.isFinite\(data\.seed\)\s*\?\s*data\.seed\s*:\s*)(.*?)(,\s*biome0\);)/;

function check(html, game) {
  const match = html.match(expression);
  assert.ok(match, game + ': game must preserve explicitly provided world seeds');
  const fallback = match[2];
  const evaluate = (random, seed) => {
    const m = Object.create(Math);
    m.random = () => random;
    return vm.runInNewContext(
      `Number.isFinite(data.seed) ? data.seed : ${fallback}`,
      { Number, Math: m, DEFAULT_SEED: 1337, data: { seed } },
      { timeout: 1000 }
    );
  };
  const a = evaluate(0.12, undefined);
  const b = evaluate(0.82, undefined);
  assert.ok(Number.isInteger(a) && Number.isInteger(b), game + ': seed must be an integer');
  assert.notEqual(a, b, game + ': repeated deterministic starting layout across sessions');
  assert.equal(evaluate(0.12, 77352), 77352, game + ': user-supplied seed not preserved');
}

for (const game of games) {
  const html = fs.readFileSync(path.join(root, 'games', game, 'index.html'), 'utf8');
  check(html, game);
  const mutations = [
    ['fixed-default-seed', 'DEFAULT_SEED'],
    ['hardcoded-literal-seed', '1337'],
    ['fake-random-zero', '(Math.random() * 0) | 0']
  ];
  for (const [name, replacement] of mutations) {
    const broken = html.replace(expression, (_whole, before, _fallback, after) =>
      before + replacement + after);
    assert.notEqual(broken, html, game + ': failed to mutate ' + name);
    assert.throws(() => check(broken, game), undefined,
      game + ': mutation escaped ' + name);
    console.log('KONTUR_MUTATION_CAUGHT ' + game + '/' + name);
  }
}
console.log('MUTATE_SEED_LAYOUT_PASS: all fixed/repeated-seed mutations rejected');
