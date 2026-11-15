import * as T from 'three';

// New volumetric props for the INK forest. Original watercolor reference files remain immutable.
const pigment = new Map();
function material(color, glowing = false) {
  const id = `${color}/${glowing}`;
  if (!pigment.has(id)) {
    pigment.set(id, glowing
      ? new T.MeshBasicMaterial({ color })
      : new T.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
  }
  return pigment.get(id);
}
function solid(root, geometry, color, position = [0, 0, 0], scale = [1, 1, 1], glowing = false) {
  const part = new T.Mesh(geometry, material(color, glowing));
  part.position.set(...position);
  part.scale.set(...scale);
  part.userData.watercolorOutline = !glowing;
  if (glowing) part.userData.watercolorSkipWash = true;
  root.add(part);
  return part;
}
function plank(root, size, color, position, rotation = 0) {
  const part = solid(root, new T.BoxGeometry(...size), color, position);
  part.rotation.y = rotation;
  return part;
}
function timber(root, start, end, radius, color, faces = 7) {
  const a = new T.Vector3(...start);
  const b = new T.Vector3(...end);
  const axis = b.clone().sub(a);
  const part = solid(root, new T.CylinderGeometry(radius * .82, radius, axis.length(), faces), color);
  part.position.copy(a).add(b).multiplyScalar(.5);
  part.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), axis.normalize());
  return part;
}
function pebble(root, color, position, size) {
  return solid(root, new T.DodecahedronGeometry(1, 0), color, position, size);
}

export function windmill(seed = 1) {
  const root = new T.Group();
  root.name = 'Ветряная мельница';
  solid(root, new T.CylinderGeometry(.89, 1.06, .48, 8), '#8e8e7b', [0, .22, 0]);
  solid(root, new T.CylinderGeometry(.76, .97, 2.25, 8), '#c1a47d', [0, 1.53, 0]);
  solid(root, new T.ConeGeometry(1.16, 1.12, 8), '#56776d', [0, 3.20, 0]);
  plank(root, [.53, 1.22, .13], '#65524a', [0, .97, .85]);
  solid(root, new T.SphereGeometry(.045, 6, 5), '#e9c987', [.18, .98, .93], [1, 1, 1], true);
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    timber(root, [Math.sin(angle) * .84, .35, Math.cos(angle) * .84],
      [Math.sin(angle) * .70, 2.63, Math.cos(angle) * .70], .035, '#716b5a');
  }
  const window = solid(root, new T.BoxGeometry(.35, .39, .065), '#ddba75', [0, 2.21, .807],
    [1, 1, 1], true);
  window.userData.watercolorOutline = false;
  timber(root, [0, 2.22, .89], [0, 2.22, 1.16], .13, '#655e4a');
  const rotor = new T.Group();
  rotor.position.set(0, 2.22, 1.17);
  root.add(rotor);
  solid(rotor, new T.CylinderGeometry(.19, .19, .12, 8), '#444d48', [0, 0, .04]);
  for (let i = 0; i < 4; i++) {
    const blade = new T.Group();
    blade.rotation.z = i * Math.PI / 2 + .16;
    timber(blade, [0, .10, 0], [0, 1.43, 0], .042, '#6c5d4a');
    plank(blade, [.46, .79, .055], '#e5d5ac', [.19, 1.04, 0]);
    for (let j = 0; j < 3; j++) {
      timber(blade, [-.05, .73 + j * .24, .037], [.42, .73 + j * .24, .037], .014, '#8d8065');
    }
    rotor.add(blade);
  }
  root.userData.rotor = rotor;
  root.rotation.y = (seed % 5) * .015;
  return root;
}

export function deer(seed = 1) {
  const root = new T.Group();
  root.name = 'Лесной олень';
  solid(root, new T.IcosahedronGeometry(.66, 1), '#a17856', [0, 1.03, 0], [1.22, .70, .64]);
  solid(root, new T.IcosahedronGeometry(.42, 1), '#dbc39b', [.11, .85, .0], [1.11, .45, .68]);
  for (const x of [-.48, .47]) for (const z of [-.24, .24]) {
    timber(root, [x, .87, z], [x + (x < 0 ? -.10 : .07), .065, z], .074, '#775b46');
    pebble(root, '#434943', [x + (x < 0 ? -.10 : .07), .055, z], [.11, .09, .10]);
  }
  timber(root, [.42, 1.03, 0], [.81, 1.65, 0], .25, '#a17856');
  solid(root, new T.IcosahedronGeometry(.32, 1), '#b48c66', [.91, 1.70, 0], [1.14, .87, .86]);
  solid(root, new T.IcosahedronGeometry(.19, 0), '#5e5549', [1.20, 1.59, 0], [.72, .55, .75]);
  for (const side of [-1, 1]) {
    const z = side * .20;
    const ear = solid(root, new T.ConeGeometry(.16, .40, 5), '#b58b6b', [.73, 1.96, z]);
    ear.rotation.x = side * .48;
    solid(root, new T.SphereGeometry(.038, 6, 4), '#2c3231', [1.13, 1.76, side * .23]);
    const branch = [
      [[.73, 1.95, z], [.67, 2.39, side * .29]],
      [[.67, 2.39, side * .29], [.47, 2.70, side * .47]],
      [[.68, 2.32, side * .29], [.96, 2.55, side * .51]],
      [[.54, 2.56, side * .40], [.52, 2.86, side * .43]]
    ];
    branch.forEach(([a, b], i) => timber(root, a, b, i === 0 ? .043 : .027, '#6b5c48', 5));
  }
  const tail = solid(root, new T.ConeGeometry(.17, .40, 6), '#ded1aa', [-.77, 1.12, 0]);
  tail.rotation.z = -.75;
  root.rotation.y = Math.sin(seed) * .04;
  return root;
}

