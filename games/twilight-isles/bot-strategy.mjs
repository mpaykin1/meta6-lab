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
  let previousGoalDistance=Infinity, noApproach=0, escapeSide=1;
  let lastGoalKey='';
  let detourRemaining=0;
  // In this game movement is camera-relative. Convert world X/Z into real
  // joystick axes directly; probing four directions is too slow on low FPS.
  const moveWorld = (s, wx, wz, ms) => {
    const yaw=Number.isFinite(s.cameraYaw)?s.cameraYaw:0;
    const c=Math.cos(yaw), t=Math.sin(yaw);
    return ctx.joystick(c*wx-t*wz, t*wx+c*wz, ms);
  };
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
      const goalKey=`${s.goal.x.toFixed(1)},${s.goal.y.toFixed(1)}`;
      if (goalKey!==lastGoalKey) {
        noApproach=0;
        detourRemaining=0;
        previousGoalDistance=Infinity;
        lastGoalKey=goalKey;
      }
      const before=Math.hypot(s.goal.x-s.hero.x,s.goal.y-s.hero.y);
      const wx=(s.goal.x-s.hero.x)/Math.max(0.001,before);
      const wz=(s.goal.y-s.hero.y)/Math.max(0.001,before);
      if (noApproach>=3 && detourRemaining===0) {
        // Commit to a physical detour rather than alternating sides each frame.
        detourRemaining=3;
        escapeSide=-escapeSide;
      }
      if (detourRemaining>0) {
        await ctx.jump();
        const sideX=-wz*escapeSide, sideZ=wx*escapeSide;
        // Sideways plus a small forward component clears corners.
        await moveWorld(s,sideX*0.9+wx*0.35,sideZ*0.9+wz*0.35,1200);
        detourRemaining--;
      } else {
        // At low FPS the input must span at least one simulation frame.
        const pulseMs=before<1.5?600:before<4?700:900;
        await moveWorld(s,wx,wz,pulseMs);
      }
      const afterState=ctx.state();
      const after=afterState.goal && afterState.hero
        ? Math.hypot(afterState.goal.x-afterState.hero.x,afterState.goal.y-afterState.hero.y)
        : 0;
      if (after>=before-0.12) noApproach++;
      else { noApproach=0; detourRemaining=0; }
      previousGoalDistance=after;
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
