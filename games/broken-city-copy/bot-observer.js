// Rule 13: observe Broken City without moving the hero or changing the world.
(() => {
  'use strict';

  function state() {
    const engine = window.__G;
    if (!engine || !engine.G || !engine.heroState || !engine.LEVELS) {
      throw new Error('META BOT: Broken City is not initialized');
    }
    const { G, heroState, LEVELS } = engine;
    const level = Math.max(0, Math.min(LEVELS.length - 1, G.li));
    const config = G.cfg || LEVELS[level];
    const position = heroState.pos;
    if (!config || !position || ![position.x, position.y, position.z, config.goal].every(Number.isFinite)) {
      throw new Error('META BOT: missing hero or level goal');
    }

    // updateGame() completes a level when heroState.pos.z < config.goal + 6.
    const endpoint = config.goal + 6;
    const levelDone = (G.state === 'trans' && G.next > G.li) ||
      ((G.state === 'ending' || G.state === 'endwait') && Boolean(G.ending));
    const gameDone = (G.state === 'ending' || G.state === 'endwait') &&
      Boolean(G.ending) && level === LEVELS.length - 1;
    const distanceProgress = Math.max(0, Math.min(1, (4 - position.z) / (4 - endpoint)));
    const progress = (level + (levelDone ? 1 : distanceProgress)) / LEVELS.length;
    const buttons = Array.from(document.querySelectorAll('button'))
      .filter(button => !button.hidden && !button.disabled &&
        !button.classList.contains('hidden') && button.getClientRects().length > 0)
      .map(button => button.id || button.getAttribute('aria-label') || 'button');

    return {
      started: G.state !== 'title',
      level,
      levels: LEVELS.length,
      stage: level + 1,
      stagesTotal: LEVELS.length,
      stageDone: Boolean(levelDone),
      levelDone: Boolean(levelDone),
      gameDone: Boolean(gameDone),
      alive: G.state !== 'title',
      hero: { x: position.x, y: position.y, z: position.z },
      goal: { x: 0, y: 0, z: endpoint },
      enemies: config.shades || 0,
      weapons: 1,
      layoutHash: [config.mode, (config.gaps || []).join(','), (config.stations || []).join(','),
        config.cracks || 0].join(':'),
      menuOpen: Boolean(G.paused || G.state === 'title'),
      buttons,
      progress,
      mode: config.mode,
      checkpoint: G.check,
      caught: G.caught,
      energy: G.energy
    };
  }

  const api = Object.freeze({
    version: 1,
    info() {
      const engine = window.__G;
      return { name: 'broken-city-copy', levels: engine ? engine.LEVELS.length : 0 };
    },
    state
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: api,
    writable: false,
    configurable: false
  });
})();
