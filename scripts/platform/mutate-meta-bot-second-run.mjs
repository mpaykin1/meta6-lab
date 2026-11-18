// Z20 permanent trap: catch silent successes in META BOT's hash-only second run.
import assert from 'node:assert/strict';
import { candidateSource, verifyCandidate } from './verify-meta-bot-second-run-candidate.mjs';

const candidate = candidateSource();
await verifyCandidate(candidate);
const mutants = [
  ['ignore-failed-retry', 'if (full || !again.ok) runs.push(again);',
    'if (full) runs.push(again);'],
  ['ignore-empty-hash', 'again.ok = false;', 'again.ok = true;'],
  ['deceptive-hash-exception', 'if (!again.hashes.length) {',
    "if (!again.hashes.length && cfg.secondRun !== 'hash') {"]
];
for (const [name, from, to] of mutants) {
  assert.ok(candidate.includes(from), 'Missing mutation anchor: ' + name);
  const mutant = candidate.replace(from, to);
  await assert.rejects(() => verifyCandidate(mutant), { name: 'AssertionError' },
    'Undetected false-success mutation: ' + name);
  console.log('META_BOT_SECOND_RUN_MUTATION_CAUGHT ' + name);
}
console.log('META_BOT_SECOND_RUN_MUTATIONS_PASS: 3 caught, including deception');
