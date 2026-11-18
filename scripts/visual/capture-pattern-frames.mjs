// Browser-side pattern sampler: three visibly different game viewpoints per target.
import {chromium} from 'playwright';
import {ink, inkProbe, pickTargets} from './targets.mjs';
import {serve} from '../meta-bot/server.mjs';
import {readFileSync, mkdirSync, writeFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve, join} from 'node:path';

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args[i + 1];
}
const root = resolve(arg('--root', '.'));
const out = resolve(arg('--out', '/tmp/bez-patternov-images'));
const target = arg('--target', 'ink');
if (!['ink', 'all', 'changed'].includes(target)) throw Error('Only --target ink, all or changed is accepted');
mkdirSync(out, {recursive: true});

function gameTargets() {
  const html = readFileSync(join(root, 'meta-games/index.html'), 'utf8');
  const targets = [];
  for (const [anchor] of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const tag = anchor.slice(0, anchor.indexOf('>') + 1);
    const klass = /\bclass\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] || '';
    if (!klass.split(/\s+/).includes('game')) continue;
    const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] || '';
    if (!/^\.\.\/(?:[a-z0-9_-]+\/)+$/i.test(href)) throw Error('Unsafe game link: ' + href);
    targets.push({id: href.slice(3, -1).replaceAll('/', '-'), url: href.slice(3)});
  }
  if (!targets.length) throw Error('No catalog games to check');
  return targets;
}
let games;
if (target === 'ink') games = [ink, inkProbe];
else if (target === 'all') games = [...gameTargets(), ink, inkProbe];
else {
  const base = process.env.PATTERN_BASE;
  if (!base) throw Error('PATTERN_BASE is required for --target changed');
  const changed = execFileSync('git', ['diff', '--name-only', base + '...HEAD'], {
    cwd: root, encoding: 'utf8'
  }).trim().split('\n');
  games = pickTargets(changed, gameTargets(), url => existsSync(join(root, url)));
}

const web = await serve(root);
const browser = await chromium.launch({headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader']});
const inventory = [];
let errors = [];
try {
  for (const game of games) {
    const page = await browser.newPage({viewport: {width: 960, height: 720}, deviceScaleFactor: 1});
    try {
      const url = new URL(game.url, web.url + '/').href;
      const result = await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 30000});
      if (!result?.ok()) throw Error('HTTP ' + (result?.status() || 'no-response'));
      await page.locator('canvas').first().waitFor({state: 'visible', timeout: 16000});
      if (game.id === 'ink') {
        await page.waitForFunction(() => window.__LIVING_WATERCOLOR_3D_READY__?.ready, undefined, {timeout: 18000});
        await page.addStyleTag({content: '#label,#hint,#chooser{visibility:hidden!important}'});
      } else if (game.id === 'ink-shader-probe') {
        await page.waitForFunction(() => window.__INK_PATTERN_PROBE__?.ready, undefined, {timeout: 18000});
      } else if (game.id === 'black-train') {
        await page.waitForFunction(() => window.__INK_NIGHT_SCREAM__?.ready, undefined, {timeout: 18000});
        await page.evaluate(() => window.__INK_NIGHT_SCREAM__.start());
      }
      const images = [];
      for (let i = 0; i < 3; i++) {
        if (game.id === 'ink') {
          const mode = ['house', 'tree', 'volcano'][i];
          await page.evaluate(name => window.__LIVING_WATERCOLOR_3D_READY__.show(name), mode);
          await page.mouse.move(150 + i * 230, 240 + i * 80);
          await page.waitForTimeout(1400);
        } else if (game.id === 'ink-shader-probe') {
          await page.evaluate(i => window.__INK_PATTERN_PROBE__.show(i), i);
          await page.waitForTimeout(350);
        } else if (game.id === 'black-train') {
          await page.evaluate(i => {
            const game = window.__INK_NIGHT_SCREAM__;
            game.look([-0.58, 0, 0.58][i]);
            game.torch(true);
            game.advance(0.5);
          }, i);
          await page.waitForTimeout(250);
        } else if (game.id.startsWith('pack-') && await page.evaluate(() =>
            (window.__INK_PACK__?.assets || window.__PACK_PROBE__?.assets || []).length >= 3)) {
          // Asset pack with selectable objects: three views = first, middle and last asset.
          await page.evaluate(i => {
            const ids = window.__INK_PACK__?.assets || window.__PACK_PROBE__.assets;
            const id = ids[[0, Math.floor(ids.length / 2), ids.length - 1][i]];
            window.postMessage({selectAsset: typeof id === 'string' ? id : id.id}, location.origin);
          }, i);
          await page.waitForTimeout(3500);
        } else {
          await page.mouse.move(170 + i * 230, 200 + i * 90);
          const key = ['ArrowRight', 'ArrowDown', 'ArrowLeft'][i];
          await page.keyboard.down(key);
          await page.waitForTimeout(700);
          await page.keyboard.up(key);
          await page.waitForTimeout(500);
        }
        const file = join(out, game.id + '-' + i + '.png');
        await page.screenshot({path: file, animations: 'disabled', timeout: 15000});
        images.push(file);
      }
      inventory.push({id: game.id, url: game.url, images});
      console.log('CAPTURED ' + game.id + ': 3 views');
    } catch (error) {
      errors.push(game.id + ': ' + error.message);
      console.error('CAPTURE FAILED ' + errors.at(-1));
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
  web.close();
}
writeFileSync(join(out, 'index.json'), JSON.stringify({games: inventory, errors}, null, 2));
if (errors.length) process.exitCode = 1;
