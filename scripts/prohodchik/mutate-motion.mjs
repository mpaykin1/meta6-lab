// K5: each spoiled copy must make the actual B2 verifier fail, not merely return a different result.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const script = join(repo, 'scripts/prohodchik/verify-motion.mjs');
const original = readFileSync(join(repo, 'scripts/prohodchik/motion-check.mjs'), 'utf8').replace(/\r\n/g, '\n');
const temp = mkdtempSync(join(tmpdir(), 'prohodchik-b2-mutations-'));

function execute(source, name, expectedPass) {
  const moduleFile = join(temp, 'motion-check.mjs');
  writeFileSync(moduleFile, source);
  const res = spawnSync(process.execPath, [script, '--module', moduleFile], {
    encoding: 'utf8', timeout: 15000
  });
  if (res.error) throw res.error;
  const log = res.stdout + '\n' + res.stderr;
  assert.equal(res.status === 0, expectedPass, name + ' unexpectedly passed/failed:\n' + log);
  if (expectedPass) assert.match(log, /B2_VERIFIER_PASS/);
  else assert.match(log, /AssertionError/);
  console.log('B2_MUTATION_PASS ' + name);
}

const mutations = [
  ['jitter-counted-as-motion', 'const EPSILON = 0.05;', 'const EPSILON = 0;'],
  ['stuck-wait-hidden', 'const STUCK_MS = 2000;', 'const STUCK_MS = 100000;'],
  ['first-motion-hides-later-stuck', "motion = result('MOVED', {distance, level: after.level});",
    "return result('MOVED', {distance, level: after.level});"],
  ['stuck-counter-restarts-every-sample', 'stationaryMs += segment.durationMs;',
    'stationaryMs = segment.durationMs;'],
  ['first-motion-disables-stuck-alarm', 'if (stationaryMs >= STUCK_MS) {',
    'if (stationaryMs >= STUCK_MS && !motion) {'],
  ['auto-drift-falsely-accepted', 'pendingX += to.x - from.x - driftX * segment.durationMs;',
    'pendingX += to.x - from.x;'],
  ['death-ignored', 'if (before?.alive === false || after?.alive === false) {',
    'if (false && (before?.alive === false || after?.alive === false)) {'],
  ['death-vanished-hero-fallback-disabled',
    'const lastHero = coordinates(after) ?? coordinates(before);',
    'const lastHero = coordinates(after);'],
  ['death-before-state-ignored',
    'if (before?.alive === false || after?.alive === false) {',
    'if (after?.alive === false) {'],
  ['death-with-missing-level-not-detected',
    'if (before?.alive === false || after?.alive === false) {',
    'if ((before?.alive === false || after?.alive === false) && Number.isInteger(after?.level)) {'],
  // Deception: skip death reports for the named game, even if its hero vanished.
  ['death-game-specific-deception',
    'if (before?.alive === false || after?.alive === false) {',
    "if ((before?.alive === false || after?.alive === false) && before?.game !== 'veil-terraces') {"],
  ['progress-counted-as-movement', 'if (distance > EPSILON && observedDistance > EPSILON)',
    'if ((distance > EPSILON && observedDistance > EPSILON) || after.progress > before.progress)'],
  ['level-change-counted-as-movement', 'if (before.level !== after.level) {',
    "if (false && before.level !== after.level) {"],
  ['no-input-counted-as-movement', 'if (!segment.input) {', 'if (false && !segment.input) {'],
  // Deception: special-case the named benchmark game, instead of measuring coordinates.
  ['game-specific-deception', '  let stationaryMs = 0;',
    "  if (segments[0]?.before?.game === 'veil-terraces') return {status: 'MOVED'};\n" +
    '  let stationaryMs = 0;'],
  ['transient-scroll-ignored', 'sample.sy !== 0 ||', 'false ||'],
  ['transient-canvas-resize-ignored', 'Math.abs(sample.cw - baseline.cw) > 1 ||', 'false ||'],
  ['release-only-deception', 'for (const sample of samples) {',
    'for (const sample of samples.slice(-1)) {'],
  ['follow-up-ignored-after-first-move', 'if (laterMs < STUCK_MS) {',
    'if (false && laterMs < STUCK_MS) {'],
  ['follow-up-shortened-to-one-ms', 'if (laterMs < STUCK_MS) {',
    'if (laterMs < 1) {'],
  ['pause-falsely-counts-as-continuous-hold',
    'if (!segment.input) laterMs = 0;', 'if (!segment.input) continue;'],
  ['early-accept-of-short-followup',
    'else laterMs += segment.durationMs;', 'else laterMs += segment.durationMs + 2000;'],
  ['first-move-counted-as-followup',
    'for (let i = firstMoveIdx + 1; i < segments.length; i++) {',
    'for (let i = firstMoveIdx; i < segments.length; i++) {'],
  // Deception: silently skip pause handling for the fixture's named game.
  ['named-game-skips-pause',
    'if (!segment.input) laterMs = 0;',
    "if (!segment.input && segment.before?.game !== 'veil-terraces') laterMs = 0;"],
  ['slow-x-microsteps-forgotten',
    'pendingX += to.x - from.x - driftX * segment.durationMs;',
    'pendingX = to.x - from.x - driftX * segment.durationMs;'],
  ['slow-y-microsteps-forgotten',
    'pendingY += to.y - from.y - driftY * segment.durationMs;',
    'pendingY = to.y - from.y - driftY * segment.durationMs;'],
  ['release-carries-false-displacement',
    '      stationaryMs = 0;\n      pendingX = 0;\n      pendingY = 0;\n      observedX = 0;\n      observedY = 0;',
    '      stationaryMs = 0;'],
  // Deception: only the fixture's originally named game gets slow-movement detection.
  ['slow-movement-named-game-deception',
    'const distance = Math.hypot(pendingX, pendingY);',
    "const distance = before.game === 'veil-terraces' ? Math.hypot(pendingX, pendingY) : 0;"],
  ['stopped-drift-manufactures-motion',
    'distance > EPSILON && observedDistance > EPSILON', 'distance > EPSILON'],
  ['corrected-distance-pretends-to-be-observed',
    'const observedDistance = Math.hypot(observedX, observedY);',
    'const observedDistance = Math.hypot(pendingX, pendingY);'],
  ['stopped-drift-game-deception',
    'distance > EPSILON && observedDistance > EPSILON',
    "distance > EPSILON && (before.game === 'veil-terraces' || observedDistance > EPSILON)"],
  ['in-flight-death-ignored',
    "['DEAD', 'STUCK', 'INVALID', 'LEVEL_CHANGED'].includes(verdict.status)",
    "['STUCK', 'INVALID', 'LEVEL_CHANGED'].includes(verdict.status)"],
  ['in-flight-stuck-ignored',
    "['DEAD', 'STUCK', 'INVALID', 'LEVEL_CHANGED'].includes(verdict.status)",
    "['DEAD', 'INVALID', 'LEVEL_CHANGED'].includes(verdict.status)"],
  ['in-flight-artifact-skipped', 'await onIncident(verdict);', 'await Promise.resolve();'],
  ['in-flight-named-game-deception',
    "if (['DEAD', 'STUCK', 'INVALID', 'LEVEL_CHANGED'].includes(verdict.status)) {",
    "if (segment.before?.game === 'veil-terraces' && " +
      "['DEAD', 'STUCK', 'INVALID', 'LEVEL_CHANGED'].includes(verdict.status)) {"],
  ['transition-stops-direction-probes',
    "['MOVED', 'DEAD', 'INVALID'].includes(verdict.status)",
    "['MOVED', 'DEAD', 'INVALID', 'LEVEL_CHANGED'].includes(verdict.status)"],
  ['transition-forged-as-motion', 'verdict = await probe(direction, index);',
    "verdict = await probe(direction, index); if (verdict.status === 'LEVEL_CHANGED') return {status: 'MOVED'};"],
  ['transition-named-game-deception', 'verdict = await probe(direction, index);',
    "verdict = await probe(direction, index); " +
      "if (verdict.game === 'other-game' && verdict.status === 'LEVEL_CHANGED') return verdict;"]
];

try {
  execute(original, 'original', true);
  for (const [name, from, replacement] of mutations) {
    assert.ok(original.includes(from), 'Mutation target disappeared: ' + name);
    const mutant = original.replace(from, replacement);
    assert.notEqual(mutant, original, 'Mutation failed: ' + name);
    execute(mutant, name, false);
  }
  console.log('B2_MUTATIONS_PASS all hostile variants including slow microsteps and deception');
} finally {
  rmSync(temp, {recursive: true, force: true});
}

