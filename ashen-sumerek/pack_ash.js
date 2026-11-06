/* ===== pack: ashen ===== */
packBegin({"id": "ashen", "name": "Пепельный путь", "desc": "Третий остров: серый кубический край с рельефом, руины, шагоходы и дроны из «Пепельного пути»."});

/* --- packs/ashen/blocks.js --- */
{
/* Two more greys, drawn from the base stone tile (the atlas is shared): a dark and a pale rock. */
defineBlock('ash_dark', { name: 'Тёмный камень', tiles: 'stone', mm: '#4b4d59', step: 'stone', tint: [0.6, 0.14] });
defineBlock('ash_pale', { name: 'Светлый камень', tiles: 'stone', mm: '#a3a5b2', step: 'stone', tint: [1.0, 0.2] });
}

/* --- packs/ashen/biome_ashen.js --- */
{
/* «Пепельный путь»: a dry biome. The land is grey cubes with real relief (plains, ridges, a rim of cliffs);
   the original Ashen models stand on it. See the `decorate` hook: ruins and props are laid out by the world seed. */
const L = (id, r, s, o) => Object.assign({ id, r, s }, o || {});
const BIG = [        // flattened plateaus: id, radius (cells), scale, solid footprint
  L('bunker', 4, 1.4, { solid: 'box', rot: 'free' }),
  L('hangar_ruin', 5, 1.8, {}),
  L('water_tower', 3, 1.7, {}),
  L('viaduct', 4, 1.9, {}),
  L('wall_ruin', 2, 1.3, { solid: 'line' }), L('wall_ruin', 2, 1.3, { solid: 'line' }), L('wall_ruin', 2, 1.3, { solid: 'line' }),
  L('wreck_truck', 3, 0.9, { solid: 'line' }),
  L('pylon', 2, 1.2, {}), L('pylon', 2, 1.2, {}), L('pylon', 2, 1.2, {}), L('pylon', 2, 1.2, {}), L('pylon', 2, 1.2, {}), L('pylon', 2, 1.2, {}),
];
const SMALL = [      // id, count, scale range, blocks the cell for coins
  ['dead_tree_a', 13, [0.5, 0.85]], ['dead_tree_b', 13, [0.5, 0.85]], ['thorn_bush', 22, [0.6, 0.95]], ['fungus', 10, [0.7, 1.1]],
  ['barrel', 3, [0.75, 0.9]], ['crate', 3, [0.75, 0.9]], ['tire_stack', 2, [0.8, 0.9]], ['grave_cross', 3, [0.8, 1.0]],
];
defineBiome('ashen', {
  name: 'Пепельный путь',
  short: 'серые кубы, руины, пепел',
  desc: 'Серый кубический край с холмами и скалами, руины бункеров, шагоходы, дроны и пепел в воздухе. Герой, оружие и погода — из Острова сумерек.',
  lede: 'Собери монеты среди руин, переживи пепельную бурю и одолей Колосса. Каждый раз пустошь населяют другие твари.',
  dry: true,                  // = the Ashen mode (engine + models); the sea is the Island's own
  blocks: {
    top: 'stone', soil: 'ash_dark', deep: 'ash_dark', beach: 'ash_pale', path: 'frost_brick', plaza: 'frost_brick',
    wall: 'frost_brick', pier: 'plank', post: 'bark', rock: 'ash_pale', tower: 'frost_brick', towerCap: 'frost_brick', towerTop: 'ash_pale', door: 'plank',
  },
  terrain: { height: 8.8, base: 0.4, hills: 1.0 },
  flora: [],
  rocks: 9, ruins: 3, piers: 2, shrines: 3,
  foes: { imp: 0.6, shade: 0.7, frost_imp: 0.5, lantern_jelly: 0.7, rose_jelly: 0.7 },      // the Island's own creatures, thinned so the Ashen roster still shows
  guardian: 'ash_colossus',
  leafColors: ['#6b6870', '#4a4852', '#8a8590'],
  weather: { kind: 'ash', density: 0.85, wind: [1.3, 0.5] },
  ambience: { wind: 1.1, waves: 1 },
  onTerrain(g) {      // grey patches break the plain up: pale rock, dark rock, brownish dust
    const { hgt, kind, vox, at, ci, W, D, role } = g;
    const pale = g.block('ash_pale'), dark = g.block('ash_dark'), dirt = g.block('frozen_dirt'), stone = g.block('stone');
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
      const i = ci(x, z), h = hgt[i];
      if (kind[i] !== 0 || h < 2) continue;
      const k = at(x, h - 1, z);
      if (vox[k] !== role.top && vox[k] !== role.beach) continue;
      const n = Math.sin(x * 0.29 + 1.7) * Math.cos(z * 0.23 - 0.6) + Math.sin((x + z) * 0.11 + 2.2) * 0.8 + Math.sin(x * 0.7 - z * 0.45) * 0.25;
      vox[k] = n > 0.75 ? pale : n < -0.7 ? dark : n > 0.3 && n < 0.42 ? dirt : stone;
      for (let y = Math.max(0, h - 3); y < h - 1; y++) if (vox[at(x, y, z)] === role.soil) vox[at(x, y, z)] = (x * 7 + z * 13 + y) % 5 === 0 ? stone : dark;
    }
  },
  decorate(g) {       // the original world: ruins, towers, props, lamps along the path, the campfire by the beacon
    const { hgt, kind, stand, vox, at, ci, inb, W, D, role } = g;
    const rnd = g.rng('ashen'), RR = (a, b) => a + (b - a) * rnd();
    const sp = g.spawn, tw = g.tower, BL = 99;
    const taken = [];
    const top = g.block('stone'), soil = role.soil, deep = role.deep, dark = g.block('ash_dark');
    const paint = (x, z, h) => {            // repaint a column up/down to height h
      const i = ci(x, z), old = hgt[i];
      if (h > old) { if (old > 0) vox[at(x, old - 1, z)] = soil; for (let y = old; y < h; y++) vox[at(x, y, z)] = y >= h - 3 ? soil : deep; }
      else for (let y = h; y < old; y++) vox[at(x, y, z)] = 0;
      if (h > 0) vox[at(x, h - 1, z)] = top;
      hgt[i] = h;
    };
    const flatten = (cx, cz, r, level) => {      // plateau of radius r; a slope-1 skirt of 3 cells keeps every step walkable
      const R2 = r + 3;
      for (let dz = -R2; dz <= R2; dz++) for (let dx = -R2; dx <= R2; dx++) {
        const x = cx + dx, z = cz + dz;
        if (!inb(x, z)) continue;
        const d = Math.hypot(dx, dz);
        if (d > R2) continue;
        const i = ci(x, z), old = hgt[i];
        const h = Math.max(3, d <= r ? level : Math.min(level + (d - r), Math.max(level - (d - r), old)));
        const hh = Math.round(h);
        if (hh !== old) paint(x, z, hh);
        stand[i] = hgt[i];
        if (d <= r) kind[i] = 5;
      }
    };
    const okSite = (x, z, r, slack = 0) => {
      if (x < r + 4 || z < r + 4 || x > W - r - 5 || z > D - r - 5) return false;
      if (Math.hypot(x - sp.x, z - sp.z) < r + 6 || Math.hypot(x - tw.x, z - tw.z) < r + 8) return false;
      for (const t of taken) if (Math.hypot(x - t.x, z - t.z) < r + t.r + 3) return false;
      let mn = 99, mx = 0;
      for (let dz = -r - 3; dz <= r + 3; dz++) for (let dx = -r - 3; dx <= r + 3; dx++) {
        if (!inb(x + dx, z + dz)) return false;
        const i = ci(x + dx, z + dz);
        if (kind[i] !== 0) return false;
        if (Math.hypot(dx, dz) <= r) { mn = Math.min(mn, hgt[i]); mx = Math.max(mx, hgt[i]); }
      }
      return mn >= 4 + (slack ? 0 : 1) && mx - mn <= 4 + slack * 2 && mx < H - 14;
    };
    const solidBox = (cx, cz, hx, hz, rot, h0, ht) => {       // invisible pillar inside a building so that it cannot be walked through
      const c = Math.cos(rot), s = Math.sin(rot);
      for (let a = -hx; a <= hx; a += 0.5) for (let b = -hz; b <= hz; b += 0.5) {
        const x = Math.floor(cx + a * c + b * s), z = Math.floor(cz - a * s + b * c);
        if (!inb(x, z)) continue;
        for (let y = h0; y < h0 + ht; y++) vox[at(x, y, z)] = dark;
        stand[ci(x, z)] = BL; kind[ci(x, z)] = 5;
      }
    };
    for (const b of BIG) {
      for (let tries = 0; tries < 520; tries++) {
        const x = Math.floor(RR(b.r + 4, W - b.r - 5)), z = Math.floor(RR(b.r + 4, D - b.r - 5));
        if (!okSite(x, z, b.r, tries > 260 ? 1 : 0)) continue;
        let sum = 0, n = 0;
        for (let dz = -b.r; dz <= b.r; dz++) for (let dx = -b.r; dx <= b.r; dx++) if (Math.hypot(dx, dz) <= b.r) { sum += hgt[ci(x + dx, z + dz)]; n++; }
        const level = Math.round(sum / n);
        flatten(x, z, b.r, level);
        const rot = RR(0, TAU), cx = x + 0.5, cz = z + 0.5;
        g.structures.push({ kind: 'ash', id: b.id, x: cx, y: level, z: cz, s: b.s, rot });
        taken.push({ x, z, r: b.r });
        if (b.solid === 'box') solidBox(cx, cz, 1.9, 1.3, rot, level, 3);
        else if (b.solid === 'line') solidBox(cx, cz, b.id === 'wreck_truck' ? 0.6 : 1.5, b.id === 'wreck_truck' ? 1.9 : 0.25, rot, level, 2);
        break;
      }
    }
    // small props: one cell each, standing on the cubes
    const cellFree = (x, z) => inb(x, z) && kind[ci(x, z)] === 0 && hgt[ci(x, z)] >= 5 && Math.hypot(x - sp.x, z - sp.z) > 4 && Math.hypot(x - tw.x, z - tw.z) > 5 && stand[ci(x, z)] !== BL;
    const put1 = (id, s, x, z, own) => {
      const i = ci(x, z);
      g.structures.push({ kind: 'ash', id, x: x + 0.5 + RR(-0.2, 0.2), y: hgt[i], z: z + 0.5 + RR(-0.2, 0.2), s, rot: RR(0, TAU) });
      stand[i] = BL; kind[i] = 5;
    };
    for (const [id, count, sr] of SMALL) {
      let placed = 0;
      for (let tries = 0; tries < 300 && placed < count; tries++) {
        const x = Math.floor(RR(3, W - 4)), z = Math.floor(RR(3, D - 4));
        if (!cellFree(x, z)) continue;
        // clusters of barrels, crates, tires and crosses sit together
        put1(id, RR(sr[0], sr[1]), x, z); placed++;
      }
    }
    // a fence line
    for (let tries = 0; tries < 80; tries++) {
      const x0 = Math.floor(RR(8, W - 14)), z0 = Math.floor(RR(8, D - 8));
      let ok = true;
      for (let k = 0; k < 6 && ok; k++) ok = cellFree(x0 + k * 1, z0) && Math.abs(hgt[ci(x0 + k, z0)] - hgt[ci(x0, z0)]) <= 1;
      if (!ok) continue;
      for (let k = 0; k < 6; k++) { const i = ci(x0 + k, z0); g.structures.push({ kind: 'ash', id: 'fence', x: x0 + k + 0.5, y: hgt[i], z: z0 + 0.5, s: 1.0, rot: 0 }); stand[i] = BL; kind[i] = 5; }
      break;
    }
    // campfire beside the beacon, a radar with its turret, lamps along the path
    const dx = tw.door[0], dz = tw.door[1], px = -dz, pz = dx;
    const fx = Math.floor(tw.x + dx * 3 + px * 3), fz = Math.floor(tw.z + dz * 3 + pz * 3);
    { const sx = fx + 2, sz = fz - 1; if (inb(sx, sz)) g.structures.push({ kind: 'ash', id: 'scavenger', x: sx + 0.5, y: hgt[ci(sx, sz)], z: sz + 0.5, s: 0.62, rot: 3.6 }); }
    if (inb(fx, fz)) { g.structures.push({ kind: 'ash', id: 'campfire', x: fx + 0.5, y: hgt[ci(fx, fz)], z: fz + 0.5, s: 0.85, rot: 0 }); stand[ci(fx, fz)] = BL; kind[ci(fx, fz)] = 5; }
    for (let tries = 0; tries < 120; tries++) {
      const x = Math.floor(RR(6, W - 7)), z = Math.floor(RR(6, D - 7));
      if (!cellFree(x, z) || !cellFree(x + 3, z + 1)) continue;
      g.structures.push({ kind: 'ash', id: 'radar', x: x + 0.5, y: hgt[ci(x, z)], z: z + 0.5, s: 1.2, rot: RR(0, TAU) });
      g.structures.push({ kind: 'ash', id: 'turret', x: x + 3.5, y: hgt[ci(x + 3, z + 1)], z: z + 1.5, s: 0.8, rot: RR(0, TAU) });
      stand[ci(x, z)] = BL; stand[ci(x + 3, z + 1)] = BL; kind[ci(x, z)] = 5; kind[ci(x + 3, z + 1)] = 5;
      break;
    }
    const pathCells = [];
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (kind[ci(x, z)] === 1) pathCells.push([x, z]);
    pathCells.sort((a, b) => Math.hypot(a[0] - sp.x, a[1] - sp.z) - Math.hypot(b[0] - sp.x, b[1] - sp.z));
    for (let k = 4, n = 0; k < pathCells.length && n < 6; k += Math.max(4, Math.floor(pathCells.length / 7)), n++) {
      const [x, z] = pathCells[k];
      let lx = x + (n % 2 ? 2 : -2), lz = z + (n % 2 ? 1 : -1);
      if (!cellFree(lx, lz)) { lx = x + (n % 2 ? -2 : 2); lz = z + (n % 2 ? -1 : 1); }
      if (!cellFree(lx, lz)) continue;
      g.structures.push({ kind: 'ash', id: 'lamp', x: lx + 0.5, y: hgt[ci(lx, lz)], z: lz + 0.5, s: 0.85, rot: (n % 2) * Math.PI });
      stand[ci(lx, lz)] = BL; kind[ci(lx, lz)] = 5;
    }
  },
  palette: {
    dusk: {
      skyTop: '#383b4a', skyHor: '#9c9aa2', fog: '#8a8c95', fogD: 0.021, keyCol: '#d3cde6', keyI: 2.7, sunEl: 0.5, sunVis: 0.2, moonMix: 0,
      hemiSky: '#aeb0be', hemiGnd: '#3c3c46', hemiI: 2.1, 
      mist: 0, mistCol: '#7d7f8c', motes: 0.55, flies: 0, stars: 0.0, wisp: 0.25,
      gain: [1.0, 0.99, 1.02], lift: [0.015, 0.012, 0.025], bloom: 0.78, grain: 0.07, vig: 0.5,
    },
    twi: {
      skyTop: '#24263a', skyHor: '#6d6571', fog: '#5d5f6c', fogD: 0.026, keyCol: '#a69cc8', keyI: 2.0, sunEl: 0.35, sunVis: 0.1, moonMix: 0.3,
      hemiSky: '#8486a0', hemiGnd: '#26262f', hemiI: 1.7, mist: 0, mistCol: '#5a5c6c', motes: 0.5, flies: 0, stars: 0.35, wisp: 0.6,
      gain: [1.0, 0.97, 1.03], lift: [0.015, 0.01, 0.03], bloom: 0.9, grain: 0.08, vig: 0.55,
    },
    night: {
      skyTop: '#0d0e1a', skyHor: '#34324a', fog: '#2c2e3e', fogD: 0.032, keyCol: '#8e9ac8', keyI: 1.5, sunEl: 0.3, sunVis: 0, moonMix: 1,
      hemiSky: '#4d5278', hemiGnd: '#14141e', hemiI: 1.3, mist: 0, mistCol: '#3a3c50', motes: 0.4, flies: 0, stars: 1, wisp: 1,
      gain: [0.98, 0.97, 1.05], lift: [0.012, 0.01, 0.035], bloom: 1.05, grain: 0.09, vig: 0.6,
    },
    dawn: {
      skyTop: '#444660', skyHor: '#c8b3ae', fog: '#9a98a2', fogD: 0.018, keyCol: '#ffe6d0', keyI: 2.9, sunEl: 0.4, sunVis: 0.5, moonMix: 0,
      hemiSky: '#b4b2c8', hemiGnd: '#3d3b46', hemiI: 2.2, mist: 0, mistCol: '#9a98a6', motes: 0.5, flies: 0, stars: 0, wisp: 0.2,
      gain: [1.02, 1.0, 1.0], lift: [0.015, 0.012, 0.02], bloom: 0.7,
    },
  },
});
}

