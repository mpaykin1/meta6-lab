// Only genuine keyboard and touch input: no game-state mutations.
// Movement, jump and attack are pressed together, the way a player holds them:
// a short tapped jump is cut by the game (variable jump height) and cannot climb
// the two-block rocks and piers where coins lie, so jump is held while walking.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter', 120);
    await ctx.wait(450);
  }
}
export async function playLevel(ctx, level) {
  let last = null, still = 0;
  while (ctx.state().level === level && !ctx.state().levelDone && !ctx.state().gameDone) {
    const state = ctx.state();
    if (!state.alive) {
      // The game's visible "Again" button also supports Enter.
      await ctx.key('Enter', 120);
      await ctx.wait(250);
      last = null; still = 0;
      continue;
    }
    if (!state.goal) { await ctx.key('KeyJ', 300); continue; }
    const distance = Math.hypot(state.goal.x - state.hero.x, state.goal.y - state.hero.y);
    const moved = last ? Math.hypot(state.hero.x - last.x, state.hero.y - last.y) : 1;
    still = moved < 0.15 ? still + 1 : 0;
    last = { ...state.hero };
    const presses = [ctx.walkToGoal(520), ctx.key('KeyJ', 440)]; // real combat input while moving
    // Held jump where the terrain rises (read-only hint), near the goal or when blocked;
    // the route itself keeps off shore cells, so a jump does not throw the hero into the sea.
    if (state.climb || still >= 2) presses.push(ctx.key('Space', 340));
    await Promise.all(presses);
  }
}
