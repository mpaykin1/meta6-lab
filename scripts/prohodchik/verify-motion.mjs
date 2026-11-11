// B2 motion verifier. Default: deterministic fixtures. --game: real Chromium + player input.
// Example: node scripts/prohodchik/verify-motion.mjs --game games/veil-terraces
import assert from 'node:assert/strict';
import {existsSync, mkdirSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const args = process.argv.slice(2);
function option(key) {
  const index = args.indexOf(key);
  if (index < 0) return null;
  assert.ok(args[index + 1] && !args[index + 1].startsWith('--'), key + ' requires a value');
  return args[index + 1];
}

function fixtures(assessMotion) {
  const state = (x, y, extra = {}) => ({
    hero: {x, y}, level: 0, alive: true, progress: 0, game: 'veil-terraces', ...extra
  });
  const interval = (before, after, durationMs = 550, input = true) => ({
    before, after, durationMs, input
  });
  const still = Array.from({length: 4}, () => interval(state(0, 0), state(0, 0)));
  const jitter = Array.from({length: 4}, () => interval(state(0, 0), state(0.01, 0)));
  const falseProgress = Array.from({length: 4}, (_, i) =>
    interval(state(0, 0, {progress: i}), state(0, 0, {progress: i + 1})));
  assert.equal(assessMotion([interval(state(0, 0), state(0.3, 0))]).status, 'MOVED');
  assert.equal(assessMotion(still).status, 'STUCK');
  assert.equal(assessMotion(jitter).status, 'STUCK');
  assert.equal(assessMotion(falseProgress).status, 'STUCK');
  const passive = interval(state(0, 0), state(0.5, 0), 500, false);
  const autopilot = Array.from({length: 4}, (_, i) =>
    interval(state(0.5 + i * 0.5, 0), state(1 + i * 0.5, 0), 550));
  assert.equal(assessMotion([passive, ...autopilot]).status, 'STUCK');
  assert.equal(assessMotion([
    passive, interval(state(0.5, 0), state(1, 0.4), 550)
  ]).status, 'MOVED');
  assert.equal(assessMotion([interval(state(0, 0), state(0, 0, {alive: false}))]).status, 'DEAD');
  assert.equal(assessMotion([
    interval(state(0, 0), state(0, 0, {level: 1, progress: 999}))
  ]).status, 'LEVEL_CHANGED');
  assert.equal(assessMotion([interval(state(0, 0), state(1, 0), 550, false)]).status, 'NO_INPUT');
  assert.equal(assessMotion([
    interval(state(0, 0), state(0, 0, {hero: {x: NaN, y: 0}}))
  ]).status, 'INVALID');
  console.log('B2_VERIFIER_PASS: 10 controls including idle drift and steer response');
}

async function verifyGame(assessMotion, gamePath, screenshot) {
  assert.match(gamePath, /^games\/[a-z0-9-]+$/, 'Unsafe game path');
  const gameDir = resolve(root, gamePath);
  assert.ok(existsSync(join(gameDir, 'index.html')), 'Game entry point missing');
  const [{chromium}, {serve}, {makeInput}, {loadGame}, {scrollAndCanvasInPage}] =
    await Promise.all([
      import('playwright'),
      import('../meta-bot/server.mjs'),
      import('../meta-bot/input.mjs'),
      import('../meta-bot/core.mjs'),
      import('../meta-bot/checks.mjs')
    ]);
  const {cfg} = await loadGame(gameDir);
  const server = await serve(root);
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist']
  });
  try {
    for (const mobile of [false, true]) {
      const name = mobile ? 'mobile' : 'desktop';
      const viewport = mobile ? {width: 390, height: 844} : {width: 1280, height: 720};
      const context = await browser.newContext({viewport, isMobile: mobile, hasTouch: mobile});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push('pageerror: ' + e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
      try {
        const response = await page.goto(server.url + '/' + gamePath + '/index.html', {
          waitUntil: 'load', timeout: 30000
        });
        assert.equal(response?.status(), 200, 'HTTP 200 required');
        await page.waitForFunction(() => !!window.__META_BOT__, null, {timeout: 15000});
        const read = () => page.evaluate(() => {
          const bot = window.__META_BOT__;
          if (typeof bot.state === 'function') return bot.state();
          const p = bot.player || {};
          return {
            started: true, level: bot.level - 1, alive: bot.alive,
            hero: {x: p.x, y: p.z ?? p.y}, progress: bot.progress
          };
        });
        const input = await makeInput(page, {
          mobile, viewport, cfg, isAborted: () => false
        });
        let initial = await read();
        if (!initial.started) {
          await input.tap(viewport.width / 2, viewport.height / 2);
          await page.waitForTimeout(700);
          initial = await read();
        }
        assert.equal(initial.started, true, 'Game has not started');
        const fixed = await page.evaluate(scrollAndCanvasInPage);
        const directions = [[0, -1], [1, 0], [-1, 0], [0, 1]];
        const idleBefore = await read();
        const idleSince = Date.now();
        await page.waitForTimeout(450);
        const idleAfter = await read();
        const segments = [{
          before: idleBefore, after: idleAfter,
          durationMs: Math.max(1, Date.now() - idleSince), input: false
        }];
        let status = 'NO_MOVEMENT';
        for (const [dx, dy] of directions) {
          const before = await read();
          const since = Date.now();
          await input.joystick(dx, dy, 550);
          const durationMs = Math.max(1, Date.now() - since);
          const after = await read();
          segments.push({before, after, durationMs, input: true});
          const position = await page.evaluate(scrollAndCanvasInPage);
          assert.ok(!position.sx && !position.sy && !position.st &&
            Math.abs(position.cx - fixed.cx) <= 1 &&
            Math.abs(position.cy - fixed.cy) <= 1 &&
            Math.abs(position.cw - fixed.cw) <= 1 &&
            Math.abs(position.ch - fixed.ch) <= 1,
          'FIX: page scrolled or canvas moved during input');
          status = assessMotion(segments).status;
          if (status !== 'NO_MOVEMENT') break;
        }
        assert.deepEqual(errors, [], 'Browser console/page errors');
        assert.equal(status, 'MOVED', 'B2 no proven player movement; status=' + status);
        console.log('B2_MOTION_PASS ' + gamePath + ' ' + name);
      } catch (error) {
        if (screenshot) {
          const file = resolve(screenshot.replace(/(\.[a-z]+)?$/, '-' + name + '.png'));
          mkdirSync(resolve(file, '..'), {recursive: true});
          await page.screenshot({path: file}).catch(e => console.error('screenshot:', e.message));
          console.error('B2 screenshot ' + file);
        }
        throw Error(gamePath + ' ' + name + ': ' + error.message);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
}

const moduleFile = option('--module');
const source = moduleFile ? pathToFileURL(resolve(moduleFile)).href : './motion-check.mjs';
const {assessMotion} = await import(source);
const game = option('--game');
try {
  if (game) await verifyGame(assessMotion, game, option('--screenshot'));
  else fixtures(assessMotion);
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}
