// «Остров последнего аптекаря» · Глава I «Тихолист» — играбельное демо.
// Мир, рендер, робот, герой — эталон INK «Павший великан» (reference/ink-fallen-guardian), без изменений (REUSE).
import * as T from 'three';
import {createLivingWatercolor3D, createWatercolorStyle} from '../../reference/ink-fallen-guardian/shared/living-watercolor-3d.js';
import {createIllustrationCamera} from '../../reference/ink-fallen-guardian/shared/living-watercolor-generators.js';
import {objectMakers} from '../../reference/ink-fallen-guardian/ink-objects.js';
import {extraObjectMakers} from '../../reference/ink-fallen-guardian/ink-extras.js';
import {settlementMakers} from '../../reference/ink-fallen-guardian/ink-settlement.js';
import {buildWorld} from '../../reference/ink-fallen-guardian/ink-world.js';
import {createInkOptics} from '../../reference/ink-fallen-guardian/ink-optics.js';
import {createFallenRobot} from '../../reference/ink-fallen-guardian/ink-fallen-robot.js';
import {SCRIPT, AMBIENT, CHASE_BARKS} from './dialogue.js';
import {createGirl} from './girl.js';
import {createPost} from './post.js';
import {createAudio} from './audio.js';
import {createUI} from './ui.js';
import {createChapter2} from './chapter2.js';

const makers = {...objectMakers, ...extraObjectMakers, ...settlementMakers, robot: createFallenRobot};
const damp = (k, dt) => 1 - Math.exp(-k * dt);
const lerpAngle = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const V = (x, z) => new T.Vector3(x, 0, z);

// ---------- ЭТАП 1–2: мир INK как есть ----------
const scene = new T.Scene();
const camera = createIllustrationCamera(T, {width: innerWidth, height: innerHeight, viewHeight: 15, position: [12, 13, 17], lookAt: [0, .5, 0]});
camera.far = 180;
const renderer = new T.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight); renderer.outputColorSpace = T.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const style = createWatercolorStyle({
  seed: 'ink-rain-forest-1113', inkColor: '#303c38', paperColor: '#efece2', washColor: '#839487',
  washOpacity: .78, washLayers: 6, edgeWidth: .019, edgeJitter: .26, granulation: .40,
  bleed: .24, shadowWash: .17, motion: .10, pigmentPooling: .27, paperGap: .15, paintedLight: .67
});
const optics = createInkOptics(renderer);
const post = createPost(renderer);
const paint = createLivingWatercolor3D({THREE: T, renderer, scene, camera, style});
const ambient = new T.HemisphereLight('#fff3d7', '#96aca3', 2.2); scene.add(ambient);
const sun = new T.DirectionalLight('#fff0cd', 1.4); sun.position.set(-5, 9, 6); scene.add(sun);
scene.fog = new T.Fog('#e7e5d6', 64, 108);
const valley = buildWorld({makers, paint, scene});
const {hero, canWalk} = valley;
// Корзина аптекаря — из готовых деталей мира (камни/грибы не нужны: простая плетёнка из примитивов INK).
const basket = new T.Group();
const weave = new T.Mesh(new T.CylinderGeometry(.2, .15, .2, 10, 1, true), new T.MeshStandardMaterial({color: '#a88a5c', roughness: 1, side: T.DoubleSide}));
const handle = new T.Mesh(new T.TorusGeometry(.16, .015, 5, 14, Math.PI), new T.MeshStandardMaterial({color: '#7a6040'}));
handle.position.y = .1; basket.add(weave, handle); basket.position.set(-.44, .46, .1); hero.add(basket);
paint.apply(basket, {seed: 'apothecary-basket'});

// ---------- Ключевые точки сюжета ----------
const HOME = V(-7.9, -13), ROBOT = V(-10.5, 5.8), START = V(-8.7, -11.4);
// БЕЗ ПОВТОРОВ: каждый поход травы и сонник растут в новых местах (3 из 7 и 2 из 5).
const POOL = {
  herbs: [[-6.8, -2.5], [-1.5, 4.0], [-12.2, .8], [-3.2, -4.8], [-9.2, -1.2], [.6, 1.2], [-13.6, -2.6]],
  shrooms: [[-15.4, 8.2], [-4.6, 10.6], [-7.8, 12.6], [-1.4, 9.2], [-16.5, 5.0]]
};
const pickN = (arr, n) => arr.map((v, i) => [Math.random(), i]).sort((a, b) => a[0] - b[0]).slice(0, n).map(([, i]) => i);
const SPOTS = {
  herbs: POOL.herbs.slice(0, 3),
  shrooms: POOL.shrooms.slice(0, 2),
  water: [8.7, 10.8],
  spare: [[-1, -3.2], [1.6, 1.8], [-6.2, -6.5], [-13.2, -3.2], [3.2, 4.2]]
};
const NEAR = {shrine: V(-15, 2), fox: V(-1.8, 13.5), deer: V(-6.5, 3.7)};
const guardian = valley.world.children.find(o => o.userData?.isFallenRobot);
const robotHead = guardian?.children.find(c => c.isGroup && Math.abs(c.position.y - 2.64) < .01);
const robotHands = guardian?.children.filter(c => c.isGroup && Math.abs(c.position.y - .30) < .01) || [];
const headBase = robotHead?.rotation.clone();

