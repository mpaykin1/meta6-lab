import * as T from 'three';

// Fallen guardian: true volumetric geometry, illustrated by the existing INK watercolor renderer.
const palette = {
  porcelain: '#c9ab93', warm: '#d7b79b', shadow: '#6e6867',
  joint: '#4d5255', rust: '#a96851', edge: '#444749',
  soil: '#83765f', moss: '#71815b', foliage: '#9a9e58',
};
const shared = new Map();
function pigment(color, opts = {}) {
  const key = color + (opts.map ? ':patina' : JSON.stringify(opts));
  if (!shared.has(key)) {
    shared.set(key, new T.MeshStandardMaterial({ color, roughness: 1, ...opts }));
  }
  return shared.get(key);
}
function part(parent, geometry, material, position = [0, 0, 0], outline = true) {
  const m = new T.Mesh(geometry, material);
  m.position.set(...position);
  m.userData.watercolorOutline = outline;
  parent.add(m);
  return m;
}
function ball(parent, size, position, material, outline = true, detail = 1) {
  const m = part(parent, new T.IcosahedronGeometry(1, detail), material, position, outline);
  m.scale.set(...size);
  return m;
}
function box(parent, dims, position, material, rotation = [0, 0, 0], outline = true) {
  const m = part(parent, new T.BoxGeometry(...dims), material, position, outline);
  m.rotation.set(...rotation);
  return m;
}
function tube(parent, points, radius, material, outline = false) {
  const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
  return part(parent, new T.TubeGeometry(curve, Math.max(12, points.length * 5), radius, 5), material,
    [0, 0, 0], outline);
}
function limb(parent, from, to, startRadius, endRadius, material) {
  const a = new T.Vector3(...from), b = new T.Vector3(...to);
  const m = part(parent, new T.CylinderGeometry(endRadius, startRadius, a.distanceTo(b), 12, 1),
    material);
  m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.sub(a).normalize());
  return m;
}
function ring(parent, center, radius, material, rotation = [0, 0, 0], width = .055) {
  const m = part(parent, new T.TorusGeometry(radius, width, 5, 22), material, center, false);
  m.rotation.set(...rotation);
  return m;
}
function patinaTexture(seed = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;
  let state = seed;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };
  context.fillStyle = '#d4b39b';
  context.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 650; i++) {
    const x = random() * 256, y = random() * 256;
    const r = 1 + Math.pow(random(), 2.8) * 24;
    const colors = ['#a76551', '#c07859', '#e1c6a7', '#8a8780', '#d9a984', '#f0d7b7'];
    context.fillStyle = colors[Math.floor(random() * colors.length)];
    context.globalAlpha = .14 + random() * .58;
    context.beginPath();
    context.ellipse(x, y, r, r * (.28 + random() * .8), random() * 6, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  for (let i = 0; i < 180; i++) {
    const x = random() * 256, y = random() * 256, r = .2 + random() * 1.7;
    context.fillStyle = '#494f50';
    context.fillRect(x, y, r, r);
  }
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
function wristAndHand(parent, x, z, mirror, armor, joint, accent) {
  const hand = new T.Group();
  hand.position.set(x, .30, z);
  hand.rotation.y = mirror * .18;
  parent.add(hand);
  const palm = ball(hand, [.79, .31, .57], [0, .04, .13], armor, true, 2);
  palm.rotation.x = -.10;
  box(hand, [1.50, .08, .20], [0, .18, .19], accent, [0, 0, 0], false);
  for (let i = 0; i < 4; i++) {
    const fx = (i - 1.5) * .35;
    const length = .68 + Math.sin((i + 1) / 5 * Math.PI) * .26;
    const knuckle = ball(hand, [.17, .18, .22], [fx, .03, .60], joint, false, 1);
    knuckle.rotation.y = (i - 1.5) * .06;
    const first = box(hand, [.30, .27, length * .55], [fx, -.05, .79], armor,
      [0, (i - 1.5) * .07, 0]);
    const second = box(hand, [.29, .23, length * .48], [fx * 1.06, -.12, 1.12], armor,
      [.12, (i - 1.5) * .10, 0]);
    first.scale.z *= .92;
    second.scale.z *= .92;
    ring(hand, [fx, .015, .96], .145, joint, [Math.PI / 2, 0, 0], .018);
  }
  const thumb = ball(hand, [.21, .18, .43], [mirror * -.85, -.04, .52], armor, true, 1);
  thumb.rotation.y = mirror * -.52;
  return hand;
}
function addRubble(g, random, soil, stone) {
  for (let i = 0; i < 27; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 1.5 + random() * 3.8;
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius * .65 + .65;
    const rock = ball(g, [.11 + random() * .30, .10 + random() * .16, .12 + random() * .29],
      [x, -.08 + random() * .10, z], i % 4 ? stone : soil, false);
    rock.rotation.set(random() * .3, random() * 6, random() * .3);
  }
}
function addGrowth(g, random, moss, leafMaterials) {
  // Instanced foliage avoids expensive watercolor outline passes on every blade.
  const leafGeo = new T.IcosahedronGeometry(1, 0);
  for (let color = 0; color < leafMaterials.length; color++) {
    const count = 170;
    const instances = new T.InstancedMesh(leafGeo, leafMaterials[color], count);
    const obj = new T.Object3D();
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2;
      const r = Math.sqrt(random()) * 4.2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * .67 + .45;
      const onChest = random() < .47;
      const bx = (random() - .5) * 2.9, by = 2.24 - random() * .54, bz = -.64 + random() * .75;
      obj.position.set(onChest ? bx : x, onChest ? by : -.02 + random() * .22,
        onChest ? bz : z);
      obj.rotation.set(random(), random() * 6.28, random() * .8);
      const size = .06 + random() * (onChest ? .14 : .20);
      obj.scale.set(size, size * (.26 + random() * .28), size * (.65 + random() * .5));
      obj.updateMatrix();
      instances.setMatrixAt(i, obj.matrix);
    }
    instances.instanceMatrix.needsUpdate = true;
    instances.userData.watercolorOutline = false;
    instances.userData.watercolorSkipWash = true;
    g.add(instances);
  }
  for (let i = 0; i < 10; i++) {
    const x = -1.55 + i * .34;
    tube(g, [[x, 2.12, -.65], [x + .14, 1.87, -.03], [x + .18, 1.21, .37],
      [x + .1, .52, .66]], .035, moss);
  }
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1, local = i % 4;
    const x = side * (1.42 + local * .20);
    tube(g, [[x, 1.82, -.78], [x + side * .21, 1.35, -.25],
      [x + side * .44, .62, .55], [x + side * .52, .22, 1.05]], .024, moss);
  }
}
export function createFallenRobot(seed = 23) {
  let state = Math.floor(seed) || 23;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };
  const g = new T.Group();
  g.name = 'Павший великан · заросший робот';
  const patina = patinaTexture(seed);
  const armor = pigment('#ffffff', patina ? { map: patina } : { color: palette.porcelain });
  const lightArmor = pigment(palette.warm);
  const dark = pigment(palette.joint);
  const seams = pigment(palette.edge);
  const rust = pigment(palette.rust);
  const moss = pigment(palette.moss);
  const soil = pigment(palette.soil);
  const rock = pigment(palette.shadow);
  const leaves = ['#7f8950', '#9c9d54', '#c1a35e', '#66795b'].map(c => pigment(c));

  // Half-submerged body and broken machinery, all sides remain genuinely volumetric.
  ball(g, [3.4, .29, 2.13], [0, -.20, .23], soil, false, 2);
  ball(g, [1.65, 1.20, .97], [-.10, .96, -.63], dark, true, 2);
  const torso = ball(g, [1.71, 1.13, .85], [-.05, 1.20, -.59], armor, true, 2);
  torso.rotation.z = -.10;
  for (const side of [-1, 1]) {
    const chest = box(g, [1.02, 1.19, .18], [side * .79, 1.35, .18], lightArmor,
      [.06, side * -.13, side * -.11]);
    chest.rotation.z = side * .08;
    box(g, [.75, .70, .09], [side * .79, 1.32, .292], armor, [0, 0, side * -.12]);
    for (let i = 0; i < 3; i++) {
      ball(g, [.052, .052, .029], [side * (.45 + i * .29), 1.84 - i * .05, .35],
        seams, false, 1);
    }
    ball(g, [.61, .61, .62], [side * 1.61, 1.31, -.40], dark, true, 2);
    ring(g, [side * 1.65, 1.31, .14], .49, rust, [0, 0, 0], .06);
  }
  for (let i = 0; i < 4; i++) {
    box(g, [1.25, .12, .25], [-.10, .53 + i * .17, .38], i % 2 ? seams : rust,
      [0, 0, -.07], false);
  }
  // Open neck bearing and heavy tilted head.
  limb(g, [.34, 1.80, -.95], [.64, 2.18, -1.06], .37, .29, dark);
  ring(g, [.56, 2.13, -.73], .30, rust);
  const head = new T.Group();
  head.position.set(.74, 2.64, -1.14);
  head.rotation.set(.07, -.17, -.43);
  g.add(head);
  ball(head, [.91, 1.02, .84], [0, 0, 0], armor, true, 2);
  box(head, [1.37, .54, .20], [.05, -.34, .68], dark, [0, -.09, -.04]);
  box(head, [1.19, .47, .12], [.05, -.34, .80], armor, [0, -.06, -.04]);
  ball(head, [.32, .32, .15], [-.58, .45, .54], lightArmor, true, 2);
  ring(head, [-.58, .45, .68], .22, rust);
  // Uneven eye positions and dormant ember-orange lenses from the concept art.
  const glow = new T.MeshBasicMaterial({ color: '#f18a4e' });
  const eyes = [[-.28, -.18, .885, .20], [.34, -.40, .87, .145]];
  eyes.forEach(([x, y, z, radius]) => {
    ball(head, [radius * 1.45, radius * 1.45, .09], [x, y, z], dark, false, 2);
    ring(head, [x, y, z + .091], radius * 1.16, seams, [0, 0, 0], .037);
    ball(head, [radius * .67, radius * .67, .07], [x, y, z + .136], glow, false, 2);
    ball(head, [radius * .24, radius * .24, .015], [x - .03, y + .04, z + .209],
      pigment('#ffe0a0', { emissive: '#d27943', emissiveIntensity: .18 }), false, 1);
  });
  for (let j = 0; j < 4; j++) {
    const y = .26 + j * .135;
    tube(head, [[.48, y, .54], [.59, y + .03, .47], [.63, y + .05, .33]], .012, seams);
  }

  // Both arms collapsed onto the soil, one giant reaching hand in the foreground.
  for (const side of [-1, 1]) {
    const shoulder = [side * 1.72, 1.29, -.49];
    const elbow = [side * 2.20, .65, .54];
    const wrist = [side * 2.58, .31, 1.50];
    limb(g, shoulder, elbow, .55, .47, armor);
    limb(g, elbow, wrist, .58, .65, armor);
    ball(g, [.49, .46, .48], elbow, dark, true, 2);
    for (let k = 0; k < 3; k++) {
      const t = (k + 1) / 4;
      const pos = shoulder.map((v, i) => v * (1 - t) + elbow[i] * t);
      const band = ball(g, [.51 - k * .012, .05, .52], pos, rust, false, 1);
      band.rotation.z = side * -.35;
    }
    ball(g, [.63, .48, .57], wrist, dark, false, 2);
    wristAndHand(g, side * 2.64, 1.66, side, armor, dark, rust);
  }

  // Earth swallowing joints, moss spreading over the shattered chassis.
  for (const x of [-2.40, -1.18, .40, 2.16, 2.97]) {
    const z = x < 0 ? .45 : .78;
    ball(g, [.70, .18, .44], [x, -.12, z], moss, false, 1);
  }
  addRubble(g, random, soil, rock);
  addGrowth(g, random, moss, leaves);
  g.userData.robotEyes = glow;
  g.userData.robotEyeBase = '#f18a4e';
  g.userData.isFallenRobot = true;
  return g;
}
