// Drives real controls only. Never writes progress, health, or level state.
// The game must expose its actual read-only __META_BOT__ adapter separately.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter', 80);
    await ctx.wait(800);
  }
}

export async function playLevel(ctx, level) {
  let explorationStep = 0;
  for (;;) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) {
      // Let the harness detect a real death; never fake a restart.
      await ctx.wait(300);
      continue;
    }
    if (s.goal && Number.isFinite(s.goal.x) && Number.isFinite(s.goal.z)) {
      await ctx.walkToGoal(450);
      continue;
    }
    // No visible goal: explore with actual movement and periodic jumps.
    const directions = ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
    await ctx.key(directions[Math.floor(explorationStep / 4) % directions.length], 300);
    if (explorationStep % 3 === 0) await ctx.key('Space', 80);
    explorationStep++;
  }
}
