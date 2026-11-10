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
  // Read-only tactical targets: live enemy heads and optional exposed heart pickups.
  // The game exposes no live hearts today; world.hearts is only a spawn blueprint.
  function threats(foes, player) {
    return (Array.isArray(foes) ? foes : [])
      .filter(f => f.hp > 0 && f.state !== 'dissolve')
      .map(f => {
        const pos = f.pos ?? f.segs?.[0] ?? f;
        const d = Math.hypot(pos.x - player.x, pos.z - player.z);
        return { pos, d };
      })
      .filter(f => Number.isFinite(f.d))
      .sort((a, b) => a.d - b.d);
  }
  function liveHeart(api, player) {
    const hearts = Array.isArray(api.hearts) ? api.hearts :
      (Array.isArray(api.heartsP) ? api.heartsP : []);
    return hearts.filter(h => h.alive && Number.isFinite(h.x) && Number.isFinite(h.z))
      .map(h => ({ h, d: Math.hypot(h.x - player.x, h.z - player.z) }))
      .sort((a, b) => a.d - b.d)[0]?.h ?? null;
  }
  function safeRetreat(world, player, foes) {
    const { reach, stand } = world;
    const side = Math.sqrt(reach?.length ?? 0);
    if (!Number.isInteger(side) || !side || !stand) return null;
    const wet = (x, z) => {
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Z = z + dz;
        if (X < 0 || Z < 0 || X >= side || Z >= side ||
            stand[X + side * Z] < 3) return true;
      }
      return false;
    };
    const px = Math.floor(player.x), pz = Math.floor(player.z);
    if (!foes.length && !wet(px, pz)) return null;
    const danger = (x, z) => foes.length ?
      Math.min(...foes.map(f => Math.hypot(f.pos.x - x, f.pos.z - z))) : 0;
    const currentDanger = danger(player.x, player.z);
    let best = null, score = -Infinity;
    for (let dz = -5; dz <= 5; dz++) for (let dx = -5; dx <= 5; dx++) {
      const x = px + dx, z = pz + dz;
      if (x < 0 || z < 0 || x >= side || z >= side) continue;
      const d = Math.hypot(x + 0.5 - player.x, z + 0.5 - player.z);
      if (d < 0.75 || d > 5 || !reach[x + side * z] ||
          stand[x + side * z] < 3 || wet(x, z)) continue;
      const away = danger(x + 0.5, z + 0.5);
      if (foes.length && away < currentDanger + 0.75) continue;
      const quality = away - d * 0.5;
      if (quality > score) { score = quality; best = { x: x + 0.5, z: z + 0.5 }; }
    }
    return best;
  }
  const retreat = { seed: null, goal: null };
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
      const nearbyFoes = threats(api.foes, p);
      const nearestFoe = nearbyFoes[0];
      // In the authored game, enemy position is the first segment (segs[0]).
      const fight = nearestFoe && nearestFoe.d < 3 ? nearestFoe.pos : null;
      const heart = player.hp <= 2 ? liveHeart(api, p) : null;
      const candidate = player.hp <= 2 && !heart ? safeRetreat(world, p, nearbyFoes) : null;
      if (!candidate) retreat.goal = null;
      else if (retreat.seed !== world.seed || !retreat.goal ||
          Math.hypot(retreat.goal.x - p.x, retreat.goal.z - p.z) < 0.75) {
        retreat.seed = world.seed;
        retreat.goal = candidate;
      }
      const survival = heart || retreat.goal;
      const target = fight || (survival ? navigate(world, p, survival) :
        (!G.all && coin ? navigate(world, p, coin) : (guardianHead || world.ring)));
      const goal = target ? { x: target.x, y: target.z } : null;
      // Read-only terrain hint for the strategy: the next step is higher than the hero's
      // column (terrace, rock top, pier, lighthouse ring), so a real held jump is needed.
      const col = (x, z) => world.stand[Math.floor(x) + Math.sqrt(world.stand.length) * Math.floor(z)];
      const climb = !!target && (col(target.x, target.z) > col(p.x, p.z) ||
        (typeof target.y === 'number' && target.y > p.y + 1));
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
        climb,
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
