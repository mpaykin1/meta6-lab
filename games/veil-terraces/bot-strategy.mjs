// Real player controls, using the existing shared core's calibrated path finding.
// Short inputs near memories prevent one held gesture from crossing two levels.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(1500);
  }
}
export async function playLevel(ctx, level) {
  let previousGoal = null;
  let bestDistance = Infinity;
  let improvingAt = Date.now();
  let detours = 0;
  // The game temporarily locks input when collecting a memory; let it settle.
  await ctx.wait(350);
  while (true) {
    const state = ctx.state();
    if (state.level !== level || state.levelDone || state.gameDone) return;
    if (!state.alive) {
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
        // A terrace lip can trap the hero even within 3 units of a memory.
        // Sidestep at any distance outside the actual 1.35-unit pickup zone.
        if (distance > 1.35) {
          const side = detours++ % 2 ? -1 : 1;
          await ctx.joystick(side, 0, 420);
          if (ctx.state().level !== level) return;
        }
        await ctx.jump();
        if (ctx.state().level !== level) return;
        improvingAt = Date.now();
      }
      // Each near-goal input is shorter than the interval needed to cross
      // the next memory: the core checks the real state between gestures.
      await ctx.walkToGoal(distance < 3.5 ? 110 : 350);
      if (ctx.state().level !== level) return;
    } else if (ctx.mobile) {
      await ctx.key('Space', 100);
      if (ctx.state().level !== level) return;
      await ctx.wait(150);
    } else {
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
