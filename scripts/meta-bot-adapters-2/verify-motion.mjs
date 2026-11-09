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
  else if (window.__rr) real = { x: b.hero.x, z: b.hero.y };
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
      await page.waitForFunction(() => { try { return !!window.__META_BOT__?.state?.()?.hero; } catch { return false; } }, { timeout: 60000 });
      if (id === 'rainbow-acceleration') await page.locator('#bRide').click();
      else if (id === 'sumerki-i-pepel-2') {
        await page.locator('#btnStart').waitFor({ state: 'visible', timeout: 45000 });
        await page.locator('#btnStart').click();
      } else {
        const started = await page.evaluate(() => window.__META_BOT__.state().started);
        if (!started) { await page.locator('#playBtn').click({ timeout: 10000 }); }
      }
      await page.waitForFunction(() => window.__META_BOT__.state().started, null, { timeout: 35000 });
      const a = await pos(page);
      if (id === 'rainbow-acceleration') {
        await page.keyboard.down('a'); await page.waitForTimeout(650); await page.keyboard.up('a');
        const b = await pos(page);
        await page.keyboard.down('d'); await page.waitForTimeout(1100); await page.keyboard.up('d');
        const c = await pos(page);
        assert.ok(b.lane > a.lane + .08, id + ': KeyA did not move real rider left');
        assert.ok(c.lane < b.lane - .08, id + ': KeyD did not move real rider right');
      } else {
        await page.keyboard.down('w'); await page.waitForTimeout(2200); await page.keyboard.up('w');
        const b = await pos(page);
        await page.keyboard.down('d'); await page.waitForTimeout(1800); await page.keyboard.up('d');
        const c = await pos(page);
        const distance = Math.hypot(b.x - a.x, b.y - a.y) + Math.hypot(c.x - b.x, c.y - b.y);
        assert.ok(distance > .12, id + ': hero did not actually move from keyboard (distance=' + distance.toFixed(3) + ')');
      }
      assert.equal(errors.length, 0, id + ': game exception: ' + errors.join(' | '));
      console.log('B2 real-input movement OK: ' + id);
    } finally { await context.close(); }
  }
} finally { await browser.close(); server.close(); }
