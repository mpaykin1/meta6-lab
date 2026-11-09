// Read only the real `__isle` engine state: never call its debug/cheat methods.
(() => {
  'use strict';
  const bot = Object.freeze({
    version: 1,
    info() { return { name: 'sumerki-i-pepel-2', levels: 1 }; },
    state() {
      const src = window.__isle;
      if (!src || !src.world) throw new Error('META BOT: world is not loaded');
      const { G, player, combat, world } = src;
      const coins = src.coins.filter(c => c.alive);
      const p = player.pos;
      let nearest = null, distance = Infinity;
      for (const coin of coins) {
        const d = (p.x - coin.x) ** 2 + (p.z - coin.z) ** 2;
        if (d < distance) { distance = d; nearest = coin; }
      }
      const target = nearest || world.beacon;
      return {
        started: ['play', 'paused', 'victory', 'dead'].includes(G.state),
        level: 0,
        levelDone: G.state === 'victory',
        gameDone: G.state === 'victory',
        alive: G.state !== 'dead' && player.hp > 0,
        hero: { x: p.x, y: p.z, z: p.z },
        goal: target ? { x: target.x, y: target.z, z: target.z } : null,
        enemies: src.foes.filter(f => f.hp > 0 && f.state !== 'dissolve').length,
        weapons: combat.arsenal.length,
        layoutHash: [G.seed, G.biome, world.coins.length].join(':'),
        menuOpen: G.state === 'paused' || G.state === 'title',
        progress: G.collected + G.kills / 100,
        cameraYaw: src.rig.yaw
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', { value: bot, writable: false, configurable: false });
})();
