// Ручка META BOT (scripts/meta-bot/CONTRACT.md) — ТОЛЬКО читает состояние «Острова последнего аптекаря».
// Уровни для бота = настоящие этапы главы: 0 — травы, 1 — сонник и вода, 2 — погоня до двери аптеки.
(function () {
  'use strict';
  const A = () => window.__APTEKAR__;
  window.__META_BOT__ = Object.freeze({
    version: 1,
    info() { return {name: 'Остров последнего аптекаря · Глава I', levels: 3}; },
    state() {
      const a = A();
      if (!a || !a.heroPos) return {started: false, level: 0, levelDone: false, gameDone: false, alive: true, hero: {x: 0, y: 0}, goal: null, enemies: 0, weapons: 0, layoutHash: '', menuOpen: false};
      const st = a.state, chase = ['tell', 'chase', 'grab', 'caught', 'outro', 'ending'].includes(st);
      const level = chase ? 2 : a.stage >= 2 ? 1 : 0, p = a.heroPos();
      return {
        started: st !== 'title', level, levelDone: level < 2 ? false : a.ended, gameDone: a.ended,
        alive: true, hero: {x: p.x, y: p.z}, goal: a.goal(),
        enemies: ['chase', 'lunge', 'grab', 'tell', 'stun', 'rise'].includes(a.girl) ? 1 : 0,
        weapons: a.charges > 0 ? 1 : 0, layoutHash: a.layoutHash + ':' + level, menuOpen: a.menuOpen, progress: a.progress
      };
    }
  });
})();
