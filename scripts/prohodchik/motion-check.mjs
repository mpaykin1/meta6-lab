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
  // Integrate small consecutive steps: a slow hero can move < EPSILON per frame.
  let pendingX = 0;
  let pendingY = 0;
  for (const segment of segments) {
    if (!segment || !Number.isFinite(segment.durationMs) || segment.durationMs <= 0) {
      return result('INVALID', {reason: 'invalid input duration'});
    }
    const {before, after} = segment;
    // Death may remove the hero entity in the same frame. Preserve the last
    // trustworthy position rather than reporting INVALID and hiding the death.
    if (before?.alive === false || after?.alive === false) {
      const lastHero = coordinates(after) ?? coordinates(before);
      const level = Number.isInteger(after?.level) ? after.level : before?.level;
      return result('DEAD', {hero: lastHero, level});
    }
    const from = coordinates(before);
    const to = coordinates(after);
    if (!from || !to || !Number.isInteger(before.level) || !Number.isInteger(after.level)) {
      return result('INVALID', {reason: 'missing trustworthy hero coordinates or level'});
    }
    if (before.level !== after.level) {
      return result('LEVEL_CHANGED', {reason: 'level transition is not proof of movement'});
    }
    if (!segment.input) {
      driftX = (to.x - from.x) / segment.durationMs;
      driftY = (to.y - from.y) / segment.durationMs;
      stationaryMs = 0;
      pendingX = 0;
      pendingY = 0;
      continue;
    }
    sampled++;
    pendingX += to.x - from.x - driftX * segment.durationMs;
    pendingY += to.y - from.y - driftY * segment.durationMs;
    const distance = Math.hypot(pendingX, pendingY);
    if (distance > EPSILON) {
      motion = result('MOVED', {distance, level: after.level});
      stationaryMs = 0;
      pendingX = 0;
      pendingY = 0;
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

/**
 * Never accept one successful input burst as a finished B2 probe.
 * Keep sampling for 2 s of later held input so a newly blocked hero is detected.
 * Idle time does not count as player input, and DEAD/STUCK always wins immediately.
 */
export function assessB2Probe(segments) {
  const verdict = assessMotion(segments);
  if (verdict.status !== 'MOVED') return verdict;
  let firstMoveIdx = -1;
  for (let i = 0; i < segments.length; i++) {
    if (assessMotion(segments.slice(0, i + 1)).status === 'MOVED') {
      firstMoveIdx = i;
      break;
    }
  }
  if (firstMoveIdx < 0) return result('INVALID', {reason: 'unverifiable first movement'});
  // A pause breaks continuous input: separated taps must not satisfy a 2 s hold.
  let laterMs = 0;
  for (let i = firstMoveIdx + 1; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment.input) laterMs = 0;
    else laterMs += segment.durationMs;
  }
  if (laterMs < STUCK_MS) {
    return result('OBSERVING', {remainingMs: STUCK_MS - laterMs});
  }
  return verdict;
}
