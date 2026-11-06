/* =============================================================================
   30d · The rest of «Пепельный путь» inside the Island: tile ground (autotiles, animated tiles), 14 FX sheets,
         8 decals, baked 8-direction billboards, stack sprites, grass/shrub/reed cards, fog layers, god rays,
         parallax silhouettes, ash/dust/ember points, rain, laser ribbons, explosions with the debris set,
         the three weapon models and the pixel UI art. All of it is the original code (ash_gpu.js).
         The hero and the 21 weapons stay the Island's own.
============================================================================= */
const AG = ashenGpu(THREE, ASH, renderer, (x, z) => groundBelow(x, 40, z));
const agH = (x, z) => groundBelow(x, 40, z);
const agRoot = new THREE.Group(); scene.add(agRoot);
const ag = { ready: false, sheets: {}, lod: [], bbs: [], fxPool: {}, beams: [], skyL: [], bursts: [], bi: 0, loops: [], hpPrev: 0, rainT: 0, cat: false };

function agInit() {
  if (ag.ready) return;
  ag.ready = true;
  AG.buildTileAtlases(); AG.buildFxAtlases();
  ag.art = AG.art2d();
  // the pixel logo of the original, shown on the title of the Ashen island
  const lg = ag.art.logo.canvas, el = document.getElementById('ashLogo');
  if (el) { el.width = lg.width; el.height = lg.height; el.getContext('2d').drawImage(lg, 0, 0); }
}
function agClear() {
  while (agRoot.children.length) { const c = agRoot.children[0]; agRoot.remove(c); c.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose && !o.material.userData.keep) o.material.dispose(); }); }
  ag.lod.length = 0; ag.bbs.length = 0; ag.beams.length = 0; ag.skyL.length = 0; ag.bursts.length = 0; ag.loops.length = 0; ag.fxPool = {};
  ag.fog = ag.rays = ag.par = ag.pts = ag.rain = ag.cir = null; ag.fogY = ag.fogAmt = ag.cirAmt = ag.rainAmt = undefined;
  const el = document.getElementById('ashLogo'); if (el) el.hidden = true;
  if (agWarnEl) agWarnEl.style.opacity = '0';
}

