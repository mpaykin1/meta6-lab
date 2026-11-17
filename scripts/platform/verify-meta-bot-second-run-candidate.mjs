// Z20: validate a candidate fix to protected META BOT in memory; never modify its core.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const coreFile = path.join(root, 'scripts/meta-bot/core.mjs');
const patchFile = path.join(root, 'docs/patches/meta-bot-second-run.patch');
const original = "      again.viewport = cfg.viewports[0] + ' (2-й запуск)'; if (full) runs.push(again);";
const replacement = [
  "      again.viewport = cfg.viewports[0] + ' (2-й запуск)';",
  '      if (!again.hashes.length) {',
  "        again.errors.push('БЕЗ ПОВТОРОВ: повторный запуск не дал раскладку уровня 1');",
  '        again.ok = false;',
  '      }',
  '      if (full || !again.ok) runs.push(again);'
].join('\n');

export function candidateSource() {
  const source = readFileSync(coreFile, 'utf8');
  if (source.includes(replacement)) return source; // Remains valid after Claude applies patch.
  assert.ok(source.includes(original), 'META BOT second-run branch changed: re-review candidate');
  const patch = readFileSync(patchFile, 'utf8');
  assert.ok(patch.includes('-' + original), 'Patch does not remove the vulnerable branch');
  for (const line of replacement.split('\n')) {
    assert.ok(patch.includes('+' + line), 'Patch missing candidate line: ' + line);
  }
  return source.replace(original, replacement);
}

async function checkScenario(source, second, expectedOk, label) {
  const marker = 'export async function checkGame(';
  assert.ok(source.includes(marker), 'Missing production checkGame implementation');
  const code = source.slice(source.indexOf(marker)).replace(marker, 'async function checkGame(');
  let count = 0;
  const first = { viewport: 'mobile', ok: true, hashes: ['first-layout'], errors: [] };
  const loadGame = async () => ({
    cfg: { viewports: ['mobile'], skipChecks: [], secondRun: 'hash' }, strategy: {}
  });
  const chromium = { launch: async () => ({ close: async () => {} }) };
  const runOnce = async ({ firstOnly }) => {
    count++;
    assert.equal(!!firstOnly, count === 2, label + ': wrong firstOnly');
    return structuredClone(count === 1 ? first : second);
  };
  const fpsSave = () => {};
  // Exercise the exact production checkGame function with deterministic runOnce outcomes.
  const checkGame = new Function('loadGame', 'chromium', 'runOnce', 'fpsSave', 'path',
    code + '\nreturn checkGame;')(loadGame, chromium, runOnce, fpsSave, path);
  const result = await checkGame({ gameDir: '/tmp/meta-bot-hash', repoRoot: '/tmp', baseUrl: 'http://localhost' });
  assert.equal(count, 2, label + ': second launch skipped');
  assert.equal(result.ok, expectedOk, label + ': falsely accepted/rejected second launch');
  if (!expectedOk) {
    assert.ok(result.runs.some(r => !r.ok), label + ': failure hidden from result.runs');
  }
}

export async function verifyCandidate(source) {
  await checkScenario(source,
    { ok: true, hashes: ['new-layout'], errors: [] }, true, 'different-layout');
  await checkScenario(source,
    { ok: false, hashes: [], errors: ['navigation failed'] }, false, 'failed-hash-retry');
  await checkScenario(source,
    { ok: true, hashes: [], errors: [] }, false, 'empty-hash-retry');
  await checkScenario(source,
    { ok: true, hashes: ['first-layout'], errors: [] }, false, 'duplicate-hash');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await verifyCandidate(candidateSource());
  console.log('META_BOT_SECOND_RUN_CANDIDATE_PASS: 4 cases, protected core unchanged');
}
