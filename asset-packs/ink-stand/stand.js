// Стенд ассетов INK: показывает пак ink-pack/1 акварелью эталона «Павший великан».
// ?pack=ready/ink-example (папка внутри asset-packs/). Режимы: «в мире» — ассеты стоят в своих зонах долины
// эталона; «по одному» — ассет крупно. Эталон только переиспользуется (импорт), его файлы не меняются.
import * as T from 'three';
const REF = new URL('../../reference/ink-fallen-guardian/', import.meta.url).href;
const {createLivingWatercolor3D, createWatercolorStyle} = await import(REF + 'shared/living-watercolor-3d.js');
const {createIllustrationCamera} = await import(REF + 'shared/living-watercolor-generators.js');
const {objectMakers} = await import(REF + 'ink-objects.js');
const {extraObjectMakers} = await import(REF + 'ink-extras.js');
const {settlementMakers} = await import(REF + 'ink-settlement.js');
const {buildWorld} = await import(REF + 'ink-world.js');
const {createInkOptics} = await import(REF + 'ink-optics.js');
const {createFallenRobot} = await import(REF + 'ink-fallen-robot.js');

const $ = s => document.querySelector(s);
const fail = msg => {const e = $('#err'); e.hidden = false; e.textContent = msg; throw new Error(msg);};
const params = new URLSearchParams(location.search);
const packPath = (params.get('pack') || 'incoming/ink-valley').replace(/[^\w\-\/.]/g, '').replace(/\.\./g, '');
const packUrl = new URL('../' + packPath + '/', import.meta.url).href;
const pack = await fetch(packUrl + 'pack.json').then(r => r.ok ? r.json() : fail('Пак не найден: ' + packPath));
// makers.js пишется «как рядом с эталоном»: переписываем его относительные импорты на папку эталона.
let src = await fetch(packUrl + 'makers.js').then(r => r.ok ? r.text() : fail('Нет makers.js'));
src = src.replace(/(from\s+['"])\.\/([^'"]+)(['"])/g, (m, a, p, b) => a + REF + p + b)
  .replace(/(from\s+['"])three(['"])/g, (m, a, b) => a + new URL(REF + 'three.module.js').href + b);
const mod = await import(URL.createObjectURL(new Blob([src], {type: 'text/javascript'})));
const makers = mod.makers || fail('makers.js не экспортирует makers');
const names = Object.keys(makers);
if (!names.length) fail('В паке нет ассетов');

const scene = new T.Scene();
const camera = createIllustrationCamera(T, {width: innerWidth, height: innerHeight, viewHeight: 17, position: [12, 13, 17], lookAt: [0, .5, 0]});
camera.far = 180;
const renderer = new T.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = T.SRGBColorSpace; document.body.prepend(renderer.domElement);
const style = createWatercolorStyle({seed: 'ink-rain-forest-1113', inkColor: '#303c38', paperColor: '#efece2', washColor: '#839487',
  washOpacity: .78, washLayers: 6, edgeWidth: .019, edgeJitter: .26, granulation: .40, bleed: .24, shadowWash: .17,
  motion: .10, pigmentPooling: .27, paperGap: .15, paintedLight: .67});
const optics = createInkOptics(renderer);
const paint = createLivingWatercolor3D({THREE: T, renderer, scene, camera, style});
scene.add(new T.HemisphereLight('#fff3d7', '#96aca3', 2.2));
const sun = new T.DirectionalLight('#fff0cd', 1.4); sun.position.set(-5, 9, 6); scene.add(sun);
scene.fog = new T.Fog('#e7e5d6', 64, 108);
const valley = buildWorld({makers: {...objectMakers, ...extraObjectMakers, ...settlementMakers, robot: createFallenRobot}, paint, scene});

// Ассеты в мире: каждый — в своей зоне, на свободном месте рядом с её центром (по спирали, где можно пройти).
const zoneOf = n => (pack.assets?.[n]?.zone || 'any').replace(/^new:.*/, 'any');
const used = [], placed = {}, tickers = [];
names.forEach((n, i) => {
  const z = valley.zones[zoneOf(n)] || valley.zones.woodland;
  let x = z[0], y = z[1];
  for (let k = 1; k < 400; k++) {
    const a = k * 2.399 + i, d = 1.6 + k * .09;
    const cx = z[0] + Math.cos(a) * d, cz = z[1] + Math.sin(a) * d;
    if (valley.canWalk(cx, cz) && used.every(([ux, uz]) => Math.hypot(ux - cx, uz - cz) > 2.2)) {x = cx; y = cz; break;}
  }
  used.push([x, y]);
  const o = makers[n](i + 1); o.position.set(x, 0, y); valley.world.add(o);
  paint.apply(o, {seed: 'ink-pack:' + n}); placed[n] = o;
  if (typeof o.userData.tick === 'function') tickers.push(o);
});
const solo = new T.Group(); scene.add(solo); solo.visible = false;
const soloCache = {};

let mode = params.get('mode') === 'solo' ? 'solo' : 'world', cur = 0, yaw = -.62, pitch = .62, zoom = 1, drag = null;
const focus = new T.Vector3(), want = new T.Vector3();
function select(i) {
  cur = (i + names.length) % names.length; const n = names[cur];
  valley.world.visible = mode === 'world'; solo.visible = mode === 'solo';
  if (mode === 'solo') {
    if (!soloCache[n]) {const o = makers[n](cur + 1); solo.add(o); paint.apply(o, {seed: 'ink-solo:' + n}); soloCache[n] = o;}
    for (const [k, o] of Object.entries(soloCache)) o.visible = k === n;
  }
  $('#list').querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', String(k === cur)));
  $('#modes').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
  const meta = pack.assets?.[n] || {};
  $('#info').textContent = [meta.label_ru || n, meta.role, meta.zone, meta.benefit].filter(Boolean).join(' · ');
  resize();
}
names.forEach((n, i) => {const b = document.createElement('button'); b.textContent = pack.assets?.[n]?.label_ru || n;
  b.onclick = () => select(i); $('#list').append(b);});
for (const [m, label] of [['world', 'В мире'], ['solo', 'По одному']]) {
  const b = document.createElement('button'); b.textContent = label; b.dataset.m = m; b.onclick = () => {mode = m; select(cur);}; $('#modes').append(b);
}
$('#menuBtn').onclick = e => {const h = $('#menu').hidden = !$('#menu').hidden; e.currentTarget.setAttribute('aria-expanded', String(!h));};
$('#prev').onclick = () => select(cur - 1); $('#next').onclick = () => select(cur + 1);
function resize() {
  const aspect = innerWidth / Math.max(1, innerHeight);
  camera.userData.viewHeight = mode === 'world' ? Math.max(9, 9 / aspect) : Math.max(4, 4 / aspect);
  camera.updateForViewport(innerWidth, innerHeight); camera.zoom = zoom; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize);
const pts = new Map(); let pinch = 0;
const cv = renderer.domElement;
cv.addEventListener('pointerdown', e => {cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, e); drag = {x: e.clientX, y: e.clientY};
  if (pts.size === 2) {const p = [...pts.values()]; pinch = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY);}});
cv.addEventListener('pointermove', e => {if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e);
  if (pts.size === 2) {const p = [...pts.values()], d = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY);
    zoom = T.MathUtils.clamp(zoom * d / Math.max(1, pinch), .5, 3); pinch = d; resize();}
  else if (drag) {yaw -= (e.clientX - drag.x) * .007; pitch = T.MathUtils.clamp(pitch + (e.clientY - drag.y) * .004, .2, 1.25);}
  drag = {x: e.clientX, y: e.clientY};});