/* ---- ground tiles: one instanced mesh, the tile index picks static / animated / autotile cell ---- */
const AG_GROUND_V = `attribute vec3 aPos; attribute float aTile; attribute float aSz; attribute float aRot; varying vec2 vUv; varying float vT; varying vec3 vW;
void main(){ vUv=uv; vT=aTile; float c=cos(aRot),s=sin(aRot); vec3 p=position*aSz; p=vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c); vW=p+aPos; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`;
function agGroundMat() {
  return new THREE.ShaderMaterial({
    uniforms: Object.assign({}, ASH.GU, { tAuto: { value: AG.ATL().auto.texture } }),
    vertexShader: AG_GROUND_V, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    fragmentShader: ASH.GLSL_COMMON + `uniform sampler2D tAtlas,tAnim,tAuto; varying vec2 vUv; varying float vT; varying vec3 vW;
void main(){ float t=floor(vT+.5); vec3 col;
  if(t<24.){ vec2 cell=vec2(mod(t,8.),3.-floor(t/8.)); col=texture2D(tAtlas,(cell+vUv)/vec2(8.,4.)).rgb; }
  else if(t<48.){ float a=t-24.; float f=floor(mod(uTime*8.,8.)); col=texture2D(tAnim,(vec2(f,7.-a)+vUv)/8.).rgb; }
  else { float b=t-48.; col=texture2D(tAuto,(vec2(mod(b,16.),2.-floor(b/16.))+vUv)/vec2(16.,3.)).rgb; }
  vec3 lit=col*(uAmbCol*.95+uSunCol*.42+pointLights(vW,vec3(0.,1.,0.))*.12);
  vec3 o=applyFog(lit,vec3(0.),vW); if(uLin>.5) o=pow(max(o,vec3(0.)),vec3(2.2)); gl_FragColor=vec4(o,1.); }`
  });
}
function agBuildGround(w) {
  const ci = w.ci, hgt = w.hgt, inb = (x, z) => x >= 0 && z >= 0 && x < W && z < D;
  const inst = [];                                              // { x, z, t, sz, rot }
  const add = (x, z, t, sz = 1, rot = 0) => inst.push({ x, z, t, sz, rot });
  const mask = (list) => { const s = new Set(); for (const [x, z] of list) if (inb(x, z)) s.add(ci(x, z)); return s; };
  const autos = (set, base) => {                                // dual-corner autotile: a corner is "on" when all four cells around it are
    const m = (x, z) => inb(x, z) && set.has(ci(x, z));
    for (const idx of set) {
      const x = idx % W, z = (idx / W) | 0;
      const tl = m(x, z) && m(x - 1, z) && m(x, z - 1) && m(x - 1, z - 1), tr = m(x, z) && m(x + 1, z) && m(x, z - 1) && m(x + 1, z - 1);
      const bl = m(x, z) && m(x - 1, z) && m(x, z + 1) && m(x - 1, z + 1), br = m(x, z) && m(x + 1, z) && m(x, z + 1) && m(x + 1, z + 1);
      add(x + 0.5, z + 0.5, 48 + base * 16 + (tl | (tr << 1) | (bl << 2) | (br << 3)));
    }
  };
  // the path: road on ash (autotile set 0), cracked asphalt and the lane marking here and there
  const road = new Set(); for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (w.kind[ci(x, z)] === 1) road.add(ci(x, z));
  autos(road, 0);
  const S = (id) => w.structures.filter((s) => s.kind === 'ash' && s.id === id);
  // concrete on dirt under the bunker, the hangar, the viaduct and the water tower
  const conc = []; for (const s of [...S('bunker'), ...S('hangar_ruin'), ...S('viaduct'), ...S('water_tower')]) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) conc.push([Math.floor(s.x) + dx, Math.floor(s.z) + dz]);
  autos(mask(conc), 1);
  // puddles: water on mud (autotile set 2) with a rippling tile in the middle
  const rnd = (n) => Math.floor(Math.random() * n), free = () => { for (let k = 0; k < 40; k++) { const c = w.landCells[rnd(w.landCells.length)]; if (w.kind[ci(c[0], c[1])] === 0) return c; } return null; };
  for (let i = 0; i < 4; i++) {
    const c = free(); if (!c) continue;
    const pl = []; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (inb(c[0] + dx, c[1] + dz) && w.kind[ci(c[0] + dx, c[1] + dz)] === 0) pl.push([c[0] + dx, c[1] + dz]);
    autos(mask(pl), 2); add(c[0] + 0.5, c[1] + 0.5, 24 + 0);
  }
  // the 24 static tiles scattered as patches, the 8 animated ones next to what they belong to
  const weight = [10, 8, 4, 3, 3, 3, 3, 3, 3, 2, 3, 4, 6, 4, 4, 4, 2, 2, 2, 2, 2, 2, 3, 3];
  weight.forEach((n, t) => { if (t === 16) return; for (let i = 0; i < n; i++) { const c = free(); if (c) add(c[0] + 0.5, c[1] + 0.5, t); } });
  const near = (id, k, t, r) => { const s = S(id)[0]; if (!s) return; for (let i = 0; i < k; i++) { const a = Math.random() * TAU, d = r * (0.5 + Math.random()); const x = Math.floor(s.x + Math.cos(a) * d), z = Math.floor(s.z + Math.sin(a) * d); if (inb(x, z) && w.kind[ci(x, z)] === 0) add(x + 0.5, z + 0.5, t); } };
  near('campfire', 2, 24 + 7, 2.2); near('campfire', 4, 24 + 1, 3); near('bunker', 3, 24 + 2, 3.5); near('bunker', 2, 24 + 3, 3.5);
  near('radar', 2, 24 + 4, 3); near('radar', 2, 24 + 6, 3); near('hangar_ruin', 2, 24 + 5, 4);
  for (let i = 0; i < 5; i++) { const c = free(); if (c) add(c[0] + 0.5, c[1] + 0.5, 24 + (i % 2 ? 1 : 5)); }
  // pieces of the grid on the map: only cells whose top is known; no ground tile above a building
  const geo = new THREE.InstancedBufferGeometry(), base = new THREE.PlaneGeometry(1, 1); base.rotateX(-Math.PI / 2);
  geo.index = base.index; geo.attributes.position = base.attributes.position; geo.attributes.uv = base.attributes.uv;
  const n = inst.length, ap = new Float32Array(n * 3), at = new Float32Array(n), az = new Float32Array(n), ar = new Float32Array(n);
  inst.forEach((q, i) => { ap.set([q.x, agH(q.x, q.z) + 0.03, q.z], i * 3); at[i] = q.t; az[i] = q.sz; ar[i] = q.rot; });
  geo.setAttribute('aPos', new THREE.InstancedBufferAttribute(ap, 3)); geo.setAttribute('aTile', new THREE.InstancedBufferAttribute(at, 1));
  geo.setAttribute('aSz', new THREE.InstancedBufferAttribute(az, 1)); geo.setAttribute('aRot', new THREE.InstancedBufferAttribute(ar, 1)); geo.instanceCount = n;
  const mesh = new THREE.Mesh(geo, agGroundMat()); mesh.frustumCulled = false; mesh.renderOrder = 1; agRoot.add(mesh);
  ag.groundN = n;
  // decals: all eight kinds
  const flat = (r) => { for (let k = 0; k < 60; k++) { const c = w.landCells[rnd(w.landCells.length)]; const h0 = hgt[ci(c[0], c[1])]; let ok = w.kind[ci(c[0], c[1])] === 0; for (let dz = -r; dz <= r && ok; dz++) for (let dx = -r; dx <= r; dx++) if (!inb(c[0] + dx, c[1] + dz) || hgt[ci(c[0] + dx, c[1] + dz)] !== h0 || w.kind[ci(c[0] + dx, c[1] + dz)] === 5) { ok = false; break; } if (ok) return [c[0] + 0.5, c[1] + 0.5, h0]; } return null; };
  [[0, 2, 3], [1, 2, 3], [2, 3, 4], [3, 2, 3], [4, 2, 3], [7, 2, 3]].forEach(([idx, r, k]) => {
    for (let i = 0; i < k - 1; i++) { const p = flat(Math.ceil(r / 2)); if (!p) continue; const d = AG.makeDecal(idx, r * 1.4); d.position.set(p[0], p[2] + 0.06, p[1]); d.rotation.y = Math.random() * 6.28; agRoot.add(d); }
  });
  const sp = w.spawn;                                           // footprints from the landing, tank tracks along the road
  for (let i = 0; i < 4; i++) { const x = Math.floor(sp.x + 1 + i * 0.7), z = Math.floor(sp.z + 1 + i * 0.9); if (!inb(x, z)) continue; const d = AG.makeDecal(5, 1.5); d.position.set(sp.x + 1 + i * 0.7, agH(sp.x + 1 + i * 0.7, sp.z + 1 + i * 0.9) + 0.06, sp.z + 1 + i * 0.9); d.rotation.y = 0.3; agRoot.add(d); }
  const rl = [...road]; for (let i = 0; i < Math.min(8, rl.length); i += 2) { const idx = rl[(i * 7) % rl.length]; const x = (idx % W) + 0.5, z = ((idx / W) | 0) + 0.5; const d = AG.makeDecal(6, 1.8); d.position.set(x, agH(x, z) + 0.06, z); agRoot.add(d); }
}

