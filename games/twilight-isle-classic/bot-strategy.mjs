// Traverse the real island; only real keyboard/pointer/joystick inputs.
export async function start(ctx) {
  await ctx.wait(1000);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height * .72);
    await ctx.wait(600);
  }
  if (!ctx.state().started) {
    await ctx.key('Enter', 100);
    await ctx.wait(1100);
  }
}
export async function playLevel(ctx, level) {
  let steps = 0;
  for (;;) {
    const s = ctx.state();
    if (s.level !== level || s.levelDone || s.gameDone) return;
    if (!s.alive) { await ctx.wait(300); continue; }
    if (steps % 5 === 4) await ctx.jump();
    if (s.enemies > 0 && steps % 3 === 2) {
      if (ctx.mobile) await ctx.tap(ctx.viewport.width * .81, ctx.viewport.height * .80);
      else await ctx.key('KeyJ', 100);
    }
    if (s.goal) await ctx.walkToGoal(430);
    else await ctx.wait(200);
    steps++;
  }
}
