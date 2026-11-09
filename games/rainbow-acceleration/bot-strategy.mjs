// Endless run: control the live rider using the same keyboard/touch steer as a player.
export async function start(ctx) {
  await ctx.wait(1000);
  if (!ctx.state().started) await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height - 115);
  for (let i = 0; i < 35 && !ctx.state().started; i++) await ctx.wait(250);
}
export async function playLevel(ctx, level) {
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.started) { await ctx.wait(300); continue; }
    const lane = Number(s.lane);
    if (!Number.isFinite(lane)) { await ctx.wait(200); continue; }
    const correction = lane > .55 ? 1 : lane < -.55 ? -1 : 0;
    if (ctx.mobile) {
      if (correction) await ctx.joystick(correction, 0, 230);
      else await ctx.wait(230);
    } else {
      if (correction) await ctx.key(correction > 0 ? 'KeyD' : 'KeyA', 200);
      else await ctx.wait(230);
    }
  }
}
