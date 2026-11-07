// META BOT v1: immutable, read-only adapter for the actual Twilight Isles world.
// No cheats or controls; all values are observed from live __isle.
(() => {
  'use strict';
  const info = () => Object.freeze({name:'Twilight Isles 2',levels:1});
  const point = v => v && Number.isFinite(v.x) && Number.isFinite(v.z)
    ? {x:v.x,y:v.z} : null;
  const state = () => {
    const api=window.__isle;
    if (!api || !api.world || !api.G || !api.player) {
      return {started:false,level:0,levelDone:false,gameDone:false,
        alive:true,hero:{x:0,y:0},goal:null,enemies:0,weapons:0,
        layoutHash:'not-loaded',menuOpen:false,progress:0,hp:1,cameraYaw:0};
    }
    const g=api.G,p=api.player,world=api.world,coins=api.coins||[];
    const ended=g.state==='victory',playing=g.state==='play';
    const hero=point(p.pos)||{x:0,y:0};
    const living=(api.foes||[]).filter(f=>f&&f.hp>0&&f.state!=='dissolve'&&f.state!=='dead'&&f.segs?.[0]);
    let goal=null,best=Infinity;
    if (!g.all) {
      for (const c of coins) if (c.alive) {
        const d=Math.hypot(c.x-hero.x,c.z-hero.y);
        if (d<best) {best=d;goal=point(c);}
      }
    } else if (!g.wardenDown && g.warden && g.warden.hp>0 && g.warden.segs?.[0]) {
      goal=point(g.warden.segs[0]);
    } else {
      goal=point(world.ring)||point(world.beacon);
    }
    let nearestEnemy=null,nearestDistance=Infinity;
    for (const f of living) {
      const at=point(f.segs[0]);
      if (!at) continue;
      const d=Math.hypot(at.x-hero.x,at.y-hero.y);
      if (d<nearestDistance) {nearestDistance=d;nearestEnemy=at;}
    }
    const collected=Number(g.collected)||0,total=Number(g.total)||20;
    // Progress uses actual pickups, guardian defeat and victory; never a synthetic win.
    const progress=ended?1:Math.min(0.85,0.85*collected/Math.max(1,total))+(g.wardenDown?0.1:0);
    return {
      started:playing||g.state==='paused'||g.state==='dead'||ended,
      level:0,levelDone:ended,gameDone:ended,
      alive:g.state!=='dead'&&p.hp>0,
      hero,goal,enemies:living.length,
      weapons:Array.isArray(api.combat?.arsenal)?api.combat.arsenal.length:0,
      layoutHash:String(g.seed)+'|'+String(g.biome),
      menuOpen:g.state==='paused',
      progress:Math.min(1,progress),
      hp:(Number(p.hp)||0)/Math.max(1,Number(p.maxHp)||1),
      cameraYaw:Number(api.rig?.yaw)||0,
      nearestEnemy,nearestEnemyDistance:nearestDistance
    };
  };
  const bot=Object.freeze({version:1,info,state});
  Object.defineProperty(window,'__META_BOT__',{value:bot,writable:false,configurable:false});
})();
