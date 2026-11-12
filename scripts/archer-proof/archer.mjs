// Comparative visual proof: real game, one seed and identical inputs, no test-only game behavior.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { serve } from '../meta-bot/server.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, '.archer-proof');
const selftest = process.argv.includes('--selftest');
const baseSHA = process.env.ARCHER_BASE_SHA || 'HEAD^';
const game = '/games/archer-in-the-fog/';
fs.mkdirSync(output, { recursive: true });

function extractPrevious() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'archer-before-'));
  const git = spawnSync('git', ['archive', baseSHA, 'games/archer-in-the-fog'], {
    cwd: root, maxBuffer: 120 * 1024 * 1024
  });
  if (git.status !== 0) throw new Error('git archive baseline: ' + git.stderr.toString());
  const tar = spawnSync('tar', ['-x', '-C', temp], { input: git.stdout });
  if (tar.status !== 0) throw new Error('extract previous: ' + tar.stderr.toString());
  return temp;
}

function seedScript() {
  let state = 0xA12C2026;
  Math.random = function () {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

async function openGame(browser, url, label, viewport) {
  const mobile = viewport === 'mobile';
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 },
    isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1
  });
  await context.addInitScript(seedScript);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', e => {
    if (e.type() === 'error' && !/favicon/i.test(e.text())) errors.push(e.text());
  });
  await page.goto(url + game, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => !!window.__A, null, { timeout: 20000 });
  await page.waitForTimeout(1100);
  if (await page.locator('#menu:not(.hide) #bPlay').isVisible()) await page.locator('#bPlay').click();
  await page.waitForFunction(() => window.__A?.G?.mode === 'play', null, { timeout: 15000 });
  if (mobile) await page.touchscreen.tap(195, 410);
  else await page.mouse.click(640, 360);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(output, label + '-' + viewport + '.png') });
  return { context, page, errors };
}

async function pixelDifference(page, selector) {
  const mark = page.locator(selector);
  if (!(await mark.count()) || !(await mark.isVisible())) return 0;
  // A transparent ancestor can leave a layout box while drawing no pixels.
  // Check effective visibility before sampling the actual screenshot difference.
  const effectiveOpacity = await mark.evaluate(el => {
    let opacity = 1;
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const css = getComputedStyle(node);
      if (css.display === 'none' || css.visibility !== 'visible') return 0;
      opacity *= Number(css.opacity);
    }
    return opacity;
  });
  if (effectiveOpacity < 0.05) return 0;
  const rect = await mark.boundingBox();
  if (!rect || rect.width < 8 || rect.height < 8) return 0;
  const clip = {
    x: Math.max(0, Math.floor(rect.x)),
    y: Math.max(0, Math.floor(rect.y)),
    width: Math.floor(rect.width),
    height: Math.floor(rect.height)
  };
  // Isolate actual screen pixels of the indicator, not an HTML attribute or hidden DOM node.
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas#c');
    if (canvas) canvas.style.visibility = 'hidden';
  });
  const visible = PNG.sync.read(await page.screenshot({ clip, animations: 'disabled' }));
  await mark.evaluate(el => { el.style.visibility = 'hidden'; });
  const hidden = PNG.sync.read(await page.screenshot({ clip, animations: 'disabled' }));
  await mark.evaluate(el => { el.style.visibility = ''; });
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas#c');
    if (canvas) canvas.style.visibility = '';
  });
  let count = 0;
  for (let i = 0; i < visible.data.length; i += 4) {
    const d = Math.abs(visible.data[i] - hidden.data[i])
      + Math.abs(visible.data[i + 1] - hidden.data[i + 1])
      + Math.abs(visible.data[i + 2] - hidden.data[i + 2]);
    if (d > 75) count++;
  }
  return count;
}

async function inspect(page) {
  const hook = await page.evaluate(() => window.__metaBot?.state?.() || null);
  const pixels = await pixelDifference(page, '#archerTarget');
  return {
    state: !!hook?.goalVisible && hook?.gameMode === 'play',
    pixels, visual: pixels >= 48,
    phase: hook?.phase || null,
    version: hook?.version || null
  };
}

