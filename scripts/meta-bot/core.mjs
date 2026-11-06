// Каркас Claude. Ядро бота-проходчика META GAMES. ChatGPT этот файл НЕ меняет (сторож meta-games-guard).
// Контракт: scripts/meta-bot/CONTRACT.md. Цель: rules/09-platforma/META_GAMES_PLATFORM.md §8.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { makeInput } from './input.mjs';
import { ALLOWED_KEYS, STATE_KEYS, visibleTextInPage, menuButtonInPage, scrollAndCanvasInPage, fpsInPage } from './checks.mjs';

const VIEWPORTS = {
  mobile:  { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  desktop: { viewport: { width: 1280, height: 720 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 }
};
const LAUNCH = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] };
const DEFAULTS = { entry: 'index.html', levelTimeoutSec: 180, stuckSec: 20, startTimeoutSec: 60, fpsBaseline: 0, viewports: ['mobile', 'desktop'], skipChecks: [], ignoreConsole: [] };

// Стратегия по умолчанию, если у игры нет bot-strategy.mjs: подождать загрузку и идти к цели.
const DEFAULT_STRATEGY = {
  async start(ctx) { await ctx.wait(2200); if (!ctx.state().started) { ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2); await ctx.wait(1500); } },
  async playLevel(ctx, level) {
    while (ctx.state().level === level && !ctx.state().levelDone && !ctx.state().gameDone) {
      if (!ctx.state().alive) { await ctx.wait(1000); continue; }
      if (ctx.state().goal) await ctx.walkToGoal(); else await ctx.key('Space', 100);
    }
  }
};

export async function loadGame(dir) {
  const cfgFile = path.join(dir, 'bot.json');
  const cfg = Object.assign({}, DEFAULTS, fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, 'utf8')) : {});
  const sf = path.resolve(dir, 'bot-strategy.mjs');
  const strategy = fs.existsSync(sf) ? await import(pathToFileURL(sf).href) : DEFAULT_STRATEGY;
  if (typeof strategy.start !== 'function' || typeof strategy.playLevel !== 'function') throw new Error('bot-strategy.mjs должен экспортировать start(ctx) и playLevel(ctx, level)');
  return { cfg, strategy };
}

