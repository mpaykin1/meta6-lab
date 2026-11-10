import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from '../meta-bot/server.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const list = process.argv.slice(2).length ? process.argv.slice(2) : ['broken-city','rainbow-acceleration','sumerki-i-pepel-2'];
const server = await serve(root);
const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'] });
const pos = async page => page.evaluate(() => {
  const b = window.__META_BOT__.state();
  let real;
  if (window.__isle) real = window.__isle.player.pos;
  else if (window.__G) real = window.__G.heroState.pos;
  else if (window.__rr) { const live = window.__rr.state; real = { x: b.hero.x, z: b.hero.y }; if (Math.abs(live.X - b.lane) > 1e-6 || Math.abs(live.S - b.segmentDistance) > 1e-6) throw new Error('rainbow observer is not reading real steering/track state'); }
  else throw new Error('independent engine position unavailable');
  if (Math.hypot(b.hero.x - real.x, b.hero.y - real.z) > 1e-6) throw new Error('observer is not tracking real player');
  return { x: b.hero.x, y: b.hero.y, lane: b.lane, started: b.started };
});
try {
  for (const id of list) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message || e)));
    try {
      await page.goto(server.url + '/games/' + id + '/index.html', { waitUntil: 'load', timeout: 60000 });
      await page.waitForFunction(() => { try { return !!window.__META_BOT__?.state?.()?.hero; } catch { return false; } }, null, { timeout: 60000 });
      if (id === 'rainbow-acceleration') await page.locator('#bRide').click();
      else if (id === 'sumerki-i-pepel-2') {
        await page.locator('#btnStart').waitFor({ state: 'visible', timeout: 45000 });
        await page.locator('#btnStart').click();
      } else {
        const started = await page.evaluate(() => window.__META_BOT__.state().started);
        if (!started && await page.evaluate(() => window.__G?.G?.state === 'title')) { await page.locator('#playBtn').click({ timeout: 10000 }); }
      }
      await page.waitForFunction(() => window.__META_BOT__.state().started, null, { timeout: 35000 });
      const a = await pos(page);
      if (id === 'rainbow-acceleration') {
        // Short pulses avoid crossing the authored road edge and triggering airborne recovery.
        await page.keyboard.down('a'); await page.waitForTimeout(180); await page.keyboard.up('a');
        const b = await pos(page);
        assert.ok(b.lane > a.lane + .02, id + ': KeyA did not move real rider left');
        await page.locator('#bBack').click();
        await page.locator('#bRide').click();
        await page.waitForFunction(() => window.__META_BOT__.state().started);
        const c = await pos(page);
        await page.keyboard.down('d'); await page.waitForTimeout(180); await page.keyboard.up('d');
        const d = await pos(page);
        assert.ok(d.lane < c.lane - .02, id + ': KeyD did not move real rider right');
      } else {
        // A spawn can face a solid ruin wall. Probe independent real key inputs
        // in both axes rather than misclassifying collision as broken controls.
        // All distances come from the engine's live position, not bot progress.
        // Broken City's tiny-hero biome moves only 0.75 units/sec, and CI WebGL
        // may render at a few FPS. Observe real play (not the ending transition),
        // use genuine run+direction keys, and keep the original 0.12m gate.
        if (id === 'broken-city') {
          await page.waitForFunction(() => window.__G?.G?.state === 'play',
            null, { timeout: 35000 });
          await page.keyboard.down('Shift');
        }
        let previous = await pos(page);
        let distance = 0;
        try {
          for (const key of ['w', 's', 'a', 'd']) {
            await page.keyboard.down(key);
            await page.waitForTimeout(id === 'broken-city' ? 2000 : 1200);
            await page.keyboard.up(key);
            const current = await pos(page);
            distance += Math.hypot(current.x - previous.x, current.y - previous.y);
            previous = current;
          }
        } finally {
          if (id === 'broken-city') await page.keyboard.up('Shift');
        }
        assert.ok(distance > .12, id + ': hero did not actually move from keyboard in any direction (distance=' + distance.toFixed(3) + ')');
      }
      assert.equal(errors.length, 0, id + ': game exception: ' + errors.join(' | '));
      console.log('B2 real-input movement OK: ' + id);
    } finally { await context.close(); }
  }
} finally { await browser.close(); server.close(); }
