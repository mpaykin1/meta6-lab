// Permanent K3 trap: owner-supplied source references belong in reference/, not games/.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));

function invalidOwnerReferencePaths(paths) {
  return paths.filter(path => {
    const normalized = path.replaceAll('\\', '/').replace(/^\.\//, '');
    return /^games\/[^/]+-reference(?:\/|$)/.test(normalized) ||
      /^references\//.test(normalized);
  });
}

// Three independently broken layouts, including the deceptive "reference" name.
const mutations = [
  ['reference-source-in-games', ['games/example-reference/index.html']],
  ['hidden-asset-under-games', ['reference/example/index.html', 'games/example-reference/assets/atlas.png']],
  ['deceptive-reference-name', ['games/reference-safe-reference/index.html']],
  ['plural-reference-root', ['references/example/index.html']]
];
for (const [name, changed] of mutations) {
  assert.ok(invalidOwnerReferencePaths(changed).length, `Mutation survived: ${name}`);
}
assert.deepEqual(invalidOwnerReferencePaths([
  'reference/example/index.html', 'reference/example/assets/atlas.png',
  'games/example/index.html'
]), []);

if (!process.argv.includes('--selftest')) {
  const changed = execFileSync('git', [
    'diff', '--name-only', '--diff-filter=A', 'origin/main...HEAD'
  ], {cwd: root, encoding: 'utf8'}).trim().split('\n').filter(Boolean);
  const invalid = invalidOwnerReferencePaths(changed);
  assert.equal(invalid.length, 0,
    `Owner-supplied references must live under reference/: ${invalid.join(', ')}`);
}
console.log('Owner reference placement: 4/4 mutations caught');
