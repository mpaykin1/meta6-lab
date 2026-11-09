// Broken City bot: only real on-screen and keyboard input, no game-state writes.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    // #playBtn is centred in the game's title screen.
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(1500);
  }
}

export async function playLevel(ctx, level) {
  let step = 0;
  let previousHero = null;
  let previousGoalDistance = Infinity;
  let blocked = 0;
  // These are the actual two different action buttons in Broken City's UI.
  // The separate #bJump exists only in the combo/cradle modes.
  const tapAction = () => ctx.tap(ctx.viewport.width - 61, ctx.viewport.height - 73);
  const jump = mode => !ctx.mobile
    ? ctx.key('Space', 90)
    : mode === 'combo' || mode === 'cradle'
      ? ctx.tap(ctx.viewport.width - 62, ctx.viewport.height - 72)
      : tapAction();
  // The first two authored ruin waypoints lead onto a very narrow staircase.
  // Align X on the street *before* walking into the wall; diagonal input hits
  // an impassable high step, then slides sideways without approaching the goal.
  const moveToward = s => {
    let dx = s.goal.x - s.hero.x;
    let dz = s.goal.y - s.hero.y;
    const enteringStairs = s.mode === 'toys' &&
      Number.isInteger(s.goal.routeIndex) && s.goal.routeIndex <= 1;
    if (enteringStairs && Math.abs(dx) > 0.65 && Math.abs(dz) < 9) dz = 0;
    const distance = Math.hypot(dx, dz);
    const yaw = Number.isFinite(s.cameraYaw) ? s.cameraYaw : 0;
    const right = dx * Math.cos(yaw) - dz * Math.sin(yaw);
    const forward = -dx * Math.sin(yaw) - dz * Math.cos(yaw);
    const length = Math.hypot(right, forward) || 1;
    // With 0.5 FPS a 3.5 s full-speed touch jumps several metres past a
    // 0.35 m waypoint. Reduce stick magnitude near it; preserve enough hold
    // time for a genuine WebGL frame. Desktop uses shorter keyboard pulses.
    const strength = ctx.mobile
      ? Math.max(0.20, Math.min(1, distance / 4))
      : 1;
    const duration = ctx.mobile ? 3500 : distance < 2 ? 450 : 950;
    return ctx.joystick(right / length * strength,
      -forward / length * strength, duration);
  };
  const stomp = () => ctx.mobile
    ? ctx.tap(ctx.viewport.width - 153, ctx.viewport.height - 61)
    : ctx.key('KeyE', 90);
  const bridge = () => ctx.mobile
    ? ctx.tap(ctx.viewport.width - 65, ctx.viewport.height - 167)
    : ctx.key('KeyQ', 90);

  for (;;) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) {
      await ctx.wait(300); // The core still enforces the unchanged death timeout.
      continue;
    }
    if (s.menuOpen || !s.started) {
      await ctx.wait(200);
      continue;
    }

    const h = s.hero;
    if (h && s.goal) {
      // Collision can slide the hero sideways without approaching the objective.
      // Track actual goal-distance improvement, not just nonzero displacement.
      const distance = Math.hypot(s.goal.x - h.x, s.goal.y - h.y);
      const goalChanged = !previousHero || previousHero.goalX !== s.goal.x ||
        previousHero.goalY !== s.goal.y;
      blocked = goalChanged || distance < previousGoalDistance - 0.15
        ? 0 : blocked + 1;
      previousGoalDistance = distance;
      previousHero = { x: h.x, y: h.y, goalX: s.goal.x, goalY: s.goal.y };
    } else {
      blocked = 0;
      previousGoalDistance = Infinity;
      previousHero = null;
    }

    if (s.mode === 'runner') {
      // Runner already moves along -Z. Dodge or jump using its actual action button.
      if (step % 3 === 0) {
        if (ctx.mobile) await tapAction();
        else await ctx.key('Space', 90);
      }
      await ctx.wait(200);
    } else if (s.goal) {
      // The observer returns read-only, authored waypoints (ruins, bridges, lamps).
      if (s.mode === 'toys' && blocked >= 2) {
        // Repeated jumping against a vertical face cannot clear the stair.
        // Back away using the real controls, then approach the authored
        // waypoint again; the observer and game state remain read-only.
        const yaw = Number.isFinite(s.cameraYaw) ? s.cameraYaw : 0;
        const retreatX = Math.sin(yaw);
        const retreatY = -Math.cos(yaw);
        await ctx.joystick(retreatX * 0.65, retreatY * 0.65,
          ctx.mobile ? 1200 : 450);
        await jump(s.mode);
        blocked = 0;
      }
      // The real route marks gaps with jump=1: take off BEFORE walking into
      // the gap. Jumping after a long low-FPS joystick hold is too late.
      if (s.mode === 'toys' && s.goal.jump) await jump(s.mode);
      await moveToward(s);
      if (s.mode === 'toys' && !s.goal.jump && step % 3 === 0) await jump(s.mode);
      if (s.mode === 'fold' && blocked >= 2) {
        if (ctx.mobile) await tapAction();
        else await ctx.key('Space', 90);
        blocked = 0;
      }
      if ((s.mode === 'cradle' || s.mode === 'combo') && blocked >= 3) {
        // Real bridge and stomp controls are toggle/action buttons.
        await bridge();
        await stomp();
        await jump(s.mode);
        blocked = 0;
      }
      if (s.mode === 'lantern' && step % 6 === 0) {
        if (ctx.mobile) await tapAction();
        else await ctx.key('Space', 90);
      }
    } else {
      await ctx.joystick(0, -1, 350);
    }
    step++;
  }
}
