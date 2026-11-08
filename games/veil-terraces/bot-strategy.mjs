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
    } else {
      // Explore with real movement when a level temporarily has no exposed goal.
      // Alternate short lateral sweeps; do not mutate the game's state or progress.
      const direction = Math.floor(Date.now() / 1200) % 2 ? 'KeyA' : 'KeyD';
      await ctx.key('KeyW', 180);
      await ctx.key(direction, 120);
      await ctx.key('Space', 80);
      await ctx.wait(150);
    }
  }
}