// ---------- Маяки целей и частицы ----------
function gradient(w, h, paint2d) { const c = document.createElement('canvas'); c.width = w; c.height = h; paint2d(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; }
const columnTex = gradient(32, 256, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffffff00'); g.addColorStop(.75, '#ffffffaa'); g.addColorStop(1, '#ffffff');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = 'destination-in';
  const s = x.createLinearGradient(0, 0, w, 0); s.addColorStop(0, '#0000'); s.addColorStop(.5, '#000f'); s.addColorStop(1, '#0000');
  x.fillStyle = s; x.fillRect(0, 0, w, h);
});
const ringGeo = new T.RingGeometry(.55, .62, 32); ringGeo.rotateX(-Math.PI / 2);
function beacon(color, height = 6) {
  const g = new T.Group();
  const col = new T.Sprite(new T.SpriteMaterial({map: columnTex, color, transparent: true, opacity: .55, depthWrite: false}));
  col.scale.set(.75, height, 1); col.position.y = height / 2; g.add(col);
  const ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({color, transparent: true, opacity: .6, depthWrite: false}));
  ring.position.y = .06; g.add(ring);
  g.userData = {col, ring, on: 0, want: 0, phase: Math.random() * 6}; g.visible = false; scene.add(g); return g;
}
function tickBeacon(b, t, dt) {
  const u = b.userData; u.on += (u.want - u.on) * damp(3, dt); b.visible = u.on > .01;
  const p = .5 + .5 * Math.sin(t * 2.2 + u.phase);
  u.col.material.opacity = u.on * (.35 + p * .3); u.ring.material.opacity = u.on * (1 - (t * .6 + u.phase) % 1) * .7;
  u.ring.scale.setScalar(.6 + ((t * .6 + u.phase) % 1) * 1.4);
}
const MAXP = 180, pPos = new Float32Array(MAXP * 3), pCol = new Float32Array(MAXP * 3), parts = [];
const pGeo = new T.BufferGeometry();
pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new T.BufferAttribute(pCol, 3));
const points = new T.Points(pGeo, new T.PointsMaterial({size: 6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .9, depthWrite: false}));
points.frustumCulled = false; scene.add(points);
for (let i = 0; i < MAXP; i++) parts.push({life: 0, p: new T.Vector3(), v: new T.Vector3()});
function burst(at, color, n = 22, spread = 1.4) {
  const c = new T.Color(color);
  for (const q of parts) {
    if (n <= 0) break; if (q.life > 0) continue; n--;
    q.life = .8 + Math.random() * .7; q.p.copy(at); q.c = c;
    q.v.set((Math.random() - .5) * spread, 1 + Math.random() * 1.6, (Math.random() - .5) * spread);
  }
}
function tickParticles(dt) {
  parts.forEach((q, i) => {
    if (q.life > 0) { q.life -= dt; q.v.y -= dt * 1.4; q.v.multiplyScalar(1 - dt * 1.2); q.p.addScaledVector(q.v, dt); }
    const alive = q.life > 0;
    pPos.set(alive ? [q.p.x, q.p.y, q.p.z] : [0, -50, 0], i * 3);
    if (alive) pCol.set([q.c.r, q.c.g, q.c.b], i * 3);
  });
  pGeo.attributes.position.needsUpdate = pGeo.attributes.color.needsUpdate = true;
}
// Светлячки сумерек: появляются, когда темнеет (мир живёт и без игрока).
const FF = 46, ffPos = new Float32Array(FF * 3), ffGeo = new T.BufferGeometry();
ffGeo.setAttribute('position', new T.BufferAttribute(ffPos, 3));
const fireflies = new T.Points(ffGeo, new T.PointsMaterial({size: 5, sizeAttenuation: false, color: '#ffd98a', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending}));
fireflies.frustumCulled = false; scene.add(fireflies);

// ---------- Предметы сбора (из готовых генераторов эталона) ----------
function pickable(kind, x, z, i) {
  let obj;
  if (kind === 'herb') {
    obj = makers.wildflowers(i + 7); obj.scale.setScalar(1.15);
    obj.traverse(o => { if (o.isMesh && o.material?.color?.getHexString() !== '8a9975') { o.material = o.material.clone(); o.material.color.set(i % 2 ? '#d7d9a0' : '#c9dd8c'); } });
  } else {
    obj = makers.mushrooms(); obj.scale.setScalar(.8);
    obj.traverse(o => { if (o.isMesh && o.material?.color?.getHexString() === 'b46e5a') { o.material = o.material.clone(); o.material.color.set('#6f8fb5'); } });
  }
  const p = V(x, z); fixSpot(p); obj.position.copy(p); obj.rotation.y = i * 1.7; scene.add(obj);
  paint.apply(obj, {seed: `${kind}-${i}`});
  const b = beacon(kind === 'herb' ? '#b9c86a' : '#7d9fd0', kind === 'spare' ? 3.2 : 6); b.position.copy(p);
  return {kind, obj, beacon: b, pos: p, taken: false, take: 0, respawn: 0, base: obj.scale.x};
}
function fixSpot(p) {
  if (canWalk(p.x, p.z)) return p;
  for (let r = .5; r < 4; r += .5) for (let a = 0; a < 6.28; a += .5) if (canWalk(p.x + Math.cos(a) * r, p.z + Math.sin(a) * r)) return p.set(p.x + Math.cos(a) * r, 0, p.z + Math.sin(a) * r);
  return p;
}
const herbs = SPOTS.herbs.map(([x, z], i) => pickable('herb', x, z, i));
const shrooms = SPOTS.shrooms.map(([x, z], i) => pickable('shroom', x, z, i + 10));
const spares = SPOTS.spare.map(([x, z], i) => pickable('spare', x, z, i + 20));
shrooms.forEach(s => s.obj.visible = false); spares.forEach(s => s.obj.visible = false);
const waterBeacon = beacon('#86c3cf'); waterBeacon.position.copy(V(...SPOTS.water));
const homeBeacon = beacon('#f0b464', 8); homeBeacon.position.copy(HOME);

