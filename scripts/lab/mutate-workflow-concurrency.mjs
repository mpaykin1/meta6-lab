// Permanent audit: every active workflow serializes runs and never cancels a main/push run.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));

export function validateWorkflow(source) {
  const errors = [];
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex(line => /^concurrency:[ \t]*/.test(line));
  if (start < 0) return ['missing top-level concurrency'];
  const inline = lines[start].replace(/^concurrency:[ \t]*/, '').trim();
  if (inline) return [];
  let end = start + 1;
  while (end < lines.length && (/^\s/.test(lines[end]) || !lines[end].trim())) end++;
  const block = lines.slice(start + 1, end);
  const group = block.find(line => /^  group:/.test(line));
  if (!group || !group.replace(/^  group:[ \t]*/, '').trim()) errors.push('missing concurrency group');
  const cancel = block.find(line => /^  cancel-in-progress:/.test(line));
  const value = cancel?.replace(/^  cancel-in-progress:[ \t]*/, '').trim();
  const nonPrEvent = /^  (push|schedule|workflow_run|workflow_dispatch|issue_comment|pull_request_target):/m
    .test(source);
  if (nonPrEvent && value && value !== 'false' &&
      !/github\.event_name\s*==\s*['"]pull_request['"]/.test(value)) {
    errors.push('non-PR run may be cancelled');
  }
  return errors;
}

const honest = [
  'name: fixture',
  'on:',
  '  push:',
  '  pull_request:',
  'concurrency:',
  '  group: fixture-by-branch',
  '  cancel-in-progress: false',
  'jobs:',
  '  sample:',
  '    runs-on: ubuntu-latest'
].join('\n');
assert.deepEqual(validateWorkflow(honest), [], 'honest workflow rejected');

const mutations = [
  ['missing concurrency', honest.replace(/^concurrency:\n(?:  .*\n){2}/m, '')],
  ['cancel push', honest.replace('cancel-in-progress: false', 'cancel-in-progress: true')],
  ['missing group', honest.replace(/^  group:.*\n/m, '')],
  ['comment deception', honest.replace(/^concurrency:/m, '# concurrency:')]
];
for (const [label, mutant] of mutations) {
  assert.ok(validateWorkflow(mutant).length, 'uncaught workflow mutation: ' + label);
  console.log('WORKFLOW_CONCURRENCY_MUTATION_CAUGHT ' + label);
}

const directory = join(root, '.github', 'workflows');
let checked = 0;
for (const filename of readdirSync(directory).filter(name => /\.ya?ml$/.test(name)).sort()) {
  // The native catalog is excluded only while its build script is genuinely absent.
  if (filename === 'lab-native-catalog.yml' &&
      !existsSync(join(root, 'platforms/scripts/build-catalog.mjs'))) continue;
  const content = readFileSync(join(directory, filename), 'utf8');
  const errors = validateWorkflow(content);
  assert.deepEqual(errors, [], filename + ': ' + errors.join(', '));
  checked++;
}
console.log('WORKFLOW_CONCURRENCY_PASS active workflows=' + checked);
