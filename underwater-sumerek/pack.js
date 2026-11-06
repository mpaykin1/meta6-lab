/* ===== pack: sunken ===== */
packBegin({"id": "sunken", "name": "Затонувший город", "desc": "Третий остров: дно моря из серо-жёлтых кубиков, архитектура Затонувшего города, рыбы, батискаф и морские чудища. Всплыви — и окажешься у берега Острова сумерек.", "order": 20});

/* --- packs/sunken/biome_sunken.js --- */
{
/* «Затонувший город»: everything is under water. The seabed is cubes — yellow sand on top of grey rock — with real relief;
   the water surface lies far above the world (see setBiomeMode), so the hero swims instead of walking:
   hold Jump to rise, let go to sink. Swim to the surface and the hero emerges in the shallows of the home island. */
defineBiome('sunken', {
  name: 'Затонувший город',
  short: 'подводный мир',
  desc: 'Серо-жёлтое дно из кубиков, затонувший собор, рыбы, батискаф и чудища глубин. Держи прыжок, чтобы всплыть к Острову сумерек.',
  lede: 'Собери жемчужины на дне, одолей хранителя глубин и зажги маяк. Всплыви — и увидишь берег Острова сумерек.',
  underwater: true,
  blocks: {
    top: 'sand', soil: 'stone', deep: 'stone', beach: 'sand', path: 'stone', plaza: 'stone',
    wall: 'stone', pier: 'plank', post: 'bark', rock: 'stone', tower: 'stone', towerCap: 'stone', towerTop: 'sand', door: 'plank',
  },
  terrain: { height: 8.4, base: 0.42, hills: 0.8, seabed: 6.2 },
  flora: [],
  rocks: 6, ruins: 2, piers: 0,
  guardian: 'uw_kraken',
  foes: { imp: 0, shade: 0, lantern_jelly: 0, rose_jelly: 0 },
  leafColors: ['#7fe0e8', '#4fb8c8', '#a8f0e0'],
  weather: null,
  ambience: { wind: 0.2, waves: 0.0 },
  onTerrain(g) {      // grey rock patches break up the yellow sand
    const { hgt, kind, vox, at, ci, W, D } = g;
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
      const i = ci(x, z), h = hgt[i];
      if (h < 5 || kind[i] !== 0) continue;
      const n = Math.sin(x * 0.31 + 1.7) * Math.cos(z * 0.27 - 0.6) + Math.sin((x + z) * 0.13 + 2.2) * 0.8;
      if (n > 0.55) vox[at(x, h - 1, z)] = g.block('stone');
    }
  },
  palette: {
    dusk: {
      skyTop: '#06304d', skyHor: '#1f8fb0', fog: '#0b5c7c', fogD: 0.05, keyCol: '#ffe9b4', keyI: 2.4, sunEl: 0.5, sunVis: 0, moonMix: 0,
      hemiSky: '#bfe6ee', hemiGnd: '#16505e', hemiI: 1.55, mist: 0, mistCol: '#2a8aa8', motes: 1.4, flies: 0.35, stars: 0, wisp: 0.5,
      gain: [1.0, 1.08, 1.14], lift: [0.0, 0.05, 0.09], bloom: 0.62, grain: 0.04, vig: 0.4,
    },
    twi: {
      skyTop: '#052a45', skyHor: '#17789a', fog: '#094a68', fogD: 0.056, keyCol: '#8fdcf2', keyI: 1.7, sunEl: 0.5, sunVis: 0, moonMix: 0,
      hemiSky: '#9fd4e4', hemiGnd: '#103f4e', hemiI: 1.3, mist: 0, mistCol: '#2a8aa8', motes: 1.2, flies: 0.6, stars: 0, wisp: 1,
      gain: [0.98, 1.06, 1.14], lift: [0.0, 0.05, 0.1], bloom: 0.75, grain: 0.05, vig: 0.45,
    },
    night: {
      skyTop: '#031c30', skyHor: '#0e5a78', fog: '#06374f', fogD: 0.062, keyCol: '#7fc8e8', keyI: 1.3, sunEl: 0.5, sunVis: 0, moonMix: 0,
      hemiSky: '#7fb8d0', hemiGnd: '#0a2f3c', hemiI: 1.0, mist: 0, mistCol: '#2a8aa8', motes: 1.0, flies: 1, stars: 0, wisp: 1,
      gain: [0.96, 1.04, 1.14], lift: [0.0, 0.05, 0.11], bloom: 0.9, grain: 0.055, vig: 0.5,
    },
    dawn: {
      skyTop: '#0a4a6a', skyHor: '#3ab0c8', fog: '#12708e', fogD: 0.045, keyCol: '#d8fbff', keyI: 2.6, sunEl: 0.5, sunVis: 0, moonMix: 0,
      hemiSky: '#d0f0f4', hemiGnd: '#1c6272', hemiI: 1.8, mist: 0, mistCol: '#4aa8c0', motes: 1.4, flies: 0.2, stars: 0, wisp: 0.4,
      gain: [1.02, 1.08, 1.12], lift: [0.0, 0.05, 0.08], bloom: 0.55,
    },
  },
});

}

