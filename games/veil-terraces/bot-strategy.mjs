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
  // Track real approach progress; detour before the core's 20-second stuck alarm.
  let previousGoal = null;
  let bestDistance = Infinity;
  let improvingAt = Date.now();
  let detours = 0;
  while (true) {
    const state = ctx.state();
    if (state.level !== level || state.levelDone || state.gameDone) return;
    if (!state.alive) {
      // Let the game handle its real respawn; the core still detects prolonged death.
      await ctx.wait(300);
      continue;
    }
    if (state.goal) {
      const { goal, hero } = state;
      const distance = Math.hypot(goal.x - hero.x, goal.y - hero.y);
      if (!previousGoal || Math.hypot(goal.x - previousGoal.x, goal.y - previousGoal.y) > 1) {
        previousGoal = { x: goal.x, y: goal.y };
        bestDistance = distance;
        improvingAt = Date.now();
        detours = 0;
      }
      if (distance < bestDistance - 0.12) {
        bestDistance = distance;
        improvingAt = Date.now();
      }
      if (Date.now() - improvingAt > 4200) {
        // A real sideways joystick movement can go around an intervening terrace.
        // Keep detecting a genuine level transition between every input.
        const side = detours++ % 2 ? -1 : 1;
        await ctx.joystick(side, 0, 620);
        if (ctx.state().level !== level) return;
        await ctx.jump();
        if (ctx.state().level !== level) return;
        improvingAt = Date.now();
      }
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
