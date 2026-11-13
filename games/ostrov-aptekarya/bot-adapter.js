// Ручка META BOT (scripts/meta-bot/CONTRACT.md) — ТОЛЬКО читает состояние «Острова последнего аптекаря».
// Уровень 0 — поход в лес, уровень 1 — погоня, уровень 2 — скрытность в архиве.
(function () {
  'use strict';
  const A = () => window.__APTEKAR__;
  window.__META_BOT__ = Object.freeze({
    version: 1,
    info() { return {name: 'Остров последнего аптекаря · Главы I–II', levels: 3}; },
    state() {
      const a = A();
      if (!a || !a.heroPos) return {started: false, level: 0, levelDone: false, gameDone: false, alive: true, hero: {x: 0, y: 0}, goal: null, enemies: 0, weapons: 0, layoutHash: '', menuOpen: false};
      const st = a.state, archive = ['archive', 'archiveCaught', 'chapter2End'].includes(st);
      const chase = ['tell', 'chase', 'grab', 'caught', 'outro', 'ending'].includes(st);
      const level = archive ? 2 : chase ? 1 : 0, p = a.heroPos();
      return {
        started: st !== 'title', level,
        levelDone: level === 1 ? a.chapter1Ended : level === 2 ? a.ended : false,
        gameDone: a.ended,
        alive: true, hero: {x: p.x, y: p.z}, goal: a.goal(),
        enemies: ['chase', 'lunge', 'grab', 'tell', 'stun', 'rise', 'sleepwalk'].includes(a.girl) ? 1 : 0,
        weapons: a.charges > 0 ? 1 : 0, layoutHash: a.layoutHash + ':' + level,
        menuOpen: a.menuOpen, progress: a.progress,
        chapter: a.chapter, archivePages: a.archivePages, archiveDoors: a.archiveDoors
      };
    }
  });
})();
