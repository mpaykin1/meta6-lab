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
  let motion = null;
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
    if (distance > EPSILON) {
      motion = result('MOVED', {distance, level: after.level});
      stationaryMs = 0;
      continue;
    }
    stationaryMs += segment.durationMs;
    if (stationaryMs >= STUCK_MS) {
      return result('STUCK', {hero: to, level: after.level, stationaryMs});
    }
  }
  return motion || (sampled
    ? result('NO_MOVEMENT', {stationaryMs})
    : result('NO_INPUT', {reason: 'no physical input was sent'}));
}


// FIX must stay stable for the entire gesture, not merely at release.
export function assessFixedViewport(samples) {
  if (!Array.isArray(samples) || samples.length < 2) {
    return result('INVALID', {reason: 'viewport trace must contain a baseline and in-flight samples'});
  }
  const keys = ['sx', 'sy', 'st', 'cx', 'cy', 'cw', 'ch'];
  const baseline = samples[0];
  for (const sample of samples) {
    if (!sample || keys.some(key => !Number.isFinite(sample[key]))) {
      return result('INVALID', {reason: 'missing viewport coordinates'});
    }
    if (sample.sx !== 0 || sample.sy !== 0 || sample.st !== 0 ||
      Math.abs(sample.cx - baseline.cx) > 1 ||
      Math.abs(sample.cy - baseline.cy) > 1 ||
      Math.abs(sample.cw - baseline.cw) > 1 ||
      Math.abs(sample.ch - baseline.ch) > 1) {
      return result('FIX_MOVED', {baseline, observed: sample});
    }
  }
  return result('FIXED', {samples: samples.length});
}
