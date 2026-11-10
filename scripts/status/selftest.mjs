// Самопроверка реального build.mjs на изолированных мутациях. Сеть не используется.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('./build.mjs', import.meta.url), 'utf8');

async function moduleFrom(text) {
  return import('data:text/javascript;base64,' + Buffer.from(text).toString('base64'));
}

async function suite(m) {
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
  assert.deepEqual(m.newErrorRows('| 18 | старая |', '| 18 | старая |\n| 18 | новая |'),
    ['| 18 | новая |']);
  assert.deepEqual(m.newErrorRows(null, '| 18 | новая |'), 'нет данных');
  assert.deepEqual(m.normalizeChanges('нет данных'),
    { count: 'нет данных', folders: 'нет данных' });
  assert.deepEqual(m.normalizeChanges({ count: 2, folders: 'scripts:4' }),
    { count: 2, folders: 'scripts:4' });
}

const mutations = {
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
  await suite(await moduleFrom(source));
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
    await suite(await moduleFrom(mutant));
    console.error('FAIL mutation stayed GREEN: ' + name);
    failures++;
  } catch (error) {
    console.log('MUTATION RED (caught): ' + name + ' | ' + error.message.split('\n')[0]);
  }
}
if (!failures) console.log('GREEN selftest: original passed, all mutations were RED');
process.exitCode = failures ? 1 : 0;
