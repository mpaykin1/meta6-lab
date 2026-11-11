// Permanent K5/K10 regressions: N+1 REST, truncated pagination, API-403 denial and fake dates.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyClaudeGraphql} from './verify-claude-graphql.mjs';
import * as original from '../storozha/gh-list.mjs';

await verifyClaudeGraphql(original);
const source = readFileSync(new URL('../storozha/gh-list.mjs', import.meta.url), 'utf8');
const edits = [
  ['REST-list-N-plus-one', "fetch('https://api.github.com/graphql'",
    "fetch('https://api.github.com/repos/' + repo + '/pulls'"],
  ['pagination-truncated', 'if (!data.pageInfo.hasNextPage) return result;',
    'return result;'],
  ['HTTP-403-suppressed', 'if (!r.ok || json.errors || !data) {',
    'if (json.errors || !data) {'],
  ['hardcoded-date-cheat',
    "const lastCommitAt = n.commits.nodes[0]?.commit?.committedDate || '';",
    "const lastCommitAt = '2026-11-14T00:00:00Z';"]
];
for (const [label, oldText, replacement] of edits) {
  assert.ok(source.includes(oldText), 'Production change broke mutation: ' + label);
  const damaged = source.replace(oldText, replacement);
  const mod = await import('data:text/javascript;base64,' +
    Buffer.from(damaged, 'utf8').toString('base64'));
  await assert.rejects(verifyClaudeGraphql(mod), assert.AssertionError,
    'MUTATION_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
}
console.log('CLAUDE_GRAPHQL_MUTATIONS_PASS 4/4');
