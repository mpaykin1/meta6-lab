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

// A 40ms mobile tap / 90ms desktop key can land between WebGL frames at 3 FPS.
// Hold the game's real control long enough for input sampling; never mutate state.
async function jumpThroughInput(ctx, state) {
  const duration = 450;
  if (ctx.mobile && state.jumpButton) {
    await ctx.hold(state.jumpButton.x, state.jumpButton.y, duration);
  } else {
    await ctx.key('Space', duration);
  }
}

export async function playLevel(ctx, level) {
  let step = 0;
  let lastPosition = null;
  let stalledSteps = 0;
  let escapeAttempt = 0;
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
      // Face the actual enemy with normal controls before the melee attack.
      // Standing still and striking a target behind the hero cannot hit it.
      const yaw = Number.isFinite(state.cameraYaw) ? state.cameraYaw : 0;
      const dx = foe.x - state.hero.x, dz = foe.y - state.hero.y;
      const sx = Math.cos(yaw) * dx - Math.sin(yaw) * dz;
      const sy = Math.sin(yaw) * dx + Math.cos(yaw) * dz;
      const len = Math.hypot(sx, sy) || 1;
      await ctx.joystick(sx / len, sy / len, 230);
      await ctx.key('KeyJ', 190);
    } else if (state.goal) {
      // A coin can be above a one-block voxel ledge: horizontal arrival
      // alone does not collect it. Jump with the real input when nearby.
      const distance = Math.hypot(state.goal.x - state.hero.x,
                                  state.goal.y - state.hero.y);
      // Track actual displacement rather than assuming walkToGoal succeeded.
      // A voxel lip can leave the hero close to the coin but unable to touch it.
      const position = {x: state.hero.x, y: state.hero.y};
      if (lastPosition && Math.hypot(position.x - lastPosition.x,
                                      position.y - lastPosition.y) < 0.12) {
        stalledSteps++;
      } else {
        stalledSteps = 0;
        escapeAttempt = 0;
      }
      lastPosition = position;
      const climbRequired = state.grounded &&
        ((state.stepRise >= 1.5 && distance < 2.5) ||
         (state.coinAbove && distance < 2.5));
      // Do not jump merely because a floor-level coin is nearby. The real
      // pickup requires the player's vertical center within 1.15 voxels;
      // jumping at every close waypoint can repeatedly miss that window.
      // Jump only for a measured ledge/raised coin or a genuine stall.
      if (stalledSteps >= 3 || climbRequired) {
        if (state.grounded) await jumpThroughInput(ctx, state);
        // Side-step through real controls to avoid repeating the blocked line.
        if (stalledSteps >= 3) {
          // Rotate the escape heading across attempts rather than alternating
          // two nearly identical sidesteps at the same blocked voxel lip.
          const angle = (escapeAttempt++ % 8) * Math.PI / 4;
          const before = ctx.state().hero;
          await ctx.joystick(Math.cos(angle), Math.sin(angle), 850);
          await jumpThroughInput(ctx, ctx.state());
          const after = ctx.state().hero;
          const moved = Math.hypot(after.x - before.x, after.y - before.y);
          // A blocked escape must not immediately retry the same wall-facing
          // walkToGoal; keep trying real directions until displacement occurs.
          if (moved < 0.12) {
            stalledSteps = 3;
            step++;
            continue;
          }
          stalledSteps = 0;
          lastPosition = after;
          step++;
          continue;
        }
      }
      // Classic's updatePlayer uses camera-relative axes:
      // worldX = cos(yaw)*stickX + sin(yaw)*stickY
      // worldZ = -sin(yaw)*stickX + cos(yaw)*stickY.
      // Apply the exact inverse with real controls. Short timed calibration
      // can measure zero movement in low-FPS software-rendered Chromium.
      const yaw = Number.isFinite(state.cameraYaw) ? state.cameraYaw : 0;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const worldX = state.goal.x - state.hero.x;
      const worldZ = state.goal.y - state.hero.y;
      const stickX = cy * worldX - sy * worldZ;
      const stickY = sy * worldX + cy * worldZ;
      const length = Math.hypot(stickX, stickY) || 1;
      // At the pickup radius, a fixed 450ms move can overshoot the coin
      // between low-FPS frames. Shorten only the real joystick hold.
      // At ~5 FPS a 100ms pulse may never be sampled. Hold through at
      // least one render interval, but scale input strength near the coin
      // so the longer pulse does not overshoot its genuine pickup radius.
      const moveMs = Math.max(260, Math.min(450, Math.round(distance * 180)));
      // Keyboard input in META BOT is digital: below 0.3 on BOTH axes
      // no key is pressed at all. Preserve analog fine control on mobile,
      // but keep desktop diagonal movement above the 0.3 threshold.
      const strength = Math.max(ctx.mobile ? 0.22 : 0.52,
                                Math.min(1, distance / 1.5));
      await ctx.joystick(stickX / length * strength, stickY / length * strength, moveMs);
      if (step % 8 === 7 && ctx.state().grounded) {
        await jumpThroughInput(ctx, ctx.state());
      }
    } else {
      // Search by real movement only when the game has no visible objective.
      await ctx.joystick(Math.cos(step * 0.6), Math.sin(step * 0.6), 350);
      if (step % 4 === 0) await jumpThroughInput(ctx, ctx.state());
    }
    step++;
  }
}
