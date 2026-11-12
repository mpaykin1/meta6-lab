// K5: every mutant must fail the actual verifier; never modify the source under test.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const original = readFileSync(join(root, 'scripts/prohodchik/seeded-routes.mjs'), 'utf8');
const verifier = join(root, 'scripts/prohodchik/verify-seeded-routes.mjs');
const temp = mkdtempSync(join(tmpdir(), 'prohodchik-seeded-'));
const mutants = [
  ['ignore-seed', 'let state = (seed >>> 0) || 0x9e3779b9;', 'let state = 0x9e3779b9;'],
  ['same-route', 'const index = (step + variant) % directions.length;',
    'const index = step % directions.length;'],
  ['no-real-input', 'await ctx.joystick(step.dx, step.dy, step.ms);', 'await ctx.wait(step.ms);'],
  ['skip-existing-strategy', 'await original.playLevel(ctx, level);', 'return;'],
  ['test-seed-cheat', '  const directions = VECTORS.map(([dx, dy]) => ({dx, dy}));',
    '  if (seed === 17) return seededRouteVariants(81, {routes, steps});\n' +
    '  const directions = VECTORS.map(([dx, dy]) => ({dx, dy}));']
];
function execute(source, label, shouldPass) {
  const file = join(temp, 'seeded-routes.mjs');
  writeFileSync(file, source);
  const r = spawnSync(process.execPath, [verifier, '--module', file], {
    encoding: 'utf8', timeout: 15000
  });
  if (r.error) throw r.error;
  const output = r.stdout + '\n' + r.stderr;
  assert.equal(r.status === 0, shouldPass, label + ' unexpected result:\n' + output);
  if (shouldPass) assert.match(output, /SEEDED_ROUTES_PASS/);
  else assert.match(output, /AssertionError|ERR_ASSERTION/);
  console.log('SEEDED_MUTATION_PASS ' + label);
}
try {
  execute(original, 'original', true);
  for (const [label, target, replacement] of mutants) {
    assert.ok(original.includes(target), 'missing mutation target ' + label);
    execute(original.replace(target, replacement), label, false);
  }
  console.log('SEEDED_MUTATIONS_PASS 5 variants, including test-specific seed deception');
} finally {
  rmSync(temp, {recursive: true, force: true});
}
