#!/usr/bin/env node
// ТЕЛЕФОН БЕЗ ТОРМОЗОВ — бот-замерщик нагрузки на видеокарту телефона.
// Правило: rules/05-proizvoditelnost-i-razvitie/TELEFON_BEZ_TORMOZOV.md
// Запуск: node scripts/telefon-bez-tormozov.mjs <путь/к/index.html | https://адрес-игры> [--json out.json]
// Код выхода 0 = все лимиты соблюдены, 1 = превышен хотя бы один лимит, 2 = игра не запустилась.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Лимиты для телефона (средний телефон, 390×844). Менять только с решения владельца.
export const LIMITS = {
  lights: 4,            // источников света (направленные+точечные+прожекторы+небо), включая выключенные (сила 0)
  offLights: 0,         // выключенных ламп (сила 0), которые всё равно стоят в сцене и считаются
  scenePasses: 1,       // сколько раз за кадр рисуется вся сцена (зеркала, тени, второй вид = лишние разы)
  draws: 150,           // отдельных отрисовок за кадр
  triangles: 150000,    // треугольников за кадр
  bufferKB: 64,         // КБ геометрии, отправленной в видеокарту за обычный кадр (медиана)
  textureKB: 128,       // КБ текстур, перезалитых за обычный кадр (медиана)
  cpuPixelOps: 0,       // getImageData/putImageData за кадр в среднем (попиксельная работа на процессоре)
};