/* ---- baked sheets: far billboards of the props (hybrid LOD), 3 strider billboards on the horizon ---- */
const AG_LOD = ['dead_tree_a', 'pylon', 'bunker', 'barrel', 'wreck_truck', 'thorn_bush', 'water_tower', 'wall_ruin'];
function agSheet(id, dirs, frames, cell, elev) {
  const k = id + dirs + frames; return ag.sheets[k] || (ag.sheets[k] = AG.bakeSheet(ASHM(id), { dirs, frames, cell, elev }));
}
function agRegisterLod(inst, st) {
  if (!AG_LOD.includes(st.id)) return;
  const sh = agSheet(st.id, 8, 1, 80, 0.32), bb = AG.makeBillboard(sh), s = st.s || 1;
  bb.material.uniforms.uSize.value.set(sh.size * s, sh.size * s);
  bb.position.set(st.x, st.y + sh.cy * s, st.z); bb.visible = false; agRoot.add(bb);
  ag.lod.push({ inst, bb, rot: st.rot || 0, x: st.x, z: st.z, far: false });
}

/* ---- sprite FX (the 14 sheets) ---- */
function agFx(fx, x, y, z, size, life, add = true, vy = 0.2) {
  let pool = ag.fxPool[fx]; if (!pool) pool = ag.fxPool[fx] = { items: [], i: 0 };
  let it = pool.items[pool.i % 2]; pool.i++;
  if (!it) { it = AG.makeSpritePool([{ fx, delay: 0, life, size, vy, grow: 1 }], add, false); agRoot.add(it); pool.items.push(it); }
  const u = it.material.uniforms; u.uOrigin.value.set(x, y, z); u.uT0.value = ASH.GU.uTime.value;
  it.geometry.attributes.aCfg.array.set([fx, 0, life, size], 0); it.geometry.attributes.aCfg.needsUpdate = true;
  it.geometry.attributes.aVel.array.set([0, vy, 0, 1], 0); it.geometry.attributes.aVel.needsUpdate = true;
}
function agBoom(x, y, z) {
  if (!ag.bursts.length) return;
  const b = ag.bursts[ag.bi++ % ag.bursts.length];
  b.trigger(new THREE.Vector3(x, y, z), ASH.GU.uTime.value, 1);
  agFx(3, x, y + 0.4, z, 2.2, 0.6, true, 0.8);
  agFx(8, x, y + 0.1, z, 2.6, 0.7, false, 0.1);
  ashLight.position.set(x, y + 1.5, z); ag.boomT = 0.5; ag.boomAt = [x, y, z];
}
function agShot(f, h, oy) {
  agFx(4, h.x, oy, h.z, 1.3, 0.2, true, 0);
  let b = ag.beams.find((q) => q.t <= 0); if (!b) return;
  const px = player.pos.x, py = player.pos.y + 0.8, pz = player.pos.z, u = b.m.material.uniforms;
  u.uA.value.set(h.x, oy, h.z); u.uB.value.set(px, py, pz); b.t = 0.22; b.m.visible = true;
  u.uCol.value.set(...(f.def.ashKind === 'turret' ? [0.3, 0.85, 1] : [1, 0.22, 0.2]));
  b.hit = [px, py, pz];
}

