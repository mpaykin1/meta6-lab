// The shared Claude core owns checks and input. This module plans only this island's observed routes.
// Game-specific planning over observed terrain. Execution remains shared-core keyboard/touch input.
export function planRoute(map, from, goal, range = 0) {
  const { width, depth, edges, reachable, heights } = map;
  const count = width * depth, cell = (x, y) => {
    const X = Math.floor(x), Y = Math.floor(y);
    return X < 0 || Y < 0 || X >= width || Y >= depth ? -1 : X + Y * width;
  };
  let start = cell(from.x, from.y);
  if (start < 0 || start >= count || !reachable[start]) {
    let distance = Infinity;
    for (let i = 0; i < count; i++) if (reachable[i]) {
      const d = Math.hypot(i % width + .5 - from.x, Math.floor(i / width) + .5 - from.y);
      if (d < distance) { distance = d; start = i; }
    }
  }
  if (!reachable[start]) return null;
  const previous = new Int32Array(count).fill(-1), steps = new Int32Array(count).fill(-1);
  const queue = [start], shifts = [1, width, -1, -width]; steps[start] = 0;
  // Reuse the island generator's four-neighbour flood, recording predecessors for a real route.
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    for (let bit = 0; bit < 4; bit++) if (edges[i] & (1 << bit)) {
      const next = i + shifts[bit];
      if (next < 0 || next >= count || steps[next] >= 0) continue;
      previous[next] = i; steps[next] = steps[i] + 1; queue.push(next);
    }
  }
  let end = cell(goal.x, goal.y);
  if (range > 0 || end < 0 || end >= count || steps[end] < 0) {
    let score = Infinity;
    for (const i of queue) {
      const distance = Math.hypot(i % width + .5 - goal.x, Math.floor(i / width) + .5 - goal.y);
      const candidate = distance <= range ? steps[i] + distance * .1 : 10000 + distance * 100 + steps[i];
      if (candidate < score) { score = candidate; end = i; }
    }
  }
  if (steps[end] < 0) return null;
  const route = [];
  for (let i = end; i !== -1; i = previous[i]) {
    route.push({ x: i % width + .5, y: Math.floor(i / width) + .5, height: heights[i] });
  }
  route.reverse();
  while (route.length > 1 && Math.hypot(route[0].x - from.x, route[0].y - from.y) < .32) route.shift();
  return route;
}

export function stickToward(state, target) {
  const dx = target.x - state.hero.x, dz = target.y - state.hero.y, length = Math.hypot(dx, dz) || 1;
  const c = Math.cos(state.cameraYaw), s = Math.sin(state.cameraYaw);
  return { x: (c * dx - s * dz) / length, y: (s * dx + c * dz) / length };
}

