// Navigate with actual player input and genuine, read-only ruin waypoints.
// Never modify game progression, collisions, level completion or timeouts.
export async function start(ctx) {
  await ctx.wait(2200);
  // "started" becomes true only after the real transition enters play.
  // At low WebGL frame rates, never begin the level watchdog during loading.
  let pressedPlay = false;
  const deadline = Date.now() + 48000;
  while (!ctx.state().started && Date.now() < deadline) {
    if (ctx.state().menuOpen && !pressedPlay) {
      await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
      pressedPlay = true;
    }
    await ctx.wait(350);
  }
}

export async function playLevel(ctx, level) {
  let steps = 0;
  let lastHero = null;
  let physicalStalls = 0;
  let lastProgress = -1;
  let stagnantSteps = 0;
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.started || s.menuOpen) {
      await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
      await ctx.wait(300);
      continue;
    }
    if (!s.alive) {
      await ctx.wait(300); // Real death detection remains in the protected core.
      continue;
    }

    const mode = String(s.layoutHash || '').split(':')[2];
    const h = s.hero;
    if (!h || !Number.isFinite(h.x) || !Number.isFinite(h.z)) {
      await ctx.wait(150);
      continue;
    }

    const progress = Number(s.progress);
    if (Number.isFinite(progress)) {
      if (progress > lastProgress + 0.002) {
        lastProgress = progress;
        stagnantSteps = 0;
      } else stagnantSteps++;
    }

    if (lastHero) {
      const displacement = Math.hypot(h.x - lastHero.x, h.z - lastHero.z);
      physicalStalls = displacement < 0.08 ? physicalStalls + 1 : 0;
    }
    lastHero = { x: h.x, z: h.z };

    // The original game supplies exact walkable points for every randomly
    // generated, full-width ruin; walking around its edge is impossible.
    // A waypoint is observational data, never synthetic level progress.
    const target = mode === 'toys' && s.waypoint ? s.waypoint : s.goal;
    if (!target || !Number.isFinite(target.x)) {
      await ctx.joystick(0, -1, 850);
    } else {
      const tz = Number.isFinite(target.z) ? target.z : target.y;
      if (!Number.isFinite(tz)) {
        await ctx.wait(100);
        continue;
      }
      const dx = target.x - h.x;
      const dz = tz - h.z;
      const distance = Math.hypot(dx, dz);
      const yaw = Number.isFinite(s.cameraYaw) ? s.cameraYaw : 0;

      // Game updateGame(): fwd=(-sin(yaw),-cos(yaw)),
      // right=(cos(yaw),-sin(yaw)), stick.vy is inverted.
      let ix = dx * Math.cos(yaw) - dz * Math.sin(yaw);
      let iz = -dx * Math.sin(yaw) - dz * Math.cos(yaw);
      const magnitude = Math.hypot(ix, iz);
      if (magnitude > 0.001) {
        ix /= magnitude;
        iz /= magnitude;
      } else {
        ix = 0;
        iz = 1;
      }

      // Follow the engine's real route even when its point is temporarily
      // farther from the final lamp. Do not fake a nearer final goal.
      if (mode === 'toys' && distance < 0.55 && target.jump) {
        await ctx.jump();
      }
      await ctx.joystick(ix, -iz, mode === 'toys' ? 950 : 600);
    }

    if (mode === 'toys' && (s.waypoint?.jump || physicalStalls >= 2 || steps % 4 === 0)) {
      await ctx.jump(); // Actual mobile jump button; Space on desktop.
    } else if (mode !== 'toys') {
      await ctx.key('Space', 90);
    }

    if (mode === 'combo' || mode === 'cradle') {
      if (steps % 3 === 0) await ctx.key('KeyE', 90);
      if (stagnantSteps >= 5) {
        await ctx.key('KeyQ', 90);
        stagnantSteps = 0; // Real bridge toggle, only after measured stall.
      }
    }
    steps++;
  }
}
