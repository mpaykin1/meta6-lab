// ЛИСТ СРАВНЕНИЯ — делает сам GitHub (Claude, 18.11.2026). Чат больше не снимает compare.png вручную:
// у ChatGPT нет настоящего браузера, и из-за этого ни одна игра не доходила до слияния (разбор 18.11).
// node automation/asset-check/compare_sheet.mjs <папка пака> <out.png> [--ids a,b,c]
// Для каждого ассета: кадр «показан» минус «скрыт» через window.__ISOLATE__(id,on) → вырезка по рамке изменившихся
// пикселей. Рядом — кадр владельца из ZAKAZ (frame) и 3 кадра эталона (pack.json base / manifest reference).
// Итог: out.png + out.json {items:[{id, visible, area}], errors:[]}. Невидимый ассет = красная плитка «НЕ ВИДЕН».
import {chromium} from 'playwright-core';
import {existsSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import {resolve, join, dirname, extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {PNG} from 'pngjs';
import http from 'node:http';
import {relative} from 'node:path';

const [packArg, outArg, ...rest] = process.argv.slice(2);
if (!packArg || !outArg) { console.error('usage: compare_sheet.mjs <pack dir> <out.png> [--ids a,b]'); process.exit(2); }
const pack = resolve(packArg), out = resolve(outArg);
const onlyIds = (rest[rest.indexOf('--ids') + 1] || '').split(',').filter(Boolean);
const REPO = resolve(dirname(new URL(import.meta.url).pathname), '../..');
const chrome = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => p && existsSync(p));
const W = 640, H = 360, MAX_ITEMS = 32;
const json = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const report = {pack: packArg, items: [], reference: null, errors: []};

const meta = json(join(pack, 'pack.json')) || json(join(pack, 'manifest.json')) || {};
const zakaz = json(join(pack, 'ZAKAZ.json')) || {};
const zItems = new Map((zakaz.items || []).map(i => [i.id, i]));
const baseRel = meta.base || meta.reference || meta.etalon || null;
const refHtml = baseRel && [join(REPO, baseRel, 'index.html'), join(REPO, baseRel)].find(p => existsSync(p) && statSync(p).isFile());

// звуки не видны по определению — их на листе не требуем
const isAudio = id => /^(snd|sfx|audio|music)/i.test(id) || /^(audio|sound|sfx|music)$/i.test(zItems.get(id)?.kind || '');
const dataUrl = f => {
  const ext = extname(f).toLowerCase().slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,` + readFileSync(f).toString('base64');
};

function bbox(a, b, thr = 28) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1, n = 0;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    const i = (y * a.width + x) * 4;
    const d = (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2])) / 3;
    if (d > thr) { n++; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  }
  return n ? {x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, area: n / (a.width * a.height)} : {area: 0};
}

// file:// не грузит ES-модули (import из эталона) — поднимаем локальный сервер на корень репозитория
const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.wasm': 'application/wasm',
  '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.css': 'text/css', '.svg': 'image/svg+xml', '.bin': 'application/octet-stream'};
const server = http.createServer((req, res) => {
  const f = resolve(REPO, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(REPO) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, {'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream'}); res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = f => `http://127.0.0.1:${server.address().port}/${relative(REPO, f).split('\\').join('/')}`;
let browser;
try {
  browser = await chromium.launch({headless: true, executablePath: chrome || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required', '--no-proxy-server']});
  const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
  page.setDefaultTimeout(120000);
  page.on('pageerror', e => report.errors.push('pageerror: ' + e.message.slice(0, 200)));
  const html = join(pack, 'index.html');
  if (!existsSync(html)) throw Error('в паке нет index.html');
  await page.goto(url(html), {waitUntil: 'commit', timeout: 60000});
  await page.waitForFunction(() => typeof window.__ISOLATE__ === 'function', {timeout: 120000, polling: 500}).catch(() => {});
  await page.waitForTimeout(2500);
  const hasIso = await page.evaluate(() => typeof window.__ISOLATE__ === 'function');
  let ids = await page.evaluate(() => [...new Set([
    ...Object.keys(window.__PACK_PROBE__?.assets || {}),
    ...(window.__PACK__?.items || []).map(i => i.id)])]);
  if (onlyIds.length) ids = ids.filter(id => onlyIds.includes(id));
  else if (zItems.size) ids = [...ids.filter(id => zItems.has(id)), ...ids.filter(id => !zItems.has(id))];
  ids = ids.slice(0, MAX_ITEMS);
  const scene = (await page.screenshot({type: 'png'})).toString('base64');
  const tiles = [];
  if (!hasIso) report.errors.push('нет window.__ISOLATE__(id,on) — ассеты нельзя показать по одному (SPEC §изоляция)');
  for (const id of hasIso ? ids.filter(id => !isAudio(id)) : []) {
    try {
      // сначала навести камеру на ассет (как пункт меню ☰), затем заморозить кадр и показать/скрыть
      const focused = await page.evaluate(id => {
        const pr = window.__PACK_PROBE__;
        if (pr?.resume) pr.resume();
        if (typeof pr?.select === 'function') { pr.select(id); return 'select'; }
        const b = document.querySelector(`#ls button[data-id="${id}"], [data-id="${id}"]`);
        if (b) { b.click(); return 'menu'; }
        return '';
      }, id);
      if (focused) await page.waitForTimeout(1600);
      await page.evaluate(id => window.__ISOLATE__(id, true), id); await page.waitForTimeout(90);
      const onBuf = await page.screenshot({type: 'png'});
      await page.evaluate(id => window.__ISOLATE__(id, false), id); await page.waitForTimeout(90);
      const offBuf = await page.screenshot({type: 'png'});
      await page.evaluate(id => window.__ISOLATE__(id, true), id);
      const box = bbox(PNG.sync.read(onBuf), PNG.sync.read(offBuf));
      const visible = box.area > 0.0004;
      report.items.push({id, visible, area: +box.area.toFixed(5), audio: isAudio(id)});
      tiles.push({id, visible, box, shot: onBuf.toString('base64')});
    } catch (e) { report.errors.push(`${id}: ${String(e.message || e).slice(0, 160)}`); }
  }
  // эталон: 3 кадра с интервалом
  const refShots = [];
  if (refHtml) {
    const rp = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
    rp.setDefaultTimeout(120000);
    try {
      await rp.goto(url(refHtml), {waitUntil: 'commit', timeout: 60000}); await rp.waitForLoadState('load', {timeout: 120000}).catch(() => {});
      for (const t of [2500, 1500, 1500]) { await rp.waitForTimeout(t); refShots.push((await rp.screenshot({type: 'png'})).toString('base64')); }
      report.reference = baseRel;
    } catch (e) { report.errors.push('эталон: ' + String(e.message || e).slice(0, 160)); }
    await rp.close();
  } else report.errors.push('эталон не найден (pack.json base / manifest reference)');

  // сборка листа в браузере: canvas → PNG
  const rows = tiles.map(t => {
    const z = zItems.get(t.id) || {};
    const fr = z.frame && existsSync(join(pack, z.frame)) ? dataUrl(join(pack, z.frame)) : null;
    return {id: t.id, name: z.name_ru || t.id, visible: t.visible, box: t.box, shot: 'data:image/png;base64,' + t.shot, frame: fr};
  });
  const sheet = await browser.newPage({viewport: {width: 1000, height: 400}, deviceScaleFactor: 1});
  await sheet.setContent('<canvas id=c></canvas>');
  const png = await sheet.evaluate(async ({rows, refShots, scene, title}) => {
    const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
    const TW = 300, TH = 169, PAD = 10, ROW = TH + 34, top = 40 + TH + 40;
    const c = document.getElementById('c'); c.width = PAD + (TW + PAD) * 3; c.height = top + rows.length * ROW + PAD;
    const g = c.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#eee'; g.font = 'bold 18px sans-serif'; g.fillText(title, PAD, 22);
    const fit = (img, x, y, w, h, crop) => {
      g.fillStyle = '#000'; g.fillRect(x, y, w, h); if (!img) return;
      const sx = crop ? crop.x : 0, sy = crop ? crop.y : 0, sw = crop ? crop.w : img.width, sh = crop ? crop.h : img.height;
      const k = Math.min(w / sw, h / sh), dw = sw * k, dh = sh * k;
      g.drawImage(img, sx, sy, sw, sh, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    };
    const refs = refShots.length ? refShots : [];
    g.font = '13px sans-serif'; g.fillStyle = '#9cf';
    g.fillText(refs.length ? 'ЭТАЛОН (3 кадра)' : 'ЭТАЛОН НЕ НАЙДЕН — ниже вся сцена пака', PAD, 40);
    const heads = refs.length ? refs : [scene];
    for (let i = 0; i < heads.length; i++) fit(await load('data:image/png;base64,' + heads[i]), PAD + i * (TW + PAD), 46, TW, TH);
    g.fillStyle = '#9cf'; g.fillText('ОБРАЗЕЦ ВЛАДЕЛЬЦА', PAD, top - 8); g.fillText('НОВЫЙ АССЕТ (крупно, по рамке)', PAD + TW + PAD, top - 8); g.fillText('АССЕТ В СЦЕНЕ', PAD + 2 * (TW + PAD), top - 8);
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r], y = top + r * ROW, shot = await load(row.shot);
      fit(row.frame ? await load(row.frame) : null, PAD, y, TW, TH);
      if (!row.frame) { g.fillStyle = '#555'; g.fillText('нет кадра', PAD + 8, y + 20); }
      if (row.visible) {
        const b = row.box, m = 24, cx = Math.max(0, b.x - m), cy = Math.max(0, b.y - m);
        fit(shot, PAD + TW + PAD, y, TW, TH, {x: cx, y: cy, w: Math.min(640 - cx, b.w + 2 * m), h: Math.min(360 - cy, b.h + 2 * m)});
        fit(shot, PAD + 2 * (TW + PAD), y, TW, TH);
        g.strokeStyle = '#ff0'; const k = Math.min(TW / 640, TH / 360);
        g.strokeRect(PAD + 2 * (TW + PAD) + (TW - 640 * k) / 2 + b.x * k, y + (TH - 360 * k) / 2 + b.y * k, b.w * k, b.h * k);
      } else { g.fillStyle = '#600'; g.fillRect(PAD + TW + PAD, y, TW * 2 + PAD, TH); g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText('НЕ ВИДЕН — показ/скрытие ничего не меняет', PAD + TW + PAD + 12, y + TH / 2); }
      g.fillStyle = '#eee'; g.font = '13px sans-serif'; g.fillText(`${r + 1}. ${row.name}`.slice(0, 120), PAD, y + TH + 18);
    }
    return c.toDataURL('image/png');
  }, {rows, refShots, scene, title: `Лист сравнения: ${packArg} — ассетов ${rows.length}`});
  writeFileSync(out, Buffer.from(png.split(',')[1], 'base64'));
  report.ok = rows.length > 0;
  if (!rows.length) report.errors.push('ни одного ассета на листе');
} catch (e) {
  report.ok = false; report.errors.push(String(e.stack || e).slice(0, 600));
} finally { if (browser) await browser.close(); server.close(); }
writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(report, null, 1));
const {sheetVerdict} = await import('../../scripts/asset-guard/rules.mjs');
const verdict = sheetVerdict(report);
console.log(JSON.stringify({ok: report.ok, items: report.items.length, invisible: report.items.filter(i => !i.visible).map(i => i.id), errors: verdict}));
process.exit(verdict.length ? 1 : 0);
