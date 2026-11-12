// Rule 13: read-only META BOT observer for the existing Sumerki engine.
(() => {
  'use strict';

  function state() {
    const engine = window.__isle;
    if (!engine || !engine.world) throw new Error('META BOT: game world is not loaded');

    const { G, player, world } = engine;
    const p = player.pos;
    let target = null;
    let nearestSquared = Infinity;
    for (const coin of engine.coins) {
      if (!coin.alive) continue;
      const distanceSquared = (p.x - coin.x) ** 2 + (p.z - coin.z) ** 2;
      if (distanceSquared < nearestSquared) {
        nearestSquared = distanceSquared;
        target = coin;
      }
    }
    // Follow the game's own nearestGoal() progression: coins -> live guardian -> victory ring.
    if (G.all || G.collected >= G.total) {
      const guardian = G.warden;
      target = guardian && guardian.hp > 0 && guardian.state !== 'dissolve'
        ? guardian.segs?.[0] : world.ring;
    } else if (!target) {
      throw new Error('META BOT: missing collectible before the collection stage is complete');
    }
    if (!target || ![target.x, target.y, target.z].every(Number.isFinite)) {
      throw new Error('META BOT: no valid live goal');
    }

    const won = G.state === 'victory';
    const stage = won || G.collected >= G.total ? 2 : 1;
    const buttons = Array.from(document.querySelectorAll('button'))
      .filter(button => !button.hidden && !button.disabled && button.getClientRects().length > 0)
      .map(button => button.id || button.getAttribute('aria-label') || 'button');

    return {
      started: ['play', 'paused', 'victory', 'dead'].includes(G.state),
      level: 0,
      levels: 1,
      stage,
      stagesTotal: 2,
      stageDone: won,
      levelDone: won,
      gameDone: won,
      alive: G.state !== 'dead' && player.hp > 0,
      hero: { x: p.x, y: p.y, z: p.z },
      goal: { x: target.x, y: target.y, z: target.z },
      buttons,
      enemies: engine.foes.filter(foe => foe.hp > 0 && foe.state !== 'dissolve').length,
      weapons: engine.combat.arsenal.length,
      layoutHash: [G.seed, G.biome, world.coins.length].join(':'),
      menuOpen: G.state === 'title' || G.state === 'paused',
      progress: G.collected + G.kills / 100,
      cameraYaw: engine.rig.yaw
    };
  }

  const observer = Object.freeze({
    version: 1,
    info() { return { name: 'sumerki-i-pepel-2-copy', levels: 1, stagesTotal: 2 }; },
    state
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: observer,
    writable: false,
    configurable: false
  });
})();
