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
  ]
];
for (const [label, before, after] of cases) {
  assert.ok(source.includes(before), 'mutation anchor disappeared: ' + label);
  const changed = source.replace(before, after);
  assert.notEqual(changed, source);
  const uri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(changed);
  const { allPages } = await import(uri);
  await assert.rejects(() => verifyPagination(allPages), undefined, 'escaped mutation: ' + label);
  console.log('TRAPPED:', label);
}
console.log('mutate-paginate: 4/4');
