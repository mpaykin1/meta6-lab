// Real player controls, using the existing shared core's calibrated path finding.
// Read one consistent game snapshot per decision; never synthesize progress.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(1500);
  }
}
export async function playLevel(ctx, level) {
  while (true) {
    const state = ctx.state();
    if (state.level !== level || state.levelDone || state.gameDone) return;
    if (!state.alive) {
      // Let the game handle its real respawn; the core still detects prolonged death.
      await ctx.wait(300);
      continue;
    }
    if (state.goal) {
      // Re-evaluate the real goal and obstacles after a short navigation interval.
      await ctx.walkToGoal(450);
    } else if (ctx.mobile) {
      // Preserve the previously passing mobile input: chained movement crossed a level boundary.
      await ctx.key('Space', 100);
      await ctx.wait(150);
    } else {
      // Desktop-only exploration with real controls; recheck the level between inputs.
      const direction = Math.floor(Date.now() / 1200) % 2 ? 'KeyA' : 'KeyD';
      await ctx.key('KeyW', 180);
      if (ctx.state().level !== level) return;
      await ctx.key(direction, 120);
      if (ctx.state().level !== level) return;
      await ctx.key('Space', 80);
      await ctx.wait(150);
    }
  }
}
