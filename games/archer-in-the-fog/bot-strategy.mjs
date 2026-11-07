// Real canvas pointer input only: hold to fire, and scan the aerial target.
// The game is endless: never synthesize levelDone, gameDone or player coordinates.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width * 0.5, ctx.viewport.height * 0.56);
    await ctx.wait(800);
  }
}

export async function playLevel(ctx, level) {
  let shot = 0;
  let reviveAttempted = false;
  const aims = [
    [0.50, 0.43], [0.65, 0.40], [0.35, 0.40],
    [0.77, 0.50], [0.23, 0.50], [0.50, 0.32]
  ];
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.started) {
      await ctx.wait(300);
      continue;
    }
    if (!s.alive) {
      if (!reviveAttempted) {
        // The real over-screen button offers one free revive.
        reviveAttempted = true;
        await ctx.tap(ctx.viewport.width * 0.5, ctx.viewport.height * 0.62);
      }
      await ctx.wait(300); // Let the core report death if revive did not work.
      continue;
    }
    const aim = aims[shot++ % aims.length];
    await ctx.hold(ctx.viewport.width * aim[0], ctx.viewport.height * aim[1], 700);
    await ctx.wait(90);
  }
}