// Самопроверка реального build.mjs на изолированных мутациях. Сеть не используется.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('./build.mjs', import.meta.url), 'utf8');

async function moduleFrom(text) {
  return import('data:text/javascript;base64,' + Buffer.from(text).toString('base64'));
}

async function suite(m, candidate) {
  assert.doesNotMatch(candidate, /process\.env\.GITHUB_/);
  assert.equal(m.runVerdict({ conclusion: 'failure' }), 'красный');
  assert.equal(m.runVerdict({ conclusion: 'success' }), 'зелёный');
  assert.equal(m.runVerdict({ conclusion: 'cancelled' }), 'нет данных');

  assert.equal(m.prState({ state: 'closed', merged_at: '2026-11-10T00:00:00Z' }), 'merged');
  assert.equal(m.prState({ state: 'open', merged_at: null }), 'open');
  assert.equal(m.prState({ state: 'closed', merged_at: null }), 'closed');

  assert.equal(m.isProtectedFile('scripts/meta-bot/core.mjs'), true);
  assert.equal(m.isProtectedFile('scripts/meta-progress/progress.mjs'), true);
  assert.equal(m.isProtectedFile('scripts/kontur/guard.mjs'), true);
  assert.equal(m.isProtectedFile('.github/workflows/another.yml'), true);
  assert.equal(m.isProtectedFile('scripts/tool/selftest.mjs'), true);
  assert.equal(m.isProtectedFile('scripts/platform/meta-games-guard.mjs'), true);
  assert.equal(m.isProtectedFile('scripts/shared/mutate-guard.mjs'), true);
  assert.equal(m.isProtectedFile('scripts/platform/verify-storefront.mjs'), true);
  assert.equal(m.isProtectedFile('games/veil-terraces/index.html'), false);

  assert.throws(() => m.enforceLimit(Array(151).fill('x').join('\n')), /exceeds/);
  assert.throws(() => m.enforceLimit('ж'.repeat(4500)), /exceeds/);
  assert.equal(m.enforceLimit('okay'), 'okay');

  assert.deepEqual(m.progressMark(null, 'M1'), {
    value: 'нет данных', reason: 'нет данных'
  });
  assert.deepEqual(m.progressMark({}, 'Л2'), {
    value: 'нет данных', reason: 'нет данных'
  });
  assert.equal(m.progressMark({ finish: { M1: { pass: true } } }, 'M1').value, 'готов');
  assert.equal(m.progressMark({ finish: { M2: { pass: false, note: '404' } } }, 'M2').value,
    'не готов');

  assert.equal(await m.safeSection(async () => { throw new Error('GitHub API 403'); }),
    'нет данных');
  assert.equal(await m.safeSection(async () => 42), 42);
  const prError = await m.prSummary('нет данных', null);
  assert.equal(prError.protectedItems, 'нет данных');
  assert.equal(prError.mergedItems, 'нет данных');
  assert.deepEqual(m.newErrorRows('| 18 | старая |', '| 18 | старая |\n| 18 | новая |'),
    ['| 18 | новая |']);
  assert.deepEqual(m.newErrorRows(null, '| 18 | новая |'), 'нет данных');
  assert.deepEqual(m.normalizeChanges('нет данных'),
    { count: 'нет данных', folders: 'нет данных' });
  assert.deepEqual(m.normalizeChanges({ count: 2, folders: 'scripts:4' }),
    { count: 2, folders: 'scripts:4' });

  const finishDoc = [
    '| M1 | x | verify | ЗЕЛЁНАЯ — [прогон](https://github.com/o/r/actions/runs/123) |',
    '| M2 | x | verify | ЗЕЛЁНАЯ — без ссылки на Actions |',
    '| M3 | x | verify | НЕТ |'
  ].join('\n');
  const finishRows = m.finishTableStatus(finishDoc);
  assert.equal(finishRows.length, 3);
  assert.equal(finishRows[0].value, 'готов');
  assert.equal(finishRows[1].value, 'нет данных');
  assert.equal(finishRows[2].value, 'не готов');
  assert.deepEqual(m.finishTableStatus(null), null);

  const phaseOne = Array.from({length: 18}, (_, index) =>
    '| M' + (index + 1) + ' | x | v | ' +
    (index < 7 ? 'ЗЕЛЁНАЯ — [прогон](https://github.com/o/r/actions/runs/123)' :
      'НЕТ') + ' |').join('\n');
  const phaseTwo = '| Л1 | x | v | ЗЕЛЁНАЯ — [прогон](https://github.com/o/r/actions/runs/456) |';
  assert.equal(m.finishSummary(phaseOne, phaseTwo).ready.length, 7);
  assert.equal(m.finishSummary(phaseOne, phaseTwo).pending.length, 11);
  assert.equal(m.finishSummary(phaseOne.split('\n').slice(1).join('\n'), phaseTwo),
    'нет данных');
  const allGreen = phaseOne.replaceAll('| НЕТ |',
    '| ЗЕЛЁНАЯ — [прогон](https://github.com/o/r/actions/runs/123) |');
  assert.equal(m.finishSummary(allGreen, phaseTwo).ready.length, 19);

  const at = Date.parse('2026-11-13T12:00:00Z');
  const old = {generated_at: '2026-11-13T10:00:00Z', run: 'a',
    sha: {lab: 'before'}, changes: {lab: {count: 1}}, pr: {open: 55}};
  const volatile = {...old, generated_at: '2026-11-13T11:59:00Z',
    run: 'b', sha: {lab: 'after'}, changes: {lab: {count: 2}}};
  assert.equal(m.shouldPublishStatus(old, volatile, at), false);
  assert.equal(m.shouldPublishStatus(old, {...old, pr: {open: 54}},
    Date.parse('2026-11-13T10:30:00Z')), false);
  assert.equal(m.shouldPublishStatus(old, {...old, pr: {open: 54}}, at), true);
  assert.deepEqual(m.retainKnown({review: {redLab: ['known']}},
    {review: {redLab: 'нет данных'}}), {review: {redLab: ['known']}});
}

