// How the bot plays «Wild train: Prologue» with the player's own gestures: tap what you see, drag to turn the camera.
export async function start(ctx) {
  await ctx.wait(2500);
  await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height * 0.35);   // wakes the sound like a player's first touch
}
export async function playLevel(ctx, level) {
  const W = ctx.viewport.width, H = ctx.viewport.height;
  let steer = 0;
  while (true) {
    const s = ctx.state();
    if (s.level !== level || s.levelDone || s.gameDone) return;
    if (!s.alive) { await ctx.tap(W / 2, H / 2 + 10); await ctx.wait(350); continue; }   // the ⟳ button (always at the centre)
    if (!s.goal && s.progress < 100) { await ctx.wait(150); continue; }   // bottles are on their way
    if (!s.goal) {                                           // top view (even a stray letter early): ride in wide circles
      const a = (steer += 0.9);
      await ctx.hold(W / 2 + Math.cos(a) * W * 0.3, H / 2 + Math.sin(a) * H * 0.3, 600);
      await ctx.wait(200);
      continue;
    }
    const x = s.goal.x, y = s.goal.y;
    const inside = x > 8 && x < W - 8 && y > 8 && y < H - 8;
    if (inside) { await ctx.tap(x, y); await ctx.wait(250); continue; }
    // the target is off screen: drag the camera toward it, like a player looking around
    // (drag right turns the view so things on the right slide in; the camera keeps some swing, so small drags)
    const dx = Math.max(-60, Math.min(60, -(x - W / 2) / 6));
    const dy = Math.max(-30, Math.min(30, -(y - H / 2) / 10));
    await ctx.swipe(W / 2, H / 2, W / 2 + dx, H / 2 + dy, 200);
    await ctx.wait(500);
  }
}