// Один прогон игры в одном экране. Возвращает { ok, errors[], levels, passed, fps, hashes }.
export async function runOnce({ baseUrl, gameDir, repoRoot, viewportName, cfg, strategy, browser, query = '', firstOnly = false }) {
  const vp = VIEWPORTS[viewportName]; const mobile = vp.isMobile;
  const errors = []; const fail = m => { if (!errors.includes(m)) errors.push(m); };
  const skip = c => cfg.skipChecks.includes(c);
  const context = await browser.newContext(vp); const page = await context.newPage();
  const ignore = cfg.ignoreConsole.map(s => new RegExp(s));
  page.on('pageerror', e => fail('исключение в игре: ' + String(e.message || e).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error') { const t = m.text(); if (!ignore.some(r => r.test(t)) && !/favicon|Failed to load resource/i.test(t)) fail('ошибка в консоли: ' + t.slice(0, 160)); } });
  const rel = path.relative(repoRoot, path.resolve(gameDir, cfg.entry)).split(path.sep).join('/');
  const res = { viewport: viewportName, levels: 0, passed: 0, fps: null, hashes: [], errors };
  let aborted = false, latest = null, polling = false, poller = null;
  try {
    await page.goto(`${baseUrl}/${rel}${query}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => !!window.__META_BOT__, null, { timeout: 30000 }).catch(() => { throw new Error('нет ручки window.__META_BOT__ (см. CONTRACT.md)'); });
    const shape = await page.evaluate(() => { const d = Object.getOwnPropertyDescriptor(window, '__META_BOT__') || {}; const b = window.__META_BOT__;
      const data = !!b && typeof b.state !== 'function' && 'totalLevels' in b;
      return { data, setter: !!d.set, writable: !!d.writable, keys: Object.keys(b), version: b.version, frozen: Object.isFrozen(b),
        fns: ['info', 'state'].every(k => typeof b[k] === 'function'), anyFn: Object.values(b).some(v => typeof v === 'function') }; });
    // Две формы ручки: версия 1 (version/info/state) и форма данных из PR #279/#280 (геттер с полями level/totalLevels/player/goal…).
    const mode = shape.data ? 'data' : 'v1';
    if (mode === 'data') {
      if (shape.setter || shape.writable || shape.anyFn) throw new Error('ручка-данные должна быть только для чтения и без функций (запрещённые ключи)');
    } else {
      const extra = shape.keys.filter(k => !ALLOWED_KEYS.includes(k));
      if (extra.length) throw new Error('ручка содержит запрещённые ключи: ' + extra.join(', ') + ' (разрешены только version, info, state)');
      if (shape.version !== 1 || !shape.fns) throw new Error('ручка не соответствует контракту версии 1');
      if (!shape.frozen) throw new Error('ручка должна быть заморожена Object.freeze');
    }
    const info = await page.evaluate(m => { const b = window.__META_BOT__; return m === 'data' ? { name: document.title, levels: b.totalLevels } : b.info(); }, mode);
    if (!Number.isInteger(info.levels) || info.levels < 1) throw new Error('info().levels должен быть целым числом ≥ 1');
    res.levels = info.levels;
    const readState = async () => {
      const s = await page.evaluate(m => { const b = window.__META_BOT__; if (m !== 'data') return b.state();
        const p = b.player || {}, g = b.goal; const z = o => (o && ('z' in o) ? o.z : o && o.y);
        return { started: true, level: b.level - 1, levelDone: !!b.completed, gameDone: !!b.completed && b.level >= b.totalLevels, alive: !!b.alive,
          hero: { x: p.x, y: z(p) }, goal: g ? { x: g.x, y: z(g) } : null, enemies: b.enemies, weapons: b.weapons, layoutHash: b.layout, menuOpen: !!b.menuOpen,
          ...(typeof b.progress === 'number' ? { progress: b.progress } : {}) }; }, mode);
      const miss = STATE_KEYS.filter(k => !(k in s)); if (miss.length) throw new Error('state() без полей: ' + miss.join(', '));
      latest = s; return s;
    };
    await readState();
    // Опрос состояния и ЧИСТОГО ЭКРАНА в фоне, пока бот играет.
    // FIX (телефон): кроме первых трёх жестов, экран сравнивается с эталоном (снят после start) каждые 0,3 с ВСЮ игру.
    polling = true; const textSeen = new Set(); let fixBase = null, joyHeldMs = 0;
    const fixBad = (a, b) => b.sx || b.sy || b.st || Math.abs(a.cx - b.cx) > 1 || Math.abs(a.cy - b.cy) > 1 || Math.abs(a.cw - b.cw) > 1 || Math.abs(a.ch - b.ch) > 1;
    poller = (async () => { let k = 0; while (polling) { try { await readState(); k++;
      if (!skip('cleanScreen') && latest.started && !latest.menuOpen && (k % 10 === 0)) for (const t of await page.evaluate(visibleTextInPage)) textSeen.add(t);
      if (mobile && fixBase && !skip('fix') && !latest.menuOpen && (k % 3 === 0) && fixBad(fixBase, await page.evaluate(scrollAndCanvasInPage))) fail('FIX: экран сдвинулся или прокрутился во время игры');
    } catch (e) { if (polling && !/closed|context was destroyed/.test(String(e))) fail(String(e.message || e)); } await new Promise(r => setTimeout(r, 100)); } })();
    const input = await makeInput(page, { mobile, viewport: vp.viewport, cfg, isAborted: () => aborted });
    let fixChecks = mobile ? 0 : 3;
    // Умная ходьба к цели (идея из бота ChatGPT, PR #279): калибруем, куда реально двигает герой каждое направление
    // джойстика (камера может быть повёрнута), и идём по обратной матрице. Только настоящий ввод.
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let calib = null;
    const jb = cfg.jumpButton ? { x: cfg.jumpButton.x * vp.viewport.width, y: cfg.jumpButton.y * vp.viewport.height } : await page.evaluate(() => {
      const e = document.querySelector('#jump,[aria-label*="jump" i],[aria-label*="прыж" i]'); if (!e) return null; const b = e.getBoundingClientRect(); return b.width ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null; });
    const jump = async () => { if (!mobile) return input.key(cfg.jumpKey || 'Space', 90); if (jb) return input.tap(jb.x, jb.y); };
    async function walkToGoal(ms = 450) {
      if (!latest.goal) return false;
      if (!calib || calib.level !== latest.level || calib.stall >= 6) {
        const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]], vec = [];
        for (const d of dirs) { const a = { ...latest.hero }; await ctx.joystick(d[0], d[1], 260); await sleep(120); vec.push([latest.hero.x - a.x, latest.hero.y - a.y]); }
        const R = [(vec[1][0] - vec[3][0]) / 2, (vec[1][1] - vec[3][1]) / 2], D = [(vec[2][0] - vec[0][0]) / 2, (vec[2][1] - vec[0][1]) / 2];
        calib = { level: latest.level, R, D, det: R[0] * D[1] - D[0] * R[1], stall: 0, last: Infinity };
      }
      const s = latest, t = [s.goal.x - s.hero.x, s.goal.y - s.hero.y], d0 = Math.hypot(t[0], t[1]);
      if (!calib.goal || Math.hypot(s.goal.x - calib.goal.x, s.goal.y - calib.goal.y) > Math.max(1, 0.1 * d0)) { calib.goal = { ...s.goal }; calib.last = Infinity; calib.stall = 0; }
      let ix, iy;
      if (Math.abs(calib.det) > 1e-6) { ix = (t[0] * calib.D[1] - calib.D[0] * t[1]) / calib.det; iy = (calib.R[0] * t[1] - t[0] * calib.R[1]) / calib.det; }
      else { ix = t[0]; iy = t[1]; }
      const n = Math.hypot(ix, iy) || 1; ix /= n; iy /= n;
      if (calib.stall >= 3) { [ix, iy] = calib.stall % 2 ? [-iy, ix] : [iy, -ix]; await jump(); }
      await ctx.joystick(ix, iy, ms); await sleep(60);
      const d1 = latest.goal ? Math.hypot(latest.goal.x - latest.hero.x, latest.goal.y - latest.hero.y) : 0;
      calib.stall = d1 < Math.min(d0, calib.last) - 0.05 ? 0 : calib.stall + 1; calib.last = Math.min(calib.last, d1);
      return true;
    }
    const ctx = Object.freeze({
      ...input, mobile, jump, walkToGoal, viewport: { ...vp.viewport }, state: () => ({ ...latest }), info: () => ({ ...info }), log: t => console.log(`    [${viewportName}] ${t}`),
      joystick: async (dx, dy, ms = 300) => { const t0 = Date.now(); try { return await joy(dx, dy, ms); } finally { joyHeldMs += Date.now() - t0; } }
    });
    async function joy(dx, dy, ms) {
        // FIX: в первых трёх жестах джойстика экран проверяется ВО ВРЕМЯ удержания (каждые 100 мс), а не только до и после.
        if (fixChecks < 3 && !skip('fix')) { fixChecks++;
          const a = await page.evaluate(scrollAndCanvasInPage); let sampling = true, bad = null;
          const sampler = (async () => { while (sampling && !bad) { try { const b = await page.evaluate(scrollAndCanvasInPage);
            if (b.sx || b.sy || b.st || Math.abs(a.cx - b.cx) > 1 || Math.abs(a.cy - b.cy) > 1 || Math.abs(a.cw - b.cw) > 1 || Math.abs(a.ch - b.ch) > 1) bad = b; } catch {} await new Promise(r => setTimeout(r, 100)); } })();
          try { await input.joystick(dx, dy, ms); } finally { sampling = false; await sampler; }
          if (bad) fail('FIX: экран сдвинулся или прокрутился во время удержания джойстика');
          return; }
        return input.joystick(dx, dy, ms);
    }
    const timed = async (fn, sec, what, watchdog) => {
      aborted = false; let timer, wd;
      const t = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(what + ': не успел за ' + sec + ' с')), sec * 1000); });
      const w = watchdog ? new Promise((_, rej) => { wd = setInterval(() => { const m = watchdog(); if (m) rej(new Error(m)); }, 250); }) : null;
      try { await Promise.race([fn(), t, ...(w ? [w] : [])]); } finally { aborted = true; clearTimeout(timer); clearInterval(wd); await new Promise(r => setTimeout(r, 300)); aborted = false; }
    };
    await timed(() => strategy.start(ctx), cfg.startTimeoutSec, 'старт', () => null);
    await new Promise(r => setTimeout(r, 500));
    if (!latest.started) throw new Error('после start() игра не началась (state().started=false)');
    if (mobile) fixBase = await page.evaluate(scrollAndCanvasInPage);
    if (!skip('menuButton') && !(await page.evaluate(menuButtonInPage))) fail('ЧИСТЫЙ ЭКРАН: нет кнопки меню ☰ в правом верхнем углу');
    if (!skip('postepenno') && (latest.enemies > 1 || latest.weapons > 1)) fail(`ПОСТЕПЕННО: в начале врагов ${latest.enemies}, оружия ${latest.weapons} (нужно не больше 1 и 1)`);
    if (!skip('fps')) { await new Promise(r => setTimeout(r, 2000)); res.fps = Math.round(await page.evaluate(fpsInPage, 3000) * 10) / 10;
      if (cfg.fpsBaseline > 0 && res.fps < cfg.fpsBaseline * 0.6) fail(`FPS: ${res.fps} при базе ${cfg.fpsBaseline} (падение больше 40%)`);
      const prev = fpsHistory(gameDir, viewportName); res.fpsPrev = prev;
      if (prev && res.fps < prev * 0.6) fail(`FPS: ${res.fps} против ${prev} в прошлых прогонах (падение больше 40%)`); }
    for (let i = 0; i < info.levels; i++) {
      const t0 = Date.now(); while (latest.level !== i) {
        if (latest.level > i) throw new Error(`уровень ${i + 1} пропущен: игра сразу перешла на уровень ${latest.level + 1}`);
        if (Date.now() - t0 > 15000) throw new Error(`уровень ${i + 1} не начался (state().level=${latest.level})`); await new Promise(r => setTimeout(r, 100)); }
      res.hashes.push(String(latest.layoutHash));
      if (firstOnly) break;
      // Прогресс внутри уровня: ближе к цели, смена цели, или рост необязательного state().progress
      // (настоящие собранные вещи / урон врагу — длинный бой у цели не «застревание»; бой без урона — застревание).
      let best = Infinity, bestAt = Date.now(), done = false, lastGoal = null, prog = null;
      const isDone = () => (done = done || latest.levelDone || latest.gameDone || latest.level > i);
      const dist = s => s.goal ? Math.hypot(s.goal.x - s.hero.x, s.goal.y - s.hero.y) : null;
      await timed(() => strategy.playLevel(ctx, i), cfg.levelTimeoutSec, `уровень ${i + 1}`, () => {
        if (isDone()) return null; const d = dist(latest);
        if (typeof latest.progress === 'number') { if (prog !== null && latest.progress > prog) { best = d ?? Infinity; bestAt = Date.now(); } prog = prog === null ? latest.progress : Math.max(prog, latest.progress); }
        if (d === null) return prog !== null && Date.now() - bestAt > cfg.stuckSec * 1000 ? `уровень ${i + 1}: герой застрял (${cfg.stuckSec} с без прогресса: progress не растёт)` : null;
        // Цель внутри уровня сменилась (новая точка) — отсчёт застревания начинается заново.
        const g = latest.goal; if (!lastGoal || Math.hypot(g.x - lastGoal.x, g.y - lastGoal.y) > Math.max(1, 0.1 * d)) { lastGoal = { ...g }; best = d; bestAt = Date.now(); }
        if (d < best - 0.01) { best = d; bestAt = Date.now(); }
        return Date.now() - bestAt > cfg.stuckSec * 1000 ? `уровень ${i + 1}: герой застрял (${cfg.stuckSec} с без приближения к цели)` : null;
      });
      await readState();
      if (!isDone()) throw new Error(`уровень ${i + 1}: playLevel закончился, а уровень не пройден`);
      res.passed++;
      if (i === info.levels - 1) break;
      const t1 = Date.now(); while (latest.level <= i && !latest.gameDone) { if (Date.now() - t1 > 15000) throw new Error(`после уровня ${i + 1} следующий не начался`); await new Promise(r => setTimeout(r, 100)); }
    }
    // FIX: джойстик под наблюдением не меньше 10 с за прогон на телефоне; если игра короткая — добрать одним удержанием.
    if (mobile && !skip('fix') && joyHeldMs < 10000) { aborted = false; await ctx.joystick(0.7, -0.7, 10000 - joyHeldMs).catch(() => {}); await new Promise(r => setTimeout(r, 400)); }
    polling = false; await poller;
    if (textSeen.size) fail('ЧИСТЫЙ ЭКРАН: виден текст во время игры: «' + [...textSeen].slice(0, 5).join('», «') + '»');
    if (!skip('noRepeat') && new Set(res.hashes).size !== res.hashes.length) fail('БЕЗ ПОВТОРОВ: одинаковая раскладка у разных уровней: ' + res.hashes.join(' / '));
  } catch (e) { fail(String(e.message || e)); }
  finally { aborted = true; polling = false; if (poller) await poller.catch(() => {}); await context.close().catch(() => {}); }
  res.ok = errors.length === 0;
  return res;
}

// История FPS между прогонами: файл из META_BOT_FPS_FILE (на GitHub его хранит actions/cache). Медиана последних 5.
function fpsKey(gameDir, v) { return path.basename(gameDir) + ':' + v; }
function fpsRead() { const f = process.env.META_BOT_FPS_FILE; try { return f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; } catch { return {}; } }
function fpsHistory(gameDir, v) { const h = fpsRead()[fpsKey(gameDir, v)]; if (!Array.isArray(h) || !h.length) return null; const a = [...h].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; }
function fpsSave(gameDir, runs) { const f = process.env.META_BOT_FPS_FILE; if (!f) return; const d = fpsRead();
  for (const r of runs) if (r.ok && r.fps) { const k = fpsKey(gameDir, r.viewport); d[k] = [...(d[k] || []), r.fps].slice(-5); }
  fs.mkdirSync(path.dirname(path.resolve(f)), { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 1)); }

// Полная проверка игры: все экраны + второй запуск для БЕЗ ПОВТОРОВ.
export async function checkGame({ gameDir, repoRoot, baseUrl, query = '' }) {
  const { cfg, strategy } = await loadGame(gameDir);
  const browser = await chromium.launch(LAUNCH);
  const runs = [];
  try {
    for (const v of cfg.viewports) runs.push(await runOnce({ baseUrl, gameDir, repoRoot, viewportName: v, cfg, strategy, browser, query }));
    // Второй независимый запуск: по умолчанию игра проходится ЦЕЛИКОМ ещё раз (новая раскладка тоже должна быть проходимой),
    // и раскладка первого уровня должна отличаться от первого запуска. bot.json "secondRun": "hash" — только сравнить раскладку.
    if (!cfg.skipChecks.includes('noRepeat') && runs[0] && runs[0].hashes.length) {
      const full = cfg.secondRun !== 'hash';
      const again = await runOnce({ baseUrl, gameDir, repoRoot, viewportName: cfg.viewports[0], cfg: { ...cfg, skipChecks: [...cfg.skipChecks, 'fps'] }, strategy, browser, query, firstOnly: !full });
      again.viewport = cfg.viewports[0] + ' (2-й запуск)'; if (full) runs.push(again);
      if (again.hashes[0] !== undefined && again.hashes[0] === runs[0].hashes[0]) runs[0].errors.push('БЕЗ ПОВТОРОВ: первый уровень одинаковый в двух запусках (' + again.hashes[0] + ')'), runs[0].ok = false;
    }
    fpsSave(gameDir, runs);
  } finally { await browser.close(); }
  return { game: path.basename(gameDir), ok: runs.every(r => r.ok), runs };
}
