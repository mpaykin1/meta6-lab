// Operate only actual game controls; never write progress or completion flags.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(800);
  }
}
export async function playLevel(ctx, level) {
  let step = 0;
  let previousProgress = -1;
  let stagnantSteps = 0;
  let lastHero = null;
  let blockedSteps = 0;
  let detourSide = 1;
  let detourAnchor = null;
  let lateralAttempts = 0;
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.started || s.menuOpen) {
      await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
      await ctx.wait(300);
      continue;
    }
    if (!s.alive) {
      await ctx.wait(300); // Let the core detect a prolonged death.
      continue;
    }
    const mode = String(s.layoutHash || '').split(':')[2];
    const progress = Number(s.progress);
    if (Number.isFinite(progress)) {
      if (progress > previousProgress + 0.002) {
        stagnantSteps = 0;
        previousProgress = progress;
      } else {
        stagnantSteps++;
      }
    }
    // Detect physical stalls against real ruins, not synthetic progress.
    const h = s.hero;
    if (h && Number.isFinite(h.x) && Number.isFinite(h.z)) {
      const moved = lastHero && Math.hypot(h.x - lastHero.x, h.z - lastHero.z);
      blockedSteps = moved !== null && moved < 0.16 ? blockedSteps + 1 : 0;
      lastHero = {x: h.x, z: h.z};
    }
    if (mode === 'toys' && (blockedSteps >= 3 || detourAnchor !== null)) {
      // A ruin spans more than one short sidestep. Keep moving sideways
      // until real x displacement reaches the edge, then try forward.
      if (detourAnchor === null) { detourAnchor = h?.x ?? 0; lateralAttempts = 0; }
      const lateral = Math.abs((h?.x ?? detourAnchor) - detourAnchor);
      if (lateral < 5 && lateralAttempts < 5) {
        await ctx.key(detourSide > 0 ? 'KeyD' : 'KeyA', 700);
        lateralAttempts++;
      } else if (lateral < 5) {
        // Real displacement never reached the edge: reverse instead of looping forever.
        detourSide = -detourSide;
        detourAnchor = h?.x ?? 0;
        lateralAttempts = 0;
      } else {
        await ctx.key('Space', 90);
        await ctx.key('KeyW', 900);
        detourSide = -detourSide;
        detourAnchor = null;
        lateralAttempts = 0;
      }
      blockedSteps = 0;
    } else if (s.goal) await ctx.walkToGoal(450);
    else await ctx.key('KeyW', 250);
    // Space is the real action() for folding, lantern stomps and jumps.
    await ctx.key('Space', 90);
    if (mode === 'combo' || mode === 'cradle') {
      if (step % 3 === 0) await ctx.key('KeyE', 90);
      // Bridge is a toggle: repeatedly pressing Q while moving closes it
      // again. Only retry it when measured forward progress has stalled.
      if (stagnantSteps >= 5) {
        await ctx.key('KeyQ', 90);
        stagnantSteps = 0;
      }
    }
    step++;
  }
}