const mutations = {
  'false-green-without-run-link': [
    "const ready = /^ЗЕЛЁНАЯ(?:\\s|$)/.test(status) && linked;".replace('\\\\', '\\'),
    "const ready = /^ЗЕЛЁНАЯ(?:\\s|$)/.test(status);".replace('\\\\', '\\')
  ],
  'stage-two-before-first-eighteen': [
    'const secondary = allGreen ? finishTableStatus(stageTwo) : [];',
    'const secondary = finishTableStatus(stageTwo);'
  ],
  'under-count-accepted-as-complete': [
    'if (primary === null || primary.length !== 18) return UNKNOWN;',
    'if (primary === null) return UNKNOWN;'
  ],
  'hourly-gate-removed': [
    "if (now - Date.parse(previous.generated_at) < 3600_000) return false;",
    "if (false) return false;"
  ],
  'timestamp-trigger-misreported-as-fact': [
    'const {generated_at, run, sha, changes, ...facts} = value;',
    'const {run, sha, changes, ...facts} = value;'
  ],
  'missing-api-values-overwrite-known-truth': [
    'if (current === UNKNOWN && previous !== undefined) return previous;',
    'if (false) return previous;'
  ],
  'red-run-as-green': [
    "run?.conclusion === 'failure' ? 'красный'",
    "run?.conclusion === 'failure' ? 'зелёный'"
  ],
  'merged-as-open': [
    "if (pr.merged_at) return 'merged';",
    "if (pr.merged_at) return 'open';"
  ],
  'open-as-merged': [
    "if (pr.state === 'open') return 'open';",
    "if (pr.state === 'open') return 'merged';"
  ],
  'protected-file-ignored': [
    'return /^(scripts\\/(meta-bot|meta-progress|kontur)\\/|\\.github\\/workflows\\/)/.test(file) ||',
    'return /^no-protected-file$/.test(file) ||'
  ],
  '150-line-limit-disabled': [
    "md.split('\\n').length > 150",
    "md.split('\\n').length > 9999"
  ],
  '8-kib-limit-disabled': [
    "Buffer.byteLength(md, 'utf8') > 8192",
    "Buffer.byteLength(md, 'utf8') > 999999"
  ],
  'missing-progress-as-ready': [
    "return { value: UNKNOWN, reason: UNKNOWN };",
    "return { value: 'готов', reason: '' };"
  ],
  'api-error-crashes-summary': [
    '    // Сбой одного источника не должен искажать другие секции.\n    return UNKNOWN;',
    '    // Сбой одного источника не должен искажать другие секции.\n    throw _error;'
  ],
  'pr-api-error-hides-protected-merges': [
    'closed: UNKNOWN, mergedItems: UNKNOWN, protectedItems: UNKNOWN',
    'closed: UNKNOWN, mergedItems: UNKNOWN, protectedItems: []'
  ],
  'raw-github-env-rejected': [
    'process.env.STATUS_RUN_URL || UNKNOWN',
    'process.' + 'env.GITHUB_RUN_ID || UNKNOWN'
  ],
  'duplicate-error-number-hidden': [
    '!oldRows.has(row)',
    'false'
  ],
  'failed-compare-disguised-as-zero': [
    "? value : { count: UNKNOWN, folders: UNKNOWN };",
    "? value : { count: 0, folders: 'ничего' };"
  ],
  'hardcoded-protected-file-cheat': [
    'export function isProtectedFile(file) {',
    "export function isProtectedFile(file) {\n" +
      "  if (file === '.github/workflows/example.yml') return true;\n  return false;"
  ]
};

let failures = 0;
try {
  await suite(await moduleFrom(source), source);
  console.log('GREEN original build.mjs: all assertions');
} catch (error) {
  console.error('RED original build.mjs:', error);
  failures++;
}

for (const [name, [from, to]] of Object.entries(mutations)) {
  if (!source.includes(from)) {
    console.error('INVALID mutation not applied: ' + name);
    failures++;
    continue;
  }
  const mutant = source.replace(from, to);
  try {
    await suite(await moduleFrom(mutant), mutant);
    console.error('FAIL mutation stayed GREEN: ' + name);
    failures++;
  } catch (error) {
    console.log('MUTATION RED (caught): ' + name + ' | ' + error.message.split('\n')[0]);
  }
}
if (!failures) console.log('GREEN selftest: original passed, all mutations were RED');
process.exitCode = failures ? 1 : 0;
