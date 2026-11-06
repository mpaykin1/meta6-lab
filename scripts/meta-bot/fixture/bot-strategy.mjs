// Стратегия тестовой мини-игры (самопроверка ядра). Каркас Claude.

export async function start(ctx) {
  // TODO: пройти стартовый экран. Пример: нажать кнопку «играть» в центре экрана.
  ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
  await ctx.wait(1500);
}

export async function playLevel(ctx, level) {
  // Готовый проходчик ядра: ctx.walkToGoal() сам калибрует джойстик под камеру и идёт к state().goal,
  // обходит препятствия боком и прыжком. Подходит для игр, где у уровня есть goal.
  // TODO: если в игре нужен бой или особые действия — добавь их здесь (ctx.key / ctx.tap / ctx.jump).
  while (ctx.state().level === level && !ctx.state().levelDone && !ctx.state().gameDone) {
    const s = ctx.state();
    if (!s.alive) { await ctx.wait(1000); continue; }
    const d = s.goal ? Math.hypot(s.goal.x - s.hero.x, s.goal.y - s.hero.y) : 0;
    if (s.progress !== undefined && s.enemies > 0 && d < 1.2) { // бой у цели (?fight=1): бить медленно, чтобы бой шёл дольше stuckSec
      if (ctx.mobile) await ctx.tap(ctx.viewport.width * 0.8, ctx.viewport.height * 0.5); else await ctx.key('Space', 60); await ctx.wait(700); continue; }
    if (s.goal) await ctx.walkToGoal(s.progress !== undefined && d < 3 ? 120 : 450);
    else await ctx.key('Space', 100); // TODO: цель без точки (победить всех врагов) — атакуй
  }
}