/* --- packs/ashen/events.js --- */
{
defineEvent('ash_rain', {
  name: 'Дождь', toast: 'Над пустошью пошёл дождь', biomes: ['ashen'], chance: 0.3, duration: [40, 60], cooldown: 70,
  when: (c) => c.play > 25,
  weather: { kind: 'rain', density: 1, wind: [1.4, 0.6] },
  palette: { skyTop: '#161a28', skyHor: '#4c5266', fog: '#3c4152', fogD: 0.04, keyCol: '#9fa6c8', keyI: 0.9, sunVis: 0, hemiSky: '#6a7090', hemiGnd: '#1a1b26', hemiI: 0.95,
    bloom: 0.85, motes: 0, mist: 0, grain: 0.08, vig: 0.58, gain: [0.95, 0.98, 1.06], lift: [0.01, 0.015, 0.05] },
  ambience: { rain: 1, gust: 0.8, wind: 1.3, waves: 0 },
  spawnMul: 1.2,
  onTick(dt, k) { if (k > 0.55 && Math.random() < dt * 0.12 * k) skyBolt(player.pos.x + rr(-16, 16), player.pos.z + rr(-16, 16)); },
});
defineEvent('ash_gale', {
  name: 'Пепельная буря', toast: 'Поднимается пепельная буря — видно всё хуже', warn: true, biomes: ['ashen'], chance: 0.28, duration: [30, 50], cooldown: 80,
  when: (c) => c.prog > 0.2,
  weather: { kind: 'ash', density: 1, wind: [5, 1.5] },
  palette: { fogD: 0.058, fog: '#6a6368', skyHor: '#8a7c82', skyTop: '#2d2830', keyCol: '#d8b8a8', keyI: 1.4, hemiI: 1.2, mist: 0, motes: 0.9, vig: 0.62, grain: 0.1 },
  ambience: { gust: 1, wind: 1.9, waves: 0, drone: 1.2 },
  spawnMul: { ash_scav: 1.6, ash_soldier: 1.4 },
});
defineEvent('ember_wind', {
  name: 'Тлеющий ветер', toast: 'С руин несёт тлеющие угли', biomes: ['ashen'], chance: 0.22, duration: [30, 45], cooldown: 90,
  when: (c) => c.play > 40,
  weather: { kind: 'embers', density: 0.9, wind: [1.8, 0.8] },
  palette: { fog: '#7a5f5c', fogD: 0.03, skyHor: '#c07a5a', skyTop: '#33232a', keyCol: '#ffb070', keyI: 2.2, bloom: 1.0, motes: 0.8, vig: 0.55 },
  ambience: { wind: 1.4, waves: 0 },
  spawnMul: 1.1,
});
}

