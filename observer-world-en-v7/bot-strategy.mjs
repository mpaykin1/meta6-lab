// Only physical inputs: controls remain the ones available to players.
export async function start(ctx) {
  await ctx.wait(1200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height * .72);
    await ctx.wait(800);
  }
  if (!ctx.state().started) {
    await ctx.key('Enter', 100);
    await ctx.wait(1000);
  }
}
export async function playLevel(ctx, level) {
  let step = 0;
  while (true) {
    const s = ctx.state();
    if (s.level !== level || s.levelDone || s.gameDone) return;
    if (!s.alive) { await ctx.wait(250); continue; }
    if (step % 5 === 4) await ctx.jump();
    if (s.enemies > 0 && step % 3 === 2) {
      if (ctx.mobile) await ctx.tap(ctx.viewport.width * .81, ctx.viewport.height * .80);
      else await ctx.key('KeyJ', 100);
    }
    if (s.goal) await ctx.walkToGoal(430);
    else await ctx.wait(150);
    step++;
  }
}