export async function start(ctx) {
  await ctx.wait(2200);
  if (!ctx.state().started) { await ctx.key('Enter'); await ctx.wait(1000); }
}
const power = weapon => weapon.damage / weapon.cooldown;
function bestWeapon(state) {
  return state.equipment.reduce((a, b) => {
    const score = w => power(w) * (w.kind === 'ranged' ? (state.fightingBoss ? 3 : 1.4) : 1) +
      (w.leech && state.health <= 4 ? 100 : 0);
    return score(b) > score(a) ? b : a;
  });
}
function chooseTarget(state, map) {
  const reachable = items => items.map(item => ({ ...item, route: planRoute(map, state.hero, item) }))
    .filter(item => item.route).sort((a, b) => a.route.length - b.route.length);
  const coins = reachable(state.coins);
  const hearts = reachable(state.pickups.filter(item => item.type === 'heart'));
  if (state.health <= 4 && hearts.length) return hearts[0];
  const weapons = reachable(state.pickups.filter(item => item.type === 'weapon'));
  const hasRanged = state.equipment.some(item => item.kind === 'ranged');
  const heldPower = Math.max(...state.equipment.map(power));
  const upgrade = weapons.find(item => item.route.length <= 12 &&
    (state.equipment.length === 1 || (!hasRanged && item.kind === 'ranged') ||
     (item.route.length <= 7 && power(item) > heldPower * 1.2)));
  if (upgrade) return upgrade;
  if (coins.length) return { ...coins[0], type: 'coin' };
  return { ...(state.destination || state.goal), id: state.fightingBoss ? 'boss' : 'exit', type: state.fightingBoss ? 'boss' : 'exit' };
}
function refreshTarget(state, target) {
  if (!target) return null;
  if (target.type === 'coin') return state.coins.find(item => item.id === target.id);
  if (target.type === 'weapon' || target.type === 'heart') return state.pickups.find(item => item.id === target.id);
  if (target.id !== (state.fightingBoss ? 'boss' : 'exit')) return null;
  return state.destination || state.goal;
}
async function swap(ctx, state) {
  if (ctx.mobile) {
    const button = state.buttons.find(item => item.id === 'v7Swap' && !item.disabled);
    if (!button) throw new Error('Visible mobile weapon switch is missing');
    await ctx.tap(button.x, button.y);
  } else await ctx.key('KeyE');
  await ctx.wait(150);
}
async function attack(ctx, state, weapon, ratio, fps) {
  if (ctx.mobile) {
    const direction = stickToward(state, state.threat);
    // Wait long enough for a rendered frame to observe the ordinary turn input.
    await ctx.joystick(direction.x, direction.y, Math.min(600, Math.max(100, 1200 / fps)));
    const button = state.buttons.find(item => item.id === 'v7Action' && !item.disabled);
    if (!button) throw new Error('Visible mobile attack button is missing');
    await ctx.hold(button.x, button.y, Math.min(4000, (weapon.charge ? weapon.charge + .1 : .55) * 1000 / ratio));
  } else {
    const aim = state.threatScreen;
    if (!aim) {
      // A foe behind the camera still needs real movement/attack input.
      // Do not silently idle in combat and pretend to make progress.
      const facing = stickToward(state, state.threat);
      await ctx.joystick(facing.x, facing.y, Math.min(800, 400 / ratio));
      await ctx.key('KeyJ', Math.min(2000, 750 / ratio));
      return;
    }
    const duration = Math.min(4000, (weapon.charge ? weapon.charge + .1 : .55) * 1000 / ratio);
    await Promise.all([
      ctx.hold(Math.max(1, Math.min(ctx.viewport.width - 1, ctx.viewport.width * aim.x)),
        Math.max(1, Math.min(ctx.viewport.height - 1, ctx.viewport.height * aim.y)), duration),
      ctx.key('Space', duration)
    ]);
  }
  await ctx.wait(Math.min(400, 1100 / fps));
}
export async function playLevel(ctx, level) {
  const map = ctx.info().navigation;
  let stage = -1, bestRemaining = Infinity, progressAt = Date.now(), target = null;
  let loggedAt = 0;
  let health = ctx.state().health, kills = ctx.state().kills, weapons = ctx.state().weapons;
  const enemyHealth = new Map();
  while (ctx.state().level === level && !ctx.state().levelDone && !ctx.state().gameDone) {
    const state = ctx.state();
    if (Date.now() - loggedAt >= 10000) {
      loggedAt = Date.now();
      ctx.log(`observed stage=${state.stage} hp=${state.health} weapon=${state.equipped} hero=${state.hero.x.toFixed(2)},${state.hero.y.toFixed(2)} height=${state.heroHeight.toFixed(2)}`);
    }
    if (!state.alive) throw new Error('Hero died during ordinary gameplay');
    if (state.stage !== stage) {
      stage = state.stage; target = null; bestRemaining = Infinity; progressAt = Date.now();
      ctx.log(`island ${level + 1}, objective ${stage + 1}/${state.objectiveCount}: health ${state.health}, weapon ${state.equipped}`);
    }
    if (state.kills > kills || state.health > health || state.weapons > weapons) progressAt = Date.now();
    kills = state.kills; health = state.health; weapons = state.weapons;
    for (const foe of state.combatants) {
      if (enemyHealth.has(foe.id) && foe.hp < enemyHealth.get(foe.id)) progressAt = Date.now();
      enemyHealth.set(foe.id, foe.hp);
    }
    // The shared core enforces its 20s watchdog against real game progress and
    // the observed traversable waypoint; a second heuristic can falsely fail detours.
    const desired = bestWeapon(state);
    if (desired.id !== state.equipped) { await swap(ctx, state); continue; }
    const fps = Math.max(1, Math.min(60, state.renderFps || 20)), ratio = Math.min(1, fps * .05);
    const range = desired.kind === 'ranged' ? Math.min(12, desired.reach * .8) : desired.reach + .3;
    if (state.threat && state.threatDistance < range) {
      await attack(ctx, state, desired, ratio, fps); continue;
    }
    const updated = refreshTarget(state, target);
    if (!updated) {
      target = chooseTarget(state, map); bestRemaining = Infinity;
      ctx.log(`navigate ${target.id}${target.route ? ' via ' + target.route.length + ' observed cells' : ''}`);
    }
    else target = { ...target, ...updated };
    const route = planRoute(map, state.hero, target, target.type === 'boss' ? Math.max(1, range - 1) : 0);
    if (!route) throw new Error('No observed terrain route to ' + target.id);
    const next = route[0], distance = Math.hypot(next.x - state.hero.x, next.y - state.hero.y);
    const remaining = route.length - 1 + distance;
    if (remaining < bestRemaining - .01) { bestRemaining = remaining; progressAt = Date.now(); }
    const direction = stickToward(state, next);
    const duration = Math.min(1200, Math.max(80, distance / 4.7 * .75 * 1000 / ratio));
    if (next.height - state.heroHeight > 1.05 && state.onGround) {
      // Ordinary Space plus touch/keyboard movement; no game method changes position or jump velocity.
      const jumpDuration = Math.min(3500, 450 / ratio);
      await Promise.all([ctx.key('Space', jumpDuration), ctx.joystick(direction.x, direction.y, jumpDuration)]);
    } else await ctx.joystick(direction.x, direction.y, duration);
    await ctx.wait(Math.min(400, 1100 / fps));
  }
}