/* --- packs/ashen/enemies.js --- */
{
/* The creatures of the Ashen Path as the Island's foes. Their hit-boxes are the same segment chains the Island's foes
   use (so every weapon, shield, freeze and shock works unchanged); the Ashen voxel model is drawn walking along that chain.
   ash / ashScale / ashKind: which model, how big, which animation set. fire: they shoot orbs (every s, range, n bullets).
   Each run only a random few of them are awake (see ashRoster in the engine). */
const SERP = REG.bodies.get('serpent'), STALK = REG.brains.get('stalker'), WARDEN = REG.enemies.get('warden');
defineBody('ashen', Object.assign({}, SERP, { trail() {}, render(f) { renderAshFoe(f); } }));
defineBrain('ashen', Object.assign({}, STALK, {
  think(f, dt, s) {
    STALK.think(f, dt, s);
    const def = f.def, head = f.segs[0];
    if (def.fly) {
      const gnd = terrainTop(head.x, head.z);
      const ty = f.state === 'chase' ? Math.max(s.py + 0.9 + 0.5 * Math.sin(f.t * 2 + f.seed), gnd + 1.2) : gnd + def.hover + 0.9 * Math.sin(f.t * 0.7 + f.seed);
      f.ty = Math.min(Math.max(ty, gnd + 1.1), H - 4);
    }
    if (def.keep && f.state === 'chase' && s.dist < def.keep) f.target.set(head.x - s.dxp * 3, 0, head.z - s.dzp * 3);   // gunmen keep their distance
    ashShoot(f, dt, s);
  },
  onHurtHero: STALK.onHurtHero,
}));
defineBrain('ashnomad', Object.assign({}, STALK, {
  think(f, dt, s) { nomadThink(f, dt, s, STALK); },
  onDamaged(f, dmg, o) { nomadHurt(f, dmg, o); },
  onHurtHero() {},
}));
defineBrain('ashturret', Object.assign({}, STALK, {
  think(f, dt, s) {
    STALK.think(f, dt, s);
    const head = f.segs[0];
    f.speed = 0; f.target.set(head.x, 0, head.z); f.harmful = false;
    ashShoot(f, dt, s);
  },
  onHurtHero() {},
}));
const LOOK = (r, g, b) => ({ core: [0.03, 0.03, 0.05], rim: [r, g, b], aura: [r, g, b], death: [r * 2, g * 2, b * 2, 2.4] });
const LAND = (c) => ({ from: 'land', every: 3.5, dist: [12, 26], biomes: ['ashen'], ...c });
defineEnemy('ash_nomad', { name: 'Странник', body: 'ashen', brain: 'ashnomad', ash: 'nomad', ashScale: 0.64, ashKind: 'human', ashAim: true, ashGlow: 0,
  seg: 2, rad: 0.36, spacing: 0.28, hover: 0.7, hp: 90, dmg: 1, wander: 2.0, chase: 3.7, chaseR: 14, keep: 5.5, soul: 0.2, danger: 0, look: LOOK(0.4, 0.8, 1.0),
  fire: { every: 2.5, range: 13, n: 1, speed: 7.2, up: 0.5 } });
defineEnemy('ash_scav', { name: 'Мародёр', body: 'ashen', brain: 'ashen', ash: 'scavenger', ashScale: 0.62, ashKind: 'human', ashGlow: 1.0,
  seg: 2, rad: 0.36, spacing: 0.28, hover: 0.7, hp: 32, dmg: 1, wander: 2.0, chase: 3.7, chaseR: 9, soul: 0.2, danger: 0.5, look: LOOK(0.9, 0.3, 0.2),
  spawn: LAND({ priority: 3, max: (c) => (ashOn('ash_scav') && c.play >= 6 ? Math.min(4, 2 + Math.floor(c.collected / 6)) : 0) }) });
defineEnemy('ash_soldier', { name: 'Солдат пустоши', body: 'ashen', brain: 'ashen', ash: 'soldier', ashScale: 0.62, ashKind: 'human', ashAim: true, ashGlow: 1.05,
  seg: 2, rad: 0.38, spacing: 0.28, hover: 0.72, hp: 58, dmg: 1, wander: 1.8, chase: 3.0, chaseR: 12, keep: 5.5, soul: 0.28, danger: 0.7, look: LOOK(1.0, 0.25, 0.25),
  fire: { every: 2.7, range: 13, n: 1, speed: 7.2, up: 0.5 },
  spawn: LAND({ priority: 2, max: (c) => (ashOn('ash_soldier') && c.collected >= 1 ? Math.min(3, 1 + Math.floor(c.collected / 6)) : 0) }) });
defineEnemy('ash_strider_s', { name: 'Шагоход-разведчик', body: 'ashen', brain: 'ashen', ash: 'strider_s', ashScale: 0.5, ashKind: 'strider', ashAim: true, ashGlow: 1.9,
  seg: 3, rad: 0.5, spacing: 0.34, hover: 1.2, hp: 82, dmg: 1, wander: 1.9, chase: 3.5, chaseR: 13, keep: 6, soul: 0.32, danger: 0.8, look: LOOK(1.0, 0.45, 0.15),
  fire: { every: 3.1, range: 15, n: 2, spread: 0.35, speed: 7.4, up: 1.7 },
  spawn: LAND({ priority: 2, every: 4.5, max: (c) => (ashOn('ash_strider_s') && c.collected >= 2 ? Math.min(2, 1 + Math.floor(c.collected / 8)) : 0) }) });
defineEnemy('ash_strider_m', { name: 'Шагоход «Курица»', body: 'ashen', brain: 'ashen', ash: 'strider_m', ashScale: 0.52, ashKind: 'strider', ashAim: true, ashGlow: 2.3,
  seg: 4, rad: 0.62, spacing: 0.4, hover: 1.5, hp: 150, dmg: 1, wander: 1.6, chase: 2.6, chaseR: 14, keep: 7, soul: 0.5, danger: 1, look: LOOK(1.0, 0.35, 0.15),
  fire: { every: 3.8, range: 17, n: 3, spread: 0.6, speed: 7.8, up: 2.0 },
  spawn: LAND({ priority: 1, every: 6, dist: [14, 28], max: (c) => (ashOn('ash_strider_m') && c.collected >= 4 ? Math.min(2, 1 + Math.floor(c.collected / 10) + (c.all ? 1 : 0)) : 0),
    onSpawn() { if (!G.firstShade) { G.firstShade = true; toast('Над пустошью идёт шагоход…', 3000, true); } } }) });
defineEnemy('ash_drone', { name: 'Дрон-квадро', body: 'ashen', brain: 'ashen', ash: 'drone_quad', ashScale: 0.45, ashKind: 'drone', fly: true,
  seg: 3, rad: 0.45, spacing: 0.3, hover: 2.4, hp: 28, dmg: 1, wander: 2.4, chase: 4.7, chaseR: 12, soul: 0.2, danger: 0.55, look: LOOK(0.4, 0.8, 1.0),
  spawn: LAND({ priority: 4, every: 4, dist: [13, 24], max: (c) => (ashOn('ash_drone') && c.play >= 10 ? Math.min(3, 1 + Math.floor(c.collected / 6)) : 0) }) });
defineEnemy('ash_eye', { name: 'Дрон-глаз', body: 'ashen', brain: 'ashen', ash: 'drone_eye', ashScale: 0.42, ashKind: 'eye', fly: true, ashTurn: 3,
  seg: 3, rad: 0.5, spacing: 0.3, hover: 2.8, hp: 46, dmg: 1, wander: 1.5, chase: 2.5, chaseR: 13, keep: 7, soul: 0.3, danger: 0.7, look: LOOK(1.0, 0.2, 0.3),
  fire: { every: 4.2, range: 14, n: 1, speed: 5.6, up: 0 },
  spawn: LAND({ priority: 4, every: 5, dist: [14, 26], max: (c) => (ashOn('ash_eye') && c.collected >= 2 ? Math.min(2, 1 + Math.floor(c.collected / 9)) : 0) }) });
defineEnemy('ash_worm', { name: 'Пепельный червь', body: 'ashen', brain: 'ashen', ash: 'ash_worm', ashScale: 0.46, ashKind: 'worm', ashMid: false, ashTurn: 3.5,
  seg: 11, rad: 0.5, spacing: 0.52, hover: 0.55, hp: 120, dmg: 1, wander: 1.8, chase: 3.1, chaseR: 10, soul: 0.4, danger: 0.9, look: LOOK(0.9, 0.5, 0.2),
  spawn: LAND({ priority: 3, every: 5, max: (c) => (ashOn('ash_worm') && c.collected >= 1 ? Math.min(2, 1 + Math.floor(c.collected / 9)) : 0) }) });
defineEnemy('ash_turret', { name: 'Турель', body: 'ashen', brain: 'ashturret', ash: 'turret', ashScale: 0.75, ashKind: 'turret', ashAim: true, ashGlow: 0.9,
  seg: 1, rad: 0.5, spacing: 0.3, hover: 0.6, hp: 74, dmg: 1, wander: 0, chase: 0, chaseR: 15, soul: 0.25, danger: 0.6, look: LOOK(1.0, 0.2, 0.2),
  fire: { every: 1.6, range: 15, n: 1, speed: 8.2, up: 0.9 },
  spawn: LAND({ priority: 4, every: 6, dist: [10, 22], max: (c) => (ashOn('ash_turret') && c.play >= 12 ? Math.min(3, 1 + Math.floor(c.collected / 7)) : 0) }) });
defineEnemy('ash_colossus', Object.assign({}, WARDEN, { name: 'Колосс', body: 'ashen', ash: 'colossus', ashScale: 0.5, ashKind: 'colossus', ashTurn: 2,
  seg: 6, rad: 1.35, spacing: 0.42, hover: 2.2, hp: 800,
  downText: 'Колосс повержен — зажги маяк!',
  look: { core: [0.03, 0.03, 0.05], rim: [0.7, 0.2, 0.15], aura: [1.0, 0.35, 0.2], death: [1, 0.6, 0.3, 2.6] },
  spawn: Object.assign({}, WARDEN.spawn, { onSpawn(f) {
    WARDEN.spawn.onSpawn(f);
    toast('Колосс проснулся!', 3600, true, 3);
  } }) }));
}

