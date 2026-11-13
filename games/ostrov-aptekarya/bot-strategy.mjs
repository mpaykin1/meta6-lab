// Стратегия META BOT для «Острова последнего аптекаря» — играет только как игрок.
export async function start(ctx) {
  // Мир INK грузится несколько секунд: нажимаем стартовую карточку (она нажимается целиком), пока игра не начнётся.
  for (let i = 0; i < 40 && !ctx.state().started; i++) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(1200);
  }
}
export async function playLevel(ctx, level) {
  while (ctx.state().level === level && !ctx.state().levelDone && !ctx.state().gameDone) {
    const s = ctx.state();
    if (s.goal) await ctx.walkToGoal(); else await ctx.wait(400);   // во время разговора без цели — слушаем
    if (level === 1) {
      // Пыльца сонника: игра тратит её, только если Ива рядом; при захвате — рывки в стороны.
      if (ctx.mobile) await ctx.tap(ctx.viewport.width - 64, ctx.viewport.height - 68); else await ctx.key('Space', 60);
      if (s.enemies) { await ctx.joystick(1, 0, 90); await ctx.joystick(-1, 0, 90); }
    }
  }
}
