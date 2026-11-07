// Gameplay-only controls: never manipulate __isle or progress.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter', 80);
    await ctx.wait(800);
  }
}
export async function playLevel(ctx, level) {
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) { await ctx.wait(300); continue; }
    const h = s.hero || s.player;
    const nearest = (s.enemies || []).reduce((a, e) => {
      const d = Math.hypot(e.x - h.x, e.z - h.z);
      return !a || d < a.distance ? { ...e, distance: d } : a;
    }, null);
    if (nearest && nearest.distance < 2.5) {
      await ctx.key('Space', 90);
    }
    if (s.goal) await ctx.walkToGoal(450);
    else { await ctx.key('Space', 90); await ctx.wait(200); }
  }
}
