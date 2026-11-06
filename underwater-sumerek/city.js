/* =============================================================================
   30c · Sunken biome: the architecture, flora, fish and the bathyscaphe of the Sunken City asset pack.
         Ported from the Sunken City artifact (put / mergeStatic / movers / schools); the models are the same .glb files.
         The cathedral stands on the beacon hill, the rest of the city is laid out around it on the Island's heights.
============================================================================= */
uwLoader.register((parser) => { parser.textureLoader = new THREE.TextureLoader(parser.options.manager); return { name: 'img_textures' }; });
const CITY = { group: null, mixers: [], movers: [], schools: [], vents: [], lights: [], tok: 0, last: 0 };
const CMAT = new Map(), CGLB = new Map();
const CSC = 0.9, CP = 0.9;                 // size and distance scale: pack metres → Island cells
function cMip(t) { if (t && !t.userData.mip) { t.userData.mip = true; t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 4; t.needsUpdate = true; } return t; }
function cConvert(m) {
  const shared = m.name && m.name !== 'voxel' && m.name !== 'voxel_glass';
  if (shared && CMAT.has(m.name)) return CMAT.get(m.name);
  if (shared) { cMip(m.map); cMip(m.emissiveMap); }
  const L = new THREE.MeshLambertMaterial({ map: m.map || null, emissive: m.emissiveMap ? 0xffffff : 0x000000, emissiveMap: m.emissiveMap || null,
    emissiveIntensity: m.emissiveMap ? (m.emissiveIntensity || 1) : 0, transparent: !!m.transparent, opacity: m.opacity ?? 1,
    side: m.transparent ? THREE.DoubleSide : THREE.FrontSide, depthWrite: !m.transparent, flatShading: true });
  L.name = m.name;
  if (shared) CMAT.set(m.name, L);
  return L;
}
function cLoad(id) {
  if (!CGLB.has(id)) {
    CGLB.set(id, fetch('glb/' + id + '.json').then((r) => { if (!r.ok) throw new Error(id + ' ' + r.status); return r.json(); }).then((j) => {
      const bin = atob(j.glb), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return uwLoader.parseAsync(u8.buffer, '');
    }).then((g) => { g.scene.traverse((o) => { if (o.isMesh) o.material = cConvert(o.material); }); return g; }));
  }
  return CGLB.get(id);
}
function cFlatten(g) {
  const by = new Map();
  g.scene.updateMatrixWorld(true);
  g.scene.traverse((o) => {
    if (!o.isMesh) return;
    const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld);
    for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'uv') geo.deleteAttribute(k);
    if (!by.has(o.material)) by.set(o.material, []);
    by.get(o.material).push(geo);
  });
  return [...by].map(([material, gs]) => ({ material, geometry: gs.length > 1 ? mergeGeometries(gs, false) : gs[0] }));
}
function cLoop(points) { return new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), true, 'centripetal'); }
function cRing(cx, cy, cz, rx, rz, n, wob, seed) {
  const r = mulberry32(seed), pts = [];
  for (let k = 0; k < n; k++) { const a = k / n * TAU; pts.push([cx + Math.cos(a) * rx * lerp(0.85, 1.15, r()), cy + Math.sin(a * 2 + seed) * wob, cz + Math.sin(a) * rz * lerp(0.85, 1.15, r())]); }
  return cLoop(pts);
}
const cA = new THREE.Vector3(), cB = new THREE.Vector3(), cC = new THREE.Vector3();
const cAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
function clearCity() {
  CITY.tok++;
  if (CITY.group) { scene.remove(CITY.group); CITY.group = null; }
  for (const l of CITY.lights) scene.remove(l);
  CITY.mixers.length = CITY.movers.length = CITY.schools.length = CITY.vents.length = CITY.lights.length = 0;
}
async function buildCity() {
  clearCity();
  const tok = CITY.tok, grp = new THREE.Group(); scene.add(grp); CITY.group = grp;
  const rnd = mulberry32((G.seed ^ 0x2a9f11) >>> 0);
  const bc = world.beacon, ox = bc.x, oz = bc.z + 9 * CP;
  const X = (x) => clamp(ox + x * CP, 2, W - 2), Z = (z) => clamp(oz + z * CP, 2, D - 2);
  const gy = (x, z) => terrainTop(x, z);
  const STATIC = [];
  async function put(id, x, z, ry = 0, s = 1, o = {}) {
    const g = await cLoad(id);
    if (tok !== CITY.tok) return null;
    const wx = X(x), wz = Z(z), obj = g.scene.clone(true);
    obj.position.set(wx, gy(wx, wz) + (o.y || 0) * CSC - (o.sink ?? 0.25), wz);
    obj.rotation.set(o.rx || 0, ry, o.rz || 0); obj.scale.setScalar(s * CSC);
    obj.traverse((m) => { m.frustumCulled = true; });
    const animated = o.clip !== false && g.animations.length > 0;
    if (animated) {
      const mx = new THREE.AnimationMixer(obj);
      const clip = g.animations.find((a) => a.name === o.clip) || g.animations[0];
      const act = mx.clipAction(clip); act.time = rnd() * clip.duration; act.timeScale = o.speed || 1; act.play();
      CITY.mixers.push(mx); grp.add(obj);
    } else STATIC.push(obj);
    return obj;
  }
  function mergeStatic() {
    const by = new Map();
    for (const o of STATIC) {
      o.updateMatrixWorld(true);
      o.traverse((m) => {
        if (!m.isMesh) return;
        const geo = m.geometry.clone();
        for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'uv') geo.deleteAttribute(k);
        if (!geo.attributes.uv || !geo.index) { geo.dispose(); return; }
        geo.applyMatrix4(m.matrixWorld);
        if (!by.has(m.material)) by.set(m.material, []);
        by.get(m.material).push(geo);
      });
    }
    for (const [mat, gs] of by) {
      const geo = gs.length > 1 ? mergeGeometries(gs, false) : gs[0];
      if (!geo) continue;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.matrixAutoUpdate = false; mesh.updateMatrix(); geo.computeBoundingSphere(); grp.add(mesh);
    }
    STATIC.length = 0;
  }
  const jobs = [];
  const add = (p) => jobs.push(p.catch((e) => console.warn('city', e)));
  /* ---- architecture, in the layout of the Sunken City plaza ---- */
  add(put('cathedral_tower', 0, -9, 0, 1.3, { sink: 0.6 }));
  add(put('stairs', 0, -5.1, 0, 1.15));
  add(put('angel_statue', -2.6, -3.6, 0.25, 1.5)); add(put('angel_statue', 2.6, -3.6, -0.25, 1.5));
  add(put('cathedral_bell', 0, -9, 0, 1.15, { y: 12.3 }));
  for (const [x, z] of [[-3.4, -1], [3.4, -1], [-3.4, 3], [3.4, 3], [-3.4, 7], [3.4, 7]]) add(put(Math.abs(z - 3) < 0.1 && x > 0 ? 'column_broken' : 'column', x, z, 0, 1.2));
  add(put('street_lamp', -2.2, 1, 0, 1.1)); add(put('street_lamp', 2.2, 5, Math.PI, 1.1));
  for (const [x, z] of [[-1.6, 1.2], [1.6, 4.8]]) { const l = new THREE.PointLight(0x7fe8ff, 5, 12); l.position.set(X(x), gy(X(x), Z(z)) + 3.2, Z(z)); scene.add(l); CITY.lights.push(l); }
  add(put('arch', -8, 4, 0.55, 1.25)); add(put('arch', 8.5, 4.5, -0.5, 1.25));
  add(put('iron_gate', 12.5, -12.5, -0.6, 1.1)); add(put('lancet_window', -12, -13, 0.7, 1.4));
  for (let k = -2; k <= 2; k++) add(put('viaduct', k * 10.4, -22.6, 0, 1.3));
  for (const x of [-15.6, 0, 15.6]) add(put('gargoyle', x, -21.75, -Math.PI / 2, 1.3, { y: 8.9 }));
  add(put('bridge', -3.5, 11, Math.PI / 2, 1)); add(put('bridge_broken', 10, 11, Math.PI / 2, 1));
  add(put('galleon', -18, 6, 0.8, 1.6, { y: -0.9 })); add(put('submarine_wreck', 17, 4, 2.5, 1.3, { y: -0.4 }));
  add(put('whale_skeleton', 13, 15.5, -0.4, 1.55)); add(put('anchor', -11.5, 10.5, 0.4, 1.3, { rz: 0.35 }));
  add(put('treasure_chest', -12.8, 12.6, 0.9, 1.3, { speed: 0.6 })); add(put('cannon', -21, 11, 1.2, 1.3));
  add(put('ship_wheel', -15.5, 12.5, 0.3, 1.2, { rx: -Math.PI / 2 + 0.15 }));
  for (const [x, z, r] of [[-13.5, 9, 0.3], [-14.6, 9.4, 1.4], [-22, 2, 0.8], [15, 8.6, 0.2]]) add(put('barrel', x, z, r, 1.2));
  for (const [x, z, r] of [[-14, 8, 0.6], [-21.5, 3.2, 0.2], [14.2, 9.6, 1.1]]) add(put('crate', x, z, r, 1.1));
  add(put('diving_helmet', 4, 8.2, -0.7, 1.4)); add(put('sea_scooter', 5.3, 8.9, 2.2, 1.1));
  for (const [x, z] of [[6, -14], [9, -12.2], [11.5, -15.4]]) add(put('sea_mine', x, z, rnd() * TAU, 1.25, { speed: 0.6 + rnd() * 0.4 }));
  for (const [x, z] of [[-5, -15], [15, -9.5]]) add(put('hot_vent', x, z, rnd() * TAU, 1.4).then((o) => { if (o) CITY.vents.push(o.position.clone().add(cA.set(0, 0.8, 0))); }));
  for (const [x, z, r] of [[-11.6, 13.6, 0.4], [5.5, 6.6, 1.3], [-6.5, 14, 2.2]]) add(put('pearl_clam', x, z, r, 1.3));
  for (const [x, z, r] of [[-10, 14, 0.2], [3, 9.5, 1.1], [8, 17, 2.4], [-1.5, 14.8, 0.8]]) add(put('starfish', x, z, r, 1.4));
  for (const [x, z, r] of [[-6.2, -13.5, 0.3], [13.5, -8, 1.2], [-7.4, -12.6, 2.1]]) add(put('tube_sponge', x, z, r, 1.5));
  for (const [x, z, r] of [[-23, 9, 0.5], [-19.5, 12.5, 1.6], [21, -2, 2.2], [-27, -4, 0.9]]) add(put('sea_fan', x, z, r, 2.1));
  /* ---- flora scattered over the whole seabed ---- */
  const flora = (id, n, s0, s1) => { for (let i = 0; i < n; i++) { const wx = 3 + rnd() * (W - 6), wz = 3 + rnd() * (D - 6); add(put(id, (wx - ox) / CP, (wz - oz) / CP, rnd() * TAU, lerp(s0, s1, rnd()), { sink: 0.15 })); } };
  flora('kelp_tall', 7, 1.1, 1.8); flora('kelp_mid', 7, 1, 1.6); flora('kelp_short', 7, 1, 1.5); flora('seagrass', 2, 1.2, 1.6); flora('anemone', 2, 1.3, 1.8);
  for (const c of ['pink', 'orange', 'violet']) flora('coral_branch_' + c, 3, 1.3, 2.1);
  flora('coral_brain', 5, 1.2, 1.9);
  await Promise.all(jobs);
  if (tok !== CITY.tok) return;
  mergeStatic();
  /* ---- life: fish schools and swimmers ---- */
  const by = (cx, cz) => gy(X(cx), Z(cz));
  const R = (cx, cy, cz, rx, rz, n, wob, seed) => cRing(X(cx), by(cx, cz) + cy * CSC, Z(cz), rx * CP, rz * CP, n, wob, seed);
  const lifeJobs = [];
  const mover = (o, curve, speed, opt = {}) => { if (o) CITY.movers.push({ o, curve, speed, u: rnd(), yaw: 0, pitch: 0, roll: 0, bob: opt.bob ?? 0.3, ground: !!opt.ground, bank: opt.bank ?? 0.5 }); };
  async function school(id, n, curve, speed, scale, spread) {
    const g = await cLoad(id);
    if (tok !== CITY.tok) return;
    const meshes = cFlatten(g).map(({ material, geometry }) => {
      geometry.translate(0, -0.22, 0);
      const mat = material.clone();
      mat.onBeforeCompile = (sh) => { sh.uniforms.uTime = U.time; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += sin(uTime * 9.0 + position.x * 12.0 + float(gl_InstanceID) * 1.7) * 0.07 * smoothstep(0.15, -0.3, position.x);'); };
      const im = new THREE.InstancedMesh(geometry, mat, n); im.frustumCulled = false; grp.add(im); return im;
    });
    const fish = [];
    for (let i = 0; i < n; i++) fish.push({ off: new THREE.Vector3((rnd() - 0.5) * spread, (rnd() - 0.5) * spread * 0.5, (rnd() - 0.5) * spread), lag: rnd() * 0.06, p: curve.getPointAt(rnd()).clone(), v: new THREE.Vector3(), yaw: 0, pitch: 0, s: scale * CSC * lerp(0.75, 1.1, rnd()), ph: rnd() * TAU });
    CITY.schools.push({ meshes, fish, curve, speed, u: rnd(), dummy: new THREE.Object3D() });
  }
  const swimmer = (id, s, mk, speed, opt) => lifeJobs.push(put(id, 0, 0, 0, s, { sink: 0 }).then((o) => { if (o) mover(o, mk(), speed, opt); }));
  lifeJobs.push(school('glow_fish_teal', 14, R(0, 8.5, -6, 9, 7.5, 8, 1.5, 2), 3.2, 0.8, 3.2));
  lifeJobs.push(school('glow_fish_violet', 12, R(-16, 4.5, 6, 6, 4.5, 7, 1, 3), 2.6, 0.78, 2.6));
  lifeJobs.push(school('glow_fish_amber', 12, R(3, 3.4, 9, 8, 3.5, 8, 0.8, 4), 2.8, 0.78, 2.6));
  lifeJobs.push(school('glow_fish_emerald', 12, R(0, 10, -18.5, 13, 4, 9, 1.4, 5), 3.4, 0.78, 3));
  lifeJobs.push(school('lantern_fish', 8, R(11, 6, -3, 6, 6, 7, 1.2, 6), 2.2, 0.9, 2.4));
  swimmer('manta', 1.6, () => R(-2, 19, -10, 15, 11, 10, 1.6, 8), 2.2, { bank: 1.4 });
  swimmer('eel', 1.2, () => R(-5, 1.4, 2, 6, 6, 7, 0.6, 9), 1.4, { bob: 0.2, bank: 0.9 });
  swimmer('seahorse', 1.5, () => R(-24, 2, 2, 1.5, 1.5, 5, 0.5, 21), 0.2, { bob: 0.5, bank: 0 });
  swimmer('nautilus', 1.4, () => R(8, 5, 2, 7, 5, 6, 1, 10), 0.6, { bob: 0.4, bank: 0.3 });
  swimmer('nautilus', 1.2, () => R(-14, 7, -12, 6, 4, 6, 1, 11), 0.5, { bob: 0.4 });
  swimmer('hermit_crab', 1.2, () => R(4.5, 0, 8.5, 2.2, 1.3, 6, 0, 12), 0.35, { ground: true, bank: 0, bob: 0 });
  swimmer('siphonophore', 1.5, () => R(-4, 15, -12, 12, 9, 8, 1.5, 14), 0.5, { bob: 0.5, bank: 0.2 });
  swimmer('scout_drone', 1.3, () => R(0, 12.5, -9, 5.5, 5.5, 8, 1, 15), 1.2, { bank: 0.6 });
  swimmer('submarine', 1.6, () => cLoop([[X(-60), by(0, 0) + 12, Z(-44)], [X(0), by(0, 0) + 13, Z(-50)], [X(60), by(0, 0) + 12, Z(-44)], [X(0), by(0, 0) + 11, Z(-38)]]), 2.2, { bob: 0.2, bank: 0.2 });
  swimmer('bathyscaphe', 1.25, () => cLoop([[0, 8, 16], [-12, 6, 16], [-24, 7, 6], [-20, 9, -6], [-10, 11, -16], [2, 14, -18], [14, 10, -15], [22, 7, -4], [20, 6, 10], [10, 5, 20]].map(([x, y, z]) => [X(x), by(0, 0) + y * CSC, Z(z)])), 1.6, { bob: 0.25, bank: 0.35 });
  await Promise.all(lifeJobs.map((p) => p.catch((e) => console.warn('life', e))));
}
function updateCity() {
  if (!CITY.group) return;
  const now = performance.now() / 1000, dt = Math.min(0.05, Math.max(0.001, now - CITY.last)); CITY.last = now;
  const t = G.time;
  for (const m of CITY.mixers) m.update(dt);
  for (const M of CITY.movers) {
    const L = M.curve.getLength();
    M.u = (M.u + M.speed * dt / L) % 1;
    const p = M.curve.getPointAt(M.u, cA), tg = M.curve.getTangentAt(M.u, cB);
    if (M.ground) p.y = terrainTop(p.x, p.z); else { p.y += Math.sin(t * 0.9 + M.u * 40) * M.bob; p.y = Math.max(p.y, terrainTop(p.x, p.z) + 1.1); }
    M.o.position.lerp(p, damp(4, dt));
    const yawT = Math.atan2(-tg.z, tg.x), dy = cAng(M.yaw, yawT);
    M.yaw += dy * damp(2.2, dt);
    M.roll += (clamp(-dy * M.bank, -0.4, 0.4) - M.roll) * damp(2, dt);
    M.pitch += (clamp(Math.asin(clamp(tg.y, -1, 1)), -0.5, 0.5) - M.pitch) * damp(2, dt);
    M.o.rotation.set(M.roll, M.yaw, M.pitch, 'YXZ');
  }
  for (const S of CITY.schools) {
    const L = S.curve.getLength();
    S.u = (S.u + S.speed * dt / L) % 1;
    for (let i = 0; i < S.fish.length; i++) {
      const f = S.fish[i];
      const c = S.curve.getPointAt((S.u - f.lag + 1) % 1, cA);
      cC.copy(f.off).applyAxisAngle(cB.set(0, 1, 0), t * 0.25 + f.ph * 0.1);
      c.add(cC); c.y += Math.sin(t * 1.3 + f.ph) * 0.25;
      cC.subVectors(c, f.p).multiplyScalar(1.6);
      f.v.lerp(cC, damp(2.6, dt)); f.p.addScaledVector(f.v, dt);
      f.p.y = Math.max(f.p.y, terrainTop(f.p.x, f.p.z) + 1.0);
      const sp = Math.hypot(f.v.x, f.v.z);
      if (sp > 0.05) f.yaw += cAng(f.yaw, Math.atan2(-f.v.z, f.v.x)) * damp(5, dt);
      f.pitch += (clamp(Math.atan2(f.v.y, Math.max(sp, 0.01)), -0.6, 0.6) - f.pitch) * damp(4, dt);
      S.dummy.position.copy(f.p); S.dummy.rotation.set(0, f.yaw, f.pitch, 'YXZ'); S.dummy.scale.setScalar(f.s); S.dummy.updateMatrix();
      for (const m of S.meshes) m.setMatrixAt(i, S.dummy.matrix);
    }
    for (const m of S.meshes) m.instanceMatrix.needsUpdate = true;
  }
  for (const v of CITY.vents) if (Math.random() < dt * 22) dust.emit(v.x + rr(-0.3, 0.3), v.y, v.z + rr(-0.3, 0.3), rr(-0.1, 0.1), rr(0.8, 1.6), rr(-0.1, 0.1), rr(2, 3.5), 0.06, 0.12, C.spray, 0.7, -1.2, 0.5, 1);
}
