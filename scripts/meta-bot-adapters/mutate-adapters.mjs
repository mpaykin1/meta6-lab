// K5: each corruption is served only to an isolated Chromium page, never written to the game.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, GAMES, withBrowser, verifyOne } from './verify-adapters.mjs';

const cases = [
  {
    name: 'hero-always-origin',
    find: /hero:\s*\{\s*x:\s*p\.x,\s*y:\s*p\.z\s*\}/,
    replace: 'hero: { x: 0, y: 0 }'
  },
  {
    name: 'cheat-hero-equals-goal',
    find: /hero:\s*\{\s*x:\s*p\.x,\s*y:\s*p\.z\s*\}/,
    replace: 'hero: { x: goal?.x ?? p.x, y: goal?.y ?? p.z }'
  },
  {
    name: 'cheat-level-always-complete',
    find: /levelDone:\s*G\.state\s*===\s*'victory'/,
    replace: 'levelDone: true'
  },
  {
    name: 'state-throws',
    find: /state\(\)\s*\{/,
    replace: "state() { throw new Error('state corrupted');"
  }
];
await withBrowser(async env => {
  for (const game of GAMES) {
    const src = fs.readFileSync(path.join(ROOT, 'games', game, 'bot-adapter.js'), 'utf8');
    for (const item of cases) {
      assert.match(src, item.find, `${game}: expected mutation anchor not found`);
      const bad = src.replace(item.find, item.replace);
      assert.notEqual(src, bad, `${game}: ineffective mutation ${item.name}`);
      let rejected = false;
      try { await verifyOne({ ...env, game, replacement: bad }); }
      catch (err) {
        rejected = true;
        console.log(`PASS rejected ${game}/${item.name}: ${String(err.message).slice(0, 180)}`);
      }
      assert.ok(rejected, `${game}: FAILED TO CATCH mutation ${item.name}`);
    }
  }
});