function agBeamTo(ax, ay, az, bx, by, bz, col) {      // a friendly beam (the Wanderer) from A to B
  const b = ag.beams.find((q) => q.t <= 0); if (!b) return;
  const u = b.m.material.uniforms; u.uA.value.set(ax, ay, az); u.uB.value.set(bx, by, bz); u.uCol.value.set(...col);
  b.t = 0.22; b.m.visible = true; b.hit = [bx, by, bz];
}
/* ---- danger captions of the original: «ШАГОХОД В СЕКТОРЕ» … ---- */
let agWarnEl = null;
function agWarn(text) {
  if (!agWarnEl) {
    agWarnEl = document.createElement('div');
    agWarnEl.style.cssText = 'position:fixed;left:50%;top:26%;transform:translateX(-50%);z-index:6;pointer-events:none;font:700 15px/1.2 "Courier New",monospace;letter-spacing:.22em;color:#ff7a6a;text-shadow:0 0 8px #ff2a3a,0 0 2px #000;opacity:0;transition:opacity .3s;white-space:nowrap';
    document.body.appendChild(agWarnEl);
  }
  agWarnEl.textContent = text || agWarnEl.textContent; agWarnEl.style.opacity = text ? '1' : '0';
}
function agWarnTick() {
  let best = '', bk = 0;
  const near = (x, z, r, k, t) => { const d = Math.hypot(x - player.pos.x, z - player.pos.z), v = Math.max(0, Math.min(1, (r - d) / (r * 0.7))) * k; if (v > 0.25 && v > bk) { bk = v; best = t; } };
  for (const f of foes) {
    if (f.state === 'dissolve' || f.state === 'rise') continue;
    const h = f.segs[0], t = f.type;
    if (t === 'ash_strider_s' || t === 'ash_strider_m') near(h.x, h.z, 30, 1, 'ШАГОХОД В СЕКТОРЕ');
    else if (t === 'ash_worm') near(h.x, h.z, 11, 0.9, 'ЧЕРВЬ ПОД ЗЕМЛЁЙ');
    else if (t === 'ash_eye') near(h.x, h.z, 12, 0.6, 'ГЛАЗ СЛЕДИТ');
    else if (t === 'ash_turret') near(h.x, h.z, 18, 0.8, 'ТУРЕЛЬ ЦЕЛИТСЯ');
  }
  for (const a of ashAnim) if (a.id === 'turret' && !a.far) { const p = a.inst.root.position; near(p.x, p.z, 18, 0.8, 'ТУРЕЛЬ ЦЕЛИТСЯ'); }
  if (ag.boomT > 0 && ag.boomAt && Math.hypot(ag.boomAt[0] - player.pos.x, ag.boomAt[2] - player.pos.z) < 12) { best = 'ВЗРЫВ!'; }
  agWarn(best);
}

