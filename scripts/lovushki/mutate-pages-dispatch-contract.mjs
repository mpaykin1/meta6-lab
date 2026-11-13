// Both supported dispatch commands must select trusted main; comments are not execution.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyClaudePages} from './verify-claude-pages.mjs';

const workflow = readFileSync(new URL('../../.github/workflows/lab-pages.yml', import.meta.url), 'utf8');
const verifier = readFileSync(new URL('./verify-claude-pages.mjs', import.meta.url), 'utf8');
const api = 'gh api --method POST "repos/$GITHUB_REPOSITORY/actions/workflows/lab-pages.yml/dispatches" -f ref=main';
assert.ok(workflow.includes(api), 'Production dispatch command must be exercised');

function verify(check) {
  check(workflow);
  check(workflow.replace(api, 'gh workflow run lab-pages.yml --ref main'));
  for (const replacement of [
    api.replace('ref=main', 'ref=lab/preview'),
    api.replace('--method POST', '--method GET'),
    api.replace('lab-pages.yml/dispatches', 'other.yml/dispatches'),
    'echo skipped # ' + api,
    '# ' + api,
    'gh workflow run lab-pages.yml --ref main-unsafe'
  ]) {
    assert.throws(() => check(workflow.replace(api, replacement)), assert.AssertionError,
      'Unsafe or nonexecuted dispatch must fail: ' + replacement);
  }
}

verify(verifyClaudePages);
const mutants = [
  ['ignore-main-target', verifier.replace('ref=main\\s*', 'ref=[^ ]+\\s*')],
  ['accept-comment-only-command', verifier.replace('!/^\\s*#/.test(x)', 'true')
    .replace('^\\s*(?:if\\s+)?gh api', '^\\s*(?:if\\s+)?(?:#\\s*)?gh api')],
  ['dispatch-check-disabled', verifier.replace(
    'commands.some(x => cliDispatch.test(x) || apiDispatch.test(x))', 'true')]
];
for (const [name, source] of mutants) {
  assert.notEqual(source, verifier, 'Mutation target missing: ' + name);
  const module = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  assert.throws(() => verify(module.verifyClaudePages), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('PAGES_DISPATCH_CONTRACT_PASS 3/3');