export function rowboat() {
  const root = new T.Group();
  root.name = 'Деревянная лодка';
  // Open clinker hull: both pointed ends, visible interior ribs and gunwales.
  const outline = [[-1.38, 0], [-.94, -.37], [0, -.51], [.94, -.37], [1.38, 0],
    [.94, .37], [0, .51], [-.94, .37]];
  const bottom = new T.Shape();
  outline.forEach(([x, z], i) => i ? bottom.lineTo(x * .86, z * .73) : bottom.moveTo(x * .86, z * .73));
  bottom.closePath();
  const floor = new T.ShapeGeometry(bottom); floor.rotateX(-Math.PI / 2);
  solid(root, floor, '#8f795c', [0, .16, 0]);
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i], b = outline[(i + 1) % outline.length];
    for (let row = 0; row < 3; row++) {
      const low = .72 + row * .09, high = low + .09;
      const points = [a[0] * low, .16 + row * .12, a[1] * low,
        b[0] * low, .16 + row * .12, b[1] * low,
        b[0] * high, .28 + row * .12, b[1] * high,
        a[0] * high, .28 + row * .12, a[1] * high];
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(points, 3));
      geo.setIndex([0, 1, 2, 0, 2, 3]); geo.computeVertexNormals();
      const panel = solid(root, geo, row % 2 ? '#ab8c63' : '#987954');
      panel.material = panel.material.clone(); panel.material.side = T.DoubleSide;
    }
    timber(root, [a[0], .54, a[1]], [b[0], .54, b[1]], .035, '#cfb68b', 5);
  }
  for (let i = 0; i < 5; i++) {
    const x = -.70 + i * .35;
    plank(root, [.025, .025, .60], '#b19a72', [x, .18, 0]);
  }
  for (const x of [-.41, .42]) plank(root, [.14, .10, .88], '#c5a178', [x, .53, 0]);
  for (const sign of [-1, 1]) {
    timber(root, [0, .59, sign * .42], [sign * .69, .56, sign * 1.18], .038, '#a78762');
    plank(root, [.15, .045, .41], '#dcc397', [sign * .73, .56, sign * 1.15], sign * .25);
  }
  root.userData.floatPhase = 0;
  return root;
}

export function fox(seed = 1) {
  const root = new T.Group();
  root.name = 'Рыжая лиса';
  solid(root, new T.IcosahedronGeometry(.45, 1), '#bd7655', [0, .55, 0], [1.22, .68, .66]);
  solid(root, new T.IcosahedronGeometry(.32, 1), '#e3cbab', [.41, .43, 0], [.65, .42, .69]);
  for (const x of [-.38, .30]) for (const z of [-.21, .21]) {
    timber(root, [x, .47, z], [x + .035, .055, z], .065, '#775c4a');
  }
  solid(root, new T.IcosahedronGeometry(.31, 1), '#c37c58', [.48, .81, 0], [1.00, .82, .78]);
  const snout = solid(root, new T.ConeGeometry(.21, .58, 5), '#e7d8b7', [.83, .69, 0]);
  snout.rotation.z = -Math.PI / 2;
  solid(root, new T.SphereGeometry(.07, 8, 6), '#333738', [1.11, .70, 0]);
  for (const side of [-1, 1]) {
    const ear = solid(root, new T.ConeGeometry(.19, .44, 4), '#a45d49',
      [.34, 1.13, side * .22]);
    ear.rotation.z = -.15;
    solid(root, new T.SphereGeometry(.045, 6, 4), '#262f2c', [.73, .84, side * .20]);
  }
  const tail = new T.Group();
  tail.position.set(-.43, .61, 0);
  root.add(tail);
  const plume = solid(tail, new T.ConeGeometry(.32, 1.14, 7), '#cb865d', [-.56, .18, 0]);
  plume.rotation.z = Math.PI / 2 + .45;
  const tip = solid(tail, new T.ConeGeometry(.18, .48, 7), '#f1dec0', [-1.06, .35, 0]);
  tip.rotation.z = Math.PI / 2 + .45;
  root.userData.tail = tail;
  root.rotation.y = Math.cos(seed) * .04;
  return root;
}

export function shrine() {
  const root = new T.Group();
  root.name = 'Забытые ворота';
  for (const x of [-.84, .84]) {
    for (let row = 0; row < 4; row++) {
      const stone = pebble(root, row % 2 ? '#a8aa98' : '#8b9e93',
        [x, .28 + row * .55, 0], [.36, .33, .45]);
      stone.rotation.y = row * .31;
    }
    pebble(root, '#a2aa9d', [x * .56, 2.41, 0], [.48, .32, .47]);
  }
  pebble(root, '#9ca69d', [0, 2.68, 0], [.44, .29, .48]);
  plank(root, [2.12, .20, .66], '#777b72', [0, .12, 0]);
  for (const x of [-1.03, 1.03]) for (const z of [-.55, .51]) {
    pebble(root, '#788a7c', [x, .11, z], [.23, .16, .26]);
  }
  const orb = solid(root, new T.IcosahedronGeometry(.22, 1), '#ecc17b', [0, 1.32, 0],
    [1, 1.13, 1], true);
  root.userData.orb = orb;
  return root;
}

export const extraObjectMakers = { windmill, deer, rowboat, fox, shrine };
