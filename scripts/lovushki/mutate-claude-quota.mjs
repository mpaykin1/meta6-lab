// Permanent K5/K10 mutation gate for the Claude PR quota correction.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyClaudeQuota} from './verify-claude-quota.mjs';
import * as original from '../storozha/core.mjs';

verifyClaudeQuota(original);
const source = readFileSync(new URL('../storozha/core.mjs', import.meta.url), 'utf8');
const edits = [
  ['repair-exemption-removed', 'pr && !repair &&', 'pr && '],
  ['wide-exemption-cheat', 'const repair = ', 'const repair = true || '],
  ['quota-always-green-cheat', 'Boolean(pr && !repair &&',
    'Boolean(false && pr && !repair &&']
];
for (const [label, oldText, newText] of edits) {
  assert.ok(source.includes(oldText), 'Production correction changed: ' + label);
  const damaged = source.replace(oldText, newText);
  assert.notEqual(damaged, source, 'Mutation is a no-op: ' + label);
  const mod = await import('data:text/javascript;base64,' +
    Buffer.from(damaged, 'utf8').toString('base64'));
  assert.throws(() => verifyClaudeQuota(mod), assert.AssertionError,
    'MUTATION_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
}
console.log('CLAUDE_QUOTA_MUTATIONS_PASS 3/3');
