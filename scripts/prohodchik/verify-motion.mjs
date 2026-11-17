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

async function fixtures(assessMotion, assessFixedViewport, assessB2Probe, monitorHeldMotion,
  probeB2Directions) {
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
  const firstMove = interval(state(0, 0), state(0.5, 0));
  const lateStall = Array.from({length: 4}, () =>
    interval(state(0.5, 0), state(0.5, 0)));
  assert.equal(assessMotion([firstMove, ...lateStall]).status, 'STUCK');
  assert.equal(assessB2Probe([firstMove]).status, 'OBSERVING');
  assert.equal(assessB2Probe([firstMove, ...lateStall.slice(0, 3)]).status, 'OBSERVING');
  assert.equal(assessB2Probe([firstMove, ...lateStall]).status, 'STUCK');
  const subsequentMovement = Array.from({length: 4}, (_, i) =>
    interval(state(0.5 + i * 0.2, 0), state(0.7 + i * 0.2, 0)));
  assert.equal(assessB2Probe([firstMove, ...subsequentMovement]).status, 'MOVED');
  const idleAfterMove = interval(state(0.5, 0), state(0.5, 0), 2200, false);
  assert.equal(assessB2Probe([firstMove, idleAfterMove]).status, 'OBSERVING');
  // 2.3 s split by an idle gap is not one continuous hold; only the last 1.1 s counts.
  const interrupted = [
    firstMove,
    interval(state(0.5, 0), state(0.7, 0), 1200),
    interval(state(0.7, 0), state(0.7, 0), 450, false),
    interval(state(0.7, 0), state(0.9, 0), 1100)
  ];
  assert.equal(assessB2Probe(interrupted).status, 'OBSERVING');
  assert.equal(assessB2Probe([
    ...interrupted, interval(state(0.9, 0), state(1.2, 0), 900)
  ]).status, 'MOVED');
  assert.equal(assessMotion([...still.slice(0, 2), firstMove]).status, 'MOVED');
  assert.equal(assessMotion(jitter).status, 'STUCK');
  // A slowly moving hero covers a real distance even if each 80ms step is tiny.
  const microX = Array.from({length: 30}, (_, i) => interval(
    state(i * 0.02, 0, {game: 'other-game'}),
    state((i + 1) * 0.02, 0, {game: 'other-game'}), 80
  ));
  const microY = Array.from({length: 30}, (_, i) => interval(
    state(0, i * 0.02), state(0, (i + 1) * 0.02), 80
  ));
  assert.equal(assessMotion(microX).status, 'MOVED');
  assert.equal(assessB2Probe(microX).status, 'MOVED');
  assert.equal(assessMotion(microY).status, 'MOVED');
  // Oscillating jitter never accumulates into actual travel.
  const oscillation = Array.from({length: 40}, (_, i) => interval(
    state((i % 2) * 0.01, 0), state(((i + 1) % 2) * 0.01, 0), 80
  ));
  assert.equal(assessMotion(oscillation).status, 'STUCK');
  // Release clears pending sub-threshold displacement; two separated nudges are not one.
  const releaseBetween = [
    interval(state(0, 0), state(0.02, 0), 80),
    interval(state(0.02, 0), state(0.04, 0), 80),
    interval(state(0.04, 0), state(0.04, 0), 100, false),
    interval(state(0.04, 0), state(0.06, 0), 80),
    interval(state(0.06, 0), state(0.08, 0), 80)
  ];
  assert.equal(assessMotion(releaseBetween).status, 'NO_MOVEMENT');
  // Passive drift is removed before integrating genuine slow input.
  const microOverDrift = [
    interval(state(0, 0), state(0.5, 0), 500, false),
    ...Array.from({length: 4}, (_, i) => interval(
      state(0.5 + i * 0.52, 0), state(0.5 + (i + 1) * 0.52, 0), 500
    ))
  ];
  assert.equal(assessMotion(microOverDrift).status, 'MOVED');
  // Stopping passive drift at a wall is not player movement in the opposite direction.
  for (const [x, y, game] of [[0.5, 0, 'veil-terraces'], [0, -0.5, 'other-game']]) {
    const stoppedDrift = [
      interval(state(0, 0, {game}), state(x, y, {game}), 500, false),
      ...Array.from({length: 5}, () => interval(state(x, y, {game}), state(x, y, {game}), 500))
    ];
    assert.equal(assessMotion(stoppedDrift).status, 'STUCK');
    assert.equal(assessB2Probe(stoppedDrift).status, 'STUCK');
  }

  assert.equal(assessMotion(falseProgress).status, 'STUCK');
  const passive = interval(state(0, 0), state(0.5, 0), 500, false);
  const autopilot = Array.from({length: 4}, (_, i) =>
    interval(state(0.5 + i * 0.5, 0), state(1 + i * 0.5, 0), 500));
  assert.equal(assessMotion([passive, ...autopilot]).status, 'STUCK');
  assert.equal(assessMotion([
    passive, interval(state(0.5, 0), state(1, 0.4), 500)
  ]).status, 'MOVED');
  assert.equal(assessMotion([interval(state(0, 0), state(0, 0, {alive: false}))]).status, 'DEAD');
  // A real death can delete the hero object and even the current level pointer.
  // The detector must raise DEAD at once, using the last valid hero coordinates.
  const disappearsOnDeath = interval(state(2, 3), {alive: false, hero: null, level: null});
  const vanished = assessMotion([disappearsOnDeath]);
  assert.equal(vanished.status, 'DEAD');
  assert.deepEqual(vanished.hero, {x: 2, y: 3});
  assert.equal(vanished.level, 0);
  assert.equal(assessB2Probe([interval(state(0, 0), state(1, 0)), disappearsOnDeath]).status, 'DEAD');
  assert.equal(assessMotion([interval(
    state(4, 5, {alive: false}), {alive: true, hero: null, level: 0}
  )]).status, 'DEAD');
  assert.equal(assessMotion([interval(state(2, 3), {alive: true, hero: null, level: 0})]).status,
    'INVALID');
  assert.equal(assessMotion([
    interval(state(0, 0), state(0, 0, {level: 1, progress: 999}))
  ]).status, 'LEVEL_CHANGED');
  assert.equal(assessMotion([interval(state(0, 0), state(1, 0), 550, false)]).status, 'NO_INPUT');
  assert.equal(assessMotion([
    interval(state(0, 0), state(0, 0, {hero: {x: NaN, y: 0}}))
  ]).status, 'INVALID');
  const fixed = {sx: 0, sy: 0, st: 0, cx: 0, cy: 0, cw: 390, ch: 844};
  assert.equal(assessFixedViewport([fixed, {...fixed}]).status, 'FIXED');
  assert.equal(assessFixedViewport([fixed, {...fixed, sy: 12}, fixed]).status, 'FIX_MOVED');
  assert.equal(assessFixedViewport([fixed, {...fixed, cw: 391.5}, fixed]).status, 'FIX_MOVED');
  assert.equal(assessFixedViewport([fixed, {...fixed, cx: NaN}]).status, 'INVALID');
  for (const game of ['veil-terraces', 'other-game']) {
    let attempts = 0;
    const resumed = await probeB2Directions([[0, -1], [1, 0]], async () => ({
      status: ++attempts === 1 ? 'LEVEL_CHANGED' : 'MOVED', game
    }));
    assert.equal(resumed.status, 'MOVED');
    assert.equal(attempts, 2, 'transition requires a fresh probe');
    assert.equal((await probeB2Directions([[0, -1], [1, 0]], async () => ({
      status: 'LEVEL_CHANGED', game
    }))).status, 'LEVEL_CHANGED', 'transitions alone never prove motion');
    attempts = 0;
    const died = await probeB2Directions([[0, -1], [1, 0]], async () => {
      attempts++;
      return {status: 'DEAD', game};
    });
    assert.equal(died.status, 'DEAD');
    assert.equal(attempts, 1, 'death must stop retries');
  }
  // The incident artifact must be captured before the held gesture finishes,
  // including a death whose entity has already vanished.
  for (const terminal of ['DEAD', 'STUCK']) {
    for (const game of ['veil-terraces', 'other-game']) {
      let finishHold;
      const held = new Promise(resolve => { finishHold = resolve; });
      const releaseFallback = setTimeout(() => finishHold(), 100);
      let released = false;
      let samples = 0;
      let captures = 0;
      const verdict = await monitorHeldMotion({
        segments: [],
        hold: async () => { await held; released = true; },
        sample: async () => {
          samples++;
          // A broken monitor must finish and fail assertions rather than hang.
          if (samples > 26) finishHold();
          return interval(state(2, 3, {game}), terminal === 'DEAD'
            ? {alive: false, hero: null, level: null} : state(2, 3, {game}), 80);
        },
        onIncident: async observed => {
          captures++;
          assert.equal(released, false, 'incident captured after release');
          assert.equal(observed.status, terminal);
          assert.deepEqual(observed.hero, {x: 2, y: 3});
          finishHold();
        }
      });
      clearTimeout(releaseFallback);
      assert.equal(verdict.status, terminal);
      assert.equal(captures, 1, game + ' must capture one in-flight incident');
      assert.equal(samples, terminal === 'DEAD' ? 1 : 25);
    }
  }
  console.log('B2_VERIFIER_PASS: motion, transient FIX drift and deceptive state controls');
}

