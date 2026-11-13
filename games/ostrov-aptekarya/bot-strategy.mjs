// META BOT: только действия игрока (джойстик, клавиши, нажатия кнопок).
export async function start(ctx) {
  for (let i = 0; i < 40 && !ctx.state().started; i++) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(1200);
  }
}
async function pressAction(ctx) {
  if (ctx.mobile) await ctx.tap(ctx.viewport.width - 64, ctx.viewport.height - 68);
  else await ctx.key('Space', 70);
}
export async function playLevel(ctx, level) {
  while (ctx.state().level === level && !ctx.state().levelDone && !ctx.state().gameDone) {
    const s = ctx.state();
    if (s.goal) await ctx.walkToGoal();
    else await ctx.wait(400);
    if (level === 1) {
      await pressAction(ctx);
      if (s.enemies) {await ctx.joystick(1, 0, 90);await ctx.joystick(-1, 0, 90);}
    } else if (level === 2) {
      if (s.goal?.door || ctx.state().archiveDoors === 0) {
        await pressAction(ctx); // створка закрывается только рядом; не телепорт
      }
      if (s.enemies && s.goal?.door) await ctx.wait(250);
    }
  }
  if (level === 1 && ctx.state().levelDone && !ctx.state().gameDone) {
    // Карточка окончания первой главы целиком нажимается. Никаких вызовов игрового API.
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(650);
  }
}
