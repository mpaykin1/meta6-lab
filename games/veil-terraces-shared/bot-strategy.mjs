// Real player controls, using the existing shared core's calibrated path finding.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(1500);
  }
}
export async function playLevel(ctx, level) {
  while (ctx.state().level === level &&
         !ctx.state().levelDone && !ctx.state().gameDone) {
    if (!ctx.state().alive) { await ctx.wait(1000); continue; }
    if (ctx.state().goal) await ctx.walkToGoal();
    else await ctx.key('Space', 100);
  }
}