async function verifyGame(assessMotion, assessFixedViewport, assessB2Probe, monitorHeldMotion,
  probeB2Directions,
  gamePath, screenshot) {
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
        let status = 'NO_MOVEMENT';
        // A series of short released taps is not one continuous 2s hold.
        // Each direction is a real held gesture with live world-state and FIX samples.
        // A blocked direction is an obstacle to log, not proof all controls are broken.
        const directionVerdict = await probeB2Directions(directions, async ([dx, dy], directionIndex) => {
          const idleBefore = await read();
          const idleSince = Date.now();
          await page.waitForTimeout(450);
          const idleAfter = await read();
          const idle = {
            before: idleBefore, after: idleAfter,
            durationMs: Math.max(1, Date.now() - idleSince), input: false
          };
          const trial = [idle];
          const viewportTrace = [fixed];
          let previous = await read();
          let previousAt = Date.now();
          const verdict = await monitorHeldMotion({
            segments: trial,
            hold: () => input.joystick(dx, dy, 3100),
            sample: async () => {
              await page.waitForTimeout(80);
              const [next, frame] = await Promise.all([
                read(), page.evaluate(scrollAndCanvasInPage)
              ]);
              const at = Date.now();
              const segment = {
                before: previous, after: next,
                durationMs: Math.max(1, at - previousAt), input: true
              };
              previous = next;
              previousAt = at;
              viewportTrace.push(frame);
              return segment;
            },
            onIncident: async incident => {
              console.log('B3_B4_INCIDENT ' + gamePath + ' ' + name +
                ' direction=' + JSON.stringify([dx, dy]) + ' state=' + JSON.stringify(incident));
              if (screenshot) {
                const file = resolve(screenshot.replace(
                  /(\.[a-z]+)?$/, '-incident-' + name + '-' + directionIndex + '.png'
                ));
                mkdirSync(resolve(file, '..'), {recursive: true});
                await page.screenshot({path: file, timeout: 15000});
              }
            }
          });
          viewportTrace.push(await page.evaluate(scrollAndCanvasInPage));
          const fix = assessFixedViewport(viewportTrace);
          assert.equal(fix.status, 'FIXED',
            'FIX: viewport changed during held input: ' + JSON.stringify(fix));
          status = verdict.status;
          if (status === 'STUCK') {
            console.log('B3_PROBE_STUCK ' + gamePath + ' ' + name +
              ' direction=' + JSON.stringify([dx, dy]) + ' state=' + JSON.stringify(verdict));
            if (screenshot) {
              const file = resolve(screenshot.replace(
                /(\.[a-z]+)?$/, '-stuck-' + name + '-' + directionIndex + '.png'
              ));
              mkdirSync(resolve(file, '..'), {recursive: true});
              await page.screenshot({path: file, timeout: 15000});
            }
            return verdict;
          }
          return verdict;
        });
        status = directionVerdict.status;
        assert.deepEqual(errors, [], 'Browser console/page errors');
        assert.equal(status, 'MOVED', 'B2 no proven player movement; status=' + status);
        const finalState = await read();
        if (screenshot) {
          const file = resolve(screenshot.replace(/(\.[a-z]+)?$/, '-' + name + '.png'));
          mkdirSync(resolve(file, '..'), {recursive: true});
          await page.screenshot({path: file, animations: 'disabled', timeout: 15000});
          console.log('B2 screenshot ' + file);
        }
        console.log('B2_MOTION_PASS ' + gamePath + ' ' + name +
          ' initial=' + JSON.stringify(initial.hero) + ' final=' + JSON.stringify(finalState.hero));
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
const {assessMotion, assessFixedViewport, assessB2Probe, monitorHeldMotion, probeB2Directions} = await import(source);
const game = option('--game');
try {
  if (game) await verifyGame(assessMotion, assessFixedViewport, assessB2Probe, monitorHeldMotion,
    probeB2Directions, game, option('--screenshot'));
  else await fixtures(assessMotion, assessFixedViewport, assessB2Probe, monitorHeldMotion, probeB2Directions);
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}

