import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync('shared/render/frame-quality.js', 'utf8');
const game = readFileSync('games/broken-city/index.html', 'utf8');

function verify(controllerSource, gameSource) {
  const context = {};
  runInNewContext(controllerSource, context, { timeout: 1000 });
  const create = context.MetaQuality?.create;
  assert.equal(typeof create, 'function');
  const controller = create({ targetMs: 16.67, minScale: 0.65, maxScale: 1 });
  assert.equal(typeof controller.suspend, 'function');

  // Sustained slow GPU frames still lower actual resolution; no unconditional speedup.
  for (let i = 0; i < 80; i++) controller.sample(350);
  assert.ok(controller.scale < 1, 'sustained 350ms frames must reduce DPR');
  const reduced = controller.scale;

  // Background rAF throttling and the first resumed frame are not GPU pressure.
  controller.suspend();
  assert.equal(controller.averageMs, 16.67, 'resume must reset stale frame-time average');
  assert.equal(controller.sample(900), reduced, 'a single resumed frame must preserve DPR');
  assert.equal(controller.averageMs, 16.67, 'resumed frame must not poison GPU average');

  for (let i = 0; i < 120; i++) controller.sample(8);
  assert.ok(controller.scale > reduced, 'quality must recover after sustained fast frames');

  assert.match(gameSource, /document\.addEventListener\('visibilitychange',\s*\(\)\s*=>\s*qualityController\.suspend\(\)/);
  assert.match(gameSource, /else qualityController\.suspend\(\);/);
}

verify(source, game);

const mutations = [
  ['skip-resume-filter', source,
    'if(resuming){resuming=false;return scale;}',
    'if(resuming){resuming=false;}'],
  ['keep-stale-average', source,
    'function suspend(){moving=targetMs;counter=0;slow=fast=0;resuming=true;}',
    'function suspend(){resuming=true;}'],
  ['cheat-skip-all-slow-frames', source,
    'ms=Math.min(ms,1000);',
    'if(ms>250)return scale;ms=Math.min(ms,1000);'],
  ['ignore-tab-return', game,
    "document.addEventListener('visibilitychange', () => qualityController.suspend(), { passive: true });",
    '/* broken: missing visibility resume handling */'],
  ['ignore-game-pause', game,
    'else qualityController.suspend();',
    'else {}']
];
for (const [name, original, from, to] of mutations) {
  assert.ok(original.includes(from), name + ': mutation anchor missing');
  const mutated = original.replace(from, to);
  assert.notEqual(mutated, original, name + ': mutation not applied');
  assert.throws(
    () => verify(original === source ? mutated : source, original === game ? mutated : game),
    undefined,
    name + ': defect escaped the regression trap'
  );
}
console.log('PASS: visibility resume quality and five regressions (including a deceptive slow-frame shortcut)');
