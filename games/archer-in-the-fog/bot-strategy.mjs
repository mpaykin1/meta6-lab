// Every action below is a real touch/mouse event. State is read-only.
// This shooter has no walking mechanic; target the actual dragon on screen.
export async function start(ctx) {
  await ctx.wait(2200);
  if (ctx.state().started) return;
  for (const y of [0.59, 0.64, 0.52]) {
    if (ctx.state().started) break;
    await ctx.tap(ctx.viewport.width * 0.5, ctx.viewport.height * y);
    await ctx.wait(800);
  }
}
export async function playLevel(ctx, level) {
  while (!ctx.state().gameDone && ctx.state().level === level) {
    const s = ctx.state();
    if (!s.alive) {
      await ctx.wait(300); // Do not conceal a death: core's 5 s watchdog decides.
      continue;
    }
    const a = s.aimScreen;
    if (a && a.visible) {
      await ctx.hold(a.x, a.y, 550); // Bow fires through the game's real pointer input.
    } else {
      // Dragon temporarily out of view: wait for its actual orbit to bring it back.
      await ctx.wait(180);
    }
  }
}
