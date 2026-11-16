// Read-only META BOT v1 adapter for the first dragon duel.
// Only reads real, public game state; never drives the player or modifies gameplay.
(() => {
  'use strict';

  let openingLayout = null;
  let sawCombat = false;
  function game() { return window.__A || null; }

  const adapter = Object.freeze({
    version: 1,
    info() {
      // The game continues indefinitely; one completed duel is one bot cycle.
      return { name: 'Archer in the Fog — first duel', levels: 1 };
    },
    state() {
      const a = game();
      const g = a?.G;
      const p = a?.archer?.root?.position;
      const dragon = a?.dragon?.root?.position;
      const tower = a?.tower;
      const started = !!g && (g.mode === 'play' || g.mode === 'over');
      if (!started) {
        openingLayout = null;
        sawCombat = false;
      }
      if (started && g.level === 1 && !openingLayout && p && tower?.origin &&
          Array.isArray(tower.blocks) && tower.blocks.length) {
        // Hash only the actual procedurally generated blocks, once per duel.
        // The starting tower origin is fixed, but its block layout is NOT.
        let hash = 2166136261;
        for (const block of tower.blocks) {
          for (const value of [block.x, block.y, block.z, block.s, block.t]) {
            hash ^= value | 0;
            hash = Math.imul(hash, 16777619);
          }
        }
        openingLayout = [
          tower.origin.x, tower.origin.y, tower.origin.z,
          tower.size, tower.blocks.length, hash >>> 0
        ].join(':');
      }
      if (started && g.phase === 'fight') sawCombat = true;
      const won = !!g && (g.level > 1 || (sawCombat && g.phase === 'retreat'));
      const hp = Number(g?.lives ?? 0);
      return Object.freeze({
        started,
        level: 0,
        levelDone: won,
        gameDone: won,
        alive: started && g?.mode !== 'over' && hp > 0 && !g.dead,
        hero: { x: p?.x ?? 0, y: p?.z ?? 0 },
        goal: started && dragon ? { x: dragon.x, y: dragon.z } : null, // Genuine moving dragon target.
        enemies: started && !won && g?.mode !== 'over' ? 1 : 0,
        weapons: Array.isArray(a?.SAVE?.owned) ? Math.max(1, a.SAVE.owned.length) : 1,
        layoutHash: openingLayout || '',
        menuOpen: !!g?.paused || document.getElementById('gameQuickMenu')?.hidden === false,
        progress: Math.max(0, Number(g?.hits) || 0)
      });
    }
  });

  Object.defineProperty(window, '__META_BOT__', {
    value: adapter, writable: false, configurable: false
  });
})();
