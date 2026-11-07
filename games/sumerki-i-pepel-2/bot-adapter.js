// Read-only META BOT view over actual Sumerki II gameplay. No game mutations.
(() => {
  'use strict';
  const read = () => {
    const game = window.__isle;
    if (!game) return null;
    const { G, player, rig, world, coins, foes, combat } = game;
    if (!world || !player || !G) return null;
    const hero = { x: player.pos.x, y: player.pos.y, z: player.pos.z };
    let nearest = null, best = Infinity;
    if (G.collected < G.total) {
      for (const coin of coins) {
        if (!coin.alive) continue;
        const d = (coin.x - hero.x) ** 2 + (coin.z - hero.z) ** 2;
        if (d < best) { best = d; nearest = coin; }
      }
    }
    const target = nearest || (G.collected >= G.total ? world.beacon : null);
    const enemies = [];
    for (const foe of foes) {
      if (foe.hp <= 0 || foe.state === 'dissolve' || !foe.segs?.length) continue;
      const p = foe.segs[0];
      enemies.push({ x: p.x, z: p.z, hp: foe.hp });
    }
    return {
      started: G.state !== 'title' && G.state !== 'loading',
      level: 1, levelDone: G.state === 'victory', gameDone: G.state === 'victory',
      alive: G.state !== 'dead' && player.hp > 0,
      hero, player: hero,
      goal: target ? { x: target.x, y: target.y, z: target.z } : null,
      enemies, weapons: combat.arsenal.length,
      progress: G.collected / Math.max(1, G.total),
      hp: player.hp / Math.max(1, player.maxHp),
      cameraYaw: rig.yaw,
      menuOpen: G.state === 'title' || G.state === 'paused',
      layoutHash: String(G.seed) + ':' + String(G.biome),
      completed: G.state === 'victory',
      totalLevels: 1
    };
  };
  const bot = Object.freeze({
    info: () => Object.freeze({ name: 'sumerki-i-pepel-2', levels: 1 }),
    state: () => read() || Object.freeze({ started: false, level: 1, levelDone: false, gameDone: false, alive: false })
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot, writable: false, configurable: false, enumerable: true
  });
})();
