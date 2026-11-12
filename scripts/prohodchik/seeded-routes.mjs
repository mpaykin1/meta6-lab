// Deterministic alternative player-input routes. No game state writes or teleportation.
const VECTORS = Object.freeze([
  [0, -1], [1, 0], [0, 1], [-1, 0],
  [0.7, -0.7], [0.7, 0.7], [-0.7, 0.7], [-0.7, -0.7]
]);

export function seededRouteVariants(seed, {routes = 3, steps = 5} = {}) {
  if (!Number.isSafeInteger(seed) || seed < 0) throw new TypeError('seed must be a nonnegative safe integer');
  if (!Number.isInteger(routes) || routes < 2 || routes > 8) throw new RangeError('routes must be 2..8');
  if (!Number.isInteger(steps) || steps < 1 || steps > 8) throw new RangeError('steps must be 1..8');
  let state = (seed >>> 0) || 0x9e3779b9;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const directions = VECTORS.map(([dx, dy]) => ({dx, dy}));
  for (let i = directions.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [directions[i], directions[j]] = [directions[j], directions[i]];
  }
  const plans = [];
  for (let variant = 0; variant < routes; variant++) {
    const path = [];
    for (let step = 0; step < steps; step++) {
      const index = (step + variant) % directions.length;
      path.push(Object.freeze({...directions[index], ms: 180 + (next() % 4) * 40}));
    }
    plans.push(Object.freeze(path));
  }
  return Object.freeze(plans);
}

export function withSeededRoute(original, plan) {
  if (typeof original?.start !== 'function' || typeof original?.playLevel !== 'function') {
    throw new TypeError('existing game strategy must export start and playLevel');
  }
  if (!Array.isArray(plan) || plan.some(p => !Number.isFinite(p.dx) ||
    !Number.isFinite(p.dy) || !Number.isFinite(p.ms) || p.ms < 100 ||
    p.ms > 500 || Math.abs(p.dx) > 1 || Math.abs(p.dy) > 1)) {
    throw new TypeError('invalid real-input route');
  }
  return Object.freeze({
    start: async ctx => original.start(ctx),
    playLevel: async (ctx, level) => {
      for (const step of plan) {
        const s = ctx.state();
        if (s.level !== level || s.levelDone || s.gameDone || s.alive === false) return;
        await ctx.joystick(step.dx, step.dy, step.ms);
      }
      const state = ctx.state();
      if (state.level === level && !state.levelDone && !state.gameDone && state.alive !== false) {
        await original.playLevel(ctx, level);
      }
    }
  });
}
