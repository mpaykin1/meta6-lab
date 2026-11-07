// Operate only actual game controls; never write progress or completion flags.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(800);
  }
}
export async function playLevel(ctx, level) {
  let step = 0;
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.started || s.menuOpen) {
      await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
      await ctx.wait(300);
      continue;
    }
    if (!s.alive) {
      await ctx.wait(300); // Let the core detect a prolonged death.
      continue;
    }
    const mode = String(s.layoutHash || '').split(':')[2];
    if (s.goal) await ctx.walkToGoal(450);
    else await ctx.key('KeyW', 250);
    // Space invokes the real action() for folding bridges, lantern stomps,
    // runner jumps and combo jumps. Combo/cradle also require separate
    // stomp (E) and bridge (Q) controls; Space alone cannot use them.
    await ctx.key('Space', 90);
    if (mode === 'combo' || mode === 'cradle') {
      if (step % 3 === 0) await ctx.key('KeyE', 90);
      if (step % 5 === 0) await ctx.key('KeyQ', 90);
    }
    step++;
  }
}