/* ---- the world around ---- */
function agBuild() {
  agClear(); agInit();
  const w = world, cx = W / 2, cz = D / 2;
  agBuildGround(w);
  // atmosphere layers
  ag.fog = AG.makeFogLayers(4); agRoot.add(ag.fog);
  ag.cir = AG.makeCirrusLayers(3); agRoot.add(ag.cir);
  ag.rays = AG.makeGodRays(3); ag.rays.position.set(cx, 0, cz); agRoot.add(ag.rays);
  ag.par = [AG.makeParallax(190, 3.1, 0, 5.2), AG.makeParallax(150, 7.7, 0.45, 4.4), AG.makeParallax(112, 1.3, 0.9, 3.6)]; ag.par.forEach((p) => agRoot.add(p));
  ag.sky = AG.makeSky(); agRoot.add(ag.sky);
  ag.pts = {
    ash: AG.makeAmbientPoints(700, { area: [60, 22, 60], size: 0.075, vel: [0.55, -0.22, 0.2], col: [0.7, 0.68, 0.66], seed: 5, far: 55, patch: 1 }),
    black: AG.makeAmbientPoints(900, { area: [36, 14, 36], size: 0.3, maxPx: 16, solid: 1, vel: [0.9, -1.35, 0.35], col: [0.035, 0.03, 0.04], seed: 21, far: 38, patch: 1 }),
    dust: AG.makeAmbientPoints(420, { area: [46, 8, 46], size: 0.06, vel: [0.9, 0.05, 0.3], col: [0.5, 0.46, 0.42], seed: 6, far: 40, patch: 1 }),
    embers: AG.makeAmbientPoints(150, { area: [3.2, 7, 3.2], size: 0.06, vel: [0.15, 1.3, 0.1], col: [1.5, 0.6, 0.18], seed: 8, add: true, tw: 1, far: 30 })
  };
  Object.values(ag.pts).forEach((p) => agRoot.add(p));
  ag.rain = AG.makeRain(2400); agRoot.add(ag.rain);
  // grass, shrub and reed cards on the land
  const area = [W - 4, D - 4, cx, cz];
  [AG.makeCards(0, 1800, area, 11, agH), AG.makeCards(1, 260, area, 12, agH), AG.makeCards(2, 110, area, 13, agH)].forEach((c) => agRoot.add(c));
  // laser ribbons: five in the sky, three for the shots
  for (let i = 0; i < 5; i++) { const l = AG.makeLaser([1, 0.14, 0.2]); l.material.uniforms.uW.value = 0.45; l.userData.k = i; agRoot.add(l); ag.skyL.push(l); }
  for (let i = 0; i < 3; i++) { const l = AG.makeLaser([1, 0.22, 0.2]); l.material.uniforms.uW.value = 0.1; l.material.uniforms.uK.value = 0; l.visible = false; agRoot.add(l); ag.beams.push({ m: l, t: 0 }); }
  // explosions with the debris set
  const dd = ASHM('debris_set');
  for (let i = 0; i < 2; i++) ag.bursts.push(new AG.Burst(agRoot, dd, ASH.voxMat()));
  // three baked strider billboards on the far horizon (as in the original)
  const sh = agSheet('strider_m', 8, 8, 72, 0.3);
  for (let i = 0; i < 3; i++) { const b = AG.makeBillboard(sh); b.userData.a = i * 2.1; b.userData.rad = 62 + i * 9; b.material.uniforms.uSize.value.set(sh.size * 1.1, sh.size * 1.1); agRoot.add(b); ag.bbs.push(b); }
  // fire, smoke, embers at the campfire
  const fire = w.structures.find((s) => s.kind === 'ash' && s.id === 'campfire');
  if (fire) {
    const fs = AG.makeSpritePool([0, 1, 2, 3].map((i) => ({ fx: 1, delay: i * 0.11, life: 0.9, size: 0.9 - i * 0.1, vx: 0, vy: 0.5, vz: 0, grow: 0 })), true, true);
    const sm = AG.makeSpritePool([0, 1, 2, 3, 4].map((i) => ({ fx: 2, delay: i * 0.8, life: 4, size: 1.0, vx: 0.5, vy: 2.2, vz: 0.2 })), false, true);
    const em = AG.makeSpritePool([0, 1].map((i) => ({ fx: 13, delay: i * 1.2, life: 2.4, size: 1.2, vy: 0.9, grow: 0 })), true, true);
    fs.material.uniforms.uBright.value = 0.3; em.material.uniforms.uBright.value = 0.25; fs.material.uniforms.uOrigin.value.set(fire.x, fire.y + 0.5, fire.z); sm.material.uniforms.uOrigin.value.set(fire.x, fire.y + 1.4, fire.z); sm.material.uniforms.uAlpha.value = 0.55;
    em.material.uniforms.uOrigin.value.set(fire.x, fire.y + 0.8, fire.z);
    agRoot.add(fs, sm, em); ag.pts.embers.material.uniforms.uCenter.value.set(fire.x, fire.y + 3.2, fire.z);
    // the arms cache by the fire: the rifle, the rocket launcher and the plasma gun, and two debris sets
    const put = (id, dx, dz, s, rot, lift) => { const inst = putAsh(id, fire.x + dx, agH(fire.x + dx, fire.z + dz) + (lift || 0.04), fire.z + dz, s, rot); return inst; };
    put('rifle', 1.7, 0.4, 1.1, 0.5); put('rocket', 2.1, -0.5, 1.1, -0.3); put('plasma', 1.4, -1.1, 1.1, 1.0);
    // stack sprites: barrels, crates, tyres and crosses built from voxel layers
    ['barrel', 'crate', 'tire_stack', 'grave_cross'].forEach((id, i) => { for (let k = 0; k < 2; k++) { const m = AG.makeStack(ASHM(id)); const x = fire.x - 2.8 - i * 0.9 + k * 0.5, z = fire.z + 2.2 + k * 1.1 - i * 0.2; m.position.set(x, agH(x, z) + 0.02, z); m.scale.setScalar(0.9); m.rotation.y = i + k; agRoot.add(m); } });
  }
  const dsp = free2(w); if (dsp) putAsh('debris_set', dsp[0], agH(dsp[0], dsp[1]) + 0.1, dsp[1], 0.5, 0.4);
  // plasma orb above the pylon, an arc at the radar
  const py = w.structures.find((s) => s.kind === 'ash' && s.id === 'pylon');
  if (py) { const o = AG.makeSpritePool([{ fx: 5, delay: 0, life: 1.2, size: 2.2, vy: 0, grow: 0 }], true, true); o.material.uniforms.uOrigin.value.set(py.x, py.y + 10.1 * (py.s || 1) * 0.9, py.z); agRoot.add(o); }
  const rd = w.structures.find((s) => s.kind === 'ash' && s.id === 'radar');
  if (rd) { const o = AG.makeSpritePool([{ fx: 12, delay: 0, life: 0.8, size: 1.8, vy: 0, grow: 0 }], true, true); o.material.uniforms.uOrigin.value.set(rd.x, rd.y + 4.8 * (rd.s || 1), rd.z); agRoot.add(o); }
  const el = document.getElementById('ashLogo'); if (el) el.hidden = false;
  sky.visible = false;
}
function free2(w) { for (let k = 0; k < 50; k++) { const c = w.landCells[Math.floor(Math.random() * w.landCells.length)]; if (w.kind[w.ci(c[0], c[1])] === 0) return [c[0] + 0.5, c[1] + 0.5]; } return null; }

