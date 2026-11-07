// Archer in the Fog: observe the live bundled game only. Never advance gameplay.
(() => {
  'use strict';
  const fighting = new Set(['intro', 'fight', 'windup', 'dive', 'tail', 'spin', 'plunge', 'ambush', 'stagger']);
  const bot = Object.freeze({
    version: 1,
    info() {
      // The source has an endless tower loop; ten stages are a bounded diagnostic circuit,
      // not an assertion that the entire endless game has an ending.
      return { name: 'Archer in the Fog — first ten encounters', levels: 10 };
    },
    state() {
      const a = window.__A;
      const g = a?.G;
      const p = a?.archer?.root?.position;
      const owned = a?.SAVE?.owned;
      if (!g || !p) {
        return {
          started: false, level: 0, levelDone: false, gameDone: false,
          alive: true, hero: { x: 0, y: 0 }, goal: null, enemies: 0,
          weapons: 0, layoutHash: 'loading', menuOpen: true, progress: 0
        };
      }
      const phase = String(g.phase || '');
      const started = g.mode === 'play';
      const alive = started && !g.dead && phase !== 'over';
      return {
        started,
        level: Math.max(0, (Number(g.level) || 1) - 1),
        levelDone: phase === 'retreat' && Number(g.hits) >= Number(g.need),
        // No finite victory state exists in the original endless game.
        gameDone: false,
        alive,
        hero: { x: Number(p.x), y: Number(p.z) },
        goal: null, // The dragon is airborne; walking to its world position is not a gameplay action.
        enemies: started && fighting.has(phase) ? 1 : 0,
        weapons: Array.isArray(owned) ? owned.length : 0,
        // Real fight setup: tower, level, temperament and randomized orbit direction.
        layoutHash: [g.level, g.depth, g.temp || '', g.orbitDir || 0].join(':'),
        menuOpen: !started || !!g.paused || phase === 'over',
        progress: Math.max(0, Number(g.hits) || 0),
        hp: Math.max(0, Number(g.lives) || 0) / 3
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot, writable: false, configurable: false, enumerable: false
  });
})();