const cli = process.argv.slice(2);
const optVal = n => { const i = cli.indexOf(n); return i < 0 ? null : cli[i + 1]; };
const arg = cli[0];
// --baseline old.json: для старой игры, которая уже была тяжелее лимита, правка проходит, только если не стало хуже (+10%).
const baseFile = optVal('--baseline');
const base = baseFile && fs.existsSync(baseFile) ? JSON.parse(fs.readFileSync(baseFile, 'utf8')).metrics : null;
const jsonOut = optVal('--json');
if (!arg) { console.error('Usage: node scripts/telefon-bez-tormozov.mjs <game.html|url> [--json out.json]'); process.exit(2); }
// Локальную игру отдаём маленьким сервером (модули и fetch не работают через file://).
let server = null, url = arg;
if (!/^https?:\/\//.test(arg)) {
  const http = await import('node:http');
  const file = path.resolve(arg); if (!fs.existsSync(file)) { console.error('Нет файла: ' + arg); if (server) server.close(); process.exit(2); }
  const root = path.dirname(file);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.css': 'text/css', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' };
  server = http.createServer((q, s) => {
    const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}/${path.basename(file)}`;
}
void pathToFileURL;

const PROBE = () => {
  const S = window.__tbt = { frames: [], cur: null, lights: { dir: 0, point: 0, spot: 0, hemi: 0, rect: 0 }, shadow: false, armed: false, lamp: {} };
  const fresh = () => ({ c2d: 0, js: 0, draws: 0, tris: 0, buf: 0, tex: 0, cpu: 0, seg: [0], fbBound: false });
  S.cur = fresh();
  const tick = () => { if (S.armed) { S.cur.off = Object.values(S.lamp).filter(Boolean).length; S.frames.push(S.cur); } S.cur = fresh(); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const triCount = (mode, count, inst = 1) => (mode === 4 ? count / 3 : (mode === 5 || mode === 6) ? Math.max(0, count - 2) : 0) * inst;
  const sizeOf = d => (d == null ? 0 : typeof d === 'number' ? d : d.byteLength || 0);
  const texBytes = a => {
    for (const x of a) if (x && typeof x === 'object' && ('width' in x) && ('height' in x) && !ArrayBuffer.isView(x)) return (x.width || 0) * (x.height || 0) * 4;
    for (const x of a) if (ArrayBuffer.isView(x)) return x.byteLength;
    const n = a.filter(v => typeof v === 'number'); return n.length >= 5 ? (n[3] || 0) * (n[4] || 0) * 4 : 0;
  };
  const wrap = (P, name, fn) => { const o = P[name]; if (!o) return; P[name] = function (...a) { try { fn.call(this, a); } catch (e) {} return o.apply(this, a); }; };
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!C) continue; const P = C.prototype;
    const draw = n => a => { S.cur.draws++; S.cur.seg[S.cur.seg.length - 1]++; S.cur.tris += n(a); };
    wrap(P, 'drawArrays', draw(a => triCount(a[0], a[2])));
    wrap(P, 'drawElements', draw(a => triCount(a[0], a[1])));
    wrap(P, 'drawArraysInstanced', draw(a => triCount(a[0], a[2], a[3])));
    wrap(P, 'drawElementsInstanced', draw(a => triCount(a[0], a[1], a[4])));
    wrap(P, 'bindFramebuffer', function () { S.cur.seg.push(0); });
    // Имя каждой переменной шейдера, чтобы видеть, какой лампе дали цвет 0 (= выключена, но считается).
    const gul = P.getUniformLocation; P.getUniformLocation = function (prog, name) { const l = gul.call(this, prog, name); if (l) try { l.__n = name; } catch (e) {} return l; };
    const isLamp = l => l && l.__n && /^(point|spot|directional)Lights\[\d+\]\.color$/.test(l.__n);
    wrap(P, 'uniform3fv', a => { const v = a[1]; if (isLamp(a[0]) && v && v[0] === 0 && v[1] === 0 && v[2] === 0) S.lamp[a[0].__n] = 1; else if (isLamp(a[0])) S.lamp[a[0].__n] = 0; });
    wrap(P, 'uniform3f', a => { if (isLamp(a[0]) && a[1] === 0 && a[2] === 0 && a[3] === 0) S.lamp[a[0].__n] = 1; else if (isLamp(a[0])) S.lamp[a[0].__n] = 0; });
    wrap(P, 'bufferData', a => { S.cur.buf += sizeOf(a[1]); });
    wrap(P, 'bufferSubData', a => { S.cur.buf += sizeOf(a[2]); });
    wrap(P, 'texImage2D', a => { S.cur.tex += texBytes(a); });
    wrap(P, 'texSubImage2D', a => { S.cur.tex += texBytes(a); });
    wrap(P, 'shaderSource', a => {
      const src = String(a[1] || ''); const g = re => +((src.match(re) || [])[1] || 0);
      const L = S.lights;
      // three.js подставляет число ламп прямо в размер массивов: pointLights[ 17 ] и т.п.
      const arr = n => g(new RegExp(n + '\\[\\s*(\\d+)\\s*\\]'));
      L.dir = Math.max(L.dir, g(/#define NUM_DIR_LIGHTS (\d+)/), arr('directionalLights'));
      L.point = Math.max(L.point, g(/#define NUM_POINT_LIGHTS (\d+)/), arr('pointLights'));
      L.spot = Math.max(L.spot, g(/#define NUM_SPOT_LIGHTS (\d+)/), arr('spotLights'));
      L.hemi = Math.max(L.hemi, g(/#define NUM_HEMI_LIGHTS (\d+)/), arr('hemisphereLights'));
      L.rect = Math.max(L.rect, g(/#define NUM_RECT_AREA_LIGHTS (\d+)/), arr('rectAreaLights'));
      if (/#define USE_SHADOWMAP/.test(src)) S.shadow = true;
    });
  }
  const C2 = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  if (C2) { wrap(C2, 'getImageData', () => { S.cur.cpu++; }); wrap(C2, 'putImageData', () => { S.cur.cpu++; });
    for (const n of ['drawImage', 'fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText', 'clearRect']) wrap(C2, n, () => { S.cur.c2d++; }); }
  // Время работы игры на процессоре за кадр: сколько длятся её обработчики кадра.
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => raf(t => { const a = performance.now(); try { cb(t); } finally { S.cur.js += performance.now() - a; } });
};

const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.addInitScript(PROBE);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
try { await page.goto(url, { waitUntil: 'load', timeout: 90000 }); } catch (e) { console.error('Игра не открылась: ' + e.message); await browser.close(); if (server) server.close(); process.exit(2); }
await page.waitForTimeout(4000);
// Пытаемся запустить игру как игрок: тап по центру, Enter, пробел, повторный тап.
for (const step of ['tap', 'Enter', 'Space', 'tap', 'tap']) {
  try { if (step === 'tap') await page.touchscreen.tap(195, 470); else await page.keyboard.press(step); } catch (e) {}
  await page.waitForTimeout(700);
}
await page.waitForTimeout(3000);
// Включаем счёт в каждом окне (игры на Playgama живут внутри iframe) и меряем 5 секунд игры.
for (const f of page.frames()) await f.evaluate(() => { if (window.__tbt) { window.__tbt.frames = []; window.__tbt.armed = true; } }).catch(() => {});
await page.waitForTimeout(5000);
const all = [];
for (const f of page.frames()) {
  const r = await f.evaluate(() => window.__tbt && { frames: window.__tbt.frames.map(x => ({ ...x, seg: x.seg })), lights: window.__tbt.lights, shadow: window.__tbt.shadow }).catch(() => null);
  if (r && r.frames.length) all.push({ url: f.url(), ...r });
}
await browser.close(); if (server) server.close();
const main = all.sort((a, b) => b.frames.reduce((s, x) => s + x.draws, 0) - a.frames.reduce((s, x) => s + x.draws, 0))[0];
if (!main || !main.frames.some(x => x.draws > 0)) { console.error('Игра не нарисовала ни одного кадра WebGL/Canvas — нечего мерить.' + (errors.length ? '\n' + errors.join('\n') : '')); if (server) server.close(); process.exit(2); }
const fr = main.frames.filter(x => x.draws > 0);
const avg = k => fr.reduce((s, x) => s + x[k], 0) / fr.length;
const med = k => { const v = fr.map(x => x[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
// «Полная сцена» = кусок кадра между сменами цели рисования, в котором не меньше 30% самой большой отрисовки и ≥ 20 рисований.
const passes = fr.map(x => { const big = Math.max(...x.seg); return x.seg.filter(n => n >= 20 && n >= big * 0.3).length; }).sort((a, b) => a - b);
const L = main.lights;
const m = {
  lights: L.dir + L.point + L.spot + L.hemi + L.rect,
  scenePasses: passes[Math.floor(passes.length / 2)] || 0,
  draws: Math.round(avg('draws')),
  triangles: Math.round(avg('tris')),
  offLights: med('off'),
  bufferKB: Math.round(med('buf') / 1024),
  textureKB: Math.round(med('tex') / 1024),
  cpuPixelOps: +avg('cpu').toFixed(2),
  canvas2d: Math.round(med('c2d')),
  jsMs: +med('js').toFixed(1),
};
m.shadow = main.shadow;
const names = {
  lights: 'Источников света (вкл. выключенные)', offLights: 'Выключенных ламп, которые всё равно считаются', scenePasses: 'Сцена рисуется раз за кадр', draws: 'Отрисовок за кадр',
  triangles: 'Треугольников за кадр', bufferKB: 'КБ геометрии в видеокарту за кадр', textureKB: 'КБ текстур перезаливается за кадр',
  cpuPixelOps: 'Попиксельных операций процессора за кадр',
};
let bad = 0;
console.log(`ТЕЛЕФОН БЕЗ ТОРМОЗОВ — ${arg}\nкадров замерено: ${fr.length}, окно: ${main.url}`);
for (const k of Object.keys(LIMITS)) {
  const over = m[k] > LIMITS[k];
  const oldDebt = over && base && base[k] > LIMITS[k] && m[k] <= base[k] * 1.1;
  if (over && !oldDebt) bad++;
  console.log(`${!over ? 'OK  ' : oldDebt ? 'OLD ' : 'FAIL'} ${names[k]}: ${m[k]} (лимит ${LIMITS[k]}${base ? ', было ' + base[k] : ''})${oldDebt ? ' — старый долг, не хуже прежнего; починить при ближайшей работе над игрой' : ''}`);
}
if (main.shadow && !(base && base.shadow)) { bad++; console.log('FAIL Тени в реальном времени включены (USE_SHADOWMAP) — заменить запечёнными пятнами-тенями'); }
console.log(`для сведения: процессор игры ${m.jsMs} мс за кадр (на телефоне примерно в 4 раза дольше), рисований на 2D-холсте ${m.canvas2d} за кадр`);
console.log(`детально свет: направленных ${L.dir}, точечных ${L.point}, прожекторов ${L.spot}, неба ${L.hemi}, площадных ${L.rect}`);
if (errors.length) console.log('ошибки страницы:\n' + errors.slice(0, 5).join('\n'));
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ perFrame: fr.map(x => ({ d: x.draws, b: Math.round(x.buf / 1024), t: Math.round(x.tex / 1024) })), target: arg, metrics: m, limits: LIMITS, shadow: main.shadow, lights: L, frames: fr.length, errors }, null, 2));
console.log(bad ? `ИТОГ: FAIL (${bad})` : 'ИТОГ: PASS');
process.exit(bad ? 1 : 0);
