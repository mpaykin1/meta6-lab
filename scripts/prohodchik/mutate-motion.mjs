// K5: each spoiled copy must make the actual B2 verifier fail, not merely return a different result.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const script = join(repo, 'scripts/prohodchik/verify-motion.mjs');
const original = readFileSync(join(repo, 'scripts/prohodchik/motion-check.mjs'), 'utf8');
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
  ['auto-drift-falsely-accepted', 'to.x - from.x - driftX * segment.durationMs,',
    'to.x - from.x,'],
  ['death-ignored', 'if (before.alive === false || after.alive === false) {',
    'if (false && (before.alive === false || after.alive === false)) {'],
  ['progress-counted-as-movement', 'if (distance > EPSILON)',
    'if (distance > EPSILON || after.progress > before.progress)'],
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
    'for (const sample of samples.slice(-1)) {']
];

try {
  execute(original, 'original', true);
  for (const [name, from, replacement] of mutations) {
    assert.ok(original.includes(from), 'Mutation target disappeared: ' + name);
    const mutant = original.replace(from, replacement);
    assert.notEqual(mutant, original, 'Mutation failed: ' + name);
    execute(mutant, name, false);
  }
  console.log('B2_MUTATIONS_PASS 11 hostile variants including transient drift and release-only cheats');
} finally {
  rmSync(temp, {recursive: true, force: true});
}
