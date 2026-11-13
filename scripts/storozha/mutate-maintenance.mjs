import assert from 'node:assert/strict';
import {maintenanceSource, verifyMaintenance} from './verify-maintenance.mjs';

const source = maintenanceSource();
await verifyMaintenance(source);
const mutants = [
  ['fresh date ignored', 'if (!staleDecision({state: fresh.state, lastCommitAt}, now).close) continue;', ''],
  ['queue not persisted', "await updateMain('DLYA_CLAUDE.md'", "await Promise.resolve('DLYA_CLAUDE.md'"],
  ['branch deleted', "await api('/pulls/' + pr.number, 'PATCH', {state: 'closed'});",
    "await api('/git/refs/heads/' + pr.head.ref, 'DELETE');"],
  ['date cheat', 'lastCommitAt}, now).close', "lastCommitAt: lastCommitAt || '2020-01-01'}, now).close"]
];
for (const [name, needle, replacement] of mutants) {
  assert.ok(source.includes(needle), 'Missing maintenance mutation: ' + name);
  await assert.rejects(verifyMaintenance(source.replace(needle, replacement)), assert.AssertionError,
    'MUTATION_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('STOROZHA_MAINTENANCE_MUTATIONS_PASS ' + mutants.length);
