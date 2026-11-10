/* META BOT v1: read-only view of the actual Sunken City runtime.
 * All progress and positions come from the owner's playable city, never from the runner. */
(() => {
  'use strict';
  const runtime = () => window.__sunken || null;
  const xyz = v => v && Number.isFinite(v.x) && Number.isFinite(v.z)
    ? {x:v.x,y:v.z} : null;
  const state = () => {
    const s=runtime();
    const bathy=s?.SPOTS?.bathy?.position;
    const hero=xyz(bathy) || {x:0,y:0};
    const carrying=s?.GS?.carry?.length || 0;
    const banked=s?.GS?.banked || 0;
    const won=!!s?.SAVE?.data?.won && banked>=30;
    const relics=(s?.REALM?.relics || []).filter(r=>r?.p && !s.REALM.found.has(r.key));
    const nearest=relics.reduce((best,r)=>{
      const d=Math.hypot(r.p.x-hero.x,r.p.z-hero.y);
      return !best||d<best.d?{d,p:r.p}:best;
    },null);
    const home={x:0,y:-7};
    const goal=won?null:carrying>0?home:nearest?xyz(nearest.p):null;
    const layout=(s?.REALM?.active || []).map(c=>c.key).filter(Boolean).slice(0,12).join('|');
    return {
      started:!!s && s.G.mode==='pilot',
      level:0,levelDone:won,gameDone:won,
      alive:!!s && s.GS.dead<=0 && s.GS.hull>0,
      hero,goal,
      enemies:s?Number(!!s.SPOTS.angler):0,
      weapons:s?1:0,
      layoutHash:layout || 'world-loading',
      menuOpen:!!document.getElementById('menu') && !document.getElementById('menu').hidden,
      progress:banked
    };
  };
  Object.defineProperty(window,'__META_BOT__',{
    value:Object.freeze({version:1,info:()=>({name:'Затонувший город',levels:1}),state}),
    writable:false,configurable:false,enumerable:false
  });
})();
