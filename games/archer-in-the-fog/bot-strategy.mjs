// First-tower dragon fight using only ordinary player controls.
export async function start(ctx) {
  const { width, height } = ctx.viewport;
  // Existing first-visit auto-start may already have opened the fight.
  if (!ctx.state().started) {
    await ctx.tap(width / 2, height * 0.58);
    await ctx.wait(900);
  }
}

export async function playLevel(ctx, level) {
  const { width, height } = ctx.viewport;
  const aimPoints = [
    [0.50, 0.43], [0.65, 0.36], [0.35, 0.36],
    [0.72, 0.52], [0.28, 0.52], [0.50, 0.27]
  ];
  let index = 0;
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level !== level) return;
    if (!s.started) {
      await ctx.tap(width * 0.5, height * 0.58);
      await ctx.wait(600);
      continue;
    }
    if (!s.alive) return;
    // Real projectile input; rotate aim across the visible dragon's flight path.
    const [x, y] = aimPoints[index % aimPoints.length];
    await ctx.hold(width * x, height * y, 1100);
    // Real side-step, never a direct game-state write.
    if (ctx.mobile) {
      const fromX = width * 0.12;
      const toX = fromX + (index % 2 ? -width * 0.10 : width * 0.10);
      await ctx.swipe(fromX, height * 0.87, toX, height * 0.87, 500);
    } else {
      await ctx.key(index % 2 ? 'KeyA' : 'KeyD', 420);
    }
    index++;
  }
}