/* --- packs/ashen/weapons.js --- */
{
/* The three guns of «Пепельный путь» as playable weapons, on top of the Island's own arsenal. Sprites are the side view of the
   original voxel models (one voxel = one pixel), see the atlas patch. */
defineProjectile('rocket', {
  splash: 1.8,
  draw(p) { glow.spark(p.pos.x, p.pos.y, p.pos.z, 0.36, C.flashWarm, 1, 0); glow.spark(p.pos.x, p.pos.y, p.pos.z, 1.0, C.fire, 0.5, 0); },
  trail(p) {
    const q = p.pos;
    glow.emit(q.x, q.y, q.z, rr(-0.3, 0.3) - p.vel.x * 0.05, rr(-0.2, 0.5), rr(-0.3, 0.3) - p.vel.z * 0.05, rr(0.2, 0.4), 0.16, 0.03, C.fire, 1, 0, 2, 2);
    dust.emit(q.x, q.y, q.z, 0, 0.4, 0, 0.9, 0.15, 0.5, C.smokeLight, 0.45, -0.2, 1, 0);
    return 0.02;
  },
});
defineProjectile('plasma', {
  draw(p) { glow.spark(p.pos.x, p.pos.y, p.pos.z, 0.3, C.zapCore, 1, 0); glow.spark(p.pos.x, p.pos.y, p.pos.z, 0.95, C.zapGlow, 0.55, 0); },
  trail(p) { glow.emit(p.pos.x, p.pos.y, p.pos.z, rr(-0.3, 0.3), rr(-0.3, 0.3), rr(-0.3, 0.3), rr(0.2, 0.35), 0.12, 0.02, C.zapGlow, 0.8, 0, 2, 2); return 0.03; },
  impact(p) { const q = p.pos; for (let k = 0; k < 8; k++) glow.emit(q.x, q.y, q.z, rr(-2.5, 2.5), rr(0.3, 2.5), rr(-2.5, 2.5), rr(0.15, 0.35), 0.1, 0.02, C.zapCore, 1, 6, 1, 1); },
});
defineWeapon('ash_rifle', {
  name: 'Винтовка пустоши', art: 'ash_rifle', kind: 'ranged', rar: 'epic', fire: 'proj', proj: 'bullet',
  dmg: 26, cd: 0.6, speed: 64, life: 1.5, size: 0.16, r: 0.1, pierce: 1, kb: 4, mag: 5, reload: 1.5, casing: true, tracer: 1, recoil: 1.3,
  color: col3(0.7, 0.95, 1, 3), stat: 'Урон 26 · 5 патронов · пробивает цель', desc: 'Длинный точный выстрел: пуля пробивает первого врага и летит дальше.',
  held: 1.2, loot: { tier: 9 }, flash: { col: 'zapGlow', light: 0x9fdcff },
  sfx: [['hiss', 0.16, 2200, 0.5, 0.2], ['tone', 150, 0.16, 'square', 0.09, 45], ['sweep', 0.3, 1800, 300, 1.2, 0.04]] });
defineWeapon('ash_rocket', {
  name: 'Ракетомёт', art: 'ash_rocket', kind: 'ranged', rar: 'legend', fire: 'proj', proj: 'rocket',
  dmg: 58, cd: 0.9, speed: 22, life: 2.2, size: 0.5, r: 0.2, aoe: 3.6, kb: 9, mag: 2, reload: 2.4, recoil: 1.8,
  stat: 'Урон 58 · взрыв радиусом 3.6', desc: 'Ракета летит прямо и рвётся о первое, во что попадёт.',
  held: 1.3, loot: { tier: 17 }, flash: { big: true, smoke: true },
  sfx: [['tone', 90, 0.3, 'sawtooth', 0.1, 40], ['hiss', 0.4, 700, 0.5, 0.14, 'lowpass'], ['sweep', 0.5, 300, 1200, 1.5, 0.05]] });
defineWeapon('ash_plasma', {
  name: 'Плазмаган', art: 'ash_plasma', kind: 'ranged', rar: 'epic', fire: 'proj', proj: 'plasma', auto: true,
  dmg: 9, cd: 1 / 7, speed: 30, spread: 4, life: 1.4, size: 0.3, r: 0.16, pierce: 1, kb: 1.5, mag: 24, reload: 1.8, glow: 0.4,
  stat: 'Урон 9 · 7 сгустков в секунду', desc: 'Очередь голубой плазмы, пока держишь атаку. Сгусток прошивает двоих.',
  held: 1.2, loot: { tier: 12 }, flash: { col: 'zapGlow', light: 0x7fe6ff },
  sfx: [['sweep', 0.12, 1800, 500, 2, 0.05], ['tone', 620, 0.1, 'triangle', 0.05, 220]] });
}

packEnd();
