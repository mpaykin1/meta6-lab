// Gameplay-only inputs. The game supplies real player coordinates, current level and goal.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2,ctx.viewport.height / 2);
    await ctx.wait(800);
  }
}
export async function playLevel(ctx, level) {
  let ticks=0;
  while (true) {
    const s=ctx.state();
    if (s.gameDone || s.levelDone || s.level>level) return;
    if (!s.alive) { await ctx.wait(300); continue; } // The core detects death after 5 s.
    // Runner stages require lane movement and regular physical jumps.
    if (level===4 || level===8) {
      if (ticks%3===0) await ctx.key('Space',80);
      await ctx.key('KeyW',420);
    } else if (s.goal) {
      // Collapsed bridges have genuine Q/E repairs; never modify the level or player.
      if (level===1 || level===5) {
        if (ticks%4===0) await ctx.key('KeyQ',90);
        if (ticks%5===0) await ctx.key('KeyE',90);
      }
      if (ticks%5===0) await ctx.key('Space',70);
      await ctx.walkToGoal();
    } else {
      await ctx.joystick(Math.sin(ticks*.7),-1,450);
      if (ticks%4===0) await ctx.jump();
    }
    ticks++;
  }
}
