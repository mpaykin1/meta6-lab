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
  // Contract v1 reads a frozen snapshot from a non-configurable getter.
  // Do not expose a callable controller or mutable references to gameplay.
  Object.defineProperty(window, '__META_BOT__', {
    configurable: false, enumerable: true,
    get() {
      const s = read();
      if (!s) return Object.freeze({
        level: 1, totalLevels: 1, player: Object.freeze({x:0,y:0,z:0}),
        goal: null, alive: false, completed: false,
        buttons: Object.freeze(['w','a','s','d','Space']),
        combat: true, enemies: 0, weapons: 0, layout: 'loading'
      });
      return Object.freeze({
        level: s.level, totalLevels: s.totalLevels,
        player: Object.freeze({...s.player}),
        goal: s.goal ? Object.freeze({...s.goal}) : null,
        alive: s.alive, completed: s.completed,
        buttons: Object.freeze(['w','a','s','d','Space','touch:joystick']),
        combat: true, enemies: s.enemies.length, weapons: s.weapons,
        layout: s.layoutHash
      });
    }
  });
})();
