// Read-only META BOT adapter: every value comes from the live Archer game.
// No artificial level advancement, hit counts, death suppression or inputs.
(() => {
  'use strict';
  let lastLevel = -1;
  let encounterHash = 'not-started';
  const buttonCenter = id => {
    const element = document.getElementById(id);
    if (!element || element.hidden || element.disabled) return null;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : null;
  };
  const bot = Object.freeze({
    version: 1,
    info() {
      // Seven authored weather themes form the first diagnostic circuit.
      // The actual game is endless; do not report a fabricated ending.
      return { name: 'Archer in the Fog', levels: 7 };
    },
    state() {
      const a = window.__A, g = a?.G;
      const hero = a?.archer?.root?.position;
      const dragon = a?.dragon;
      const target = dragon?.root?.position;
      if (!g || !hero || !target) {
        return {
          started: false, level: 0, levelDone: false, gameDone: false,
          alive: true, hero: { x: 0, y: 0 }, goal: null,
          enemies: 0, weapons: 0, layoutHash: encounterHash,
          menuOpen: true, progress: 0, hp: 0, cameraYaw: 0
        };
      }
      const level = Math.max(0, g.level - 1);
      const playing = g.mode === 'play';
      if (!playing) {
        // initWorld() runs again after Play; never hash the pre-menu arena.
        lastLevel = -1;
        encounterHash = 'not-started';
      } else if (level !== lastLevel) {
        lastLevel = level;
        // The game's actual randomized tower seed, orbit and physical spawn.
        encounterHash = [
          g.level, a.sceneSeed, g.orbitDir,
          hero.x.toFixed(2), hero.y.toFixed(2), hero.z.toFixed(2),
          target.x.toFixed(2), target.y.toFixed(2), target.z.toFixed(2)
        ].join(':');
      }
      const alive = playing && !g.dead && g.phase !== 'over';
      const cam = a.camera;
      const project = point => {
        if (!cam || !point) return null;
        const view = hero.clone().set(point.x, point.y, point.z).project(cam);
        const x = (view.x + 1) * innerWidth * 0.5;
        const y = (1 - view.y) * innerHeight * 0.5;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return { x, y, visible: view.z > -1 && view.z < 1 &&
          x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight };
      };
      const travel = Math.min(0.65, hero.distanceTo(target) / 62);
      const anticipated = target.clone().addScaledVector(dragon.vel, travel);
      const aimScreen = project(anticipated);
      let fireballScreen = null;
      if (g.task === 'fire') {
        // Incoming projectiles can be unordered. Prioritize the nearest
        // visible threat instead of whichever projectile was spawned first.
        let nearestDistance = Infinity;
        for (const f of a.incoming || []) {
          const distance = Math.hypot(f.x - hero.x, f.y - hero.y, f.z - hero.z);
          const lead = Math.min(0.25, distance / 62);
          const candidate = project({
            x: f.x + f.vx * lead, y: f.y + f.vy * lead, z: f.z + f.vz * lead
          });
          if (candidate?.visible && distance < nearestDistance) {
            nearestDistance = distance;
            fireballScreen = candidate;
          }
        }
      }
      return {
        started: playing,
        level,
        // These flags come from the real retreat and never fake a win.
        levelDone: g.phase === 'retreat' && g.hits >= g.need,
        gameDone: false, // The original game has no finite ending.
        alive,
        hero: { x: hero.x, y: hero.z },
        goal: null, // Stationary archer: dragon is a moving combat target, not a walkable goal.
        enemies: alive && g.phase !== 'retreat' ? 1 : 0,
        weapons: alive ? 1 : 0,
        layoutHash: encounterHash,
        menuOpen: !playing || !!g.paused || g.phase === 'over' ||
          !document.getElementById('menu')?.classList.contains('hide') ||
          !document.getElementById('shop')?.classList.contains('hide'),
        progress: Number(g.hits) || 0,
        hp: Math.max(0, Number(g.lives) || 0) / 3,
        cameraYaw: Math.atan2(g.camDir.x, g.camDir.z),
        task: g.task,
        phase: g.phase,
        aimScreen,
        fireballScreen,
        startScreen: !playing ? buttonCenter('bPlay') : null,
        reviveScreen: !alive ? buttonCenter('bRevive') : null
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot, writable: false, configurable: false, enumerable: false
  });
})();
