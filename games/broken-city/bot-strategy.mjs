// Drives real controls only; never changes progress, health, or level state.
// Broken City starts through the on-screen #playBtn, not the Enter key.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(1500);
  }
}

export async function playLevel(ctx, level) {
  let explorationStep = 0;
  for (;;) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) {
      // Wait for the real death/retry state; do not fake a restart.
      await ctx.wait(300);
      continue;
    }
    if (s.goal && Number.isFinite(s.goal.x) && Number.isFinite(s.goal.z)) {
      await ctx.walkToGoal(450);
      continue;
    }
    // No visible goal: explore with the actual game's keyboard bindings.
    const directions = ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
    await ctx.key(directions[Math.floor(explorationStep / 4) % directions.length], 300);
    if (explorationStep % 3 === 0) await ctx.key('Space', 80);
    explorationStep++;
  }
}
