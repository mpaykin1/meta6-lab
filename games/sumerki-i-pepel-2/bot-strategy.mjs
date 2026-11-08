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
    // The public META BOT state contains an enemy count, not enemy positions.
    // Jump at a nearby real target to reach raised voxel platforms.
    if (s.goal) {
      const h = s.hero || s.player;
      const distance = Math.hypot(s.goal.x - h.x, s.goal.y - h.y);
      if (distance < 2.0) await ctx.jump();
    }
    if (s.goal) await ctx.walkToGoal(450);
    else { await ctx.key('Space', 90); await ctx.wait(200); }
  }
}
