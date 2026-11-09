// Uses only player-visible input through the META BOT context.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter', 120);
    await ctx.wait(450);
  }
}
export async function playLevel(ctx, level) {
  while (ctx.state().level === level && !ctx.state().levelDone && !ctx.state().gameDone) {
    if (!ctx.state().alive) { await ctx.wait(400); continue; }
    if (ctx.state().goal) await ctx.walkToGoal();
    await ctx.key('KeyJ', 150); // the actual combat key, not a debug action
  }
}