async function threatProof(page) {
  const triggered = await page.waitForFunction(() => {
    const g = window.__A?.G;
    return g?.mode === 'play' && g.rageMax > 0 && g.rage / g.rageMax > 0.75;
  }, null, { timeout: 25000 }).then(() => true).catch(() => false);
  if (!triggered) return { state: false, redPixels: 0, visual: false };
  const hook = await page.evaluate(() => window.__metaBot?.state?.() || null);
  const mark = page.locator('#archerTarget');
  if (!(await mark.count()) || !(await mark.isVisible())) {
    return { state: !!hook?.danger, redPixels: 0, visual: false };
  }
  const box = await mark.boundingBox();
  const clip = { x: Math.floor(box.x), y: Math.floor(box.y),
    width: Math.floor(box.width), height: Math.floor(box.height) };
  const screenshot = PNG.sync.read(await page.screenshot({ clip, animations: 'disabled' }));
  let redPixels = 0;
  for (let i = 0; i < screenshot.data.length; i += 4) {
    const r = screenshot.data[i], g = screenshot.data[i + 1], b = screenshot.data[i + 2];
    if (r > 180 && g < r * 0.7 && b < r * 0.75) redPixels++;
  }
  return { state: !!hook?.danger, redPixels, visual: redPixels >= 48 };
}

async function fpsSample(page) {
  return page.evaluate(async () => {
    const frames = [];
    let last = 0;
    await new Promise(resolve => {
      const start = performance.now();
      function step(now) {
        if (last) frames.push(now - last);
        last = now;
        if (now - start < 3000) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
    return Math.round(1000 / (frames.reduce((a, b) => a + b, 0) / frames.length));
  });
}

const browser = await chromium.launch({
  headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const newer = await serve(root);
let older;
let success = true;
try {
  if (!selftest) older = await serve(extractPrevious());
  for (const viewport of ['mobile', 'desktop']) {
    if (selftest) {
      const { context, page } = await openGame(browser, newer.url, 'baseline', viewport);
      const baseline = await inspect(page);
      await page.evaluate(() => {
        const node = document.createElement('div');
        node.id = 'archerTarget';
        node.style.cssText = 'position:fixed;top:35px;left:40%;width:100px;height:100px;opacity:0';
        document.body.appendChild(node);
        window.__metaBot = { state: () => ({ goalVisible: true, gameMode: 'play' }) };
      });
      const invisible = await inspect(page);
      const passed = !baseline.visual && !invisible.visual && invisible.state;
      console.log(JSON.stringify({ viewport, baseline, invisible, noImprovementRed: !baseline.visual, invisibleHookRed: invisible.state && !invisible.visual, passed }));
      success &&= passed;
      await context.close();
      continue;
    }
    const b = await openGame(browser, older.url, 'before', viewport);
    const a = await openGame(browser, newer.url, 'after', viewport);
    const before = await inspect(b.page);
    const after = await inspect(a.page);
    const beforeFps = await fpsSample(b.page);
    const afterFps = await fpsSample(a.page);
    const beforeThreat = await threatProof(b.page);
    const afterThreat = await threatProof(a.page);
    const passed = !before.state && !before.visual && after.state && after.visual
      && !beforeThreat.state && !beforeThreat.visual && afterThreat.state && afterThreat.visual
      && beforeFps <= afterFps && b.errors.length === 0 && a.errors.length === 0;
    console.log(JSON.stringify({ viewport, before, after, beforeThreat, afterThreat, beforeFps, afterFps,
      errorsBefore: b.errors, errorsAfter: a.errors, passed }));
    success &&= passed;
    await b.context.close();
    await a.context.close();
  }
} finally {
  if (older) older.close();
  newer.close();
  await browser.close();
}
process.exit(success ? 0 : 1);
