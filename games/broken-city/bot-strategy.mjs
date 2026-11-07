// Operates the game's actual keyboard controls. No progress or completion writes.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(800);
  }
}
export async function playLevel(ctx, level) {
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.started || s.menuOpen) {
      await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
      await ctx.wait(300);
      continue;
    }
    if (!s.alive) {
      await ctx.wait(300);
      continue; // The core must detect prolonged death; never fake recovery.
    }
    if (s.goal) {
      await ctx.walkToGoal(450);
    } else {
      await ctx.key('KeyW', 250);
    }
    // Real in-game action: jump / fold bridge / lantern stomp as applicable.
    await ctx.key('Space', 90);
  }
}
