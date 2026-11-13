// New files only: detect regressions to all three Claude LAB Pages repairs.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyClaudePages} from './verify-claude-pages.mjs';

const source = readFileSync(new URL('../../.github/workflows/lab-pages.yml', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n');
verifyClaudePages(source);
const ifLine = source.split('\n').find(x => /^    if: github\.ref == 'refs\/heads\/main' &&/.test(x));
assert.ok(ifLine, 'missing production guard condition');
const edits = [
  ['deploy-from-any-branch-cheat', ifLine, '    if: true'],
  ['allow-duplicate-guard-deploy', ifLine, "    if: github.ref == 'refs/heads/main'"],
  ['top-level-concurrency-cancels-deploy', '    concurrency:\n      group: lab-pages',
    'concurrency:\n  group: lab-pages'],
  ['kick-branch-does-not-request-main',
    '-f ref=main',
    '-f ref=lab/preview']
];
for (const [label, target, mutated] of edits) {
  assert.ok(source.includes(target), 'Mutation target missing: ' + label);
  const changed = source.replace(target, mutated);
  assert.notEqual(changed, source, 'Mutation did nothing: ' + label);
  assert.throws(() => verifyClaudePages(changed), assert.AssertionError,
    'MUTATION_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
}
console.log('CLAUDE_PAGES_MUTATIONS_PASS 4/4');
