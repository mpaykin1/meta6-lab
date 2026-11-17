import * as THREE from 'three';

// Independent INK model factory. The approved guardian model and renderer remain untouched.
const COLORS = {
  body: '#8fa59b', roof: '#afc0b2', hood: '#a9b9ae', side: '#718a80',
  tyre: '#45534f', rubber: '#586760', seam: '#627770', hull: '#809d97',
  hullLight: '#a1b6ac', dome: '#b2c4b9', glass: '#344f56',
  glassLight: '#6f9293', brass: '#b59b6d', brassLight: '#cbb486',
  shadow: '#45575a', ivory: '#ffe0a0', fin: '#66827d'
};
const cache = new Map();
function pigment(name, emissive = false) {
  const key = name + (emissive ? ':glow' : '');
  if (!cache.has(key)) {
    cache.set(key, new THREE.MeshStandardMaterial({
      color: COLORS[name], roughness: emissive ? .48 : .9, metalness: 0,
      emissive: emissive ? COLORS.ivory : '#000000',
      emissiveIntensity: emissive ? .32 : 0
    }));
  }
  return cache.get(key);
}
function roundedGeometry(w, h, d, r = .12) {
  const b = Math.min(r, w * .2, h * .2, d * .2);
  const x = w / 2 - b, y = h / 2 - b, q = Math.min(b, x, y);
  const s = new THREE.Shape();
  s.moveTo(-x + q, -y);
  s.lineTo(x - q, -y); s.quadraticCurveTo(x, -y, x, -y + q);
  s.lineTo(x, y - q); s.quadraticCurveTo(x, y, x - q, y);
  s.lineTo(-x + q, y); s.quadraticCurveTo(-x, y, -x, y - q);
  s.lineTo(-x, -y + q); s.quadraticCurveTo(-x, -y, -x + q, -y);
  const depth = Math.max(.008, d - 2 * b);
  const g = new THREE.ExtrudeGeometry(s, {
    depth, steps: 1, bevelEnabled: true, bevelSize: b,
    bevelThickness: b, bevelSegments: 2, curveSegments: 4
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}
function attach(parent, geom, material, at = [0, 0, 0], outline = true) {
  const m = new THREE.Mesh(geom, material);
  m.position.set(...at);
  m.userData.watercolorOutline = outline;
  m.userData.watercolorSkipWash = !outline;
  m.castShadow = false;
  m.receiveShadow = false;
  parent.add(m);
  return m;
}
function box(parent, size, at, mat, r = .1, outline = true) {
  return attach(parent, roundedGeometry(...size, r), mat, at, outline);
}
function oval(parent, size, at, mat, outline = true, detail = 2) {
  const m = attach(parent, new THREE.IcosahedronGeometry(1, detail), mat, at, outline);
  m.scale.set(...size);
  return m;
}
function cylinder(parent, radius, thickness, at, mat, axis = 'z', outline = false, segments = 18) {
  const m = attach(parent, new THREE.CylinderGeometry(radius, radius, thickness, segments), mat, at, outline);
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  return m;
}
function torus(parent, radius, thick, at, mat, orientation = 'z', outline = false) {
  const m = attach(parent, new THREE.TorusGeometry(radius, thick, 6, 36), mat, at, outline);
  if (orientation === 'x') m.rotation.y = Math.PI / 2;
  if (orientation === 'y') m.rotation.x = Math.PI / 2;
  return m;
}
function port(parent, size, position, normal = 'x') {
  const g = new THREE.Group();
  g.position.set(...position);
  if (normal === '-x') g.rotation.y = -Math.PI / 2;
  else if (normal === 'x') g.rotation.y = Math.PI / 2;
  else if (normal === '-z') g.rotation.y = Math.PI;
  parent.add(g);
  cylinder(g, size, .085, [0, 0, 0], pigment('shadow'), 'z');
  cylinder(g, size * .81, .095, [0, 0, .013], pigment('glass'), 'z');
  const inner = oval(g, [size * .42, size * .32, .055],
    [-size * .12, size * .12, .075], pigment('glassLight'), false, 1);
  inner.rotation.z = -.2;
  torus(g, size * .97, .044, [0, 0, .07], pigment('brass'));
  torus(g, size * .73, .014, [0, 0, .083], pigment('brassLight'));
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + .18;
    oval(g, [.027, .027, .025], [Math.cos(a) * size, Math.sin(a) * size, .112],
      pigment('brassLight'), false, 0);
  }
  return g;
}
function thruster(parent, x) {
  const g = new THREE.Group();
  g.position.set(x, .88, -1.87);
  parent.add(g);
  cylinder(g, .32, .71, [0, 0, -.15], pigment('fin'), 'z', true, 24);
  cylinder(g, .35, .12, [0, 0, -.5], pigment('brass'), 'z', false, 24);
  cylinder(g, .27, .07, [0, 0, -.58], pigment('shadow'), 'z');
  const rotor = new THREE.Group();
  rotor.position.z = -.64;
  g.add(rotor);
  cylinder(rotor, .07, .16, [0, 0, 0], pigment('brassLight'), 'z');
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    const blade = oval(rotor, [.105, .235, .038],
      [Math.sin(a) * .16, Math.cos(a) * .16, 0], pigment('brass'), false, 1);
    blade.rotation.z = -a + .29;
    blade.rotation.x = .20;
  }
  return {g, rotor};
}
export function createInkCarBathyscaphe(seed = 20261117) {
  const root = new THREE.Group();
  root.name = 'INK · Car / Bathyscaphe · volumetric transforming 3D';
  root.userData.seed = seed;
  const car = new THREE.Group();
  root.add(car);

  const undercarriage = box(car, [2.61, .68, 3.92], [0, .90, 0],
    pigment('body'), .16);
  box(car, [2.55, .22, 1.20], [0, 1.30, 1.30], pigment('hood'), .07);
  const roof = box(car, [2.19, .92, 2.30], [0, 1.68, -.30],
    pigment('roof'), .25);
  const windshield = box(car, [2.0, .41, .045], [0, 1.54, .885],
    pigment('side'), .025, false);
  const bumper = box(car, [2.50, .16, .22], [0, .70, 2.02],
    pigment('side'), .055, false);
  const rearBumper = box(car, [2.48, .13, .17], [0, .68, -2.01],
    pigment('side'), .05, false);
  const lamps = [];
  for (const x of [-.87, .87]) {
    lamps.push(box(car, [.43, .24, .072], [x, 1.015, 2.002],
      pigment('ivory', true), .05, false));
    box(car, [.55, .28, .06], [x, 1.012, 1.963],
      pigment('seam'), .055, false);
  }
  const wheels = [];
  for (const xSign of [-1, 1]) {
    for (const z of [-1.24, 1.29]) {
      const wheel = new THREE.Group();
      wheel.position.set(1.37 * xSign, .57, z);
      cylinder(wheel, .36, .24, [0, 0, 0], pigment('tyre'), 'x', true, 24);
      cylinder(wheel, .24, .267, [0, 0, 0], pigment('rubber'), 'x');
      cylinder(wheel, .07, .28, [0, 0, 0], pigment('side'), 'x');
      car.add(wheel);
      wheels.push({node: wheel, sign: xSign, z});
    }
  }

  const sub = new THREE.Group();
  root.add(sub);
  oval(sub, [1.36, .91, 1.93], [0, 1.13, .02], pigment('hull'), true, 3);
  oval(sub, [1.25, .64, 1.73], [0, 1.43, .06],
    pigment('hullLight'), true, 2);
  oval(sub, [1.00, .62, 1.09], [0, 1.91, -.21],
    pigment('dome'), true, 3);
  const domeBand = torus(sub, .99, .043, [0, 1.73, -.21],
    pigment('brass'), 'y');
  domeBand.scale.z = 1.11;
  for (const z of [-1.10, .70]) {
    const frame = torus(sub, 1, .052, [0, 1.15, z], pigment('seam'));
    frame.scale.set(1.34, .89, 1);
  }
  const hatch = cylinder(sub, .36, .12, [0, 2.41, -.42],
    pigment('seam'), 'y', true, 22);
  cylinder(sub, .30, .13, [0, 2.48, -.42],
    pigment('brass'), 'y', false, 22);
  cylinder(sub, .24, .135, [0, 2.50, -.42],
    pigment('roof'), 'y');
  const antenna = cylinder(sub, .028, .31, [.37, 2.61, -.37],
    pigment('seam'), 'y');
  oval(sub, [.095, .09, .095], [.37, 2.78, -.37],
    pigment('ivory', true), false);
  const portGroups = [];
  for (const sign of [-1, 1]) {
    for (const z of [-.71, .35]) {
      portGroups.push(port(sub, z < 0 ? .254 : .22,
        [sign * (z < 0 ? 1.29 : 1.31), 1.23, z],
        sign < 0 ? '-x' : 'x'));
    }
  }
  portGroups.push(port(sub, .35, [0, 1.32, 1.87], 'z'));
  const headlightPods = [];
  for (const sign of [-1, 1]) {
    const pod = new THREE.Group();
    pod.position.set(sign * .92, .90, 1.59);
    oval(pod, [.28, .27, .42], [0, 0, .09], pigment('fin'), false, 1);
    cylinder(pod, .22, .07, [0, 0, .42],
      pigment('brass'), 'z');
    cylinder(pod, .177, .075, [0, 0, .47],
      pigment('ivory', true), 'z');
    sub.add(pod);
    headlightPods.push(pod);
  }
  const fins = [];
  for (const sign of [-1, 1]) {
    const f = oval(sub, [.58, .13, .81],
      [sign * 1.43, 1.10, -1.15], pigment('fin'), true, 1);
    f.rotation.y = sign * .18;
    fins.push(f);
    cylinder(sub, .083, 2.34, [sign * 1.02, .63, -.05],
      pigment('seam'), 'z');
  }
  const fin = box(sub, [.18, .69, .74], [0, 2.03, -1.38],
    pigment('fin'), .06);
  fin.rotation.x = -.20;
  for (const z of [-.36, -.82, -1.30]) {
    cylinder(sub, .055, .14, [0, 2.06, z],
      pigment('brass'), 'y');
  }
  const motors = [-.64, .64].map(x => thruster(sub, x));
  for (const sign of [-1, 1]) {
    for (const z of [-.99, .76]) {
      cylinder(sub, .07, .05, [sign * 1.30, .67, z],
        pigment('brass'), 'x');
    }
  }

  const ease = x => {
    const a = Math.max(0, Math.min(1, x));
    return a * a * (3 - 2 * a);
  };
  const segment = (p, a, b) => ease((p - a) / (b - a));
  root.userData.setMorph = (value, seconds = 0) => {
    const p = Math.max(0, Math.min(1, value));
    const fold = segment(p, .24, .88);
    const retract = segment(p, .07, .65);
    const hatchProgress = segment(p, .18, .80);
    car.scale.set(1 - .999 * fold, 1 - .999 * fold, 1 - .999 * fold);
    car.visible = fold < .999;
    roof.position.y = 1.68 - .25 * retract;
    roof.scale.y = 1 - .35 * retract;
    undercarriage.position.y = .90 + .23 * retract;
    undercarriage.scale.y = 1 - .34 * retract;
    windshield.scale.y = 1 - .97 * retract;
    bumper.position.y = .70 + .35 * retract;
    rearBumper.position.y = .68 + .27 * retract;
    for (const {node, sign, z} of wheels) {
      node.position.set(sign * (1.37 - .54 * retract),
        .57 + .46 * retract, z - .07 * retract);
      node.rotation.z = sign * .18 * retract;
      node.scale.setScalar(1 - .96 * retract);
    }
    const emerge = segment(p, .12, .82);
    const scale = Math.max(.001, emerge);
    sub.visible = p > .11;
    sub.scale.set(.20 + .80 * scale, .18 + .82 * scale, .19 + .81 * scale);
    sub.position.y = -.28 * (1 - scale);
    fin.scale.y = .10 + .90 * hatchProgress;
    fin.position.y = 1.79 + .24 * hatchProgress;
    antenna.scale.y = .10 + .90 * segment(p, .61, .94);
    hatch.scale.y = .1 + .9 * hatchProgress;
    for (const m of motors) {
      m.g.position.z = -1.40 - .47 * segment(p, .45, .94);
      m.g.scale.setScalar(.18 + .82 * segment(p, .40, .92));
      m.rotor.rotation.z = seconds * (1.3 + 7 * segment(p, .66, .98));
    }
    for (const f of fins) {
      f.scale.y = .06 + .94 * segment(p, .46, .93);
    }
    for (const pod of headlightPods) {
      pod.rotation.y = Math.sin(seconds * .55) * .035 * scale;
    }
    root.position.y = .08 * Math.sin(seconds * 1.18) * segment(p, .60, .97);
    root.userData.morph = p;
  };
  root.userData.setMorph(0, 0);
  return root;
}
