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
      const started = !!g && (g.mode === 'play' || g.mode === 'over');
      if (!started) {
        openingLayout = null;
        sawCombat = false;
      }
      if (started && g.level === 1 && !openingLayout && p && dragon) {
        // Capture world coordinates and the genuinely randomized attack direction.
        openingLayout = [
          p.x.toFixed(2), p.y.toFixed(2), p.z.toFixed(2),
          dragon.x.toFixed(2), dragon.z.toFixed(2), g.orbitDir
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
        goal: null, // Aim and defeat the dragon; no physical destination.
        enemies: started && !won && g?.mode !== 'over' ? 1 : 0,
        weapons: 1,
        layoutHash: openingLayout || '',
        menuOpen: !!g?.paused,
        progress: Math.max(0, Number(g?.hits) || 0)
      });
    }
  });

  Object.defineProperty(window, '__META_BOT__', {
    value: adapter, writable: false, configurable: false
  });
})();
