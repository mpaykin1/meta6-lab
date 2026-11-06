/* =============================================================================
   30c · Ashen biome engine: the voxel models of «Пепельный путь» inside the Island.
         The Island's foe logic (segment-chain hit-boxes, damageFoe, all 21 weapons) is untouched: every foe still
         owns `segs`; an Ashen voxel model (jointed parts, procedural animation) simply walks along that chain.
         Props, lamps, the campfire, the rover and the far colossi are the original Ashen models, placed as they were.
============================================================================= */
const ASH = ashenLib(THREE);
const ASHM = (id) => ASH.MODELS.find((m) => m.id === id);
let DRY = false;                                   // a dry biome: no water at all, the whole map is land
const ashGroup = new THREE.Group(); scene.add(ashGroup);
const ashAnim = [];                                // props with an animate() each frame: { inst, id, opt(t), x, z }
const ashFx = { fire: null, rover: null, lasers: [], far: [], fungi: [], lamps: [], pylon: null };
const ashFoes = new Map();
const ashSky = new THREE.Group(); scene.add(ashSky);
const ashFloor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshBasicMaterial({ color: 0x606370, fog: false }));
ashFloor.rotation.x = -Math.PI / 2; ashFloor.position.y = -0.4; ashFloor.visible = false; ashFloor.renderOrder = -5; scene.add(ashFloor);
const ashLight = new THREE.PointLight(0xff9040, 0, 18, 1.6); scene.add(ashLight);
const ashHit = new THREE.Vector3(1, 1, 1), ashFreeze = new THREE.Vector3(0.62, 0.82, 1.35);

function ashSync(t) {                              // the Ashen shader works in display colours; the lights follow the Island's mood
  const g = ASH.GU, e2 = 1 / 2.2;
  g.uTime.value = t;
  g.uSunDir.value.copy(keyDir);
  const ks = clamp(keyLight.intensity / 2.5, 0.35, 1.25), hs2 = clamp(hemi.intensity / 1.9, 0.4, 1.2), kc = keyLight.color;
  g.uSunCol.value.set(1.9 * ks * (0.7 + 0.3 * Math.pow(kc.r, e2) * 1.2), 1.85 * ks * (0.7 + 0.3 * Math.pow(kc.g, e2) * 1.2), 2.0 * ks * (0.7 + 0.3 * Math.pow(kc.b, e2) * 1.2));
  g.uAmbCol.value.set(0.95 * hs2, 1.0 * hs2, 1.15 * hs2);
  g.uRim.value.set(0.32, 0.3, 0.5);
  g.uFogCol.value.set(Math.pow(scene.fog.color.r, e2), Math.pow(scene.fog.color.g, e2), Math.pow(scene.fog.color.b, e2));
  g.uFogD.value = scene.fog.density; g.uFogH.value = 0.35;
  g.uGlowK.value = 1 + Math.sin(t * 0.9) * 0.05;
  ashFloor.material.color.copy(scene.fog.color).multiplyScalar(0.78);
}

