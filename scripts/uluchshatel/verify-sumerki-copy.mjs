// Regression checks for rule 13: state is live, complete and read-only.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';

const DIR = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../games/sumerki-i-pepel-2-copy');
const SCRIPT = resolve(DIR, 'bot-observer.js');
const HTML = resolve(DIR, 'index.html');
const ORIGINAL_SHA256 = '59a2831229367c7517e3892f9b867190424baa3971f021362c0adcd50a24ed5a';
const LOADER = '<script src="./bot-observer.js"></script>';

export function verifyObserver(code) {
  const engine = {
    G: { state: 'play', collected: 0, total: 2, kills: 3, seed: 1337, biome: 'dusk' },
    player: { pos: { x: 4, y: 7, z: 9 }, hp: 6 },
    world: { beacon: { x: 45, y: 8, z: 50 }, ring: { x: 42, y: 3, z: 47 }, coins: [{}, {}] },
    coins: [
      { x: 5, y: 8, z: 9, alive: true },
      { x: 22, y: 10, z: 9, alive: true }
    ],
    foes: [{ hp: 9, state: 'hunt' }],
    combat: { arsenal: ['stick'] },
    rig: { yaw: 0.6 }
  };
  const button = (id, visible) => ({
    id, hidden: !visible, disabled: false,
    getClientRects: () => visible ? [{}] : [],
    getAttribute: () => null
  });
  const win = { __isle: engine };
  const doc = { querySelectorAll: () => [button('btnJump', true), button('btnSecret', false)] };
  runInNewContext(code, { window: win, document: doc }, { timeout: 1500, filename: SCRIPT });

  const desc = Object.getOwnPropertyDescriptor(win, '__META_BOT__');
  assert.ok(desc, 'observer must exist');
  assert.equal(desc.writable, false, 'bot cannot be replaced');
  assert.equal(desc.configurable, false, 'bot cannot be removed');
  assert.equal(Object.isFrozen(win.__META_BOT__), true, 'bot API must be frozen');

  const bot = win.__META_BOT__;
  assert.equal(bot.info().levels, 1);
  assert.equal(bot.info().stagesTotal, 2);
  const snapshot = JSON.stringify(engine);
  const first = bot.state();
  assert.equal(JSON.stringify(engine), snapshot, 'state() must not modify gameplay');
  assert.equal(first.started, true);
  assert.equal(first.level, 0);
  assert.equal(first.stage, 1);
  assert.equal(first.stagesTotal, 2);
  assert.equal(first.levelDone, false);
  assert.equal(first.alive, true);
  assert.equal(first.hero.x, 4);
  assert.equal(first.hero.y, 7);
  assert.equal(first.hero.z, 9);
  assert.equal(first.goal.x, 5, 'nearest live coin is the goal');
  assert.equal(first.goal.y, 8);
  assert.equal(first.progress, 0.03);
  assert.equal(first.enemies, 1);
  assert.equal(first.weapons, 1);
  assert.equal(first.buttons.join(','), 'btnJump', 'only visible controls are published');

  engine.player.pos.x = 21;
  assert.equal(bot.state().goal.x, 22, 'hero movement changes the live target');
  engine.coins.forEach(coin => { coin.alive = false; });
  engine.G.collected = 2;
  assert.equal(bot.state().goal.x, 42, 'the victory ring, not the beacon, follows all coins');
  assert.equal(bot.state().goal.y, 3, 'ring elevation is read from the game');
  assert.equal(bot.state().stage, 2);
  engine.G.warden = { hp: 10, state: 'hunt', segs: [{ x: 12, y: 5, z: 13 }] };
  assert.equal(bot.state().goal.x, 12, 'live guardian must be approached before the ring');
  assert.equal(bot.state().goal.z, 13, 'live guardian position is not hardcoded');
  engine.G.warden.hp = 0;
  engine.G.wardenDown = true;
  assert.equal(bot.state().goal.x, 42, 'after guardian defeat the destination is the ring');
  engine.G.state = 'victory';
  assert.equal(bot.state().levelDone, true);
  assert.equal(bot.state().gameDone, true);
  engine.G.state = 'dead';
  engine.player.hp = 0;
  assert.equal(bot.state().alive, false);
  assert.equal(bot.state().levelDone, false);
}

export function verifyFiles() {
  const html = readFileSync(HTML, 'utf8');
  const code = readFileSync(SCRIPT, 'utf8');
  assert.equal(html.split(LOADER).length - 1, 1, 'observer loaded exactly once');
  assert.ok(html.indexOf('window.__isle = {') < html.indexOf(LOADER),
    'observer must load after original game state is exposed');
  assert.ok(!/showInterstitial|showRewarded|showBanner|playgama-bridge/i.test(code),
    'observer cannot add advertisements');
  const originalHtml = html.replace('\n' + LOADER, '');
  const hash = createHash('sha256').update(originalHtml).digest('hex');
  assert.equal(hash, ORIGINAL_SHA256, 'original game, assets and graphics must be byte-identical');
  verifyObserver(code);
  console.log('VERIFY sumerki copy rule 13: source intact, live read-only observer');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) verifyFiles();
