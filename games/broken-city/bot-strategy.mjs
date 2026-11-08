// Broken City: drive only through ordinary player controls.
export async function start(ctx) {
  await ctx.wait(1500);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width * 0.5, ctx.viewport.height * 0.5);
    await ctx.wait(1000);
  }
}
export async function playLevel(ctx, level) {
  let step = 0;
  for (;;) {
    const s = ctx.state();
    if (s.level !== level || s.levelDone || s.gameDone) return;
    if (!s.alive) { await ctx.wait(300); continue; }
    // The corridor has real moving obstructions, gaps and collapsing barriers.
    // Recalibrate against the live world after each short movement.
    if (step++ % 4 === 3) await ctx.jump();
    await ctx.walkToGoal(500);
  }
}
