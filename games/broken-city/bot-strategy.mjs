// Uses only real keyboard input and the game's read-only state. No progress mutation.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state()?.started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(800);
  }
  if (!ctx.state()?.started) await ctx.key('Enter', 80);
}
export async function playLevel(ctx, level) {
  let turns = 0;
  while (true) {
    const s = ctx.state();
    if (!s || s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) { await ctx.wait(300); continue; }
    const h = s.hero, g = s.goal;
    if (h && g && Number.isFinite(h.x) && Number.isFinite(h.z) && Number.isFinite(g.z)) {
      // Built-in core walks with real input and collision checks.
      await ctx.walkToGoal(450);
    } else {
      await ctx.key(turns++ % 4 === 0 ? 'Space' : 'KeyW', 180);
    }
  }
}
