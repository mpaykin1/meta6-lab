// Sunken City player strategy: keyboard movement and sonar only; no page access.
export async function start(ctx) {
  // The original game switches to the bathyscaphe after its assets have loaded.
  for (let attempt=0;attempt<18&&!ctx.state().started;attempt++) await ctx.wait(1000);
}
export async function playLevel(ctx,level) {
  while(ctx.state().level===level&&!ctx.state().levelDone&&!ctx.state().gameDone) {
    if (!ctx.state().alive) { await ctx.wait(700); continue; }
    // Sonar is the legitimate player action revealing the relics nearby.
    await ctx.key('KeyE',100);
    if (ctx.state().goal) {
      await ctx.walkToGoal();
    } else {
      // Search forward when no streamed relic has been discovered yet.
      await ctx.key('KeyW',850);
      await ctx.key('ArrowRight',150);
    }
  }
}