// ---------- Ива ----------
const iva = createGirl({makers, paint}); scene.add(iva.group);
// Свечение героев видно сквозь кроны: фонарь аптекаря и огонёк импланта Ивы (иначе лес их прячет).
const discTex = gradient(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, '#ffffffcc'); g.addColorStop(.45, '#ffffff44'); g.addColorStop(1, '#ffffff00'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
function mark(color) { const m = new T.Sprite(new T.SpriteMaterial({map: discTex, color, transparent: true, opacity: .3, depthTest: false, depthWrite: false})); m.renderOrder = 20; scene.add(m); return m; }
const heroMark = mark('#ffcf86'), ivaMark = mark('#86d9c9');

// ---------- Звук, интерфейс, диалоги ----------
const audio = createAudio();
const api = window.__APTEKAR__ = {bot: false, timeScale: 1, version: '1.0.0'};
let paused = true;
const ui = createUI({
  onStart() { audio.start(); paused = false; begin(); },
  onRestart() { reset(); paused = false; audio.start(); begin(); },
  onSound() { audio.setEnabled(!audio.enabled); return audio.enabled; },
  onPause(open) { paused = open || state === 'title'; },
  onSkip() { if (dlg.cur) dlg.t = dlg.dur; },
  onAction() {
    if(state === 'archive'){chapter2.action();return;}
    useDust(); if (state === 'grab') struggle += charges > 0 ? 0 : .12;
  },
  onNext() { beginChapter2(); }
});
ui.bind(renderer.domElement);
const dlg = {queue: [], cur: null, t: 0, dur: 0, idle: 0, gap: 0};
function play(key, then, interrupt = false) {
  const lines = SCRIPT[key] || key;
  if (interrupt) { dlg.queue.length = 0; if (dlg.cur) { dlg.cur = null; ui.say(null); } }
  lines.forEach((line, i) => dlg.queue.push({line, then: i === lines.length - 1 ? then : null}));
}
function tickDialogue(dt) {
  if (!dlg.cur && dlg.queue.length && (dlg.gap -= dt) <= 0) {
    dlg.cur = dlg.queue.shift(); dlg.t = 0; dlg.dur = 1.7 + dlg.cur.line[1].length * .052;
    ui.say(dlg.cur.line); heard++; if (dlg.cur.line[0] === 'v') { audio.voice(dlg.cur.line[1]); glitchSpike = Math.max(glitchSpike, .55); }
  }
  if (dlg.cur) {
    dlg.idle = 0; dlg.t += dt;
    if (dlg.t >= dlg.dur) { const cb = dlg.cur.then; dlg.cur = null; dlg.gap = .35; ui.say(null); cb?.(); }
  } else dlg.idle += dt;
}
const busy = () => !!dlg.cur || dlg.queue.length > 0;

// ---------- Состояние игры ----------
let heard = 0, frameAvg = 16, quality = 1;
let state = 'title', stage = 0, counts = {herbs: 0, shrooms: 0, water: 0}, charges = 0;
let day = 0, struggle = 0, lastFlip = 0, stateT = 0, chaseT = 0, glitchSpike = 0, fade = 0, fadeTo = 0;
let flags = {}, ambientIx = 0, barkIx = 0, barkT = 0, checkpoint = START.clone(), afterWaterT = -1, warm = 0;
let yaw = -.62, pitch = .92, zoom = 1, viewH = 15, shake = 0, elapsed = 0, previous = 0, stepT = 0;
const heroVel = new T.Vector3(), heroDir = V(0, 1), focus = START.clone(), desired = new T.Vector3();
const chapter2 = createChapter2({scene, makers, paint, hero, iva, canWalk, fixSpot, beacon, burst, audio, play,
  onCaught() {setState('archiveCaught');fadeTo=1;glitchSpike=.55;audio.stab();play('archiveCaught',null,true);},
  onComplete() {setState('chapter2End');fadeTo=0;day=0;audio.setMood('calm');ui.end(true,2);}
});

function setState(s) { state = s; stateT = 0; }
let layoutHash = '';
function layoutSpots() {
  const h = pickN(POOL.herbs, 3), m = pickN(POOL.shrooms, 2);
  layoutHash = 'h' + h.join('') + 'm' + m.join('');
  [[herbs, h, POOL.herbs], [shrooms, m, POOL.shrooms]].forEach(([items, ix, pool]) => items.forEach((it, i) => {
    it.pos.set(pool[ix[i]][0], 0, pool[ix[i]][1]); fixSpot(it.pos); it.beacon.position.copy(it.pos);
  }));
}
function reset() {
  chapter2.hide(); ui.mode('dust'); ui.end(false,1);
  layoutSpots(); heard = 0;
  stage = 0; counts = {herbs: 0, shrooms: 0, water: 0}; charges = 0; day = 0; struggle = 0; chaseT = 0;
  flags = {}; ambientIx = 0; barkIx = 0; afterWaterT = -1; fade = 0; fadeTo = 0; warm = 0;
  dlg.queue.length = 0; dlg.cur = null; ui.say(null); ui.clearJournal();
  for (const it of [...herbs, ...shrooms, ...spares]) { it.taken = false; it.take = 0; it.obj.visible = it.kind === 'herb'; it.obj.scale.setScalar(it.base); it.obj.position.copy(it.pos); it.beacon.userData.want = 0; }
  waterBeacon.userData.want = homeBeacon.userData.want = 0;
  hero.position.copy(START); heroVel.set(0, 0, 0); iva.group.position.set(START.x - .8, 0, START.z - 1.1); iva.set('follow');
  audio.setMood('calm');
}
function begin() { setState('walk'); stage = 1; herbs.forEach(h => h.beacon.userData.want = 1); play('intro'); }
function beginChapter2() {
  if (state !== 'ending') return;
  ui.end(false); ui.mode('archive');day=1;fade=fadeTo=0;warm=0;
  heroVel.set(0,0,0);focus.copy(hero.position);setState('archive');chapter2.begin();
}
reset();

function take(it) {
  it.taken = true; burst(it.obj.position.clone().setY(.5), it.kind === 'herb' ? '#b9c86a' : '#7d9fd0'); it.beacon.userData.want = 0;
  audio.chime(it.kind === 'herb' ? 0 : 1); shake = .12;
  if (it.kind === 'herb') {
    counts.herbs++; play('herb' + counts.herbs);
    if (counts.herbs === 3) { stage = 2; shrooms.forEach(s => { s.obj.visible = true; s.beacon.userData.want = 1; }); }
  } else if (it.kind === 'shroom') {
    counts.shrooms++; charges++; play('shroom' + counts.shrooms);
    if (counts.shrooms === 2) { stage = 3; waterBeacon.userData.want = 1; }
  } else { charges = Math.min(3, charges + 1); it.respawn = 18; }
}
function useDust() {
  if (charges <= 0 || !['chase', 'grab', 'tell'].includes(state)) return;
  const d = flat(hero.position, iva.group.position);
  if (d > 3.4) return;
  charges--; audio.dust(); burst(iva.group.position.clone().setY(.8), '#9db8e0', 40, 2.4); shake = .2;
  iva.set('sleep', 4.6); if (state === 'grab') setState('chase');
  if (!flags.dustLine) { flags.dustLine = true; play('dust', null, true); }
}
function startTell(late) {
  setState('tell'); iva.set('tell', 2.6); audio.stab(); audio.setMood('chase'); checkpoint.copy(hero.position);
  play(late ? 'tellLate' : 'tell', null, true);
  [...herbs, ...shrooms].forEach(s => s.beacon.userData.want = 0); waterBeacon.userData.want = 0;
}
function startChase() {
  setState('chase'); flags.chased = true; iva.set('chase'); homeBeacon.userData.want = 1;
  spares.forEach(s => { if (!s.taken) { s.obj.visible = true; s.beacon.userData.want = .7; } });
}
function toEnding(lines) {
  setState('outro'); iva.set('faint'); fadeTo = 1; homeBeacon.userData.want = 0;
  play(lines, () => {
    hero.position.set(HOME.x - .9, 0, HOME.z + .7); iva.group.position.set(HOME.x - 1.8, 0, HOME.z - .3);
    iva.set('idle'); iva.state.lie = 0; day = 0; audio.setMood('calm'); focus.copy(hero.position);
    spares.forEach(s => { s.obj.visible = false; s.beacon.userData.want = 0; });
    setState('ending'); fadeTo = 0; play('ending', () => setTimeout(() => ui.end(true), 900));
  }, true);
}

// ---------- Бот-проходчик (для проверки проходимости; включается из теста) ----------
let botSide = 1, botStuckT = 0, botLast = new T.Vector3(), botDodge = 0, botFlip = 0;
function botInput(dt) {
  let target = null;
  if (state === 'walk') {
    if (stage <= 1) target = herbs.find(h => !h.taken)?.pos;
    else if (stage === 2) target = shrooms.find(h => !h.taken)?.pos;
    else if (stage === 3) target = V(...SPOTS.water);
  } else if (state === 'chase' || state === 'tell') target = HOME;
  else if (state === 'archive') {
    const goal=chapter2.goal();if(goal)target=V(goal.x,goal.y);
  }
  if (state === 'grab' && api.botPassive) return {x: 0, y: 0};
  if (state === 'grab') { botFlip += dt; if (botFlip > .09) { botFlip = 0; botSide *= -1; } return {x: botSide, y: 0}; }
  if (!target) return {x: 0, y: 0};
  let dir = V(target.x - hero.position.x, target.z - hero.position.z);
  if (dir.length() < .3) return {x: 0, y: 0};
  dir.normalize();
  if (state === 'chase') {
    const g = V(iva.group.position.x - hero.position.x, iva.group.position.z - hero.position.z), gd = g.length();
    if (!api.botPassive && gd < 1.9 && charges > 0 && ['chase', 'lunge'].includes(iva.state.mode)) useDust();
    if (gd < 4.2 && g.normalize().dot(dir) > .55) dir = dir.clone().add(V(-dir.z, dir.x).multiplyScalar(botSide * 1.6)).normalize();
  }
  botStuckT += dt;
  if (botStuckT > 1.2) { if (flat(botLast, hero.position) < .4) { botDodge = .9; botSide *= -1; } botLast.copy(hero.position); botStuckT = 0; }
  if (botDodge > 0) { botDodge -= dt; dir = V(-dir.z * botSide, dir.x * botSide).add(dir.multiplyScalar(.3)).normalize(); }
  // Перевод мирового направления в оси джойстика с учётом поворота камеры.
  return {x: Math.cos(yaw) * dir.x - Math.sin(yaw) * dir.z, y: Math.sin(yaw) * dir.x + Math.cos(yaw) * dir.z};
}

// ---------- Симуляция (один подшаг) ----------
function simulate(dt, mx, my) {
  stateT += dt;
  tickDialogue(dt);

  // --- аптекарь: инерция, а не рывки ---
  const canMove = ['walk', 'chase', 'tell', 'ending', 'archive'].includes(state);
  const len = Math.hypot(mx, my); if (len > 1) { mx /= len; my /= len; }
  const want = canMove ? V(Math.cos(yaw) * mx + Math.sin(yaw) * my, -Math.sin(yaw) * mx + Math.cos(yaw) * my).multiplyScalar(state === 'chase' ? 3.45 : state === 'tell' ? 1.1 : 3.1) : V(0, 0);
  heroVel.lerp(want, damp(9, dt));
  if (state !== 'grab') {
    const nx = hero.position.x + heroVel.x * dt, nz = hero.position.z + heroVel.z * dt;
    if (canWalk(nx, hero.position.z)) hero.position.x = nx; else heroVel.x *= .3;
    if (canWalk(hero.position.x, nz)) hero.position.z = nz; else heroVel.z *= .3;
  }
  const speed = Math.hypot(heroVel.x, heroVel.z);
  if (speed > .15) { heroDir.set(heroVel.x, 0, heroVel.z).normalize(); hero.rotation.y = lerpAngle(hero.rotation.y, Math.atan2(heroVel.x, heroVel.z), damp(10, dt)); }
  const gait = elapsed * (speed > .2 ? 8.5 : 2);
  hero.position.y = speed > .2 ? Math.abs(Math.sin(gait)) * .035 : Math.sin(elapsed * 2) * .01;
  hero.rotation.z = state === 'grab' ? Math.sin(elapsed * 22) * .08 : Math.sin(gait * .5) * .02 * Math.min(1, speed);
  hero.userData.legs.forEach((leg, i) => leg.rotation.x = speed > .2 ? Math.sin(gait + i * Math.PI) * .4 * Math.min(1, speed / 2.5) : 0);
  hero.userData.scarf.rotation.z = Math.sin(elapsed * 2.3) * .09 + speed * .05;
  basket.rotation.z = Math.sin(gait) * .12 * Math.min(1, speed);
  if (speed > 1 && (stepT -= dt) <= 0) { stepT = .3; audio.step(.6); }

  // --- сбор ---
  for (const it of [...herbs, ...shrooms, ...spares]) {
    if (it.taken) {
      if (it.take < 1) { it.take = Math.min(1, it.take + dt * 2.2); it.obj.position.lerp(hero.position.clone().setY(.9), damp(8, dt)); it.obj.scale.setScalar(it.base * (1 - it.take)); if (it.take >= 1) it.obj.visible = false; }
      if (it.kind === 'spare' && it.respawn > 0 && (it.respawn -= dt) <= 0 && state === 'chase') {
        it.taken = false; it.take = 0; it.obj.visible = true; it.obj.position.copy(it.pos); it.obj.scale.setScalar(it.base); it.beacon.userData.want = .7;
      }
      continue;
    }
    if (!it.obj.visible) continue;
    it.obj.rotation.y += dt * .3; it.obj.position.y = Math.sin(elapsed * 2 + it.base * 9) * .03;
    const ok = it.kind === 'herb' ? stage === 1 : it.kind === 'shroom' ? stage === 2 : state === 'chase' || state === 'grab';
    if (ok && flat(hero.position, it.pos) < 1.05) take(it);
  }
  if (state === 'walk' && stage === 3 && flat(hero.position, V(...SPOTS.water)) < 1.15) {
    stage = 4; counts.water = 1; audio.chime(2); burst(hero.position.clone().setY(.4), '#86c3cf', 30); waterBeacon.userData.want = 0;
    play('water', () => { afterWaterT = 3; });
  }

  // --- сюжет: прогулка, места, сумерки ---
  if (state === 'walk') {
    day = Math.min(1, day + dt / (stage === 4 ? 9 : 320));
    const near = (k, p, r) => { if (!flags[k] && !busy() && flat(hero.position, p) < r) { flags[k] = true; return true; } return false; };
    if (stage >= 1 && near('robot', ROBOT, 8.2)) { iva.set('listen', 14); play('robot', () => iva.set('follow')); }
    if (stage >= 1 && near('shrine', NEAR.shrine, 4)) play('shrine');
    if (stage >= 1 && near('fox', NEAR.fox, 4.5)) play('fox');
    if (stage >= 1 && near('deer', NEAR.deer, 3.6)) play('deer');
    if (stage >= 1 && !flags.lake && !busy() && hero.position.x > 3.4) { flags.lake = true; play('lake'); }
    if (!flags.dusk1 && day > .42 && stage < 4 && !busy()) { flags.dusk1 = true; play('dusk1'); }
    if (!flags.dusk2 && day > .74 && stage < 4 && !busy()) { flags.dusk2 = true; play('dusk2'); }
    if (stage >= 1 && stage < 4 && dlg.idle > 19 && ambientIx < AMBIENT.length) play(AMBIENT[ambientIx++]);
    if (afterWaterT > 0 && !busy() && (afterWaterT -= dt) <= 0) startTell(false);
    if (day >= 1 && stage < 4) startTell(true);
  } else if (state === 'tell') {
    if (flags.chased) chaseT += dt;
    if (stateT > 2.6) startChase();
  } else if (state === 'chase') {
    chaseT += dt; barkT += dt;
    if (!flags.hint && chaseT > 5 && !busy()) { flags.hint = true; play('hint'); }
    if (barkT > 10 && !busy()) { barkT = 0; play([CHASE_BARKS[barkIx++ % CHASE_BARKS.length]]); }
    if (Math.random() < dt * .35) glitchSpike = Math.max(glitchSpike, .35 + Math.random() * .3);
    const gd = flat(hero.position, iva.group.position);
    if (['chase', 'lunge'].includes(iva.state.mode) && gd < .68) {
      setState('grab'); iva.set('grab'); struggle = 0; audio.stab(); shake = .35; play('grab', null, true);
    }
    if (flat(hero.position, HOME) < 1.7) { audio.door(); shake = .3; toEnding('home'); }
    else if (chaseT > 70) toEnding('faint');
  } else if (state === 'grab') {
    chaseT += dt;   // ночь идёт и в захвате: погоня всегда кончается (не дольше ~70 с)
    // Ива тянет к великану; вырваться — частые рывки в стороны или пыльца.
    const toR = V(ROBOT.x - hero.position.x, ROBOT.z - hero.position.z).normalize();
    hero.position.addScaledVector(toR, 1.55 * dt);
    iva.group.position.copy(hero.position).addScaledVector(toR, .55);
    iva.group.rotation.y = Math.atan2(toR.x, toR.z);
    hero.rotation.y = lerpAngle(hero.rotation.y, Math.atan2(-toR.x, -toR.z), damp(6, dt));
    const sx = Math.sign(Math.round(mx)), sy = Math.sign(Math.round(my)), flip = sx * 3 + sy;
    if ((sx || sy) && flip !== lastFlip) { struggle += .17; lastFlip = flip; shake = Math.max(shake, .12); }
    struggle = Math.max(0, struggle - dt * .3);
    if (struggle >= 1) {
      setState('chase'); iva.set('stun', 1.6); hero.position.addScaledVector(toR, -1.2); fixSpot(hero.position);
      play('breakFree', null, true); audio.chime(1);
    } else if (flat(hero.position, ROBOT) < 3.6) {
      setState('caught'); flags.caughtN = (flags.caughtN || 0) + 1; fadeTo = 1; glitchSpike = 1; play('caught', null, true); audio.stab();
    }
  } else if (state === 'archive') {
    chapter2.tick(dt,elapsed);
  } else if (state === 'archiveCaught') {
    if (stateT > 2.15) {
      chapter2.resetAfterCaught();heroVel.set(0,0,0);focus.copy(hero.position);
      fadeTo=0;setState('archive');
    }
  } else if (state === 'caught') {
    chaseT += dt;
    if (stateT > 3.4) {
      hero.position.copy(checkpoint); heroVel.set(0, 0, 0); focus.copy(checkpoint);
      iva.group.position.copy(checkpoint).add(V(1.4, 1.2)); fixSpot(iva.group.position);
      charges = Math.max(charges, 1); fadeTo = 0; setState('tell'); iva.set('tell', 3.4); play('caughtAfter', null, true);
    }
  }

  // --- Ива ---
  const robotPos = guardian ? guardian.position : ROBOT;
  iva.update(dt, {hero, heroVel, heroDir, canWalk, robot: robotPos, home: HOME, time: elapsed, dusk: day});
  if (iva.state.mode === 'listen' && iva.state.t > iva.state.dur) iva.set('follow');

  heroMark.position.set(hero.position.x, .8, hero.position.z);
  heroMark.scale.setScalar(1.3 + Math.sin(elapsed * 3) * .06); heroMark.material.opacity = .22 + day * .25;
  ivaMark.position.set(iva.group.position.x, .7, iva.group.position.z);
  ivaMark.material.color.set('#86d9c9').lerp(new T.Color('#ff6a2c'), Math.min(1, iva.state.signal * 1.2));
  ivaMark.scale.setScalar(1 + iva.state.signal * 1.1 + Math.sin(elapsed * (2 + iva.state.signal * 8)) * .12);
  ivaMark.material.opacity = .18 + iva.state.signal * .35 + day * .12;

  // --- великан: голова следит, руки вздрагивают, глаза разгораются ---
  const sig = iva.state.signal, robotNear = 1 - Math.min(1, flat(hero.position, ROBOT) / 22);
  if (robotHead && guardian) {
    const local = guardian.worldToLocal(hero.position.clone().setY(1));
    const look = T.MathUtils.clamp(Math.atan2(local.x - robotHead.position.x, local.z - robotHead.position.z), -.7, .7);
    const k = Math.min(1, sig * 1.3 + robotNear * .4);
    robotHead.rotation.y = headBase.y + look * .55 * k + Math.sin(elapsed * .21) * .03;
    robotHead.rotation.x = headBase.x - k * .1 + Math.sin(elapsed * .37) * .015;
    robotHead.rotation.z = headBase.z + Math.sin(elapsed * .29) * .02 + k * .07;
  }
  robotHands.forEach((h, i) => { h.rotation.x = -sig * .14 * (i ? 1 : .6) + Math.max(0, Math.sin(elapsed * 1.7 + i * 2)) * sig * .06; });

}

// ---------- Главный цикл ----------
function resize() { renderer.setSize(innerWidth, innerHeight); }
addEventListener('resize', resize);
function animate(ms) {
  requestAnimationFrame(animate);
  if (document.hidden) { previous = ms; return; }
  const raw = Math.min(.4, Math.max(0, (ms - previous) / 1000)); previous = ms;
  // Медленное устройство — снижаем качество один раз, плавность важнее резкости.
  frameAvg = frameAvg * .97 + Math.min(raw, .1) * 1000 * .03;
  if (frameAvg > 30 && quality > .7 && elapsed > 3) { quality = .7; renderer.setPixelRatio(1); paint.setQuality(.7); post.setScale(.8); }
  const dt = paused ? 0 : raw * api.timeScale;
  const fr = Math.min(raw, .066);
  elapsed += raw;
  const input = ui.input();
  yaw -= input.lookX * .0065; pitch = T.MathUtils.clamp(pitch + input.lookY * .0035, .32, 1.2);
  zoom = T.MathUtils.clamp(zoom * Math.exp(-input.zoom * .001), .7, 1.8);
  let mx = input.x, my = input.y;
  if (api.bot && !paused) ({x: mx, y: my} = botInput(dt));
  // Симуляция идёт подшагами по 50 мс: на слабом устройстве игра медленнее рисуется, но не замедляется.
  const steps = Math.min(32, Math.max(1, Math.ceil(dt / .05)));
  for (let k = 0; k < steps; k++) simulate(dt / steps, mx, my);
  const sig = iva.state.signal, robotNear = 1 - Math.min(1, flat(hero.position, ROBOT) / 22);

  // --- свет и сумерки ---
  const dusk = ['ending','chapter2End'].includes(state) ? 0 : Math.pow(day, 1.25);
  ambient.color.set('#fff3d7').lerp(new T.Color('#aeb8d4'), dusk); ambient.intensity = 2.2 - dusk * .75;
  sun.color.set('#fff0cd').lerp(new T.Color('#e48c62'), dusk); sun.intensity = 1.4 - dusk * .8;
  scene.fog.color.set('#e7e5d6').lerp(new T.Color('#b9bfcc'), dusk);
  fireflies.material.opacity = Math.max(0, dusk - .35) * 1.3;
  for (let i = 0; i < FF; i++) {
    const a = i * 2.39996, r = 3 + (i % 9) * 1.4;
    ffPos.set([focus.x + Math.cos(a + elapsed * .05) * r + Math.sin(elapsed * .7 + i) * .4,
      .4 + ((i * .37 + elapsed * .12) % 1.8) + Math.sin(elapsed * 2 + i) * .1,
      focus.z + Math.sin(a + elapsed * .05) * r + Math.cos(elapsed * .6 + i) * .4], i * 3);
  }
  ffGeo.attributes.position.needsUpdate = true;
  if (guardian?.userData.robotEyes) {
    const eyes = guardian.userData.robotEyes.color, flare = Math.min(1, sig * 1.2 + (state === 'caught' ? 1 : 0));
    eyes.setRGB(1, .39 + Math.sin(elapsed * .75) * .065 + flare * .45, .2 + flare * .55);
  }

  // --- маяки, частицы ---
  for (const b of [...herbs, ...shrooms, ...spares].map(i => i.beacon).concat(waterBeacon, homeBeacon, ...chapter2.beacons)) tickBeacon(b, elapsed, raw);
  tickParticles(raw);

  // --- камера: тяжёлая, с запаздыванием и упреждением ---
  const chaseCam = ['chase', 'grab', 'tell', 'caught', 'archive', 'archiveCaught'].includes(state);
  desired.set(hero.position.x + heroVel.x * .35, .6, hero.position.z + heroVel.z * .35);
  if (chaseCam) desired.lerp(iva.group.position.clone().setY(.6), .25);
  focus.lerp(desired, damp(state === 'ending' ? 1.5 : 3.6, fr));
  shake = Math.max(0, shake - raw * 1.6);
  const aspect = innerWidth / Math.max(1, innerHeight);
  const baseH = Math.max(10, 7.2 / aspect) * (chaseCam ? 1.32 : state === 'ending' ? .85 : 1) / zoom;
  viewH += (baseH - viewH) * damp(1.4, raw);
  if (Math.abs(camera.userData.viewHeight - viewH) > .001) { camera.userData.viewHeight = viewH; camera.updateForViewport(innerWidth, innerHeight); }
  const sx = (Math.random() - .5) * shake, sz = (Math.random() - .5) * shake;
  camera.position.set(focus.x + Math.sin(yaw) * Math.cos(pitch) * 60 + sx, focus.y + Math.sin(pitch) * 60, focus.z + Math.cos(yaw) * Math.cos(pitch) * 60 + sz);
  camera.lookAt(focus.x + sx, focus.y, focus.z + sz);

  // --- звук и пост-обработка ---
  audio.setMood(state === 'chase' || state === 'grab' || state === 'tell' || state === 'caught' ? 'chase' : day > .45 && (state === 'walk' || state === 'archive' || state === 'archiveCaught') ? 'dusk' : 'calm');
  audio.setLevels({robot: Math.max(robotNear, sig * .8), chase: state === 'chase' || state === 'grab' ? Math.min(1, .35 + chaseT / 60 + (state === 'grab' ? .5 : 0)) : 0, rain: .4 + dusk * .5});
  glitchSpike = Math.max(0, glitchSpike - raw * 2.6);
  fade += (fadeTo - fade) * damp(fadeTo > fade ? 1.6 : 1.1, raw);
  warm += ((state === 'chase' ? Math.max(0, 1 - flat(hero.position, HOME) / 12) : state === 'ending' ? .6 : 0) - warm) * damp(2, raw);
  const u = post.uniforms;
  u.time.value = elapsed; u.signal.value = sig * (state === 'walk' ? .6 : 1); u.dusk.value = dusk; u.fade.value = fade; u.warm.value = warm;
  u.glitch.value = Math.min(1, glitchSpike + (state === 'grab' ? .3 + struggle * .2 : 0) + (state === 'caught' ? .6 : 0) + sig * .06);
  ui.pips(counts, stage === 4 && state !== 'walk' ? 0 : stage);
  if (state === 'archive') ui.action(chapter2.doorNearby(),1,false);
  else ui.action(counts.shrooms > 0 && !['ending','chapter2End'].includes(state), charges,
    state === 'grab' || (state === 'chase' && flat(hero.position, iva.group.position) < 2.6 && charges > 0));

  valley.tick(elapsed, focus, false);
  paint.tick(ms);
  post.render(() => optics.render(scene, camera, false));
}
requestAnimationFrame(animate);

Object.defineProperties(api, Object.getOwnPropertyDescriptors({
  get state() { return state; }, get stage() { return stage; }, get counts() { return counts; },
  get charges() { return charges; }, get girl() { return iva.state.mode; }, get day() { return day; },
  // Для бота-проверки: перейти сразу к погоне у причала.
  debugChase() {
    api.start(); dlg.queue.length = 0; dlg.cur = null; stage = 4; counts = {herbs: 3, shrooms: 2, water: 1}; charges = 2; day = 1;
    hero.position.set(7.5, 0, 10.8); iva.group.position.set(6.3, 0, 10.7); focus.copy(hero.position); startTell(false);
  },
  get layoutHash() { return chapter2.active || chapter2.done ? layoutHash+':'+chapter2.layoutHash : layoutHash; },
  get progress() { return heard + counts.herbs + counts.shrooms + counts.water + chapter2.pages + chapter2.doorsClosed; },
  get chapter() {return ['archive','archiveCaught','chapter2End'].includes(state) ? 2 : 1;},
  get chapter1Ended() {return state === 'ending';},
  get archivePages() {return chapter2.pages;},
  get archiveDoors() {return chapter2.doorsClosed;},
  get archiveCaught() {return chapter2.caught;},
  get menuOpen() { return ui.menuOpen; }, get ended() { return state === 'chapter2End'; },
  goal() {
    if(state === 'archive')return chapter2.goal();
    if (state === 'walk') {
      const it = stage === 1 ? herbs.find(h => !h.taken) : stage === 2 ? shrooms.find(h => !h.taken) : null;
      if (it) return {x: it.pos.x, y: it.pos.z};
      if (stage >= 3) return {x: SPOTS.water[0], y: SPOTS.water[1]};   // цель не исчезает посреди шага бота
      return null;
    }
    return ['chase', 'tell', 'grab', 'caught', 'outro', 'ending'].includes(state) ? {x: HOME.x, y: HOME.z} : null;
  },
  get caughtCount() { return flags.caughtN || 0; },
  start() { if (state === 'title') { ui.title(false); paused = false; audio.start(); begin(); } },
  startChapter2() {beginChapter2();},
  debugChapter2() {
    if(state==='title')api.start();
    if(state==='walk'||state==='ending'){
      dlg.queue.length=0;dlg.cur=null;ui.say(null);setState('ending');beginChapter2();
    }
  },
  skipDialogue() { dlg.queue.length = 0; if (dlg.cur) dlg.t = dlg.dur; },
  heroPos: () => ({x: hero.position.x, z: hero.position.z})
}));
