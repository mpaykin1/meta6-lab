import * as T from 'three';
import {batchInk} from './ink-batch.js';

export const random = n => {
  const a = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return a - Math.floor(a);
};
export const shoreX = z => 6.2 + Math.sin(z * .27) * 1.55 + Math.sin(z * .79) * .26;
export function buildWorld({makers, paint, scene}) {
  const world = new T.Group(); world.name = 'INK · город, лес и озеро'; scene.add(world);
  const trees = [], props = [], wet = [], circles = [];
  function add(kind, x, z, scale = 1, angle = 0, seed = 1) {
    const o = makers[kind](seed);
    o.position.set(x, 0, z); o.scale.multiplyScalar(scale); o.rotation.y = angle;
    o.userData.kind = kind; world.add(o); props.push(o);
    if (kind === 'fir' || kind === 'birch' || kind === 'sapling') trees.push(o);
    return o;
  }
  function surface(shape, color, height) {
    const geo = new T.ShapeGeometry(shape, 48); geo.rotateX(-Math.PI / 2);
    const o = new T.Mesh(geo, new T.MeshStandardMaterial({color, roughness: .90, side: T.DoubleSide}));
    o.position.y = height; o.userData.watercolorOutline = false; world.add(o); return o;
  }
  // The right edge is an actual shoreline, with no land hidden beneath the lake.
  const land = new T.Shape(); land.moveTo(shoreX(-21), 21);
  for (let z = -21; z <= 21; z += .35) land.lineTo(shoreX(z), -z);
  land.lineTo(-18, -21); land.quadraticCurveTo(-22, -19, -22, -14);
  land.lineTo(-22, 14); land.quadraticCurveTo(-22, 21, -15, 21); land.closePath();
  surface(land, '#b6bea3', -.04);
  const soil = new T.Mesh(new T.ExtrudeGeometry(land, {depth: .40, bevelEnabled: false}),
    new T.MeshStandardMaterial({color: '#a89e83', roughness: 1}));
  soil.rotation.x = -Math.PI / 2; soil.position.y = -.46;
  soil.userData.watercolorOutline = false; world.add(soil);
  const sand = new T.Shape(); sand.moveTo(shoreX(-21) - .5, 21);
  for (let z = -21; z <= 21; z += .35) sand.lineTo(shoreX(z) - .50, -z);
  for (let z = 21; z >= -21; z -= .35) sand.lineTo(shoreX(z) + .10, -z);
  sand.closePath(); surface(sand, '#ccbc97', -.025);
  const lakeShape = new T.Shape(); lakeShape.moveTo(shoreX(-21), 21);
  for (let z = -21; z <= 21; z += .35) lakeShape.lineTo(shoreX(z), -z);
  lakeShape.lineTo(20, -21); lakeShape.quadraticCurveTo(24, -19, 24, -14);
  lakeShape.lineTo(24, 14); lakeShape.quadraticCurveTo(24, 21, 18, 21); lakeShape.closePath();
  const water = surface(lakeShape, '#78a5a4', -.08);
  water.material.roughness = .25; water.material.metalness = .12;
  // Ink contour lines gently drift over the pigment wash of the lake.
  const waveGeo = new T.BufferGeometry(), wavePoints = new Float32Array(100 * 6);
  waveGeo.setAttribute('position', new T.BufferAttribute(wavePoints, 3));
  const waves = new T.LineSegments(waveGeo, new T.LineBasicMaterial({
    color: '#dce0c7', transparent: true, opacity: .34, depthWrite: false
  })); world.add(waves);
  function ribbon(points, width, color, y = .015) {
    const curve = new T.CatmullRomCurve3(points.map(([x, z]) => new T.Vector3(x, 0, z)));
    const v = [], idx = [];
    for (let i = 0; i <= 100; i++) {
      const p = curve.getPoint(i / 100), d = curve.getTangent(i / 100);
      v.push(p.x - d.z * width, y, p.z + d.x * width, p.x + d.z * width, y, p.z - d.x * width);
      if (i < 100) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(v, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({color, roughness: .85}));
    mesh.userData.watercolorOutline = false; world.add(mesh);
  }
  ribbon([[-12, -20], [-12, -13], [-10, -8], [-8, -4]], 2.3, '#777f78', .012);
  ribbon([[-8, -4], [-5, -1], [-2, 2], [1, 5], [3.6, 9], [5.8, 11]], .68, '#c4b38e', .022);
  ribbon([[-2, 2], [-3, 7], [-6, 12], [-9, 17]], .48, '#bbad8d', .018);
  function slab(size, color, x, y, z) {
    const o = new T.Mesh(new T.BoxGeometry(...size), new T.MeshStandardMaterial({color, roughness: 1}));
    o.position.set(x, y, z); o.userData.watercolorOutline = false; world.add(o); return o;
  }
  slab([1.30, .12, 12], '#b9baaa', -9.15, .05, -14.6);
  for (let i = 0; i < 30; i++) slab([.15, .19, .36], i % 2 ? '#a9b3a4' : '#c1c4b0',
    -9.87, .06, -20.3 + i * .4);
  for (let i = 0; i < 7; i++) slab([.07, .012, .90], '#d7cfb1', -12.2, .029, -20 + i * 1.65);
  const shop = add('apothecary', -5.0, -13, 1, -Math.PI / 2);
  const hut = add('shelter', 2.9, 7.8, .78, -.15);
  const dock = add('pier', 5.75, 10.8, 1, -Math.PI / 2);
  const boat = add('rowboat', 10.1, 12.0, 1, -.45);
  const hero = add('traveller', -10.25, -8.6, .82, 0);
  hero.traverse(o => {
    if (!o.isMesh) return;
    const hex = o.material.color?.getHexString();
    if (hex === 'b25d51') { o.material = o.material.clone(); o.material.color.set('#bc994f'); }
  });
  const hood = hero.children.find(o => o.geometry?.type === 'SphereGeometry' && o.position.y > 1.25);
  if (hood) { hood.material = hood.material.clone(); hood.material.color.set('#ddd2ae'); }
  for (const x of [-.14, .14]) {
    const shoe = new T.Mesh(new T.BoxGeometry(.19, .12, .34), new T.MeshStandardMaterial({color: '#4b5148'}));
    shoe.position.set(x, .06, .06); hero.add(shoe);
  }
  add('car', -12.3, -16.3, 1, .10);
  add('bench', -9.15, -9.9, .85, -Math.PI / 2);
  add('sign', -7.3, -4.8, .85, -.2);
  add('bridge', -5.4, 8.1, .80, .5);
  const mill = add('windmill', -13, 11.5, .9, .3);
  const deer = add('deer', -6.5, 3.7, .76, -.4);
  const fox = add('fox', -1.8, 13.5, .85, -.4);
  const shrine = add('shrine', -15, 2, .85, .20);
  // Павший великан — принятый эталон (OWNER PASS 13.11.2026), лежит в осеннем лесу.
  const guardian = add('robot', -10.5, 5.8, .83, -.62, 23);
  const lamps = [[-9.6, -18], [-9.5, -8], [-4, -.4], [3.6, 9.7]];
  lamps.forEach(([x, z]) => add('streetlamp', x, z, .86));
  // Existing tree makers supply every seasonal variant; no second tree implementation.
  const autumn = ['#b7a65e', '#c58b5a', '#b36f66', '#c28b93', '#64877a'];
  for (let i = 0; i < 87; i++) {
    const x = -19 + random(i + 400) * 25, z = -5 + random(i + 800) * 24;
    const pathX = -4.5 + z * .72;
    if (Math.abs(x - pathX) < 1.8 || (x > 1.3 && z > 5.2 && z < 12)) continue;
    if (Math.hypot(x + 13, z - 11.5) < 2.3 || Math.hypot(x + 15, z - 2) < 2) continue;
    const tree = add(i % 7 === 0 ? 'birch' : 'fir', x, z,
      .70 + random(i + 500) * .65, random(i) * 6.28, i + 3);
    if (i % 5 !== 0) tree.traverse(o => {
      if (!o.isMesh || !o.material.color || o.position.y < 1.1 || o.geometry.type === 'CylinderGeometry') return;
      o.material = o.material.clone(); o.material.color.set(autumn[i % autumn.length]);
      o.material.color.offsetHSL(0, -.04, (random(i + 40) - .5) * .12);
    });
  }
  for (let i = 0; i < 12; i++) add('sapling', -16 + random(i + 3) * 20,
    -3 + random(i + 49) * 21, .8 + random(i), i, i + 1);
  for (let i = 0; i < 19; i++) {
    const z = -5 + i * 1.28;
    add('reeds', shoreX(z) - .20, z, .7 + random(i) * .5, i);
    if (i % 3 === 0) add('rock', shoreX(z) - .8, z + .3, .5, i, i);
  }
  for (let i = 0; i < 17; i++) {
    const x = -18 + random(i + 61) * 22, z = -4 + random(i + 208) * 21;
    add(i % 2 ? 'bush' : 'wildflowers', x, z, .65 + random(i) * .4, i, i + 1);
  }
  for (let i = 0; i < 5; i++) {
    add('rock', -8.2, -16 + i * 1.3, .6 + random(i) * .4, i, i);
    add('bush', -7.8, -16.6 + i * 1.3, .8, i, i);
  }
  add('mushrooms', -3.7, 1.4, .9); add('mushrooms', .7, 6.0, .7);
  const grassCount = 2100;
  const grass = new T.InstancedMesh(new T.ConeGeometry(.04, .42, 3),
    new T.MeshStandardMaterial({color: '#9aab82', roughness: 1}), grassCount);
  const dummy = new T.Object3D(), c = new T.Color();
  for (let i = 0; i < grassCount; i++) {
    const x = -20 + random(i + 1000) * 27, z = -6 + random(i + 4000) * 26;
    const onPath = Math.abs(x - (-4.5 + z * .72)) < 1.35;
    const onLake = x > shoreX(z) - .5;
    dummy.position.set(x, .12, z); dummy.rotation.set(.10, random(i) * 6.28, .18);
    dummy.scale.setScalar(onPath || onLake ? 0 : .45 + random(i + 30)); dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
    c.set(i % 4 === 0 ? '#c3b488' : i % 3 === 0 ? '#b5bb92' : '#879d77'); grass.setColorAt(i, c);
  }
  grass.userData.watercolorOutline = false; grass.userData.watercolorSkipWash = true; world.add(grass);
  // Clear small growth from under the fallen giant so it reads as one silhouette.
  for (const o of [...props]) {
    if (o === guardian || !['fir', 'birch', 'sapling', 'bush', 'wildflowers', 'rock', 'mushrooms', 'reeds'].includes(o.userData.kind)) continue;
    // Keep the giant's face open toward the camera: clear a short corridor in front of it.
    const fx = o.position.x + 10.5, fz = o.position.z - 5.8, along = fx * -.58 + fz * .81;
    const near = Math.hypot(fx, fz) < 4.6;
    const corridor = along > 0 && along < 8 && Math.abs(fx * .81 + fz * .58) < 2.6;
    if (!near && !corridor) continue;
    world.remove(o); props.splice(props.indexOf(o), 1);
    const t = trees.indexOf(o); if (t >= 0) trees.splice(t, 1);
  }
  trees.forEach(tree => batchInk(tree));
  batchInk(world, {cellSize: 8, exclude: new Set([...trees, hero, boat, mill, deer, fox, shrine, guardian])});
  // Pigment seed is a uniform, so repeated objects can share the compiled GPU program.
  paint.apply(world, {seed: 'ink-expanded-valley'});
  world.traverse(o => {
    if (o.isMesh && o.material.userData?.livingWatercolorPatched) {
      o.material.customProgramCacheKey = () => 'ink-world-pigment-v1';
    }
  });
  // Soft ink pools provide directional shadows without expensive shadow maps on phones.
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d'), gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#ffffffb0'); gradient.addColorStop(.55, '#ffffff44');
  gradient.addColorStop(1, '#ffffff00'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  const shadowTexture = new T.CanvasTexture(canvas);
  function pool(x, z, w, h, color, opacity, angle = 0) {
    const mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({
      map: shadowTexture, color, transparent: true, opacity, depthWrite: false
    }));
    mesh.rotation.set(-Math.PI / 2, 0, angle); mesh.position.set(x, .045, z); world.add(mesh); return mesh;
  }
  trees.forEach(tree => pool(tree.position.x - 1.1, tree.position.z + 1.4,
    2.7 * tree.scale.x, 6 * tree.scale.x, '#4e6558', .32, .5));
  pool(-6.3, -11.0, 8, 9, '#526d65', .4, .25);
  const heroShadow = pool(hero.position.x, hero.position.z, .8, .55, '#253e36', .7);
  lamps.forEach(([x, z]) => pool(x + .45, z, 3.6, 3.5, '#ffe7a5', .60));
  pool(-8, -12, 5, 3, '#aee5c8', .45);
  for (let i = 0; i < 12; i++) {
    const x = -13 + random(i + 20) * 3, z = -20 + i * 1.1;
    const p = pool(x, z, .5, 1.5, '#d0dfc6', .22, -.1); wet.push(p);
  }
  paint.createBrushEmitter({parent: hut, origin: new T.Vector3(.58, 2.9, .14),
    count: 7, scale: .35, rise: .32, spread: .25, wind: .13, opacity: .12, seed: 'hut-smoke'});
  const rainCount = 360, rainPoints = new Float32Array(rainCount * 6);
  const rainGeo = new T.BufferGeometry(); rainGeo.setAttribute('position', new T.BufferAttribute(rainPoints, 3));
  const rain = new T.LineSegments(rainGeo, new T.LineBasicMaterial({
    color: '#668a88', transparent: true, opacity: .30, depthWrite: false
  })); world.add(rain);
  const ringGeo = new T.RingGeometry(.12, .133, 16); ringGeo.rotateX(-Math.PI / 2);
  for (let i = 0; i < 54; i++) {
    const ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({
      color: '#d9e4cf', transparent: true, opacity: .2, depthWrite: false, side: T.DoubleSide
    }));
    ring.position.set(0, .05, 0); world.add(ring); circles.push(ring);
  }
  const dustGeo = new T.BufferGeometry(), dustPoints = new Float32Array(60 * 3);
  dustGeo.setAttribute('position', new T.BufferAttribute(dustPoints, 3));
  world.add(new T.Points(dustGeo, new T.PointsMaterial({
    size: .045, color: '#e9d4a3', transparent: true, opacity: .5, depthWrite: false
  })));
  const fogs = [];
  for (let i = 0; i < 5; i++) {
    const fog = new T.Sprite(new T.SpriteMaterial({map: shadowTexture, color: '#dde6cd',
      transparent: true, opacity: .13, depthWrite: false}));
    fog.position.set(-12 + i * 6, 1.6, 2 + Math.sin(i * 4) * 10); fog.scale.set(18, 3.2, 1);
    world.add(fog); fogs.push(fog);
  }
  function canWalk(x, z) {
    if (x < -20.5 || x > 21 || z < -20 || z > 20) return false;
    // The pier runs east from shore; its boards are the only way onto the water.
    if (x > shoreX(z) - .25) return x > 5.4 && x < 9.6 && Math.abs(z - 10.8) < .72;
    if (x > -7.4 && x < -2.5 && z > -16.5 && z < -9.45) return false;
    if (x > 1.65 && x < 4.20 && z > 6.6 && z < 9.25) return false;
    if (Math.hypot(x + 13, z - 11.5) < 1.15) return false;
    if (Math.hypot(x + 10.5, z - 5.8) < 2.6) return false;
    return true;
  }
  function tick(t, focus, overview) {
    heroShadow.position.set(hero.position.x, .06, hero.position.z);
    mill.userData.rotor.rotation.z = t * .23;
    fox.userData.tail.rotation.y = Math.sin(t * 1.3) * .12;
    boat.position.y = -.08 + Math.sin(t * 1.1) * .035;
    boat.rotation.z = Math.sin(t * .9) * .025;
    deer.rotation.y = -.4 + Math.sin(t * .4) * .08;
    if (guardian.userData.robotEyes) guardian.userData.robotEyes.color.setRGB(1, .39 + Math.sin(t * .75) * .065, .20);
    shrine.userData.orb.position.y = 1.32 + Math.sin(t * 1.5) * .1;
    trees.forEach((tree, i) => {
      tree.rotation.z = Math.sin(t * .8 + i) * .012;
      tree.rotation.x = Math.sin(t * .6 + i) * .007;
    });
    for (let i = 0; i < rainCount; i++) {
      const x = focus.x + (random(i + 100) - .5) * 30;
      const z = focus.z + (random(i + 700) - .5) * 30;
      const y = 8 - ((t * 4 + random(i + 70) * 8) % 8), n = i * 6;
      rainPoints.set([x, y, z, x - .07, y + .38, z], n);
    }
    rainGeo.attributes.position.needsUpdate = true;
    circles.forEach((ring, i) => {
      const phase = (t * .65 + random(i)) % 1;
      ring.position.x = focus.x + (random(i + 80) - .5) * 25;
      ring.position.z = focus.z + (random(i + 90) - .5) * 25;
      ring.position.y = ring.position.x > shoreX(ring.position.z) ? -.065 : .052;
      ring.scale.setScalar(.20 + phase * 3); ring.material.opacity = (1 - phase) * .24;
    });
    for (let i = 0; i < 100; i++) {
      const z = -20 + random(i + 980) * 40, x = shoreX(z) + .5 + random(i + 70) * 13;
      const drift = Math.sin(t * .55 + i) * .09, n = i * 6;
      wavePoints.set([x, -.05, z + drift, x + .35 + random(i) * .7, -.05, z + drift + .04], n);
    }
    waveGeo.attributes.position.needsUpdate = true;
    for (let i = 0; i < 60; i++) dustPoints.set([
      -18 + random(i + 56) * 25 + Math.sin(t * .2 + i) * .20,
      .3 + ((random(i + 30) * 4 + t * .035) % 4), -4 + random(i + 7) * 23
    ], i * 3);
    dustGeo.attributes.position.needsUpdate = true;
    fogs.forEach((fog, i) => {fog.position.x = -12 + i * 6 + Math.sin(t * .10 + i) * 1.5;});
    wet.forEach((p, i) => {p.material.opacity = .14 + Math.sin(t + i) * .055;});
    props.forEach(o => {
      o.visible = overview || Math.hypot(o.position.x - focus.x, o.position.z - focus.z) < 24;
    });
  }
  return {world, hero, tick, canWalk, zones: {
    city: [-10.25, -8.6], woodland: [-2, 2], lakeside: [4.8, 10.5], meadow: [-8, 12], guardian: [-12.4, 8.6]
  }};
}
