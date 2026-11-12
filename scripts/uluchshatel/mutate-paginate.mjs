// K5 mutation traps for complete, fail-closed PR and changed-file pagination.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verifyPagination } from './verify-paginate.mjs';

const source = readFileSync(new URL('./paginate.mjs', import.meta.url), 'utf8');
await verifyPagination();
const cases = [
  [
    'truncate page of exactly 100 entries',
    'if (items.length < 100) return results;',
    'if (items.length <= 100) return results;'
  ],
  [
    'deception: silently hide PR #234',
    'results.push(...items);',
    'results.push(...items.filter(item => item.number !== 234));'
  ],
  [
    'never request second page',
    'for (let page = 1; page <= 20; page++) {',
    'for (let page = 1; page <= 1; page++) {'
  ],
  [
    'swallow malformed API responses',
    "if (!Array.isArray(items)) throw new Error('GitHub API returned incomplete page: ' + path);",
    'if (!Array.isArray(items)) return results;'
  ],
  [
    'rename source path silently discarded',
    'if (file.previous_filename) paths.push(file.previous_filename);',
    'if (false) paths.push(file.previous_filename);'
  ],
  [
    'accept renamed file with unknown original path',
    "if (file.status === 'renamed' &&",
    "if (false &&"
  ],
  [
    'deception: hardcode checked path for one game',
    'paths.push(file.filename);',
    "paths.push('games/skin-trainer/index.html');"
  ]
];
for (const [label, before, after] of cases) {
  assert.ok(source.includes(before), 'mutation anchor disappeared: ' + label);
  const changed = source.replace(before, after);
  assert.notEqual(changed, source);
  const uri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(changed);
  const { allPages, allChangedPaths } = await import(uri);
  await assert.rejects(() => verifyPagination(allPages, allChangedPaths), undefined, 'escaped mutation: ' + label);
  console.log('TRAPPED:', label);
}
console.log('mutate-paginate: 7/7');
