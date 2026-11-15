// Чистая ловушка бота (не игровые ассеты): минимальный пак ink-pack/1, который обязан проходить без HARD.
// Файл пишется так, будто лежит рядом с эталоном reference/ink-fallen-guardian: 'three' + генераторы эталона.
import * as T from 'three';
import {deformGeometryOrganic, createSemanticStroke} from './shared/living-watercolor-generators.js';

const ink = '#272c30';
const mats = new Map();
const mat = color => {
  if (!mats.has(color)) mats.set(color, new T.MeshStandardMaterial({color, roughness: 1}));
  return mats.get(color);
};
// Детерминированный шум от seed — никакого Math.random (одинаковый мир при каждой загрузке).
const rnd = (seed, i) => {const a = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453; return a - Math.floor(a);};
function part(g, geo, color, p, outline = true) {
  const o = new T.Mesh(geo, mat(color)); o.position.set(...p); o.userData.watercolorOutline = outline; g.add(o); return o;
}

// Растение: кувшинки у берега. Каждый seed — своя россыпь (БЕЗ ПОВТОРОВ); листья колышутся (живой мир).
export function lilyPads(seed = 1) {
  const g = new T.Group(); g.name = 'Кувшинки';
  const n = 4 + Math.floor(rnd(seed, 0) * 4), pads = [];
  for (let i = 0; i < n; i++) {
    const r = .16 + rnd(seed, i + 1) * .14, a = rnd(seed, i + 9) * Math.PI * 2, d = rnd(seed, i + 17) * .7;
    const geo = deformGeometryOrganic(T, new T.CircleGeometry(r, 12, .3, Math.PI * 1.85), {seed: seed * 13 + i, amount: .05});
    geo.rotateX(-Math.PI / 2);
    const pad = part(g, geo, ['#607e74', '#789180', '#91a18b'][i % 3], [Math.cos(a) * d, .01, Math.sin(a) * d], false);
    pad.userData.phase = i * 1.3 + seed; pads.push(pad);
    if (rnd(seed, i + 30) > .6) part(g, new T.SphereGeometry(.05, 7, 5), '#d5d3bb', [pad.position.x, .06, pad.position.z]);
  }
  g.userData.footprint = 0;
  g.userData.tick = t => {for (const p of pads) {p.position.y = .01 + Math.sin(t * .9 + p.userData.phase) * .012; p.rotation.y = Math.sin(t * .35 + p.userData.phase) * .12;}};
  return g;
}

// Существо: светлячки над поляной великана. Рой дрейфует, каждый со своей фазой (не всё разом).
export function fireflies(seed = 1) {
  const g = new T.Group(); g.name = 'Светлячки';
  const glow = new T.MeshBasicMaterial({color: '#ffd095'}), bugs = [];
  for (let i = 0; i < 9; i++) {
    const b = new T.Mesh(new T.SphereGeometry(.035, 6, 4), glow);
    b.userData = {watercolorOutline: false, ox: (rnd(seed, i) - .5) * 1.6, oz: (rnd(seed, i + 40) - .5) * 1.6, ph: rnd(seed, i + 80) * 6.28};
    b.position.set(b.userData.ox, .6, b.userData.oz); g.add(b); bugs.push(b);
  }
  g.userData.footprint = 0;
  g.userData.tick = t => {for (const b of bugs) {const u = b.userData;
    b.position.set(u.ox + Math.sin(t * .4 + u.ph) * .25, .55 + Math.sin(t * .9 + u.ph * 2) * .22, u.oz + Math.cos(t * .33 + u.ph) * .25);}};
  return g;
}

// Предмет с пользой: шестерня великана. Подобрал — глаза робота светят ярче, в тумане видно дальше.
export function giantCog(seed = 1) {
  const g = new T.Group(); g.name = 'Шестерня великана';
  const ring = part(g, new T.TorusGeometry(.22, .06, 6, 14), '#9c9b8e', [0, .28, 0]);
  for (let i = 0; i < 10; i++) {const a = i / 10 * Math.PI * 2;
    const tooth = part(g, new T.BoxGeometry(.07, .08, .06), '#918872', [Math.cos(a) * .3, .28 + Math.sin(a) * .3, 0]); tooth.rotation.z = a;}
  g.add(createSemanticStroke(T, [new T.Vector3(-.3, .02, .1), new T.Vector3(0, .05, .2), new T.Vector3(.3, .02, .1)], {color: ink, radius: .012, opacity: .5}));
  ring.userData.watercolorOutline = true;
  g.userData.footprint = 0;
  g.userData.interact = {radius: 1.2, effect: 'reveal_far', label_ru: 'Глаза великана светят ярче — туман отступает'};
  g.userData.tick = t => {g.children.forEach((c, i) => {if (c !== g.children[g.children.length - 1]) c.position.y += Math.sin(t * 1.4 + i * .2) * .0008;}); g.rotation.y = Math.sin(t * .6) * .25;};
  return g;
}

export const makers = {lilyPads, fireflies, giantCog};
