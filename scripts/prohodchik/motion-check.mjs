// B2/B3: only actual hero displacement caused during player input counts as movement.
// A changed level, progress counter or animation alone is never movement evidence.
const EPSILON = 0.05;
const STUCK_MS = 2000;
const result = (status, details = {}) => ({status, ...details});

function coordinates(state) {
  const p = state?.hero;
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
  return p;
}

export function assessMotion(segments) {
  if (!Array.isArray(segments)) return result('INVALID', {reason: 'segments must be an array'});
  let stationaryMs = 0;
  let sampled = 0;
  let driftX = 0;
  let driftY = 0;
  for (const segment of segments) {
    if (!segment || !Number.isFinite(segment.durationMs) || segment.durationMs <= 0) {
      return result('INVALID', {reason: 'invalid input duration'});
    }
    const {before, after} = segment;
    const from = coordinates(before);
    const to = coordinates(after);
    if (!from || !to || !Number.isInteger(before.level) || !Number.isInteger(after.level)) {
      return result('INVALID', {reason: 'missing trustworthy hero coordinates or level'});
    }
    if (before.alive === false || after.alive === false) {
      return result('DEAD', {hero: to, level: after.level});
    }
    if (before.level !== after.level) {
      return result('LEVEL_CHANGED', {reason: 'level transition is not proof of movement'});
    }
    if (!segment.input) {
      driftX = (to.x - from.x) / segment.durationMs;
      driftY = (to.y - from.y) / segment.durationMs;
      stationaryMs = 0;
      continue;
    }
    sampled++;
    const distance = Math.hypot(
      to.x - from.x - driftX * segment.durationMs,
      to.y - from.y - driftY * segment.durationMs
    );
    if (distance > EPSILON) return result('MOVED', {distance, level: after.level});
    stationaryMs += segment.durationMs;
    if (stationaryMs >= STUCK_MS) {
      return result('STUCK', {hero: to, level: after.level, stationaryMs});
    }
  }
  return sampled
    ? result('NO_MOVEMENT', {stationaryMs})
    : result('NO_INPUT', {reason: 'no physical input was sent'});
}
