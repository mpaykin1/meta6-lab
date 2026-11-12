// Checks seeded routes and real player-input delegation without requiring Chromium.
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const args = process.argv.slice(2);
if (args.length && (args[0] !== '--module' || !args[1])) throw new Error('Expected --module <file>');
const source = args.length ? pathToFileURL(resolve(args[1])).href : './seeded-routes.mjs';
const {seededRouteVariants, withSeededRoute} = await import(source);

const a = seededRouteVariants(17);
const b = seededRouteVariants(17);
const c = seededRouteVariants(81);
assert.deepEqual(a, b, 'the same seed must reproduce the same physical movements');
assert.notDeepEqual(a, c, 'different seeds must explore different movement paths');
assert.equal(a.length, 3);
assert.equal(new Set(a.map(path => JSON.stringify(path.map(({dx, dy}) => [dx, dy])))).size, 3,
  'three distinct physical directions, not merely different timings');
for (const plan of a) {
  assert.equal(plan.length, 5);
  for (const step of plan) {
    assert.ok(Math.abs(step.dx) <= 1 && Math.abs(step.dy) <= 1);
    assert.ok(step.ms >= 100 && step.ms <= 500);
  }
}
const actions = [];
let state = {level: 0, levelDone: false, gameDone: false, alive: true};
const ctx = {
  state: () => ({...state}),
  joystick: async (dx, dy, ms) => actions.push(['joystick', dx, dy, ms]),
  wait: async ms => actions.push(['wait', ms])
};
const original = {
  start: async () => actions.push(['start']),
  playLevel: async (_ctx, level) => actions.push(['original', level])
};
const wrapped = withSeededRoute(original, a[0]);
await wrapped.start(ctx);
await wrapped.playLevel(ctx, 0);
assert.equal(actions[0][0], 'start');
assert.equal(actions.filter(x => x[0] === 'joystick').length, 5, 'only player controls explore routes');
assert.deepEqual(actions.at(-1), ['original', 0], 'real existing strategy must play the level');
assert.ok(!actions.some(x => x[0] === 'wait'), 'route cannot silently replace actual input');
state = {...state, alive: false};
actions.length = 0;
await wrapped.playLevel(ctx, 0);
assert.deepEqual(actions, [], 'do not drive a dead hero or fake a completion');
assert.throws(() => seededRouteVariants(-1), /seed/);
assert.throws(() => withSeededRoute(original, [{dx: 2, dy: 0, ms: 200}]), /route/);
console.log('SEEDED_ROUTES_PASS: 3 reproducible real-input paths, delegation, death and deception guards');
