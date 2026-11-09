// Only genuine keyboard and touch input: no game-state mutations.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter', 120);
    await ctx.wait(450);
  }
}
export async function playLevel(ctx, level) {
  while (ctx.state().level === level && !ctx.state().levelDone && !ctx.state().gameDone) {
    const state = ctx.state();
    if (!state.alive) {
      // The game's visible "Again" button also supports Enter.
      await ctx.key('Enter', 120);
      await ctx.wait(250);
      continue;
    }
    if (state.goal) {
      const distance = Math.hypot(state.goal.x - state.hero.x, state.goal.y - state.hero.y);
      // One-block terraces and the lighthouse ring require an actual jump.
      if (distance < 3.5) await ctx.jump();
      await ctx.walkToGoal(600);
    }
    // Real combat input; never call the game's internal attack/debug methods.
    await ctx.key('KeyJ', 250);
  }
}
