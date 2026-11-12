// Regression: PR checks must run before main contains new files; writes only from trusted main.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const load = name => readFileSync(new URL('../../.github/workflows/' + name, import.meta.url), 'utf8');
const source = {
  quota: load('storozha-quota.yml'),
  reference: load('storozha-reference.yml'),
  handler: readFileSync(new URL('./reference-check.mjs', import.meta.url), 'utf8')
};
function verify(v) {
  assert.match(v.quota, /pull_request:\s*\n/, 'Quota check must bind PR head SHA');
  assert.match(v.quota, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/,
    'Quota code must exist in checkout before merging PR');
  assert.match(v.quota, /permissions:\s*\n\s*contents: read/,
    'Quota PR code cannot obtain main write rights');
  assert.match(v.reference, /pull_request:\s*\n/, 'Head-attached PR check required');
  assert.match(v.reference, /pull_request_target:\s*\n/, 'Trusted queue writer required');
  const readOnlyJob = v.reference.split('  storozha-reference:\n')[1]?.split('  storozha-reference-queue:')[0];
  const trustedJob = v.reference.split('  storozha-reference-queue:\n')[1];
  assert.ok(readOnlyJob && trustedJob, 'Security boundary must have distinct jobs');
  assert.match(readOnlyJob, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/,
    'Read-only PR gate must execute before merge');
  assert.match(readOnlyJob, /STOROZHA_READ_ONLY: '1'/,
    'PR-sourced code cannot update main');
  assert.doesNotMatch(readOnlyJob, /contents: write/, 'PR-sourced code must be read-only');
  assert.match(trustedJob, /ref: main/, 'Only trusted main may write queue entries');
  assert.match(trustedJob, /contents: write/, 'Queue writer needs main write permission');
  assert.match(v.handler, /if \(process\.env\.STOROZHA_READ_ONLY !== '1'\)/,
    'Read-only mode must prevent queue mutations');
}
verify(source);
const mutations = [
  ['quota loads missing main module', 'quota',
    'ref: ${{ github.event.pull_request.head.sha }}', 'ref: main'],
  ['PR reference guard loads missing main module', 'reference',
    'ref: ${{ github.event.pull_request.head.sha }}', 'ref: main'],
  ['PR reference guard can write main', 'reference',
    "STOROZHA_READ_ONLY: '1'", "STOROZHA_READ_ONLY: '0'"],
  ['trusted writer loads PR untrusted code', 'reference',
    "          ref: main", "          ref: ${{ github.event.pull_request.head.sha }}"],
  ['main-write lock missing', 'handler',
    "if (process.env.STOROZHA_READ_ONLY !== '1')", 'if (true)']
];
for (const [name, which, needle, replacement] of mutations) {
  assert.ok(source[which].includes(needle), 'Mutation anchor missing: ' + name);
  assert.throws(() => verify({...source, [which]: source[which].replace(needle, replacement)}),
    assert.AssertionError, 'MUTATION_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('STOROZHA_WORKFLOW_MUTATIONS_PASS ' + mutations.length);