/* ---- foes ------------------------------------------------------------------ */
function makeAshFoe(f) {
  const def = ASHM(f.def.ash);
  if (!def) return null;
  const mat = ASH.voxMat(), inst = ASH.instance(def, mat), root = new THREE.Group();
  inst.root.scale.setScalar(f.def.ashScale || 0.6);
  root.add(inst.root); scene.add(root);
  const h = f.segs[0];
  return { inst, mat, root, yaw: Math.random() * TAU, py: h.y, gy: h.y, sp: 0, wy: 0 };
}
function disposeAshFoe(m) { scene.remove(m.root); m.mat.dispose(); }
function clearAshFoes() { for (const m of ashFoes.values()) disposeAshFoe(m); ashFoes.clear(); }
function sweepAshFoes() { for (const [f, m] of ashFoes) if (!foes.includes(f)) { disposeAshFoe(m); ashFoes.delete(f); } }
function renderAshFoe(f) {                         // body.render of the 'ashen' bodies
  let m = ashFoes.get(f);
  if (!m) { m = makeAshFoe(f); if (!m) return; ashFoes.set(f, m); }
  const dt = ashDt, def = f.def, h = f.segs[0], T = G.time;
  const sp = Math.hypot(f.vel.x, f.vel.z), spN = f.stun > 0 ? 0 : sp;
  let x = h.x, z = h.z;
  if (def.ashMid) { const mid = f.segs[Math.floor(f.n / 2)]; x = (h.x + mid.x) * 0.5; z = (h.z + mid.z) * 0.5; }
  // heading: toward the hero while shooting, else along the velocity
  let want = m.yaw;
  const dxp = player.pos.x - h.x, dzp = player.pos.z - h.z, dist = Math.hypot(dxp, dzp);
  if (def.ashAim && f.state === 'chase' && dist < (def.fire ? def.fire.range : 10)) want = Math.atan2(dxp, dzp);
  else if (f.ally && f.tgt && f.tgt.state !== 'dissolve') want = Math.atan2(f.tgt.segs[0].x - h.x, f.tgt.segs[0].z - h.z);
  else if (spN > 0.25) want = Math.atan2(f.vel.x, f.vel.z);
  else if (def.ashAim) want = Math.atan2(dxp, dzp);
  let d = want - m.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
  m.yaw += d * Math.min(1, dt * (def.ashTurn || 5));
  // height: walkers stand on the cubes, flyers follow the head
  let y;
  if (def.fly) { y = h.y - 0.35; m.py += (y - m.py) * Math.min(1, dt * 6); y = m.py + Math.sin(f.t * 1.7 + f.seed) * 0.06; }
  else {
    const gy = groundBelow(x, Math.max(h.y, 0) + 1.5, z);
    m.gy += (gy - m.gy) * Math.min(1, dt * 12);
    y = m.gy + clamp(h.y - gy - def.hover, -0.4, 3.2) * (def.boss ? 0.8 : 0.2);
  }
  m.root.position.set(x, y, z);
  m.root.rotation.y = m.yaw;
  if (f.state === 'dissolve' && !m.boom) { m.boom = true; agBoom(h.x, y + 0.5, h.z); }
  const rise = Math.max(0.001, Math.min(1, f.t * 0.8) * (f.state === 'dissolve' ? Math.max(0, f.alpha) : 1));
  const sc = (def.ashScale || 0.6) * (0.55 + 0.45 * Math.min(1, f.t * 0.8));
  m.inst.root.scale.setScalar(sc);
  m.root.visible = rise > 0.01 || f.state !== 'rise';
  // animation (the original anim functions, driven by the foe's own state)
  const slow = f.slow > 0 ? 0.35 : 1, tt = f.t * slow + f.seed;
  let o;
  switch (def.ashKind) {
    case 'human': o = { speed: clamp(spN / 2.6, 0, 1.3), aim: (f.state === 'chase' && dist < 13) || (f.ally && f.tgt) ? 1 : 0 }; break;
    case 'strider': o = { mode: spN > 0.3 ? 'walk' : 'idle', speed: clamp(spN / 2.0, 0, 1.2), fire: f.fireK || 0 }; break;
    case 'colossus': o = { mode: spN > 0.3 ? 'walk' : 'idle', speed: clamp(spN / 2.4, 0, 1.2) }; break;
    case 'drone': o = { vx: f.vel.x * 0.25, vz: f.vel.z * 0.25 }; break;
    case 'eye': o = { lookY: clamp(Math.atan2(dxp, dzp) - m.yaw, -1, 1) * (f.state === 'chase' ? 1 : 0.3) }; break;
    case 'worm': o = { speed: 0.5 + clamp(spN / 3, 0, 1) * 0.9 }; break;
    case 'turret': o = { mode: f.state === 'chase' ? 'attack' : 'idle' }; break;
    default: o = {};
  }
  ASH.animate(m.inst, tt, o);
  // status looks: hit flash, freeze, burn, shock, dissolve
  const u = m.mat.uniforms;
  u.uHit.value = f.flash > 0.01 ? Math.min(1, f.flash) * 0.9 : f.burn > 0 ? 0.25 + 0.15 * Math.sin(T * 25) : f.shock > 0 ? 0.35 * Math.random() : 0;
  u.uTint.value.copy(f.slow > 0 ? ashFreeze : ashHit);
  u.uDis.value = f.state === 'dissolve' ? 1 - Math.max(0, f.alpha) : f.state === 'rise' ? 1 - Math.min(1, f.t * 0.8) : 0;
  // red eyes / lamps glow into the dust
  if (f.ally && f.alpha > 0.2 && f.state !== 'dissolve') glow.spark(h.x, y + 1.35, h.z, 0.09, C.ice, 0.14, 0);      // a friend's faint blue mark
  if (f.alpha > 0.2 && f.state !== 'dissolve' && def.ashGlow) glow.spark(h.x, y + def.ashGlow, h.z, def.rad * 2.2, C.eyeGlow, 0.16, 0);
}

