// Read-only META BOT adapter for the actual Archer in the Fog game state.
// The original bundle exposes window.__A; no fake progression or input hooks.
(() => {
  'use strict';
  let lastLevel = -1;
  let encounterHash = 'not-loaded';
  const bot = Object.freeze({
    version: 1,
    info() {
      // Seven authored weather themes; later rounds in this game continue endlessly.
      return { name: 'Archer in the Fog', levels: 7 };
    },
    state() {
      const a = window.__A;
      const g = a && a.G;
      const hero = a && a.archer && a.archer.root && a.archer.root.position;
      const dragon = a && a.dragon;
      const target = dragon && dragon.root && dragon.root.position;
      if (!g || !hero || !target) {
        return {
          started: false, level: 0, levelDone: false, gameDone: false,
          alive: true, hero: { x: 0, y: 0 }, goal: null,
          enemies: 0, weapons: 0, layoutHash: encounterHash,
          menuOpen: true, progress: 0, hp: 0, cameraYaw: 0
        };
      }
      const level = Math.max(0, g.level - 1);
      if (level !== lastLevel) {
        lastLevel = level;
        // Actual tower/dragon spawn and chosen orbit direction; snapshot only once.
        // No randomized or manufactured hash value.
        encounterHash = [
          g.level,
          hero.x.toFixed(2), hero.y.toFixed(2), hero.z.toFixed(2),
          target.x.toFixed(2), target.y.toFixed(2), target.z.toFixed(2),
          g.orbitDir
        ].join(':');
      }
      const playing = g.mode === 'play';
      const alive = playing && !g.dead && g.phase !== 'over';
      let aimScreen = null;
      const cam = a.camera;
      if (cam && dragon.vel && typeof target.clone === 'function') {
        const flight = Math.min(0.65, hero.distanceTo(target) / 38);
        const projected = target.clone().addScaledVector(dragon.vel, flight).project(cam);
        const x = (projected.x + 1) * innerWidth / 2;
        const y = (1 - projected.y) * innerHeight / 2;
        if (Number.isFinite(x) && Number.isFinite(y)) {
          aimScreen = { x, y, visible: projected.z > -1 && projected.z < 1 &&
            x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight };
        }
      }
      return {
        started: playing,
        level, levelDone: false, gameDone: false, // Real game is endless.
        alive,
        hero: { x: hero.x, y: hero.z },
        goal: { x: target.x, y: target.z },
        enemies: alive ? 1 : 0, // One visible dragon encounter.
        weapons: 1,             // One active bow at a time.
        layoutHash: encounterHash,
        menuOpen: !playing || !!g.paused ||
          !document.getElementById('menu').classList.contains('hide'),
        progress: g.hits,       // Hits the game itself awarded this round.
        hp: Math.max(0, Number(g.lives || 0)) / 3,
        cameraYaw: Math.atan2(g.camDir.x, g.camDir.z),
        aimScreen, phase: g.phase
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot, writable: false, configurable: false
  });
})();
