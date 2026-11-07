// Input-only agent for the actual Sumerki II game. Never changes game state.
// The adapter exposes a numeric enemy count, plus optional read-only nearestEnemy coordinates.
const point = p => p && Number.isFinite(p.x) && Number.isFinite(p.z) ? p : null;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Inverse of the game's camera-relative input transform:
// world(dx,dz) = (cos(yaw)*ix - sin(yaw)*iz, -sin(yaw)*ix - cos(yaw)*iz)
// Touch joystick vertical axis is the opposite of iz.
function fleeJoystick(hero, foe, yaw) {
  const dx = hero.x - foe.x, dz = hero.z - foe.z;
  const norm = Math.hypot(dx, dz) || 1;
  const x = dx / norm, z = dz / norm, c = Math.cos(yaw || 0), sn = Math.sin(yaw || 0);
  return [c * x - sn * z, sn * x + c * z];
}

export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state()?.started) {
    await ctx.key('Enter', 80);
    await ctx.wait(800);
  }
}

export async function playLevel(ctx, level) {
  let step = 0;
  for (;;) {
    const s = ctx.state();
    if (!s || s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) { await ctx.wait(300); continue; }

    const hero = point(s.hero), foe = point(s.nearestEnemy);
    const range = hero && foe ? distance(hero, foe) : Infinity;
    if (hero && foe && range < 6 && Number(s.hp) < 0.35) {
      const [ix, iy] = fleeJoystick(hero, foe, Number(s.cameraYaw) || 0);
      await ctx.joystick(ix, iy, 320);
    } else if (foe && range < 2.5 && s.enemies > 0) {
      // This game's genuine attack controls are J/K; Space only jumps.
      await ctx.key('KeyJ', 140);
      if (step % 5 === 0) await ctx.jump();
    } else if (point(s.goal) && typeof ctx.walkToGoal === 'function') {
      try {
        await ctx.walkToGoal(450);
      } catch (err) {
        // A collectible disappearing mid-navigation is normal progress.
        // Retry using the NEXT real goal, not a fabricated completion.
        const next = ctx.state();
        if (point(next?.goal) && next.level === s.level) throw err;
        await ctx.wait(80);
      }
    } else {
      // Input-only exploration when no objective is visible.
      const keys = ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
      await ctx.key(keys[Math.floor(step / 6) % keys.length], 350);
    }
    if (step % 13 === 0) await ctx.jump();
    step++;
  }
}
