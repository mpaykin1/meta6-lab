// Moves through genuine keyboard / touch controls only; never edits the game.
export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) {
    await ctx.key('Enter', 80);
    await ctx.wait(800);
  }
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height * 0.72);
    await ctx.wait(500);
  }
}

export async function playLevel(ctx, level) {
  let step = 0;
  while (true) {
    const state = ctx.state();
    if (state.gameDone || state.levelDone || state.level > level) return;
    if (!state.alive) {
      // The game's real free revive appears after its death animation. Use
      // its visible button just as a player would. If absent, the core must
      // still observe death and fail after the strict 5-second threshold.
      if (state.reviveButton) {
        await ctx.tap(state.reviveButton.x, state.reviveButton.y);
      }
      await ctx.wait(300);
      continue;
    }

    const foe = state.nearestEnemy;
    if (foe && foe.distance < 6 && state.hp < 0.35) {
      // Evade using the same joystick a player uses; never teleport.
      await ctx.joystick(step % 2 ? -1 : 1, 0.6, 320);
      await ctx.key('KeyJ', 110);
    } else if (foe && foe.distance < 2.5) {
      // Classic uses J/K for attack. A hit must register in game state.
      await ctx.key('KeyJ', 190);
    } else if (state.goal) {
      // A coin can be above a one-block voxel ledge: horizontal arrival
      // alone does not collect it. Jump with the real input when nearby.
      const distance = Math.hypot(state.goal.x - state.hero.x,
                                  state.goal.y - state.hero.y);
      if (distance < 1.25) await ctx.jump();
      // The existing META BOT calibrates joystick/camera direction.
      await ctx.walkToGoal(450);
      if (step % 8 === 7) await ctx.jump();
    } else {
      // Search by real movement only when the game has no visible objective.
      await ctx.joystick(Math.cos(step * 0.6), Math.sin(step * 0.6), 350);
      if (step % 4 === 0) await ctx.jump();
    }
    step++;
  }
}
