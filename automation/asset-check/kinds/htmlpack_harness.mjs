// Браузерный измеритель htmlpack/1. Playwright/Chrome взят из scripts/shared/verify-seven-browser.mjs.
// node htmlpack_harness.mjs <reference/index.html> <candidate/index.html>
import {chromium} from 'playwright-core';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {inflateSync} from 'node:zlib';

const [refPath, packPath] = process.argv.slice(2);
const result = {ok: false, reference: null, candidate: null};
const chrome = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => p && existsSync(p));

// PNG (8-bit RGB/RGBA) decoder, без сторонних изображительных библиотек.
function pixels(bin) {
  const b = Buffer.from(bin);
  if (b.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error('Screenshot not PNG');
  let offset = 8, width = 0, height = 0, channels = 4;
  const chunks = [];
  while (offset + 12 <= b.length) {
    const len = b.readUInt32BE(offset), kind = b.toString('ascii', offset + 4, offset + 8);
    const data = b.subarray(offset + 8, offset + 8 + len);
    if (kind === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      channels = data[9] === 2 ? 3 : data[9] === 6 ? 4 : 0;
      if (data[8] !== 8 || !channels || data[12] !== 0) throw Error('PNG format unsupported');
    }
    if (kind === 'IDAT') chunks.push(data);
    offset += len + 12;
    if (kind === 'IEND') break;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * channels;
  const out = Buffer.allocUnsafe(height * stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++], row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[row + x - channels] : 0;
      const c = y ? out[row + x - stride] : 0;
      const d = y && x >= channels ? out[row + x - stride - channels] : 0;
      let v = raw[src++];
      if (filter === 1) v += a;
      else if (filter === 2) v += c;
      else if (filter === 3) v += (a + c) >> 1;
      else if (filter === 4) {
        const p = a + c - d, pa = Math.abs(p - a), pb = Math.abs(p - c), pc = Math.abs(p - d);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? c : d;
      } else if (filter !== 0) throw Error('PNG filter invalid');
      out[row + x] = v & 255;
    }
  }
  return {width, height, channels, data: out};
}
function diff(a, b, threshold = 32) {
  const n = Math.min(a.data.length, b.data.length);
  const s = a.channels, t = b.channels;
  let count = 0, all = 0;
  for (let p = 0; p < a.width * a.height; p += 4) {
    const i = p * s, j = p * t;
    if (i + 2 >= n || j + 2 >= b.data.length) break;
    const d = (Math.abs(a.data[i] - b.data[j]) +
               Math.abs(a.data[i + 1] - b.data[j + 1]) +
               Math.abs(a.data[i + 2] - b.data[j + 2])) / 3;
    if (d > threshold) count++;
    all++;
  }
  return count / Math.max(1, all);
}
function features(a, b, fps, isolated = 1) {
  const {width, height, channels: c, data: d} = a;
  const corners = [[3, 3], [width - 4, 3], [3, height - 4], [width - 4, height - 4]];
  const bg = corners.map(([x, y]) => [d[(y * width + x) * c], d[(y * width + x) * c + 1], d[(y * width + x) * c + 2]]);
  let detail = 0, visible = 0, total = 0;
  const colors = new Set();
  for (let y = 3; y < height - 3; y += 4) for (let x = 3; x < width - 3; x += 4) {
    const i = (y * width + x) * c, j = (y * width + x + 3) * c;
    const h = ((y + 3) * width + x) * c;
    const rgb = [d[i], d[i + 1], d[i + 2]];
    colors.add(((rgb[0] >> 4) << 8) | ((rgb[1] >> 4) << 4) | (rgb[2] >> 4));
    const edge = (Math.abs(d[i] - d[j]) + Math.abs(d[i + 1] - d[j + 1]) + Math.abs(d[i + 2] - d[j + 2]) +
                  Math.abs(d[i] - d[h]) + Math.abs(d[i + 1] - d[h + 1]) + Math.abs(d[i + 2] - d[h + 2])) / 6;
    if (edge > 13) detail++;
    if (Math.min(...bg.map(z => (Math.abs(z[0] - rgb[0]) + Math.abs(z[1] - rgb[1]) + Math.abs(z[2] - rgb[2])) / 3)) > 23) visible++;
    total++;
  }
  return {visible: +(visible / total).toFixed(5), detail: +(detail / total).toFixed(5),
          motion: +diff(a, b, 12).toFixed(5), colors: colors.size,
          fps: Math.round(fps), isolated: +isolated.toFixed(5)};
}
async function textOutsideMenu(page) {
  return page.evaluate(() => [...document.querySelectorAll('body *')].some(el => {
    if (el.closest('#pn') || el.closest('#mb') || el.closest('#err') ||
        ['SCRIPT', 'STYLE', 'CANVAS', 'SVG', 'PATH'].includes(el.tagName) || el.children.length) return false;
    if (!el.textContent.trim()) return false;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity !== 0 &&
           r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 &&
           r.left < innerWidth && r.top < innerHeight;
  }));
}
async function measure(browser, file, isPack) {
  const page = await browser.newPage({viewport: {width: 640, height: 360}, deviceScaleFactor: 1});
  const report = {items: {}, errors: [], screen_text: false};
  page.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
  page.on('console', e => {if (e.type() === 'error') report.errors.push('console: ' + e.text());});
  try {
    await page.goto(pathToFileURL(resolve(file)).href, {waitUntil: 'domcontentloaded', timeout: 30000});
    await page.waitForFunction(() => window.__PACK__?.items?.length > 0 && !!window.__STATE__,
                              {timeout: 30000});
    const ids = await page.evaluate(() => window.__PACK__.items.map(o => o.id));
    for (const id of ids) {
      await page.locator('#mb').click();
      await page.locator('#ls button[data-id="' + id + '"]').click();
      await page.waitForTimeout(140);
      const first = pixels(await page.screenshot({type: 'png'}));
      const fps = await page.evaluate(() => new Promise(done => {
        let n = 0, started = performance.now();
        function next(now) {
          n++;
          if (now - started >= 500) done(n * 1000 / (now - started));
          else requestAnimationFrame(next);
        }
        requestAnimationFrame(next);
      }));
      const second = pixels(await page.screenshot({type: 'png'}));
      let isolated = 1;
      if (isPack) {
        const canHide = await page.evaluate(id => !!window.__PACK_PROBE__?.assets?.[id] &&
          typeof window.__PACK_PROBE__.setHidden === 'function', id);
        if (canHide) {
          await page.evaluate(id => window.__PACK_PROBE__.setHidden(id, true), id);
          await page.waitForTimeout(45);
          const off = pixels(await page.screenshot({type: 'png'}));
          await page.evaluate(id => window.__PACK_PROBE__.setHidden(id, false), id);
          isolated = diff(second, off, 28);
        } else if (await page.evaluate(id => window.__PACK__?.items.some(i => i.id === id && i.isNew), id)) {
          isolated = 0;
        }
      }
      report.items[id] = features(first, second, fps, isolated);
      if (await textOutsideMenu(page)) report.screen_text = true;
    }
  } finally {await page.close();}
  return report;
}
let browser;
try {
  if (!refPath || !packPath) throw Error('usage: harness reference.html pack.html');
  browser = await chromium.launch({headless: true, executablePath: chrome || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--enable-unsafe-swiftshader',
           '--use-gl=angle', '--use-angle=swiftshader']});
  result.reference = await measure(browser, refPath, false);
  result.candidate = resolve(refPath) === resolve(packPath) ? result.reference : await measure(browser, packPath, true);
  result.ok = true;
} catch (err) {
  result.error = String(err?.stack || err);
} finally {
  if (browser) await browser.close();
}
process.stdout.write(JSON.stringify(result));
process.exitCode = result.ok ? 0 : 1;