for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(ev, e => {pts.delete(e.pointerId); drag = null;});
cv.addEventListener('wheel', e => {e.preventDefault(); zoom = T.MathUtils.clamp(zoom * Math.exp(-e.deltaY * .001), .5, 3); resize();}, {passive: false});

select(Math.max(0, names.indexOf(params.get('asset'))));
let prev = 0, t = 0;
function frame(ms) {
  requestAnimationFrame(frame);
  if (document.hidden) {prev = ms; return;}
  const dt = Math.min(.04, Math.max(0, (ms - prev) / 1000)); prev = ms; t += dt;
  const target = mode === 'world' ? placed[names[cur]].position : new T.Vector3();
  want.set(target.x, .7, target.z); focus.lerp(want, 1 - Math.exp(-dt * 3));
  if (!drag) yaw += dt * .08;                               // медленный облёт: кинематографичная инерция
  camera.position.set(focus.x + Math.sin(yaw) * Math.cos(pitch) * 60, focus.y + Math.sin(pitch) * 60, focus.z + Math.cos(yaw) * Math.cos(pitch) * 60);
  camera.lookAt(focus);
  valley.tick(t, focus, false);
  for (const o of tickers) if (o.visible !== false) o.userData.tick(t, dt);
  const s = soloCache[names[cur]]; if (mode === 'solo' && s?.userData.tick) s.userData.tick(t, dt);
  paint.tick(ms); optics.render(scene, camera, false);
}
requestAnimationFrame(frame);
window.__INK_STAND__ = {pack: packPath, names, select, get mode() {return mode;}};