/* ---- shooting: orbs of the same kind the Island's guardian throws ------------------------ */
function ashShoot(f, dt, s) {
  const fc = f.def.fire;
  if (!fc || f.state === 'dissolve' || f.state === 'rise') return;
  f.fireK = Math.max(0, (f.fireK || 0) - dt * 3.2);
  f.shootT = (f.shootT === undefined ? rr(1.2, fc.every) : f.shootT) - dt;
  if (f.shootT > 0 || s.dist > fc.range || s.dist < 2 || G.state !== 'play' || f.stun > 0 || f.slow > 0.01 && Math.random() < 0.5) return;
  f.shootT = fc.every * rr(0.8, 1.3);
  const h = f.segs[0], oy = h.y + (fc.up ?? 0.5);
  const dx = player.pos.x - h.x, dz = player.pos.z - h.z, dy = player.pos.y + 0.8 - oy, d = Math.hypot(dx, dz) || 1;
  const base = Math.atan2(dz, dx), n = fc.n || 1, v = fc.speed || 7;
  for (let i = 0; i < n; i++) {
    const a = base + (n > 1 ? (i / (n - 1) - 0.5) * (fc.spread || 0.5) : 0);
    addProj({ w: null, kind: 'orb', team: 1, pos: new THREE.Vector3(h.x, oy, h.z), vel: new THREE.Vector3(Math.cos(a) * v, dy / d * v, Math.sin(a) * v), life: 3, age: 0,
      r: 0.3, size: 0.45, dmg: 1, kb: 0, grav: 0, ric: 'none', bounce: 0, rest: 0, pierce: 0, rehit: 99, stuck: 0, hit: new Map(), fx: 0, tracer: true, col: C.ember });
  }
  f.fireK = 1;
  glow.spark(h.x, oy, h.z, 1.1, C.ember, 0.7, 0);
  flashLight(tmpE.set(h.x, oy, h.z), 0xff7a30, 6);
  SFX.orb();
  agShot(f, h, oy);
}


/* ---- the Wanderer («Кочевник», the original hero model): a companion that can turn on the hero ---------------
   ally: follows the hero, shoots the nearest foe · betrayal: the hero hits him twice, or he is greedy and the last coins
   are near · truce: beaten to a quarter of his health he yields; left far behind for a while he calms down. */
