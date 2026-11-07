// META GAMES Observer World V7: read-only, source-derived game state; no progress edits.
(() => {
  'use strict';
  let lastWorld = null, lastFingerprint = 'loading';
  function fingerprint(world, biome) {
    if (!world) return 'loading';
    if (world !== lastWorld) {
      lastWorld = world;
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
      lastFingerprint = (h >>> 0).toString(16);
    }
    return String(biome || '') + ':' + lastFingerprint;
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
            if (next[n] >= 0 || reach[n] <= 0 || height[n] >= 26 ||
                Math.abs(height[n] - height[at]) > 1) continue;
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
    info() { return { name: 'Twilight Island — Observer World V7', levels: 1 }; },
    state() {
      const b = window.__isle;
      const g = b?.G, player = b?.player, world = b?.world;
      const state = g?.state ?? 'loading';
      const position = player?.pos;
      const hero = { x: position?.x ?? 0, y: position?.z ?? 0 };
      const foeList = b?.foes ?? [];
      let enemies = 0;
      let nearestEnemy = null;
      let nearestEnemyD = Infinity;
      for (const foe of foeList) {
        if (!(foe.hp > 0) || foe.state === 'dissolve') continue;
        enemies++;
        const head = foe.segs?.[0];
        if (!head) continue;
        const d = Math.hypot(head.x - hero.x, head.z - hero.y);
        if (d < nearestEnemyD) {
          nearestEnemyD = d;
          nearestEnemy = { x: head.x, y: head.z, distance: d };
        }
      }
      let goalPoint = null;
      if (state === 'play') {
        if (g?.all) {
          const warden = g.warden;
          goalPoint = warden?.hp > 0 && warden.state !== 'dissolve'
            ? (warden.segs?.[0] ?? world?.ring)
            : world?.ring;
        } else {
          let best = Infinity;
          for (const coin of b?.coins ?? []) {
            if (!coin.alive) continue;
            const d = (coin.x - hero.x) ** 2 + (coin.z - hero.y) ** 2;
            if (d < best) {
              best = d;
              goalPoint = coin;
            }
          }
        }
      }
      if (state === 'play' && !g?.all) goalPoint = stickToLiveCoin(world, b?.coins, goalPoint);
      // The authentic restart is visible only after the real death screen.
      let retryButton = null;
      if (state === 'dead') {
        const screen = document.getElementById('scrEnd');
        const button = document.getElementById('btnAgain');
        if (screen && !screen.hidden && button && !button.disabled) {
          const rect = button.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            retryButton = {x:rect.left + rect.width / 2,y:rect.top + rect.height / 2};
          }
        }
      }
      const won = state === 'victory';
      return {
        started: state !== 'title' && state !== 'loading',
        level: 0,
        levelDone: won,
        gameDone: won,
        alive: state !== 'dead' && (player?.hp ?? 0) > 0,
        hero,
        goal: goalPoint ? (g?.all ? { x: goalPoint.x, y: goalPoint.z } : routedGoal(world, hero, { x: goalPoint.x, y: goalPoint.z })) : null,
        enemies,
        weapons: Array.isArray(b?.combat?.arsenal) ? b.combat.arsenal.length : 0,
        layoutHash: fingerprint(world,g?.biome),
        menuOpen: state !== 'play',
        // Source HP_MAX=6 (Observer V7), game-owned counters only: collected coins and defeated Warden.
        progress: (g?.collected ?? 0) + (g?.wardenDown ? 1 : 0),
        hp: player ? player.hp / 6 : 0,
        cameraYaw: b?.rig?.yaw ?? 0,
        nearestEnemy,
        retryButton
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot, writable: false, configurable: false
  });
})();
