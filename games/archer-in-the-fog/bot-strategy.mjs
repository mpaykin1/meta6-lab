// Archer plays only via genuine pointer events sent by META BOT input.mjs.
// Read-only state contains actual onscreen target and the real current challenge.
export async function start(ctx) {
  reviveUsed = false; // Each viewport and independent replay is a new run.
  await ctx.wait(2200);
  if (ctx.state().started) return;
  await ctx.key('Enter', 80);
  await ctx.wait(800);
  for (let retry = 0; retry < 3 && !ctx.state().started; retry++) {
    const start = ctx.state().startScreen;
    if (start) await ctx.tap(start.x, start.y);
    else await ctx.tap(ctx.viewport.width * 0.5, ctx.viewport.height * 0.56);
    await ctx.wait(800);
  }
}

let reviveUsed = false;
export async function playLevel(ctx, level) {
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) {
      if (!reviveUsed && s.reviveScreen) {
        reviveUsed = true;
        await ctx.tap(s.reviveScreen.x, s.reviveScreen.y);
      }
      await ctx.wait(300); // 5-second death watchdog remains in force.
      continue;
    }
    // Real fire challenge awards progress only for shooting down fireballs.
    // Hold challenge increments its own time counter; sparks must be earned.
    const point = s.task === 'fire' && s.fireballScreen?.visible
      ? s.fireballScreen : s.aimScreen;
    if (point?.visible) {
      await ctx.hold(point.x, point.y, 550);
    } else {
      await ctx.wait(160);
    }
  }
}
