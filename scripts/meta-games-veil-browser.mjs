import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const url = new URL('file://' + resolve('meta-games-worlds/veil-terraces/index.html'));
const browser = await chromium.launch({ headless: true, args: [
  '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist', '--disable-dev-shm-usage'
] });
try {
  const errors = [];
  async function visit(context) {
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.goto(url.href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__metaGamesState?.().chunks >= 9, null, { timeout: 45000 });
    const canvas = page.locator('#screen');
    const rect = await canvas.boundingBox();
    const gl = await page.evaluate(() => {
      const context = document.querySelector('#screen').getContext('webgl2');
      return !!context && context.getError() === context.NO_ERROR;
    });
    assert.equal(gl, true, 'WebGL2 render must be initialized without GL errors');
    assert.equal(await page.evaluate(() => scrollX === 0 && scrollY === 0), true);
    assert.ok(rect.width > 200 && rect.height > 200);
    return { page, rect, canvas };
  }
  const desktop = await browser.newContext({ viewport: { width: 1050, height: 720 } });
  const { page: pc, rect: pcRect } = await visit(desktop);
  const before = await pc.evaluate(() => window.__metaGamesState());
  await pc.keyboard.down('w');
  await pc.waitForTimeout(750);
  await pc.keyboard.up('w');
  const after = await pc.evaluate(() => window.__metaGamesState());
  assert.ok(Math.hypot(after.x - before.x, after.z - before.z) > .05, 'Desktop W changes hero position');
  assert.ok(after.chunks <= 25, 'Streaming has a bounded cache');
  const pcRect2 = await pc.locator('#screen').boundingBox();
  assert.deepEqual(pcRect2, pcRect, 'Canvas fixed while the hero moves');

  const phone = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2
  });
  const { page: mobile, rect: phoneRect } = await visit(phone);
  assert.equal(await mobile.locator('#jump').isVisible(), true);
  await mobile.locator('#menuButton').click();
  assert.equal(await mobile.locator('#menu').isVisible(), true);
  await mobile.locator('#resume').click();
  assert.equal(await mobile.locator('#menu').isVisible(), false);
  const phoneRect2 = await mobile.locator('#screen').boundingBox();
  assert.deepEqual(phoneRect2, phoneRect);
  assert.equal(await mobile.evaluate(() => scrollX === 0 && scrollY === 0), true);
  assert.deepEqual(errors, [], 'No runtime JavaScript or console errors');
  console.log('VEIL TERRACES browser smoke PASS: GL, movement, fixed viewport, menu, mobile canvas');
} finally {
  await browser.close();
}
