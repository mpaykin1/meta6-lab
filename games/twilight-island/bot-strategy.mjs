// Observer World V7: input-only gameplay, never set G/player/level or teleport.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter', 80);
    await ctx.wait(800);
  }
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(500);
  }
}

export async function playLevel(ctx, level) {
  let step = 0;
  let retries = 0;
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) {
      // A real "Again" UI restart is available after the death animation.
      // Use it at most once; otherwise let the core detect failure in 5 s.
      if (s.retryButton && retries < 1) {
        retries++;
        await ctx.tap(s.retryButton.x, s.retryButton.y);
      }
      await ctx.wait(300);
      continue;
    }
    const enemy = s.nearestEnemy;
    if (enemy && s.hp < 0.35 && enemy.distance < 6) {
      await ctx.joystick(step % 2 ? -1 : 1, 0.6, 300);
      await ctx.key('KeyJ', 110);
    } else if (enemy && enemy.distance < 2.5) {
      await ctx.key('KeyJ', 140);
    } else if (s.goal) {
      await ctx.walkToGoal(450);
      if (step % 5 === 4) await ctx.jump();
    } else {
      // Explore only through real player controls when no objective is visible.
      await ctx.joystick(Math.cos(step * 0.6), Math.sin(step * 0.6), 300);
      if (step % 4 === 0) await ctx.jump();
    }
    step++;
  }
}
