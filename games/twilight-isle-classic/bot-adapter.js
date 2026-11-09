// Read-only bridge to the game's existing window.__isle debug snapshot.
// No gameplay actions are exposed through window.__META_BOT__.
(() => {
  'use strict';
  function game() {
    const api = window.__isle;
    if (!api || !api.G || !api.player || !api.world) {
      throw new Error('Twilight Isle state is not initialized');
    }
    return api;
  }
  function nearestLiveCoin(coins, player) {
    let nearest = null;
    let best = Infinity;
    for (const coin of coins) {
      if (!coin.alive) continue;
      const d = (coin.x - player.x) ** 2 + (coin.z - player.z) ** 2;
      if (d < best) { best = d; nearest = coin; }
    }
    return nearest;
  }
  const bot = Object.freeze({
    version: 1,
    info() { return { name: document.title, levels: 1 }; }, // one beacon mission per island run
    state() {
      const api = game();
      const { G, player, world, combat } = api;
      const p = player.pos;
      const coin = nearestLiveCoin(api.coins, p);
      const guardian = G.warden;
      const guardianHead = guardian && guardian.hp > 0 &&
        guardian.state !== 'dissolve' && guardian.segs?.[0];
      const target = !G.all ? coin : (guardianHead || world.ring);
      const goal = target ? { x: target.x, y: target.z } : null;
      const layoutHash = [
        world.seed, world.biome,
        world.spawn.x, world.spawn.z,
        world.beacon.x, world.beacon.z,
        ...world.coins.map(c => `${c.x},${c.z}`)
      ].join('|');
      return {
        started: !['loading', 'title'].includes(G.state),
        level: 0,
        levelDone: G.state === 'victory',
        gameDone: G.state === 'victory',
        alive: G.state !== 'dead' && player.hp > 0,
        hero: { x: p.x, y: p.z },
        goal,
        enemies: api.foes.filter(f => f.hp > 0 && f.state !== 'dissolve').length,
        weapons: combat.arsenal.length,
        layoutHash,
        menuOpen: G.state === 'paused',
        progress: G.collected + G.kills + (G.wardenDown ? 1 : 0)
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot, writable: false, configurable: false
  });
})();
