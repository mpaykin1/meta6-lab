// Input-only strategy. The original island provides a real coin/warden goal.
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
  let tick = 0;
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) { await ctx.wait(300); continue; }
    // Keyboard J is the original game's real attack binding, including on mobile.
    if (s.enemies > 0 && tick % 3 === 0) await ctx.key('KeyJ', 90);
    if (s.goal) {
      await ctx.walkToGoal(450);
      if (tick % 5 === 0) await ctx.jump();
    } else {
      await ctx.joystick(Math.sin(tick * 0.8), -0.85, 450);
      if (tick % 3 === 0) await ctx.jump();
    }
    tick++;
  }
}