/* ---- per frame ---- */
const agTmp = new THREE.Vector3();
function agFrame(dt, T) {
  if (!ag.ready || !ag.fog) return;
  const cp = camera.position, pp = player.pos;
  const U = ASH.GU;
  ag.sky.position.copy(cp);
  ag.par.forEach((p) => p.position.set(cp.x, 20, cp.z));
  // fog and low clouds drift on their own through the world: height eases (no snapping on terrain steps), banks come and go on slow cycles
  const hT = agH(pp.x, pp.z), ek = 1 - Math.exp(-dt * 0.9);
  ag.fogY = ag.fogY === undefined ? hT : ag.fogY + (hT - ag.fogY) * ek;
  ag.fog.position.y = ag.fogY - 1.2; ag.fog.children.forEach((f) => f.position.set(cp.x, f.position.y, cp.z));
  const TT = T + 40 + (ag.tOff || 0);
  const bnk = (a, b, c) => 0.62 * (0.5 + 0.5 * Math.sin(TT * a + c)) + 0.38 * (0.5 + 0.5 * Math.sin(TT * b + c * 2.3));
  const fogAmt = Math.min(1, Math.max(0, (bnk(0.047, 0.0173, 1.0) - 0.28) / 0.5)), cirAmt = Math.min(1, Math.max(0, (bnk(0.031, 0.0121, 3.1) - 0.25) / 0.5));
  ag.fogAmt = ag.fogAmt === undefined ? fogAmt : ag.fogAmt + (fogAmt - ag.fogAmt) * (1 - Math.exp(-dt * 0.5));
  ag.cirAmt = ag.cirAmt === undefined ? cirAmt : ag.cirAmt + (cirAmt - ag.cirAmt) * (1 - Math.exp(-dt * 0.5));
  ag.fog.children.forEach((f) => { f.material.uniforms.uAmt.value = ag.fogAmt; });
  ag.cir.children.forEach((f) => { f.material.uniforms.uAmt.value = ag.cirAmt; });
  ag.pts.ash.material.uniforms.uCenter.value.set(cp.x, cp.y, cp.z); ag.pts.black.material.uniforms.uCenter.value.set(cp.x, cp.y - 3, cp.z);
  ag.cir.position.y = ag.fogY - 0.2; ag.cir.children.forEach((f) => f.position.set(cp.x, f.position.y, cp.z)); ag.pts.dust.material.uniforms.uCenter.value.set(cp.x, cp.y - 4, cp.z);
  // rain follows the Island's ash_rain event
  const ru = ag.rain.material.uniforms; ru.uCenter.value.copy(cp); const evRain = EVT.cur && EVT.cur.id === 'ash_rain' ? EVT.k : 0;
  const cycRain = 0.85 * Math.min(1, Math.max(0, (0.5 - ag.fogAmt) / 0.35)) * Math.min(1, Math.max(0, (Math.sin(TT * 0.036 + 0.6) - 0.15) / 0.5));   // дождь Острова приходит, когда туман отплыл, и уходит, когда плывёт новый
  ag.rainAmt = ag.rainAmt === undefined ? 0 : ag.rainAmt + (Math.max(evRain, cycRain) - ag.rainAmt) * (1 - Math.exp(-dt * 0.7));
  ru.uAmt.value = ag.rainAmt;
  if (ru.uAmt.value > 0.3) { ag.rainT -= dt; if (ag.rainT <= 0) { ag.rainT = 0.08; const a = Math.random() * TAU, d = 1.5 + Math.random() * 7; const x = pp.x + Math.cos(a) * d, z = pp.z + Math.sin(a) * d; agFx(9, x, agH(x, z) + 0.1, z, 0.7, 0.35, false, 0); } }
  agWarnTick();
  // far billboards (hybrid LOD)
  for (const q of ag.lod) {
    const d = Math.hypot(q.x - cp.x, q.z - cp.z), far = q.far ? d > 30 : d > 38;
    if (far !== q.far) { q.far = far; q.inst.root.visible = !far; q.bb.visible = far; }
    if (q.far) AG.billboardUpdate(q.bb, camera, q.rot, 0);
  }
  ag.bbs.forEach((b, i) => {
    const u = b.userData; u.a += dt * 0.018 * (i % 2 ? -1 : 1);
    const x = W / 2 + Math.cos(u.a) * u.rad, z = D / 2 + Math.sin(u.a) * u.rad, sg = i % 2 ? -1 : 1;
    b.position.set(x, 4 + b.userData.sheet.cy * 1.1, z);
    AG.billboardUpdate(b, camera, Math.atan2(-Math.sin(u.a) * sg, Math.cos(u.a) * sg), T * 3.8 + i * 3);
  });
  // sky lasers, shot beams
  ag.skyL.forEach((l, i) => { const a = T * 0.02 * (1 + i * 0.3) + i * 1.3, u = l.material.uniforms; u.uA.value.set(cp.x + Math.cos(a) * 140, 45 + i * 7 + Math.sin(T * 0.1 + i) * 4, cp.z + Math.sin(a) * 140); u.uB.value.set(cp.x + Math.cos(a + 0.9) * 160, 70 + i * 9, cp.z + Math.sin(a + 0.9) * 150); u.uK.value = (0.45 + 0.35 * Math.sin(T * 0.6 + i * 2)) * (0.6 + 0.4 * Math.sin(T * 7 + i)); });
  for (const b of ag.beams) if (b.t > 0) { b.t -= dt; const u = b.m.material.uniforms; u.uK.value = Math.max(0, b.t / 0.22); if (b.t <= 0) { b.m.visible = false; agFx(6, b.hit[0], b.hit[1], b.hit[2], 1.4, 0.3, true, 0); agFx(3, b.hit[0], b.hit[1], b.hit[2], 1.2, 0.4, true, 0.3); } }
  ag.bursts.forEach((b) => b.update(dt, T));
  if (ag.boomT > 0) { ag.boomT -= dt; if (ag.boomT <= 0 && !ashFx.fire) ashLight.intensity = 0; }
  // the hero loses a heart: a glitch blip in front of the lens
  if (player.hp < ag.hpPrev) agFx(11, pp.x, pp.y + 1, pp.z, 2.4, 0.4, true, 0);
  ag.hpPrev = player.hp;
}

