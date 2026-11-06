// Observation only. No input, teleport, damage, equipment, level or health mutations.
(function () {
  'use strict';
  const point = value => Object.freeze({ x: value.x, y: value.z });
  let mappedWorld, mappedNavigation;
  function navigation(world) {
    if (mappedWorld === world) return mappedNavigation;
    const width = Math.sqrt(world.stand.length), depth = width, height = world.vox.length / (width * depth);
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const clear = (x, z, y) => y >= 0 && y < height - 1 &&
      !world.vox[x + width * (z + depth * y)] && !world.vox[x + width * (z + depth * (y + 1))];
    const edges = Array(width * depth).fill(0);
    // The original generator's reachability rule: step <=1, jump <=2, two free body cells.
    for (let z = 0; z < depth; z++) for (let x = 0; x < width; x++) {
      const i = x + z * width;
      if (!world.reach[i] || world.stand[i] >= 99) continue;
      directions.forEach(([dx, dz], bit) => {
        const X = x + dx, Z = z + dz, j = X + Z * width;
        if (X < 0 || Z < 0 || X >= width || Z >= depth || !world.reach[j] || world.stand[j] >= 99) return;
        const top = Math.max(world.stand[i], world.stand[j]);
        if (world.stand[j] - world.stand[i] <= 2 && clear(x, z, top) && clear(X, Z, top)) edges[i] |= 1 << bit;
      });
    }
    mappedWorld = world;
    mappedNavigation = Object.freeze({ width, depth, heights: Object.freeze(Array.from(world.stand)),
      reachable: Object.freeze(Array.from(world.reach)), edges: Object.freeze(edges) });
    return mappedNavigation;
  }
  function buttons() {
    return Object.freeze(Array.from(document.querySelectorAll('button, summary')).flatMap(button => {
      const rect = button.getBoundingClientRect();
      if (!rect.width || !rect.height || getComputedStyle(button).visibility === 'hidden') return [];
      return [Object.freeze({ id: button.id || 'menu',
        label: button.getAttribute('aria-label') || button.title || button.textContent.trim(),
        x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
        width: rect.width, height: rect.height, disabled: !!button.disabled })];
    }));
  }

  // Read-only route observation: the goal is the next traversable waypoint of the
  // item the real player is pursuing, not a straight line through a cliff.
  // One flood per snapshot; a stationary player receives the same waypoint.
  function navigationFocus(game, nav, player, fallback) {
    const width = nav.width, count = nav.edges.length;
    const cell = (x, y) => {
      const ix = Math.floor(x), iy = Math.floor(y);
      return ix < 0 || iy < 0 || ix >= width || iy >= nav.depth ? -1 : ix + iy * width;
    };
    let start = cell(player.pos.x, player.pos.z);
    if (start < 0 || !nav.reachable[start]) {
      let best = Infinity;
      for (let i = 0; i < count; i++) if (nav.reachable[i]) {
        const d = Math.hypot(i % width + .5 - player.pos.x, Math.floor(i / width) + .5 - player.pos.z);
        if (d < best) { best = d; start = i; }
      }
    }
    if (start < 0) return fallback;
    const before = new Int32Array(count).fill(-1);
    const distance = new Int32Array(count).fill(-1);
    const queue = [start], offsets = [1, width, -1, -width];
    distance[start] = 0;
    for (let k = 0; k < queue.length; k++) {
      const id = queue[k];
      for (let bit = 0; bit < 4; bit++) if (nav.edges[id] & (1 << bit)) {
        const next = id + offsets[bit];
        if (next >= 0 && next < count && distance[next] < 0) {
          distance[next] = distance[id] + 1;
          before[next] = id;
          queue.push(next);
        }
      }
    }
    function observe(target, range = 0) {
      let end = cell(target.x, target.z);
      if (range > 0 || end < 0 || distance[end] < 0) {
        let best = Infinity;
        for (const id of queue) {
          const d = Math.hypot(id % width + .5 - target.x, Math.floor(id / width) + .5 - target.z);
          const score = d <= range ? distance[id] + d * .1 : 10000 + d * 100 + distance[id];
          if (score < best) { best = score; end = id; }
        }
      }
      if (end < 0 || distance[end] < 0) return null;
      const ids = [];
      for (let id = end; id !== -1; id = before[id]) ids.push(id);
      ids.reverse();
      while (ids.length > 1 &&
        Math.hypot(ids[0] % width + .5 - player.pos.x, Math.floor(ids[0] / width) + .5 - player.pos.z) < .32) ids.shift();
      const first = ids[0];
      return { routeLength: ids.length, next: { x: first % width + .5, z: Math.floor(first / width) + .5 } };
    }
    function ranked(items) {
      return items.map(item => ({ item, route: observe(item) })).filter(x => x.route)
        .sort((a, b) => a.route.routeLength - b.route.routeLength);
    }
    const coins = ranked(game.coins.filter(c => c.alive));
    const hearts = ranked(game.hearts.filter(h => h.alive));
    const loot = ranked(game.loot.filter(l => l.alive && game.WEAPONS[l.id]));
    const arsenal = game.combat.arsenal;
    const power = id => {
      const w = game.WEAPONS[id];
      const damage = w.dps || (Array.isArray(w.dmg) ? w.dmg[1] : w.dmg) || 0;
      return damage / (w.cd || w.tick || 1);
    };
    let selected = null;
    if (player.hp <= 4 && hearts.length) selected = hearts[0];
    if (!selected) {
      const hasRanged = arsenal.some(id => game.WEAPONS[id].kind === 'ranged');
      const heldPower = Math.max(...arsenal.map(power));
      selected = loot.find(x => x.route.routeLength <= 12 &&
        (arsenal.length === 1 || (!hasRanged && game.WEAPONS[x.item.id].kind === 'ranged') ||
          (x.route.routeLength <= 7 && power(x.item.id) > heldPower * 1.2)));
    }
    if (!selected) selected = coins[0];
    const route = selected ? selected.route : observe(fallback, 0);
    return route ? route.next : fallback;
  }

  // Stateful *observation* only: aggregate measured enemy HP loss across
  // successive read-only snapshots. No enemy or player state is ever modified.
  const observedHP = new WeakMap();
  let observedDamage = 0;
  function recordDamage(game) {
    const enemies = new Set([...(game.foes || []), game.G.warden].filter(Boolean));
    for (const foe of enemies) {
      if (!Number.isFinite(foe.hp)) continue;
      const hp = Math.max(0, foe.hp), before = observedHP.get(foe);
      if (before !== undefined && hp < before) observedDamage += before - hp;
      observedHP.set(foe, hp);
    }
    return observedDamage;
  }

  function install() {
    const game = window.__isle;
    if (!game || !game.world || game.G.state === 'loading') return false;
    const bot = Object.freeze({
      version: 1,
      info() { return Object.freeze({ name: 'Twilight Island', levels: 1, navigation: navigation(game.world) }); },
      state() {
        const { G, player, world } = game;
        const foes = game.foes.filter(foe => foe.hp > 0 && foe.state !== 'dissolve');
        const realDamage = recordDamage(game);
        const nearestCoin = game.coins.filter(coin => coin.alive).reduce((best, coin) => !best ||
          Math.hypot(coin.x - player.pos.x, coin.z - player.pos.z) <
          Math.hypot(best.x - player.pos.x, best.z - player.pos.z) ? coin : best, null);
        const boss = G.warden && G.warden.hp > 0 ? G.warden.segs[0] : null;
        const actualGoal = nearestCoin || boss || world.ring;
        const nearestFoe = foes.reduce((best, foe) => !best ||
          foe.segs[0].distanceTo(player.pos) < best.segs[0].distanceTo(player.pos) ? foe : best, null);
        const equipped = game.WEAPONS[game.combat.cur] || game.WEAPONS.fists;
        const attackRange = equipped.kind === 'ranged'
          ? Math.min(12, (equipped.reach || equipped.range || 15) * .8)
          : (equipped.reach || equipped.range || 15) + .3;
        const inCombat = nearestFoe && nearestFoe.segs[0].distanceTo(player.pos) < attackRange;
        // Spatial watchdog is appropriate for walking; during an actual fight
        // the strategy separately requires combat/health progress within 20 seconds.
        const goal = inCombat ? null : navigationFocus(game, navigation(world), player, actualGoal);

        const heroScreen = player.pos.clone(); heroScreen.y += .85; heroScreen.project(game.camera);
        const screen = nearestFoe ? nearestFoe.segs[0].clone() : null;
        if (screen) { screen.y = player.pos.y + .85; screen.project(game.camera); }
        return Object.freeze({
          started: ['play', 'paused', 'dead', 'victory'].includes(G.state),
          level: G.state === 'victory' ? 1 : 0,
          stage: G.collected + (G.wardenDown ? 1 : 0), objectiveCount: G.total + 2,
          progress: G.collected + Math.max(0, game.combat.arsenal.length - 1) + G.kills +
            realDamage / 100 + (G.wardenDown ? 1 : 0),
          levelDone: G.state === 'victory', gameDone: G.state === 'victory',
          alive: player.hp > 0 && G.state !== 'dead',
          hero: point(player.pos), goal: goal ? point(goal) : null,
          destination: point(actualGoal),
          heroHeight: player.pos.y, onGround: player.onGround, cameraYaw: game.rig.yaw,
          renderFps: game.perf.acc > 0 ? game.perf.frames / game.perf.acc : null,
          coins: Object.freeze(game.coins.flatMap((coin, id) => coin.alive ?
            [Object.freeze({ id: 'coin-' + id, x: coin.x, y: coin.z, height: coin.y })] : [])),
          pickups: Object.freeze([
            ...game.loot.filter(item => item.alive).map(item => Object.freeze({
              id: item.id, type: 'weapon', kind: game.WEAPONS[item.id].kind,
              damage: game.WEAPONS[item.id].dps || (Array.isArray(game.WEAPONS[item.id].dmg) ?
                game.WEAPONS[item.id].dmg[1] : game.WEAPONS[item.id].dmg),
              cooldown: game.WEAPONS[item.id].cd || game.WEAPONS[item.id].tick || 1,
              x: item.x, y: item.z, height: item.y })),
            ...game.hearts.flatMap((item, id) => item.alive ? [Object.freeze({
              id: 'heart-' + id, type: 'heart', x: item.x, y: item.z, height: item.y })] : [])
          ]),
          enemies: foes.length, weapons: game.combat.arsenal.length,
          buttons: buttons(),
          health: player.hp, equipped: game.combat.cur,
          kills: G.kills,
          combatants: Object.freeze(foes.map(foe => Object.freeze({ id: foe.seed, hp: foe.hp }))),
          equipment: Object.freeze(game.combat.arsenal.map(id => {
            const weapon = game.WEAPONS[id];
            return Object.freeze({ id, kind: weapon.kind, reach: weapon.reach || weapon.range || 15,
              damage: weapon.dps || (Array.isArray(weapon.dmg) ? weapon.dmg[1] : weapon.dmg),
              cooldown: weapon.cd || weapon.tick || 1, leech: weapon.leech || 0, charge: weapon.charge || 0 });
          })),
          layoutHash: JSON.stringify({ spawn: point(world.spawn),
            coins: world.coins.map(coin => [coin.x, coin.y, coin.z]) }),
          menuOpen: !!document.getElementById('v5Menu')?.open || G.state === 'paused',
          threatDistance: nearestFoe ? Math.hypot(nearestFoe.segs[0].x - player.pos.x,
            nearestFoe.segs[0].z - player.pos.z) : null,
          fightingBoss: !!boss,
          threat: nearestFoe ? point(nearestFoe.segs[0]) : null,
          threatDirection: screen ? Object.freeze({ x: screen.x - heroScreen.x,
            y: (heroScreen.y - screen.y) * innerHeight / innerWidth }) : null,
          threatScreen: screen && screen.z > -1 && screen.z < 1 ?
            Object.freeze({ x: (screen.x + 1) * .5, y: (1 - screen.y) * .5 }) : null
        });
      }
    });
    Object.defineProperty(window, '__META_BOT__', { value: bot, writable: false, configurable: false });
    return true;
  }
  let ready = false, tries = 0;
  function probe() { ready = ready || install(); if (!ready && ++tries < 600) requestAnimationFrame(probe); }
  window.addEventListener('observer-v7-ready', probe);
  requestAnimationFrame(probe);
})();
