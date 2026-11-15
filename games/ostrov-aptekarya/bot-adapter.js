// Read-only META BOT adapter. Levels I (0 herbs, 1 water, 2 chase) are preserved; archive is level 3.
(function () {
  'use strict';
  const A = () => window.__APTEKAR__;
  window.__META_BOT__ = Object.freeze({
    version: 1,
    info() { return {name: 'Остров последнего аптекаря · Главы I–II', levels: 4}; },
    state() {
      const ap = A();
      if (!ap || !ap.heroPos) return {started:false,level:0,levelDone:false,gameDone:false,
        alive:true,hero:{x:0,y:0},goal:null,enemies:0,weapons:0,layoutHash:'',menuOpen:false};
      const st=ap.state;
      const archive=['archive','archiveCaught','chapter2End'].includes(st);
      const chase=['tell','chase','grab','caught','outro','ending'].includes(st);
      const level=archive?3:chase?2:ap.stage>=2?1:0;
      const p=ap.heroPos();
      return {
        started:st!=='title',level,
        levelDone:level===2?ap.chapter1CardReady:level===3?ap.ended:false,
        gameDone:ap.ended,alive:true,hero:{x:p.x,y:p.z},goal:ap.goal(),
        enemies:['chase','lunge','grab','tell','stun','rise','sleepwalk'].includes(ap.girl)?1:0,
        weapons:ap.charges>0?1:0,layoutHash:ap.layoutHash+':'+level,
        menuOpen:ap.menuOpen,progress:ap.progress,chapter:ap.chapter,
        chapter1CardReady:ap.chapter1CardReady,archivePages:ap.archivePages,archiveDoors:ap.archiveDoors
      };
    }
  });
})();
