// META GAMES only. Read the accepted island's real runtime; never write to it.
(() => {
  'use strict';
  // Hash actual terrain, placements and landmarks once per generated world.
  // Based on the independent, read-only layout sampling in PR #99.
  let layoutWorld = null;
  let layoutFingerprint = '';
  function actualLayout(world, biome) {
    if (!world) return 'loading';
    if (world !== layoutWorld) {
      layoutWorld = world;
      let h = 2166136261;
      for (const field of [world.stand, world.kind]) {
        if (!field || !Number.isFinite(field.length)) continue;
        const stride = Math.max(1, Math.floor(field.length / 128));
        for (let i = 0; i < field.length; i += stride) {
          h = Math.imul(h ^ (field[i] | 0), 16777619);
        }
      }
      for (const p of [world.spawn, world.beacon, world.ring]) {
        if (!p) continue;
        h = Math.imul(h ^ (Math.floor(p.x * 10) | 0), 16777619);
        h = Math.imul(h ^ (Math.floor(p.z * 10) | 0), 16777619);
      }
      layoutFingerprint = (h >>> 0).toString(16);
    }
    return String(biome ?? '') + ':' + layoutFingerprint;
  }
  // Reverse flow field over the accepted game's real traversable voxel grid.
  // Build asynchronously on a new target; state() only follows cached waypoints.
  let fieldWorld = null, fieldKey = '', field = null, scheduledKey = '';
  function scheduleField(world, target) {
    if (!world?.stand || !world?.reach || !target) return;
    const width = Math.round(Math.sqrt(world.stand.length));
    if (width * width !== world.stand.length) return;
    const tx = Math.floor(target.x), tz = Math.floor(target.y);
    if (tx < 0 || tz < 0 || tx >= width || tz >= width) return;
    const key = tx + ':' + tz;
    if (fieldWorld === world && (fieldKey === key || scheduledKey === key)) return;
    scheduledKey = key;
    fieldWorld = world;
    field = null;
    setTimeout(() => {
      if (fieldWorld !== world || scheduledKey !== key) return;
      const total = width * width, height = world.stand, reach = world.reach;
      const next = new Int16Array(total), queue = new Int16Array(total);
      next.fill(-1);
      let head = 0, tail = 0;
      const root = tx + tz * width;
      if (reach[root] > 0 && height[root] < 26) {
        next[root] = root; queue[tail++] = root;
        while (head < tail) {
          const at = queue[head++], x = at % width, z = (at / width) | 0;
          for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nx = x + dx, nz = z + dz;
            if (nx < 0 || nz < 0 || nx >= width || nz >= width) continue;
            const n = nx + nz * width;
            if (next[n] >= 0 || reach[n] <= 0 || height[n] >= 26) continue;
            // Reverse search: n -> at must obey the original game's
            // forward one-/two-block climb and unrestricted drop rules.
            // A symmetric abs(height difference) <= 1 wrongly disconnects
            // reachable coins across stairs and long downhill sections.
            const top = Math.max(height[n], height[at]);
            if (height[at] - height[n] > 2 || top < 0 || top >= 25) continue;
            const clearColumn = (cx, cz) =>
              world.vox[world.at(cx, top, cz)] === 0 &&
              world.vox[world.at(cx, top + 1, cz)] === 0;
            if (!clearColumn(x, z) || !clearColumn(nx, nz)) continue;
            next[n] = at;
            queue[tail++] = n;
          }
        }
      }
      if (fieldWorld === world && scheduledKey === key) {
        fieldKey = key; field = next;
      }
    }, 0);
  }
  function routedGoal(world, hero, goal) {
    if (!world || !goal) return goal;
    scheduleField(world, goal);
    const width = Math.round(Math.sqrt(world.stand.length));
    if (!field || fieldWorld !== world || fieldKey !== Math.floor(goal.x) + ':' + Math.floor(goal.y)) return goal;
    const x = Math.floor(hero.x), z = Math.floor(hero.y);
    if (x < 0 || z < 0 || x >= width || z >= width) return goal;
    const here = x + z * width, next = field[here];
    if (next < 0 || next === here) return goal;
    return { x: (next % width) + .5, y: ((next / width) | 0) + .5 };
  }
  // Persist a genuine uncollected coin until pickup. Euclidean nearest can
  // flip on every step and make an otherwise valid route oscillate.
  let coinWorld = null, trackedCoin = null;
  function stickToLiveCoin(world, coins, candidate) {
    if (world !== coinWorld || !trackedCoin?.alive ||
        !Array.isArray(coins) || !coins.includes(trackedCoin)) {
      coinWorld = world; trackedCoin = candidate;
    }
    return trackedCoin;
  }
  const bot = Object.freeze({
    version: 1,
    info() {
      return { name: 'Twilight Isle Classic', levels: 1 };
    },
    state() {
      const isle = window.__isle;
      const game = isle?.G;
      const player = isle?.player;
      const pos = player?.pos;
      const hero = { x: pos?.x ?? 0, y: pos?.z ?? 0 };
      const state = game?.state ?? 'loading';
      const coins = isle?.coins ?? [];
      const foes = isle?.foes ?? [];
      const arsenal = isle?.combat?.arsenal ?? [];
      let nearestCoin = null;
      let nearestCoinD = Infinity;
      for (const coin of coins) {
        if (!coin.alive) continue;
        const d = Math.hypot(coin.x - hero.x, coin.z - hero.y);
        if (d < nearestCoinD) {
          nearestCoinD = d;
          nearestCoin = coin;
        }
      }
      let nearestEnemy = null;
      let nearestEnemyD = Infinity;
      let livingEnemies = 0;
      for (const foe of foes) {
        if (!(foe.hp > 0) || foe.state === 'dissolve') continue;
        const head = foe.segs?.[0];
        if (!head) continue;
        livingEnemies++;
        const d = Math.hypot(head.x - hero.x, head.z - hero.y);
        if (d < nearestEnemyD) {
          nearestEnemyD = d;
          nearestEnemy = { x: head.x, y: head.z, distance: d };
        }
      }
      const warden = game?.warden;
      const bossAlive = Boolean(warden && warden.hp > 0 && warden.state !== 'dissolve');
      const head = bossAlive ? warden.segs?.[0] : null;
      const ring = isle?.world?.ring;
      const objective = game?.all
        ? (head ?? ring)
        : stickToLiveCoin(isle?.world, isle?.coins, nearestCoin);
      const directGoal = objective
        ? { x: objective.x, y: objective.z }
        : null;
      const goal = game?.all ? directGoal : routedGoal(isle?.world, hero, directGoal);
      const total = Math.max(1, game?.total ?? 1);
      const collected = Math.max(0, game?.collected ?? 0);
      // Only observed coin pickups and actual warden health contribute.
      const coinFraction = Math.min(1, collected / total);
      const bossFraction = game?.wardenDown
        ? 1
        : bossAlive && warden.maxHp > 0
          ? Math.max(0, Math.min(1, 1 - warden.hp / warden.maxHp))
          : 0;
      const won = state === 'victory';
      // The ordinary free-revive button appears after the game's real death
      // animation. Expose only its on-screen coordinates, never call its handler.
      let reviveButton = null;
      if (state === 'dead') {
        const btn = document.getElementById('btnRevive');
        const end = document.getElementById('scrEnd');
        if (btn && end && !end.hidden && !btn.hidden && !btn.disabled) {
          const rect = btn.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            reviveButton = {
              x: rect.left + rect.width * 0.5,
              y: rect.top + rect.height * 0.5
            };
          }
        }
      }
      return {
        started: state !== 'title' && state !== 'loading',
        level: 0,
        levelDone: won,
        gameDone: won,
        alive: state !== 'dead' && (player?.hp ?? 1) > 0,
        hero,
        goal,
        enemies: livingEnemies,
        weapons: arsenal.length,
        layoutHash: actualLayout(isle?.world, game?.biome),
        menuOpen: state === 'title' || state === 'paused' || state === 'dead' || won,
        progress: won ? 1 : Math.min(0.99, 0.8 * coinFraction + 0.19 * bossFraction),
        hp: player?.maxHp > 0 ? player.hp / player.maxHp : 1,
        cameraYaw: isle?.rig?.yaw ?? 0,
        nearestEnemy,
        reviveButton
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot,
    writable: false,
    configurable: false
  });
})();
