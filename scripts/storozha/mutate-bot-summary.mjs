// K3/K5: a daily bot report must never invent a game PASS.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {passedGamesFromLog} from './bot-summary.mjs';

const good = '2026Z ▶ games/veil-terraces\n2026Z   ✅ mobile: уровней 6, пройдено 6, FPS 35\n' +
  '2026Z   ✅ desktop: уровней 6, пройдено 6, FPS 25\n';
const bad = good + '2026Z ▶ games/broken-city\n2026Z   ✅ mobile: уровней 3, пройдено 3, FPS 40\n' +
  '2026Z   ❌ desktop: уровней 3, пройдено 2, FPS 30\n';
function verify(parser) {
  assert.deepEqual(parser(good), ['veil-terraces'], 'One confirmed game, both viewports');
  assert.deepEqual(parser(bad), ['veil-terraces'], 'Failed desktop cannot count as game PASS');
  assert.deepEqual(parser('2026Z ▶ games/veil-terraces\n2026Z ✅ mobile: уровней 6, пройдено 5'),
    [], 'Partial completion is red even if emoji claims success');
  assert.deepEqual(parser('2026Z ▶ games/veil-terraces\n2026Z ✅ mobile: уровней 6, пройдено 6'),
    [], 'One viewport does not prove whole game');
  assert.deepEqual(parser('no META BOT output'), [], 'Cannot hardcode games');
}
verify(passedGamesFromLog);
const source = readFileSync(new URL('./bot-summary.mjs', import.meta.url), 'utf8');
const mutants = [
  ['ignore failed desktop', "!x.failed && x.mobile && x.desktop", "x.mobile"],
  ['ignore partial levels', 'passed !== total', 'false'],
  ['hardcode a known game', 'return [...games].filter', "return [['veil-terraces',{mobile:true,desktop:true,failed:false}]].filter"],
  ['ignore missing desktop', 'x.mobile && x.desktop', 'x.mobile']
];
for (const [name, needle, replacement] of mutants) {
  assert.ok(source.includes(needle), 'Missing mutation target: ' + name);
  const body = source.replace(needle, replacement);
  assert.notEqual(body, source, 'No mutation generated: ' + name);
  const parser = Function(body.replace(/\bexport\s+/g, '') + '\nreturn passedGamesFromLog;')();
  assert.throws(() => verify(parser), assert.AssertionError, 'MUTATION_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('BOT_SUMMARY_MUTATIONS_PASS ' + mutants.length);
