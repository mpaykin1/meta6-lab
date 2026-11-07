// META BOT v1 — read-only observations from Twilight Isle Classic's existing __isle debug handle.
// No gameplay mutation, no invented achievements or additional world generation.
(() => {
  'use strict';
  let lastWorld = null;
  let lastHash = '';
  function actualLayout(world, biome) {
    if (!world) return '';
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
      for (const p of [world.spawn, world.ring, world.beacon]) {
        if (!p) continue;
        h = Math.imul(h ^ (Math.floor(p.x * 10) | 0), 16777619);
        h = Math.imul(h ^ (Math.floor(p.z * 10) | 0), 16777619);
      }
      lastHash = (h >>> 0).toString(16);
    }
    return String(biome || '') + ':' + lastHash;
  }
  const bot = Object.freeze({
    version: 1,
    info() { return { name: 'Twilight Isle Classic', levels: 1 }; },
    state() {
      const b = window.__isle;
      const g = b?.G, p = b?.player, world = b?.world;
      if (!g || !p || !world) {
        return {
          started: false, level: 0, levelDone: false, gameDone: false,
          alive: true, hero: { x: 0, y: 0 }, goal: null,
          enemies: 0, weapons: 0, layoutHash: '', menuOpen: true
        };
      }
      const playing = g.state === 'play', won = g.state === 'victory';
      let target = null;
      if (playing) {
        if (g.all) {
          const warden = g.warden;
          const alive = warden?.hp > 0 && warden.state !== 'dissolve';
          target = alive ? warden.segs?.[0] : world.ring;
        } else {
          let best = Infinity;
          for (const coin of b.coins || []) {
            if (!coin.alive) continue;
            const dist = (coin.x - p.pos.x) ** 2 + (coin.z - p.pos.z) ** 2;
            if (dist < best) { best = dist; target = coin; }
          }
        }
      }
      let enemies = 0;
      for (const foe of b.foes || []) if (foe.hp > 0 && foe.state !== 'dissolve') enemies++;
      return {
        started: !['loading', 'title'].includes(g.state),
        level: 0, levelDone: won, gameDone: won,
        alive: g.state !== 'dead' && p.hp > 0,
        hero: { x: p.pos.x, y: p.pos.z },
        goal: target ? { x: target.x, y: target.z } : null,
        enemies,
        weapons: Array.isArray(b.combat?.arsenal) ? b.combat.arsenal.length : 0,
        layoutHash: actualLayout(world, g.biome),
        menuOpen: g.state === 'title' || g.state === 'loading' || g.state === 'paused',
        // Direct game counters only: actual coins collected, plus the actual defeated boss.
        progress: (g.collected | 0) + (g.wardenDown ? 1 : 0),
        hp: p.maxHp > 0 ? p.hp / p.maxHp : 0,
        cameraYaw: b.rig?.yaw || 0
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot, writable: false, configurable: false, enumerable: false
  });
})();
