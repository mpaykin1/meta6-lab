// Read only the real `__isle` engine state: never call its debug/cheat methods.
(() => {
  'use strict';
  const route = { seed: null, coin: null, path: [], step: 1 };
  function navigate(world, player, coin) {
    const reach = world.reach, stand = world.stand;
    const side = reach && Math.sqrt(reach.length);
    if (!reach || !stand || !Number.isInteger(side)) return coin;
    const clampCell = v => Math.max(0, Math.min(side - 1, Math.floor(v)));
    const start = clampCell(player.x) + side * clampCell(player.z);
    const end = clampCell(coin.x) + side * clampCell(coin.z);
    // Knockback, a fall or a slide can leave the hero beside a cliff the old route
    // crosses: re-plan from where the hero really is as soon as the next waypoint
    // is no longer adjacent.
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
      // Cells beside deep water (stand < 3): a held jump there drops the hero into the sea.
      const nearWater = j => {
        const x = j % side, z = Math.floor(j / side);
        for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
          const X = x + dx, Z = z + dz;
          if (X >= 0 && Z >= 0 && X < side && Z < side && stand[X + side * Z] < 3) return true;
        }
        return false;
      };
      const search = safe => {
        prev.fill(-1);
        const queue = new Int32Array(reach.length); let head = 0, tail = 1;
        queue[0] = origin; prev[origin] = origin;
        while (head < tail && prev[end] === -1) {
          const i = queue[head++], x = i % side, z = Math.floor(i / side);
          for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const X = x + dx, Z = z + dz;
            if (X < 0 || Z < 0 || X >= side || Z >= side) continue;
            const j = X + side * Z;
            if (!reach[j] || prev[j] !== -1 || Math.abs(stand[j] - stand[i]) > 2) continue;
            if (safe && j !== end && nearWater(j)) continue;
            prev[j] = i; queue[tail++] = j;
          }
        }
      };
      if (reach[origin] && reach[end]) {
        search(true);
        if (prev[end] === -1) search(false);
        if (prev[end] !== -1) {
          let i = end;
          while (i !== origin) { route.path.push(i); i = prev[i]; }
          route.path.push(origin);
          route.path.reverse();
        }
      }
    }
    if (!route.path.length) return coin;
    // Advance by the waypoint the hero is actually heading to (step + 1), not the one
    // already behind: a hero standing on the current goal must get the next goal.
    // Skip ahead to the farthest of the next few waypoints the hero already touches.
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
      const target = nearest ? navigate(world, p, nearest) : world.beacon;
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