/* ---- the pixel art and the full asset list, in the pause menu ---- */
function agCatalog() {
  const body = document.getElementById('ashCatBody'); if (!body || ag.cat || !ag.ready) return;
  ag.cat = true;
  const add = (title, sub) => { const h = document.createElement('div'); h.className = 'ars-sub'; h.textContent = title + (sub ? ' · ' + sub : ''); body.append(h); const row = document.createElement('div'); row.className = 'agrow'; body.append(row); return row; };
  const cv = (c, scale, name) => { const fig = document.createElement('figure'); const k = document.createElement('canvas'); k.width = c.width; k.height = c.height; k.getContext('2d').drawImage(c, 0, 0); k.style.width = c.width * scale + 'px'; k.style.height = c.height * scale + 'px'; fig.append(k); if (name) { const f = document.createElement('figcaption'); f.textContent = name; fig.append(f); } return fig; };
  const stat = ASH.MODELS.filter((m) => m.cat === 'static'), anim = ASH.MODELS.filter((m) => m.cat === 'anim');
  const models = (list, row) => list.forEach((def) => { const sh = AG.bakeSheet(def, { dirs: 1, frames: 1, cell: 96, elev: 0.3 }); row.append(cv(AG.rtToCanvas(sh.rt), 1, def.name)); sh.rt.dispose(); });
  models(anim, add('Анимированные 3D', anim.length + ' моделей'));
  models(stat, add('Статичные 3D', stat.length + ' моделей'));
  const A = AG.ATL();
  add('Тайлы земли', AG.TILES.length + ' шт.').append(cv(AG.rtToCanvas(A.tiles), 4, AG.TILES.map((n) => AG.TILES_NAMES[n]).join(', ')));
  add('Анимированные тайлы', '8 шт. × 8 кадров').append(cv(AG.rtToCanvas(A.anim), 3, AG.TILES_ANIM.map((n) => AG.TILES_NAMES[n]).join(', ')));
  add('Автотайлы', '3 набора по 16').append(cv(AG.rtToCanvas(A.auto), 3, 'Дорога по пеплу · бетон по земле · вода по грязи'));
  add('Эффекты', AG.FX.length + ' листов × 8 кадров').append(cv(AG.rtToCanvas(A.fx), 1, AG.FX.map((f) => f[1]).join(', ')));
  add('Декали', AG.DECALS.length + ' шт.').append(cv(AG.rtToCanvas(A.decal), 2, AG.DECALS.map((d) => d[1]).join(', ')));
  const r2 = add('Пиксель-арт интерфейса', '16 иконок · шрифт · рамки · вывеска');
  r2.append(cv(ag.art.icons.canvas, 4, Object.keys(AG.ICONS).join(', ')), cv(ag.art.font.canvas, 3, 'шрифт A–Z, 0–9'), cv(ag.art.hud.canvas, 3, 'панель, полоса здоровья, кнопка'), cv(ag.art.logo.canvas, 2, 'вывеска'));
}
