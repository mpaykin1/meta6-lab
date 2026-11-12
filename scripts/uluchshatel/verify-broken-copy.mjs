// K5: read-only observer, live goals and byte-identical owner source.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { inventory, LOADER } from './inventory-broken-copy.mjs';

const DIR = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../games/broken-city-copy');
const OBSERVER = resolve(DIR, 'bot-observer.js');
const HTML = resolve(DIR, 'index.html');

export function verifyObserver(code) {
  const LEVELS = [
    { mode: 'fold', goal: -112, gaps: [-26], shades: 2 },
    { mode: 'lantern', goal: -150, stations: [-20], shades: 3 },
    { mode: 'runner', goal: -300, cracks: 6 },
    { mode: 'fold', goal: -160, gaps: [-48], shades: 4 },
    { mode: 'lantern', goal: -210, stations: [-26], shades: 5 },
    { mode: 'runner', goal: -320, cracks: 9, final: true }
  ];
  const G = {
    state: 'title', li: 0, cfg: null, next: 0, paused: false,
    check: 4, caught: 0, energy: 1, ending: null
  };
  const heroState = { pos: { x: 2, y: 3, z: 4 } };
  const engine = { G, heroState, LEVELS };
  const button = (id, visible, cssHidden = false) => ({
    id, hidden: !visible, disabled: false,
    classList: { contains: name => name === 'hidden' && cssHidden },
    getClientRects: () => visible ? [{}] : [],
    getAttribute: () => null
  });
  const buttons = [button('playBtn', true), button('soundBtn', true),
    button('actBtn', true, true), button('replayBtn', false)];
  const win = { __G: engine };
  const doc = { querySelectorAll: () => buttons };
  runInNewContext(code, { window: win, document: doc }, { timeout: 1500, filename: OBSERVER });

  const descriptor = Object.getOwnPropertyDescriptor(win, '__META_BOT__');
  assert.ok(descriptor, 'observer exists');
  assert.equal(descriptor.writable, false, 'observer is not writable');
  assert.equal(descriptor.configurable, false, 'observer cannot be removed');
  const bot = win.__META_BOT__;
  assert.ok(Object.isFrozen(bot), 'observer is frozen');
  assert.deepEqual(Object.keys(bot).sort(), ['info', 'state', 'version'], 'read-only API only');
  assert.equal(bot.info().levels, 6, 'six live levels');
  const assertUnchanged = () => {
    const before = JSON.stringify(engine);
    const actual = bot.state();
    assert.equal(JSON.stringify(engine), before, 'state() must not mutate gameplay');
    return actual;
  };

  let snap = assertUnchanged();
  assert.equal(snap.started, false);
  assert.equal(snap.level, 0);
  assert.equal(snap.levels, 6);
  assert.equal(snap.stagesTotal, 6);
  assert.equal(snap.goal.z, -106, 'goal is actual completion threshold');
  assert.equal(snap.hero.x, 2);
  assert.equal(snap.hero.y, 3, 'height is not z');
  assert.equal(snap.hero.z, 4);
  assert.equal(snap.levelDone, false);
  assert.equal(snap.gameDone, false);
  assert.equal(snap.progress, 0);
  assert.equal(snap.buttons.join(','), 'playBtn,soundBtn', 'hide CSS and invisible buttons');

  G.state = 'play';
  G.cfg = LEVELS[0];
  heroState.pos.z = -51;
  heroState.pos.y = 7;
  snap = assertUnchanged();
  assert.equal(snap.started, true);
  assert.equal(snap.hero.y, 7, 'live hero height');
  assert.ok(snap.progress > 0 && snap.progress < 1 / 6, 'live progress updates');
  assert.equal(snap.enemies, 2);

  G.state = 'trans';
  G.next = 1;
  snap = assertUnchanged();
  assert.equal(snap.levelDone, true, 'level transition is completion');
  assert.equal(snap.gameDone, false);
  assert.equal(snap.progress, 1 / 6);

  G.li = 1;
  G.cfg = LEVELS[1];
  G.state = 'play';
  heroState.pos.z = -80;
  snap = assertUnchanged();
  assert.equal(snap.level, 1);
  assert.equal(snap.goal.z, -144, 'goal changes with live level');
  assert.equal(snap.mode, 'lantern');

  G.li = 5;
  G.cfg = LEVELS[5];
  G.state = 'endwait';
  G.ending = 'exit';
  snap = assertUnchanged();
  assert.equal(snap.goal.z, -314);
  assert.equal(snap.levelDone, true);
  assert.equal(snap.gameDone, true);
  assert.equal(snap.progress, 1);
  assert.equal(bot.info().levels, 6);
}

export function verifyFiles() {
  const html = readFileSync(HTML, 'utf8');
  const code = readFileSync(OBSERVER, 'utf8');
  const counts = inventory(html);
  assert.equal(counts.total, 67, 'all 67 owner inventory entries remain');
  assert.equal(counts.levels, 6, 'six original levels retained');
  assert.equal(counts.gallery, 20, 'twenty gallery assets retained');
  assert.equal(counts.soundDefinitions, 11, 'eleven sound effects retained');
  assert.ok(html.indexOf('window.__G = {') < html.indexOf(LOADER), 'state exposed before adapter');
  assert.ok(!/showInterstitial|showRewarded|showBanner|playgama-bridge/i.test(code),
    'observer does not add advertising');
  verifyObserver(code);
  console.log('VERIFY Broken City copy rule 13: 67 definitions retained, read-only live observer');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) verifyFiles();
