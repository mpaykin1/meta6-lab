// All actions use the player's ordinary input; the observer cannot alter game state.
export async function start(ctx) {
  await ctx.wait(900);
  if (!ctx.state().started) await ctx.key('Enter', 120);
  for (let i = 0; i < 35 && !ctx.state().started; i++) await ctx.wait(250);
}
export async function playLevel(ctx, level) {
  let steps = 0;
  while (true) {
    const s = ctx.state();
    if (s.levelDone || s.gameDone || s.level > level) return;
    if (!s.started || s.menuOpen) { await ctx.wait(200); continue; }
    if (!s.alive) { await ctx.wait(250); continue; }
    if (s.goal) await ctx.walkToGoal();
    if ((steps++ % 3) === 0) await ctx.key('KeyJ', 160);
    if (steps % 7 === 0) await ctx.jump();
  }
}
