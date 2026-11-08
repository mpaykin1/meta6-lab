// Gameplay only: real keyboard and joystick actions, no state mutation.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter',80);
    await ctx.wait(800);
  }
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width/2,ctx.viewport.height/2);
    await ctx.wait(600);
  }
}
export async function playLevel(ctx,level) {
  let iterations=0,lastProgress=-1,stalls=0;
  while (true) {
    const s=ctx.state();
    if (s.gameDone||s.levelDone||s.level>level) return;
    if (!s.alive) { await ctx.wait(300); continue; }
    const danger=s.nearestEnemyDistance;
    // Attack using the game's existing KeyJ control, never synthetic damage.
    if (Number.isFinite(danger) && danger<2.5) {
      await ctx.key('KeyJ',200);
      if (s.hp<0.35) await ctx.jump();
    } else if (s.goal) {
      await ctx.walkToGoal(450);
      // Physical jumps over terrain; never teleport or change victory flags.
      if (iterations%5===4) await ctx.jump();
    } else {
      const a=iterations*2.39996;
      await ctx.joystick(Math.cos(a),Math.sin(a),260);
      if (iterations%4===0) await ctx.jump();
    }
    const now=ctx.state();
    if (typeof now.progress==='number' && now.progress>lastProgress) {
      lastProgress=now.progress;stalls=0;
    } else if (++stalls>9) {
      // Investigate nearby passable directions; the shared core calibrates goal walking.
      await ctx.jump();stalls=0;
    }
    iterations++;
  }
}