const nomadS = { spawned: false, f: null, greed: false, betrayed: false };
function nomadSpawn() {
  if (!DRY || G.state !== 'play' || nomadS.spawned) return;
  nomadS.spawned = true; nomadS.betrayed = false; nomadS.greed = Math.random() < 0.5;
  const f = spawnFoe('ash_nomad', player.pos.x + 3, player.pos.y + 1, player.pos.z + 2, false);
  if (!f) { nomadS.spawned = false; return; }
  f.def = Object.assign({}, f.def); f.ally = true; f.anger = 0; f.calm = 0; f.shootT = 1.2; nomadS.f = f;
  toast('Странник идёт с тобой', 3200);
}
function nomadTurn(f, text) {
  f.ally = false; f.state = 'chase'; f.timer = 0; f.anger = 0; f.calm = 0; f.def.danger = 0.7; f.def.ashGlow = 1.0; f.shootT = 1.6;
  toast(text, 3400, true, 2);
}
function nomadTruce(f) {
  f.ally = true; f.state = 'wander'; f.anger = 0; f.hp = f.maxHp * 0.55; f.stun = 1.2; f.def.danger = 0; f.def.ashGlow = 0; f.shootT = 2;
  nomadS.betrayed = true;
  toast('Странник: «Хватит. Мир?»', 3200);
}
function nomadHurt(f, dmg, o) {
  if (o && o.dot) return;
  if (f.ally) {
    f.anger++;
    if (f.anger >= 2) nomadTurn(f, 'Странник: «Ты поднял на меня руку!»');
    else toast('Странник: «Эй! Осторожнее!»', 1800, true);
  } else {
    f.state = 'chase'; f.calm = 0;
    if (f.hp > 0 && f.hp <= f.maxHp * 0.25) nomadTruce(f);
  }
}
function nomadThink(f, dt, s, STALK) {
  const head = f.segs[0], def = f.def;
  f.harmful = false;
  if (f.state === 'dissolve' || f.state === 'rise') return;
  if (!f.ally) {                                                  // enemy: the stalker's chase + gunfire
    STALK.think(f, dt, s);
    if (s.dist < def.keep) f.target.set(head.x - s.dxp * 3, 0, head.z - s.dzp * 3);
    ashShoot(f, dt, s);
    f.calm = s.dist > 45 ? f.calm + dt : 0;
    if (f.calm > 20) nomadTruce(f);
    return;
  }
  if (nomadS.greed && !nomadS.betrayed && G.total && G.collected >= G.total * 0.8) { nomadS.betrayed = true; nomadTurn(f, 'Странник: «Маяк мой. Прости.»'); return; }
  f.state = 'wander'; def.danger = 0; f.hold = false;
  let tg = null, bd = 1e9;
  for (const q of foes) {
    if (q === f || q.state === 'dissolve' || q.state === 'rise' || q.alpha < 0.6) continue;
    const h = q.segs[0], d = Math.hypot(h.x - head.x, h.z - head.z);
    if (d < 16 && d < bd && Math.hypot(h.x - s.px, h.z - s.pz) < 24) { bd = d; tg = q; }
  }
  f.tgt = tg;
  if (tg) {
    const th = tg.segs[0], dx = th.x - head.x, dz = th.z - head.z, d = Math.hypot(dx, dz) || 1;
    if (d < 4.5) f.target.set(head.x - dx / d * 3, 0, head.z - dz / d * 3), f.speed = 3.6;
    else if (d > 8) f.target.set(th.x, 0, th.z), f.speed = 3.4;
    else f.target.set(head.x, 0, head.z), f.speed = 0.6;
    f.shootT -= dt;
    if (f.shootT <= 0 && d < 14 && f.stun <= 0) {
      f.shootT = rr(1.3, 2.0);
      const oy = head.y + 0.5;
      damageFoe(tg, 14, dx / d, dz / d, { at: th, kb: 1.5 });
      agBeamTo(head.x, oy, head.z, th.x, th.y + 0.3, th.z, [0.3, 0.85, 1]);
      agFx(4, head.x, oy, head.z, 1.1, 0.2, true, 0);
      glow.spark(head.x, oy, head.z, 1.0, C.ice, 0.6, 0);
      flashLight(tmpE.set(head.x, oy, head.z), 0x55ccff, 5);
      SFX.orb();
      f.fireK = 1;
    }
  } else {
    const d = s.dist;
    if (d > 4) { f.target.set(s.px, 0, s.pz); f.speed = d > 20 ? 6.5 : d > 10 ? 5.0 : 3.2; }
    else { f.target.set(head.x, 0, head.z); f.speed = 0.4; }
  }
  f.fireK = Math.max(0, (f.fireK || 0) - dt * 3.2);
  f.turn = 2.4; f.yk = 2.6; f.arrive = 0.01;
  f.ty = Math.max(terrainTop(head.x, head.z), SEA) + def.hover + 0.3 * Math.sin(f.t * 1.7 + f.seed);
}

/* ---- random roster: not every Ashen creature at once ------------------------------------- */
const ASH_KINDS = ['ash_scav', 'ash_soldier', 'ash_strider_s', 'ash_strider_m', 'ash_drone', 'ash_eye', 'ash_worm', 'ash_turret'];
const ASH_NAMES = { ash_scav: 'мародёры', ash_soldier: 'солдаты пустоши', ash_strider_s: 'шагоходы-разведчики', ash_strider_m: 'шагоходы «Курица»', ash_drone: 'дроны-квадро', ash_eye: 'дроны-глаза', ash_worm: 'пепельные черви', ash_turret: 'турели' };
const ashRoster = { on: new Set(), t: 0 };
function ashRollRoster() {
  const pool = ASH_KINDS.slice().sort(() => Math.random() - 0.5);
  ashRoster.on = new Set(pool.slice(0, 3)); ashRoster.t = rr(40, 70);
}
function ashRosterTick(dt) {               // every minute or so one kind leaves and another comes out of the haze
  if (!DRY || G.state !== 'play') return;
  ashRoster.t -= dt;
  const want = 3 + (G.collected >= 6 ? 1 : 0) + (G.collected >= 13 ? 1 : 0);
  if (ashRoster.t > 0 && ashRoster.on.size >= want) return;
  ashRoster.t = rr(45, 80);
  const off = ASH_KINDS.filter((k) => !ashRoster.on.has(k)), on = [...ashRoster.on];
  if (ashRoster.on.size >= want && on.length) ashRoster.on.delete(on[Math.floor(Math.random() * on.length)]);
  while (ashRoster.on.size < want && off.length) { const k = off.splice(Math.floor(Math.random() * off.length), 1)[0]; ashRoster.on.add(k); toast('Из пепельной дымки вышли ' + ASH_NAMES[k], 3000, true); }
}
const ashOn = (id) => ashRoster.on.has(id);

