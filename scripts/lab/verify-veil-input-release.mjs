import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from '../meta-bot/server.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const server = await serve(root);
const browser = await chromium.launch({ args: [
  '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'
] });
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1050, height: 720 },
      isMobile: mobile, hasTouch: mobile
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(server.url + '/games/veil-terraces/');
    await page.waitForFunction(() => window.__META_BOT__?.player);
    await page.keyboard.down('w');
    await page.waitForTimeout(250);
    await page.evaluate(() => dispatchEvent(new Event('blur')));
    await page.keyboard.up('w');
    const stopped = await page.evaluate(() => window.__META_BOT__.player);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.__META_BOT__.player);
    assert(Math.hypot(after.x - stopped.x, after.z - stopped.z) < .02, 'hero drifts after blur');
    if (mobile) {
      const client = await context.newCDPSession(page);
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart', touchPoints: [{ x: 50, y: 300, id: 7 }]
      });
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove', touchPoints: [{ x: 95, y: 280, id: 7 }]
      });
      await page.waitForTimeout(150);
      await page.evaluate(() => dispatchEvent(new Event('blur')));
      const before = await page.evaluate(() => window.__META_BOT__.player);
      await page.waitForTimeout(400);
      const final = await page.evaluate(() => window.__META_BOT__.player);
      assert(Math.hypot(final.x - before.x, final.z - before.z) < .02, 'fallback touch remains active');
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    assert.deepEqual(errors, []);
    console.log('VEIL INPUT RELEASE PASS:', mobile ? 'phone keyboard + real fallback touch' : 'desktop');
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