/* --- packs/sunken/enemies.js --- */
{
/* Sea creatures of the Sunken City (real .glb models). Their hit-boxes are the same segment chains the island's foes use,
   so every weapon, shield, freeze and shock of the island works on them unchanged. model/len: which GLB and how long it is drawn. */
const SERP = REG.bodies.get('serpent'), STALK = REG.brains.get('stalker'), WARDEN = REG.enemies.get('warden');
defineBody('swimmer', Object.assign({}, SERP, { trail() {}, render(f) { renderFoeModel(f); } }));
defineBrain('swimmer', Object.assign({}, STALK, {
  think(f, dt, s) {
    STALK.think(f, dt, s);
    const def = f.def, head = f.segs[0], gnd = terrainTop(head.x, head.z);
    let ty = f.state === 'chase' || f.state === 'flee' ? s.py + 0.2 + 0.45 * Math.sin(f.t * 2 + f.seed) : gnd + def.hover + 1.0 + 1.3 * Math.sin(f.t * 0.55 + f.seed);
    f.ty = Math.min(Math.max(ty, gnd + 0.9), H - 4);
  },
}));
const SWIM = (c) => ({ from: 'deep', every: 3, dist: [10, 18], ...c });
const LOOK = (r, g, b) => ({ core: [0.02, 0.07, 0.12], rim: [r, g, b], aura: [r, g, b], death: [r * 2, g * 2, b * 2, 2.6] });
defineEnemy('uw_eel', { name: 'Угорь', body: 'swimmer', brain: 'swimmer', model: 'eel', len: 2.7,
  seg: 7, rad: 0.3, spacing: 0.34, hover: 0.8, hp: 24, dmg: 1, wander: 2.0, chase: 4.2, chaseR: 10, soul: 0.18, danger: 0.5, look: LOOK(0.2, 0.9, 0.7),
  spawn: SWIM({ priority: 2, biomes: ['sunken'], max: (c) => (c.play < 3 ? 0 : Math.min(3, 1 + Math.floor(c.collected / 5))) }) });
defineEnemy('uw_jelly_t', { name: 'Медуза', body: 'swimmer', brain: 'swimmer', model: 'jellyfish_teal', len: 1.4,
  seg: 3, rad: 0.55, spacing: 0.26, hover: 1.5, hp: 20, dmg: 1, wander: 1.2, chase: 2.5, chaseR: 9, soul: 0.18, danger: 0.5, look: LOOK(0.3, 0.9, 1.0),
  spawn: SWIM({ priority: 3, every: 4, biomes: ['sunken'], max: (c) => (c.play < 4 ? 0 : Math.min(2, 1 + Math.floor(c.collected / 6))) }) });
defineEnemy('uw_jelly_v', { name: 'Фиолетовая медуза', body: 'swimmer', brain: 'swimmer', model: 'jellyfish_violet', len: 1.5,
  seg: 3, rad: 0.55, spacing: 0.26, hover: 1.5, hp: 26, dmg: 1, wander: 1.2, chase: 2.7, chaseR: 9, soul: 0.2, danger: 0.5, look: LOOK(0.8, 0.4, 1.0),
  spawn: SWIM({ priority: 4, every: 5, biomes: ['sunken'], max: (c) => (c.collected < 3 ? 0 : Math.min(2, 1 + Math.floor(c.collected / 8))) }) });
defineEnemy('uw_drone', { name: 'Дрон-разведчик', body: 'swimmer', brain: 'swimmer', model: 'scout_drone', len: 1.3,
  seg: 3, rad: 0.45, spacing: 0.3, hover: 1.2, hp: 30, dmg: 1, wander: 2.2, chase: 4.4, chaseR: 11, soul: 0.2, danger: 0.6, look: LOOK(1.0, 0.7, 0.2),
  spawn: SWIM({ priority: 5, every: 5, dist: [12, 20], biomes: ['sunken'], max: (c) => (c.collected < 2 ? 0 : Math.min(2, 1 + Math.floor((c.collected - 2) / 6))) }) });
defineEnemy('uw_angler', { name: 'Удильщик', body: 'swimmer', brain: 'swimmer', model: 'angler', len: 2.4,
  seg: 6, rad: 0.62, spacing: 0.42, hover: 1.0, hp: 70, dmg: 1, wander: 1.8, chase: 3.3, chaseR: 11, soul: 0.4, danger: 1, look: LOOK(1.0, 0.5, 0.3),
  spawn: SWIM({ priority: 1, every: 4, dist: [13, 21], biomes: ['sunken'], max: (c) => (c.collected < 1 ? 0 : Math.min(3, 1 + Math.floor((c.collected - 1) / 5)) + (c.all ? 1 : 0)),
    onSpawn() { if (!G.firstShade) { G.firstShade = true; toast('Из глубины поднимается удильщик…', 3000, true); } } }) });
defineEnemy('uw_kraken', Object.assign({}, WARDEN, { name: 'Хранитель глубин', body: 'swimmer', model: 'kraken_tentacle', len: 8,
  downText: 'Хранитель глубин повержен — зажги маяк!',
  look: { core: [0.02, 0.07, 0.12], rim: [0.2, 0.7, 0.9], aura: [0.3, 0.9, 1.0], death: [0.5, 1, 1, 2.6] },
  spawn: Object.assign({}, WARDEN.spawn, { onSpawn(f) {
    const h = f.segs[0];
    G.bossCam = 2.6; SFX.roar(); rig.trauma = Math.min(1, rig.trauma + 0.6);
    toast('Хранитель глубин пробудился!', 3600, true, 3);
    for (let k = 0; k < 40; k++) dust.emit(h.x + rr(-1.5, 1.5), world.tower.base + 0.2, h.z + rr(-1.5, 1.5), rr(-2, 2), rr(1, 4), rr(-2, 2), rr(1, 2), 0.6, 1.6, C.spray, 0.7, -0.4, 1, 0);
  } }) }));

}

packEnd();
