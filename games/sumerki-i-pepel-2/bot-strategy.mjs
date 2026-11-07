// Input-only bot strategy. Never modifies game state or fabricates completion.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter', 80);
    await ctx.wait(800);
  }
}
export async function playLevel(ctx, level) {
  let tick = 0;
  while (true) {
    const s = ctx.state();
    if (s.gameDone || s.levelDone || s.level > level) return;
    if (!s.alive) { await ctx.wait(300); continue; }
    const hero = s.hero;
    const enemies = Array.isArray(s.enemies) ? s.enemies : [];
    let nearest = null, distance = Infinity;
    if (hero && Number.isFinite(hero.x) && Number.isFinite(hero.z)) {
      for (const enemy of enemies) {
        if (!Number.isFinite(enemy.x) || !Number.isFinite(enemy.z)) continue;
        const d = Math.hypot(enemy.x - hero.x, enemy.z - hero.z);
        if (d < distance) { distance = d; nearest = enemy; }
      }
    }
    if (nearest && distance < 6 && s.hp < 0.35) {
      await ctx.key('KeyS', 300);
    } else if (nearest && distance < 2.5) {
      await ctx.key('Space', 90);
    } else if (s.goal) {
      await ctx.walkToGoal(450);
    } else {
      const direction = ['KeyW', 'KeyD', 'KeyW', 'KeyA'][Math.floor(tick / 6) % 4];
      await ctx.key(direction, 450);
      if (tick % 8 === 0) await ctx.key('Space', 90);
    }
    tick++;
  }
}
