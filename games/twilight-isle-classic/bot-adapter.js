// META GAMES only. Read the accepted island's real runtime; never write to it.
(() => {
  'use strict';
  const bot = Object.freeze({
    version: 1,
    info() {
      return { name: 'Twilight Isle Classic', levels: 1 };
    },
    state() {
      const isle = window.__isle;
      const game = isle?.G;
      const player = isle?.player;
      const pos = player?.pos;
      const hero = { x: pos?.x ?? 0, y: pos?.z ?? 0 };
      const state = game?.state ?? 'loading';
      const coins = isle?.coins ?? [];
      const foes = isle?.foes ?? [];
      const arsenal = isle?.combat?.arsenal ?? [];
      let nearestCoin = null;
      let nearestCoinD = Infinity;
      for (const coin of coins) {
        if (!coin.alive) continue;
        const d = Math.hypot(coin.x - hero.x, coin.z - hero.y);
        if (d < nearestCoinD) {
          nearestCoinD = d;
          nearestCoin = coin;
        }
      }
      let nearestEnemy = null;
      let nearestEnemyD = Infinity;
      let livingEnemies = 0;
      for (const foe of foes) {
        if (!(foe.hp > 0) || foe.state === 'dissolve') continue;
        const head = foe.segs?.[0];
        if (!head) continue;
        livingEnemies++;
        const d = Math.hypot(head.x - hero.x, head.z - hero.y);
        if (d < nearestEnemyD) {
          nearestEnemyD = d;
          nearestEnemy = { x: head.x, y: head.z, distance: d };
        }
      }
      const warden = game?.warden;
      const bossAlive = Boolean(warden && warden.hp > 0 && warden.state !== 'dissolve');
      const head = bossAlive ? warden.segs?.[0] : null;
      const ring = isle?.world?.ring;
      const objective = game?.all
        ? (head ?? ring)
        : nearestCoin;
      const goal = objective
        ? { x: objective.x, y: objective.z }
        : null;
      const total = Math.max(1, game?.total ?? 1);
      const collected = Math.max(0, game?.collected ?? 0);
      // Only observed coin pickups and actual warden health contribute.
      const coinFraction = Math.min(1, collected / total);
      const bossFraction = game?.wardenDown
        ? 1
        : bossAlive && warden.maxHp > 0
          ? Math.max(0, Math.min(1, 1 - warden.hp / warden.maxHp))
          : 0;
      const won = state === 'victory';
      // The ordinary free-revive button appears after the game's real death
      // animation. Expose only its on-screen coordinates, never call its handler.
      let reviveButton = null;
      if (state === 'dead') {
        const btn = document.getElementById('btnRevive');
        const end = document.getElementById('scrEnd');
        if (btn && end && !end.hidden && !btn.hidden && !btn.disabled) {
          const rect = btn.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            reviveButton = {
              x: rect.left + rect.width * 0.5,
              y: rect.top + rect.height * 0.5
            };
          }
        }
      }
      return {
        started: state !== 'title' && state !== 'loading',
        level: 0,
        levelDone: won,
        gameDone: won,
        alive: state !== 'dead' && (player?.hp ?? 1) > 0,
        hero,
        goal,
        enemies: livingEnemies,
        weapons: arsenal.length,
        layoutHash: game ? String(game.biome) + ':' + String(game.seed) : 'loading',
        menuOpen: state === 'title' || state === 'paused' || state === 'dead' || won,
        progress: won ? 1 : Math.min(0.99, 0.8 * coinFraction + 0.19 * bossFraction),
        hp: player?.maxHp > 0 ? player.hp / player.maxHp : 1,
        cameraYaw: isle?.rig?.yaw ?? 0,
        nearestEnemy,
        reviveButton
      };
    }
  });
  Object.defineProperty(window, '__META_BOT__', {
    value: bot,
    writable: false,
    configurable: false
  });
})();
