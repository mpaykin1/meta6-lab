import * as T from 'three';
import {objectMakers} from './ink-objects.js';

const inks = new Map();
function pigment(color, glow = false) {
  const key = color + glow;
  if (!inks.has(key)) inks.set(key, glow
    ? new T.MeshBasicMaterial({color})
    : new T.MeshStandardMaterial({color, roughness: .88}));
  return inks.get(key);
}
function part(root, geometry, color, at = [0, 0, 0], glow = false) {
  const mesh = new T.Mesh(geometry, pigment(color, glow));
  mesh.position.set(...at);
  if (glow) mesh.userData.watercolorSkipWash = true;
  root.add(mesh);
  return mesh;
}
function box(root, size, color, at, angle = 0) {
  const mesh = part(root, new T.BoxGeometry(...size), color, at);
  mesh.rotation.y = angle;
  return mesh;
}
function beam(root, a, b, radius, color) {
  const start = new T.Vector3(...a), end = new T.Vector3(...b);
  const delta = end.clone().sub(start);
  const mesh = part(root, new T.CylinderGeometry(radius, radius, delta.length(), 6), color);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
  return mesh;
}
function roundedShape(w, h, r) {
  const s = new T.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function roundedBlock(root, w, d, height, color, at, radius = .6) {
  const geo = new T.ExtrudeGeometry(roundedShape(w, d, radius), {
    depth: height, bevelEnabled: false, curveSegments: 8
  });
  geo.rotateX(-Math.PI / 2);
  return part(root, geo, color, at);
}
export function apothecary() {
  const g = new T.Group(); g.name = 'Угловая аптека';
  roundedBlock(g, 7.2, 4.8, .24, '#b5b5a0', [0, .02, 0]);
  roundedBlock(g, 6.8, 4.4, 3.35, '#b4c0ac', [0, .26, 0]);
  roundedBlock(g, 7.25, 4.85, .26, '#526d70', [0, 3.61, 0]);
  roundedBlock(g, 6.7, 4.3, .12, '#81918a', [0, 3.90, 0]);
  part(g, new T.CylinderGeometry(1.12, 1.24, .42, 28), '#526d70', [2.13, 4.12, .80]);
  part(g, new T.CylinderGeometry(.68, .96, .32, 28), '#7d9690', [2.13, 4.48, .80]);
  // Recessed storefront, frames, doors and hand-drawn wall courses.
  for (const x of [-2.35, -.88, 1.95]) {
    box(g, [1.31, 1.7, .12], '#425c60', [x, 1.65, 2.23]);
    box(g, [1.13, 1.47, .13], '#91b6aa', [x, 1.66, 2.31]);
    box(g, [.04, 1.48, .04], '#d4d0b4', [x, 1.66, 2.40]);
    const reflection = box(g, [.11, 1.4, .018], '#d2dfce', [x - .32, 1.66, 2.39]);
    reflection.rotation.z = -.20;
  }
  box(g, [.94, 2.25, .14], '#425453', [.58, 1.39, 2.25]);
  box(g, [.71, 1.66, .05], '#7ba39e', [.58, 1.58, 2.34]);
  box(g, [.045, .29, .09], '#dabf85', [.88, 1.26, 2.40]);
  for (const z of [-1.12, .42]) {
    box(g, [.12, 1.7, 1.28], '#425c60', [-3.43, 1.65, z]);
    box(g, [.13, 1.45, 1.08], '#88ada5', [-3.51, 1.65, z]);
  }
  for (let i = 0; i < 13; i++) {
    const awning = box(g, [.49, .10, 1.02], i % 2 ? '#536f66' : '#e5d6ad',
      [-2.94 + i * .49, 2.82, 2.64]);
    awning.rotation.x = .19;
    box(g, [.49, .23, .07], i % 2 ? '#536f66' : '#e5d6ad', [-2.94 + i * .49, 2.66, 3.14]);
  }
  for (const y of [.54, 3.24]) box(g, [6.20, .055, .055], '#758c80', [0, y, 2.23]);
  for (const x of [-2.9, -1.55, -.15, 1.30, 2.92]) {
    box(g, [.06, .48, .045], '#879c8a', [x, .64, 2.26]);
  }
  beam(g, [3.2, 2.8, 1.58], [4.0, 2.8, 1.58], .045, '#425652');
  box(g, [.13, .92, .90], '#3d5c57', [4.0, 2.6, 1.58]);
  part(g, new T.BoxGeometry(.15, .61, .18), '#e1f5d9', [4.0, 2.6, 1.58], true);
  part(g, new T.BoxGeometry(.15, .18, .61), '#e1f5d9', [4.0, 2.6, 1.58], true);
  return g;
}
export function pier() {
  const g = new T.Group(); g.name = 'Дощатый причал';
  for (let i = 0; i < 18; i++) {
    const z = i * .23;
    box(g, [1.8 + Math.sin(i * 3) * .045, .12, .208],
      i % 3 ? '#ad9270' : '#c0a37b', [0, .30, z]);
    // Visible grain follows each board instead of a flat texture decal.
    if (i % 2 === 0) box(g, [1.37, .012, .012], '#796b57', [.08, .367, z + .04]);
  }
  for (const x of [-.76, .76]) {
    box(g, [.13, .17, 4.3], '#786c58', [x, .12, 1.96]);
    for (const z of [.10, 1.94, 3.85]) {
      beam(g, [x, -.72, z], [x, .65, z], .085, '#7d7460');
      part(g, new T.CylinderGeometry(.11, .11, .05, 7), '#c1a982', [x, .67, z]);
    }
  }
  return g;
}
export function streetlamp() {
  const g = new T.Group(); g.name = 'Уличный фонарь';
  part(g, new T.CylinderGeometry(.15, .22, .18, 8), '#59665e', [0, .10, 0]);
  beam(g, [0, .12, 0], [0, 3.3, 0], .055, '#54645d');
  beam(g, [0, 3.3, 0], [.60, 3.3, 0], .055, '#54645d');
  const lamp = objectMakers.lantern(); lamp.position.set(.60, 2.68, 0); g.add(lamp);
  return g;
}
export function car() {
  const g = new T.Group(); g.name = 'Зелёный автомобиль';
  box(g, [1.7, .56, 3.1], '#688978', [0, .64, 0]);
  roundedBlock(g, 1.55, 1.75, .65, '#789b85', [0, .91, -.18], .3);
  box(g, [1.34, .45, .055], '#9cb8af', [0, 1.23, .70]);
  for (const x of [-.87, .87]) for (const z of [-.98, .98]) {
    const wheel = part(g, new T.CylinderGeometry(.31, .31, .14, 12), '#414d49', [x, .39, z]);
    wheel.rotation.z = Math.PI / 2;
  }
  for (const x of [-.58, .58]) part(g, new T.BoxGeometry(.29, .16, .08),
    '#eadbb0', [x, .69, 1.59], true);
  box(g, [1.57, .12, .13], '#a5aea0', [0, .43, 1.60]);
  return g;
}
export function bush(seed = 1) {
  const g = new T.Group(); g.name = 'Кустарник';
  for (let i = 0; i < 3; i++) part(g, new T.IcosahedronGeometry(.40, 1),
    ['#6c8f78', '#8d9f7c', '#a7ae83'][(seed + i) % 3],
    [(i - 1) * .32, .29 + Math.sin(seed + i) * .08, Math.cos(i * 4) * .17]);
  return g;
}
export function reeds(seed = 1) {
  const g = new T.Group(); g.name = 'Камыш и прибрежная трава';
  for (let i = 0; i < 7; i++) {
    const x = Math.sin(seed + i * 5) * .32, z = Math.cos(i * 3) * .30;
    const h = .58 + (i % 4) * .15;
    beam(g, [x, 0, z], [x + .12, h, z + .08], .015, '#8d9c72');
    const leaf = part(g, new T.ConeGeometry(.045, h * .75, 3), '#a6ac7b', [x - .08, h * .35, z]);
    leaf.rotation.z = -.30;
    if (i % 2 === 0) part(g, new T.CylinderGeometry(.035, .035, .22, 6), '#947258',
      [x + .12, h, z + .08]);
  }
  return g;
}
export function wildflowers(seed = 1) {
  const g = new T.Group(); g.name = 'Красные цветы и белые зонтики';
  for (let i = 0; i < 5; i++) {
    const x = Math.sin(i * 3 + seed) * .4, z = Math.cos(i * 5) * .32, h = .35 + i * .10;
    beam(g, [x, 0, z], [x, h, z], .013, '#8a9975');
    if (i % 2) {
      for (let j = 0; j < 5; j++) {
        const a = j * Math.PI * .4;
        const p = [x + Math.cos(a) * .16, h + .035, z + Math.sin(a) * .16];
        beam(g, [x, h - .09, z], p, .008, '#b6b89a');
        part(g, new T.SphereGeometry(.065, 5, 4), '#e8e0be', p);
      }
    } else part(g, new T.IcosahedronGeometry(.075, 0), '#b15f59', [x, h, z]);
  }
  return g;
}
export function sapling(seed = 1) {
  const g = objectMakers.fir(seed); g.name = 'Молодая ель'; g.scale.setScalar(.38); return g;
}
export const settlementMakers = {apothecary, pier, streetlamp, car, bush, reeds, wildflowers, sapling};
