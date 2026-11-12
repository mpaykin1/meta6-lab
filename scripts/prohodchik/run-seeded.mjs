// Real browser exploration: reuse protected META BOT core and the game's original strategy.
// Usage: node scripts/prohodchik/run-seeded.mjs games/veil-terraces 17
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serve} from '../meta-bot/server.mjs';
import {loadGame, runOnce} from '../meta-bot/core.mjs';
import {seededRouteVariants, withSeededRoute} from './seeded-routes.mjs';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const relative = process.argv[2];
assert.match(relative || '', /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/, 'provide an existing game path');
const gameDir = resolve(root, relative);
assert.ok(gameDir.startsWith(root + '/'), 'game must be inside repository');
assert.ok(existsSync(join(gameDir, 'index.html')), 'game index.html missing');
const seed = Number(process.argv[3] ?? 17);
const plans = seededRouteVariants(seed);
const {cfg, strategy} = await loadGame(gameDir);
const server = await serve(root);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
let successful = true;
try {
  for (let variant = 0; variant < plans.length; variant++) {
    const routeStrategy = withSeededRoute(strategy, plans[variant]);
    for (const viewportName of ['desktop', 'mobile']) {
      const r = await runOnce({
        baseUrl: server.url, gameDir, repoRoot: root, viewportName,
        cfg, strategy: routeStrategy, browser
      });
      console.log(JSON.stringify({
        game: relative, seed, variant, viewport: viewportName,
        levels: r.levels, passed: r.passed, ok: r.ok, fps: r.fps, errors: r.errors
      }));
      if (!r.ok || r.passed !== r.levels) successful = false;
    }
  }
} finally {
  await browser.close();
  server.close();
}
if (!successful) process.exitCode = 1;
