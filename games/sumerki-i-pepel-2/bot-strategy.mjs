// Controls only: never mutates gameplay state or reports synthetic progress.
// The game still requires an independently verified read-only __META_BOT__ adapter.
const point = p => p && Number.isFinite(p.x) && Number.isFinite(p.z) ? p : null;
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state()?.started) {
    await ctx.key('Enter',80);
    await ctx.wait(800);
  }
}
export async function playLevel(ctx,level) {
  let step=0;
  for (;;) {
    const s=ctx.state();
    if (!s || s.gameDone || s.levelDone || s.level>level) return;
    if (!s.alive) { await ctx.wait(300); continue; }
    const hero=point(s.hero);
    const enemies=Array.isArray(s.enemies)?s.enemies.filter(point):[];
    const nearest=hero?enemies.sort((a,b)=>distance(hero,a)-distance(hero,b))[0]:null;
    const d=nearest&&hero?distance(hero,nearest):Infinity;
    if (nearest && d<6 && Number(s.hp)<0.35) {
      // Retreat using real directional controls, not teleportation.
      const key=Math.abs(hero.x-nearest.x)>Math.abs(hero.z-nearest.z)
        ? (hero.x>=nearest.x?'KeyD':'KeyA') : (hero.z>=nearest.z?'KeyS':'KeyW');
      await ctx.key(key,300);
    } else if (nearest && d<2.5) {
      await ctx.key('Space',120);
    } else if (point(s.goal) && typeof ctx.walkToGoal==='function') {
      await ctx.walkToGoal(450);
    } else {
      // Exploration through normal keyboard input; occasional real jump.
      const keys=['KeyW','KeyD','KeyS','KeyA'];
      await ctx.key(keys[Math.floor(step/6)%keys.length],350);
      if (step%7===0) await ctx.key('Space',80);
    }
    step++;
  }
}
