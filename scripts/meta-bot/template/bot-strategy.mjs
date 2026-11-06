// ШАБЛОН стратегии бота. Скопировать в games/<игра>/bot-strategy.mjs.
// Контракт: scripts/meta-bot/CONTRACT.md. Бот играет ТОЛЬКО как игрок: ctx.tap / hold / swipe / joystick / key.
// ChatGPT: замени TODO. Не пытайся получить доступ к странице — его нет.

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
    if (s.goal) await ctx.walkToGoal();
    else await ctx.key('Space', 100); // TODO: цель без точки (победить всех врагов) — атакуй
  }
}
