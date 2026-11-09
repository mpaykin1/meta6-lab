// B2 — real browser motion check, independent of the META BOT claims.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from '../meta-bot/server.mjs';
import { ALLOWED_KEYS, STATE_KEYS } from '../meta-bot/checks.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const GAMES = ['twilight-isle-classic', 'twilight-isles'];
const DIST = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const LAUNCH = { args: [
  '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'
] };

export async function verifyOne({ browser, baseUrl, game, replacement = null }) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  try {
    if (replacement !== null) {
      await page.route(`**/games/${game}/bot-adapter.js`, route =>
        route.fulfill({ status: 200, contentType: 'text/javascript', body: replacement }));
    }
    await page.goto(`${baseUrl}/games/${game}/index.html`, {
      waitUntil: 'load', timeout: 60000
    });
    await page.waitForFunction(() => !!window.__META_BOT__ && !!window.__isle?.world
      && window.__isle.G.state === 'title', null, { timeout: 60000 });
    const shape = await page.evaluate(() => {
      const d = Object.getOwnPropertyDescriptor(window, '__META_BOT__');
      const bot = window.__META_BOT__;
      return {
        keys: Object.keys(bot), version: bot.version,
        frozen: Object.isFrozen(bot), writable: d.writable,
        configurable: d.configurable, setter: !!d.set,
        info: bot.info()
      };
    });
    assert.deepEqual(shape.keys.sort(), [...ALLOWED_KEYS].sort(), game + ': forbidden keys');
    assert.equal(shape.version, 1, game + ': incorrect API version');
    assert.equal(shape.frozen, true, game + ': mutable API');
    assert.equal(shape.writable, false, game + ': writable API');
    assert.equal(shape.configurable, false, game + ': configurable API');
    assert.equal(shape.setter, false, game + ': setter exposed');
    assert.ok(shape.info.name && Number.isInteger(shape.info.levels) &&
      shape.info.levels > 0, game + ': invalid info()');

    // Fresh visitors are auto-started by the real retention layer; its title button is hidden.
    // Returning visitors can still start using the real Enter keyboard shortcut.
    await page.waitForTimeout(850);
    if (!(await page.evaluate(() => window.__META_BOT__.state().started))) {
      await page.keyboard.press('Enter');
    }
    await page.waitForFunction(() => window.__META_BOT__.state().started,
      null, { timeout: 15000 });
    const snapshot = () => page.evaluate(() => {
      const s = window.__META_BOT__.state();
      const p = window.__isle.player.pos; // independent game truth, never the bot's report
      return { state: s, actual: { x: p.x, y: p.z } };
    });
    const check = ({ state: s, actual: p }) => {
      for (const key of STATE_KEYS) assert.ok(Object.hasOwn(s, key),
        game + ': state() missing ' + key);
      for (const k of ['started', 'levelDone', 'gameDone', 'alive', 'menuOpen']) {
        assert.equal(typeof s[k], 'boolean', game + ': invalid ' + k);
      }
      for (const k of ['level', 'enemies', 'weapons']) {
        assert.ok(Number.isInteger(s[k]) && s[k] >= 0, game + ': invalid ' + k);
      }
      for (const [label, pos] of [['hero', s.hero], ['goal', s.goal]]) {
        if (pos === null && label === 'goal') continue;
        assert.ok(pos && Number.isFinite(pos.x) && Number.isFinite(pos.y),
          game + ': invalid ' + label);
      }
      assert.ok(typeof s.layoutHash === 'string' && s.layoutHash.length > 0,
        game + ': missing world layout');
      if (s.progress !== undefined) assert.ok(Number.isFinite(s.progress),
        game + ': invalid progress');
      assert.ok(DIST(s.hero, p) < 0.001,
        game + ': hero position differs from actual game player');
    };
    const before = await snapshot();
    check(before);
    assert.equal(before.state.started, true);
    assert.equal(before.state.levelDone, false,
      game + ': levelDone incorrectly true before gameplay');
    assert.equal(before.state.gameDone, false,
      game + ': gameDone incorrectly true before gameplay');
    if (before.state.goal) assert.ok(DIST(before.state.hero, before.state.goal) > 0.01,
      game + ': hero falsely equals goal');

    // Hold one ordinary movement key for two seconds. Poll state while the key is down.
    const samples = [];
    await page.keyboard.down('KeyW');
    try {
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(100);
        const s = await snapshot();
        check(s);
        samples.push(s);
      }
    } finally {
      await page.keyboard.up('KeyW');
    }
    const last = samples.at(-1);
    assert.ok(DIST(before.actual, last.actual) > 0.1,
      game + ': real hero did not move from 2 seconds of KeyW');
    assert.ok(DIST(before.state.hero, last.state.hero) > 0.1,
      game + ': state().hero did not move from 2 seconds of KeyW');
    assert.ok(samples.some(s => DIST(before.actual, s.actual) > 0.1),
      game + ': no movement during key hold');
    return { game, moved: DIST(before.actual, last.actual) };
  } finally {
    await context.close();
  }
}

export async function withBrowser(fn) {
  const server = await serve(ROOT);
  const browser = await chromium.launch(LAUNCH);
  try { return await fn({ browser, baseUrl: server.url }); }
  finally { await browser.close(); server.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await withBrowser(async env => {
    for (const game of GAMES) {
      const r = await verifyOne({ ...env, game });
      console.log(`PASS ${game}: real movement ${r.moved.toFixed(3)} world units`);
    }
  });
}
