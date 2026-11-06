// Real player input only. Never access page, game state internals or debug cheats.
export async function start(ctx) {
  await ctx.wait(2300);
  // The first visit autostarts. Enter is the game's ordinary start control for later visits.
  await ctx.key('Enter',80);
  await ctx.wait(400);
}
export async function playLevel(ctx,level) {
  let turns=0;
  while(turns++ < 1100) {
    const s=ctx.state();
    if(s.gameDone || s.levelDone || s.level>level || !s.alive) return;
    if(s.goal) await ctx.walkToGoal(510);
    else await ctx.wait(500);
    if(turns%2===0) {
      // Real in-game attack control; on mobile use the visible attack icon.
      if(ctx.mobile) await ctx.hold(ctx.viewport.width - 62, ctx.viewport.height - 124, 900);
      else await ctx.key('KeyJ',850);
    }
    if(turns%8===0) await ctx.jump();
  }
  throw new Error('Island was not completed through player controls');
}
