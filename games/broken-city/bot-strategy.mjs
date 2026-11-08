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
  let blocked = 0;
  let sidestep = 1;
  // These are the actual two different action buttons in Broken City's UI.
  // The separate #bJump exists only in the combo/cradle modes.
  const tapAction = () => ctx.tap(ctx.viewport.width - 61, ctx.viewport.height - 73);
  const jump = mode => !ctx.mobile
    ? ctx.key('Space', 90)
    : mode === 'combo' || mode === 'cradle'
      ? ctx.tap(ctx.viewport.width - 62, ctx.viewport.height - 72)
      : tapAction();
  // Convert world-space goal vector to the real camera-relative joystick.
  // Avoid four-direction calibration: on low-FPS WebGL it samples almost no
  // simulation frames and may produce a degenerate movement basis.
  const moveToward = s => {
    const dx = s.goal.x - s.hero.x;
    const dz = s.goal.y - s.hero.y;
    const yaw = Number.isFinite(s.cameraYaw) ? s.cameraYaw : 0;
    const right = dx * Math.cos(yaw) - dz * Math.sin(yaw);
    const forward = -dx * Math.sin(yaw) - dz * Math.cos(yaw);
    const length = Math.hypot(right, forward) || 1;
    return ctx.joystick(right / length, -forward / length, 1100);
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
    if (h && previousHero) {
      blocked = Math.hypot(h.x - previousHero.x, h.y - previousHero.y) < 0.1
        ? blocked + 1 : 0;
    }
    if (h) previousHero = { x: h.x, y: h.y };

    if (s.mode === 'runner') {
      // Runner already moves along -Z. Dodge or jump using its actual action button.
      if (step % 3 === 0) {
        if (ctx.mobile) await tapAction();
        else await ctx.key('Space', 90);
      }
      await ctx.wait(200);
    } else if (s.goal) {
      // The observer returns read-only, authored waypoints (ruins, bridges, lamps).
      if (blocked >= 3 && s.mode === 'toys') {
        await ctx.joystick(sidestep, 0, 520);
        sidestep = -sidestep;
        await jump(s.mode);
        blocked = 0;
      } else {
        await moveToward(s);
      }
      if (s.mode === 'toys' && step % 3 === 0) await jump(s.mode);
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
