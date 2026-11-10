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
  // Read-only grid navigation through cells the world generator marked reachable.
  // Goals are real walkable waypoints on the route to a real uncollected coin.
  const route = { seed: null, coin: null, path: [], step: 1 };
  function navigate(world, player, coin) {
    const reach = world.reach, stand = world.stand;
    const side = reach && Math.sqrt(reach.length);
    if (!reach || !stand || !Number.isInteger(side)) return coin;
    const clampCell = v => Math.max(0, Math.min(side - 1, Math.floor(v)));
    const start = clampCell(player.x) + side * clampCell(player.z);
    const end = clampCell(coin.x) + side * clampCell(coin.z);
    // Re-plan from where the hero really is once the next waypoint is no longer adjacent
    // (knockback, a fall or a slide off the old route).
    const nextCell = route.path[Math.min(route.path.length - 1, route.step + 1)];
    const offPath = route.path.length && nextCell !== undefined &&
      Math.hypot(player.x - (nextCell % side + 0.5),
        player.z - (Math.floor(nextCell / side) + 0.5)) > 2.2;
    if (route.seed !== world.seed || route.coin !== coin || !route.path.length || offPath) {
      route.seed = world.seed; route.coin = coin; route.path = []; route.step = 1;
      const prev = new Int32Array(reach.length); prev.fill(-1);
      let origin = start;
      if (!reach[origin]) {
        let distance = Infinity;
        for (let dz = -6; dz <= 6; dz++) for (let dx = -6; dx <= 6; dx++) {
          const x = clampCell(player.x + dx), z = clampCell(player.z + dz);
          const i = x + side * z, d = Math.hypot(player.x - x - 0.5, player.z - z - 0.5);
          if (reach[i] && d < distance) { origin = i; distance = d; }
        }
      }
      if (reach[origin] && reach[end]) {
        const queue = new Int32Array(reach.length); let head = 0, tail = 1;
        queue[0] = origin; prev[origin] = origin;
        while (head < tail && prev[end] === -1) {
          const i = queue[head++], x = i % side, z = Math.floor(i / side);
          for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const X = x + dx, Z = z + dz;
            if (X < 0 || Z < 0 || X >= side || Z >= side) continue;
            const j = X + side * Z;
            if (!reach[j] || prev[j] !== -1 || Math.abs(stand[j] - stand[i]) > 2) continue;
            prev[j] = i; queue[tail++] = j;
          }
        }
        if (prev[end] !== -1) {
          let i = end;
          while (i !== origin) { route.path.push(i); i = prev[i]; }
          route.path.push(origin);
          route.path.reverse();
        }
      }
    }
    if (!route.path.length) return coin;
    // Advance by the waypoint the hero is heading to (step + 1), not the one behind:
    // a hero standing on the current goal must get the next goal.
    for (let k = Math.min(route.path.length - 1, route.step + 4); k > route.step; k--) {
      const i = route.path[k];
      if (Math.hypot(player.x - (i % side + 0.5), player.z - (Math.floor(i / side) + 0.5)) < 0.75) { route.step = k; break; }
    }
    // Last waypoint: aim at the real coin itself so the pickup radius is hit.
    if (route.step + 1 >= route.path.length) return coin;
    const i = route.path[route.step + 1];
    return { x: i % side + 0.5, z: Math.floor(i / side) + 0.5 };
  }
  const bot = Object.freeze({
    version: 1,
    info() { return { name: document.title, levels: 1 }; }, // one beacon mission per island run
    state() {
      const api = game();
      const { G, player, world, combat } = api;
      const p = player.pos;
      const coin = !G.all && route.coin?.alive ? route.coin : nearestLiveCoin(api.coins, p);
      const guardian = G.warden;
      const guardianHead = guardian && guardian.hp > 0 &&
        guardian.state !== 'dissolve' && guardian.segs?.[0];
      const target = !G.all && coin ? navigate(world, p, coin) : (guardianHead || world.ring);
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