/* ---- props (world.structures) --------------------------------------------------------- */
function clearAsh() {
  for (const a of ashAnim) a.inst.root.traverse((o) => { if (o.isMesh && o.material && o.material.dispose) o.material.dispose(); });
  ashAnim.length = 0;
  while (ashGroup.children.length) { const c = ashGroup.children[0]; ashGroup.remove(c); c.traverse((o) => { if (o.isMesh && o.material && o.material.dispose) o.material.dispose(); }); }
  while (ashSky.children.length) { const c = ashSky.children[0]; ashSky.remove(c); c.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); }
  nomadS.spawned = false; nomadS.f = null;
  Object.assign(ashFx, { fire: null, rover: null, lasers: [], far: [], fungi: [], lamps: [], pylon: null });
  ashLight.intensity = 0; ashFloor.visible = false; clearAshFoes(); agClear(); sky.visible = true;
}
function putAsh(id, x, y, z, s, rot, own) {
  const def = ASHM(id);
  const inst = ASH.instance(def, ASH.voxMat());
  inst.root.scale.setScalar(s || 1); inst.root.position.set(x, y, z); inst.root.rotation.y = rot || 0;
  ashGroup.add(inst.root);
  return inst;
}
function buildAsh() {
  clearAsh();
  const w = world, lodList = [];
  for (const st of w.structures) {
    if (st.kind !== 'ash') continue;
    const inst = putAsh(st.id, st.x, st.y, st.z, st.s, st.rot); lodList.push([inst, st]);
    if (st.id === 'campfire') { ashFx.fire = inst; ashFx.fireAt = new THREE.Vector3(st.x, st.y, st.z); }
    else if (st.id === 'lamp') ashFx.lamps.push(inst);
    else if (st.id === 'fungus') ashFx.fungi.push(inst);
    else if (st.id === 'pylon') ashFx.pylon = inst;
    if (ASHM(st.id).anim) ashAnim.push({ inst, id: st.id, x: st.x, z: st.z, ph: st.x * 0.7 + st.z });
  }
  // the rover patrols the path from the beach to the beacon, as it patrols the road in the original
  const path = [];
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (w.kind[x + z * W] === 1) path.push([x + 0.5, z + 0.5]);
  const sp = w.spawn;
  path.sort((a, b) => Math.hypot(a[0] - sp.x, a[1] - sp.z) - Math.hypot(b[0] - sp.x, b[1] - sp.z));
  if (path.length > 8) {
    const inst = putAsh('rover', path[0][0], 0, path[0][1], 0.62, 0);
    ashFx.rover = { inst, path, u: 0, dir: 1, y: 0 };
    ashAnim.push({ inst, id: 'rover', rover: true });
  }
  // far silhouettes: two colossi stalk beyond the rim, as in the original sky
  for (let i = 0; i < 2; i++) {
    const a = i ? 2.4 : 5.2, r = 78;
    const inst = putAsh('colossus', W / 2 + Math.cos(a) * r, 2, D / 2 + Math.sin(a) * r, 1.15 + i * 0.25, 0);
    ashFx.far.push({ inst, a, r, i });
    ashAnim.push({ inst, id: 'colossus', far: true });
  }
  agBuild();
  for (const [inst, st] of lodList) agRegisterLod(inst, st);   // far props swap to baked flat pictures in the haze
  ashFloor.visible = false;
}
const ashV = new THREE.Vector3(), ashQ = new THREE.Quaternion(), ashUp = new THREE.Vector3(0, 1, 0);
let ashLast = 0, ashDt = 0.016;
function ashFrame() {      // once a frame (renderFoes) in a dry biome
  const now = performance.now() / 1000;
  const dt = ashDt = Math.min(0.05, Math.max(0.001, now - ashLast)); ashLast = now;
  const T = G.time;
  ashSync(T);
  sweepAshFoes();
  nomadSpawn();
  // animated props
  for (const a of ashAnim) {
    if (a.far) {
      const f = ashFx.far.find((q) => q.inst === a.inst);
      f.a += dt * (0.008 + f.i * 0.004);
      const x = W / 2 + Math.cos(f.a) * f.r, z = D / 2 + Math.sin(f.a) * f.r, px = a.inst.root.position.x, pz = a.inst.root.position.z;
      a.inst.root.position.set(x, 2, z);
      if (Math.hypot(x - px, z - pz) > 1e-5) a.inst.root.rotation.y += (() => { let d = Math.atan2(x - px, z - pz) + 0.3 - a.inst.root.rotation.y; return Math.atan2(Math.sin(d), Math.cos(d)); })() * Math.min(1, dt * 1.5);
      ASH.animate(a.inst, T, { mode: 'walk', speed: 0.6 });
    } else if (a.rover) {
      const R = ashFx.rover;
      R.u += R.dir * dt * 2.2;
      const n = R.path.length - 1;
      if (R.u > n) { R.u = n; R.dir = -1; } else if (R.u < 0) { R.u = 0; R.dir = 1; }
      const i0 = Math.floor(R.u), i1 = Math.min(n, i0 + 1), k = R.u - i0;
      const x = lerp(R.path[i0][0], R.path[i1][0], k), z = lerp(R.path[i0][1], R.path[i1][1], k);
      const px = a.inst.root.position.x, pz = a.inst.root.position.z;
      const gy = groundBelow(x, 30, z);
      R.y += (gy - R.y) * Math.min(1, dt * 8);
      a.inst.root.position.set(x, R.y + 0.05, z);
      if (Math.hypot(x - px, z - pz) > 1e-4) { let d = Math.atan2(x - px, z - pz) - a.inst.root.rotation.y; a.inst.root.rotation.y += Math.atan2(Math.sin(d), Math.cos(d)) * Math.min(1, dt * 4); }
      ASH.animate(a.inst, T, { speed: 1 });
    } else if (a.id === 'scavenger') {                    // the marauder by the fire turns to watch the hero
      const p = a.inst.root.position; let dd = Math.atan2(player.pos.x - p.x, player.pos.z - p.z) - a.inst.root.rotation.y;
      a.inst.root.rotation.y += Math.atan2(Math.sin(dd), Math.cos(dd)) * Math.min(1, dt * 1.2);
      ASH.animate(a.inst, T + a.ph, { speed: 0 });
    } else if (a.id === 'turret' || a.id === 'radar') {
      ASH.animate(a.inst, T + a.ph, { mode: 'idle' });
    } else ASH.animate(a.inst, T + (a.ph || 0), {});
  }
  // glowing mushrooms and the orb of the pylon breathe
  for (const f of ashFx.fungi) f.mat.uniforms.uGlow.value = 0.7 + 0.3 * Math.sin(T * 1.3 + f.root.position.x);
  if (ashFx.pylon) ashFx.pylon.mat.uniforms.uGlow.value = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(T * 1.1)) * (0.5 + 0.5 * Math.sin(T * 0.37 + 1));
  // the campfire: light, embers, smoke
  if (ashFx.fire) {
    const fk = ashFx.fire.flick || 1, p = ashFx.fireAt;
    ashLight.position.set(p.x, p.y + 1.4, p.z); ashLight.intensity = 2.4 * fk * (1 + 0.2 * Math.max(0, 1 - Math.hypot(player.pos.x - p.x, player.pos.z - p.z) / 5));
    const u = ASH.GU.uPL.value[0], c = ASH.GU.uPC.value[0];
    u.set(p.x, p.y + 1.2, p.z, 15); c.set(1.5, 0.62, 0.24).multiplyScalar(1.4 * fk);
    if (Math.random() < dt * 22) glow.emit(p.x + rr(-0.25, 0.25), p.y + 0.9, p.z + rr(-0.25, 0.25), rr(-0.2, 0.2), rr(0.9, 1.9), rr(-0.2, 0.2), rr(0.9, 1.6), 0.05, 0.02, C.ember, 1, 0.2, 0.5, 1);
    if (Math.random() < dt * 4) dust.emit(p.x + rr(-0.2, 0.2), p.y + 1.4, p.z + rr(-0.2, 0.2), rr(-0.1, 0.3), rr(0.5, 1), rr(-0.1, 0.1), rr(2, 3.5), 0.3, 0.9, C.smoke, 0.4, 0, 0.5, 0);
  }
  ashRosterTick(dt);
  agFrame(dt, T);
}
