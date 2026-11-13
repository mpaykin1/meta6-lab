// K5: quota must select the oldest five deterministically when GitHub returns equal creation timestamps.
// Only a new mutation test; protected scripts/storozha/core.mjs is not modified.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const coreUrl = new URL('../storozha/core.mjs', import.meta.url);
const source = readFileSync(coreUrl, 'utf8');
const production = await import(coreUrl);
const now = Date.parse('2026-11-15T12:00:00Z');
const created = '2026-11-13T12:00:00Z';
const recent = '2026-11-15T11:00:00Z';
const item = (number, created_at = created) => ({number, state: 'open', created_at,
  lastCommitAt: recent, head: {ref: 'lab/quota-fixture-' + number}});

function verify(mod) {
  const ties = [16, 14, 12, 17, 13, 11, 15].map(n => item(n));
  for (const input of [ties, [...ties].reverse()]) {
    const result = mod.quota(input, 17, now);
    assert.deepEqual(result.oldest, [11, 12, 13, 14, 15],
      'Equal created_at timestamps must be sorted by PR number, not API order');
    assert.equal(result.living, 7);
    assert.equal(result.reject, true, 'Seventh PR may not bypass quota');
  }
  const other = [26, 24, 22, 27, 23, 21, 25].map(n => item(n));
  assert.deepEqual(mod.quota(other, 27, now).oldest, [21, 22, 23, 24, 25],
    'Sorting may not special-case a single fixture number range');
  const mixed = [16, 14, 12, 17, 13, 11, 15].map(n => item(n));
  mixed.push(item(90, '2026-11-12T15:00:00Z'));
  assert.deepEqual(mod.quota(mixed, 17, now).oldest, [90, 11, 12, 13, 14],
    'Timestamp order has priority over numerical tie-breaking');
}

verify(production);
const mutants = [
  ['missing-tie-break', ' || a.number - b.number', ''],
  ['reversed-tie-break', ' || a.number - b.number', ' || b.number - a.number'],
  ['fixture-range-cheat', ' || a.number - b.number',
    ' || ((a.number <= 20 && b.number <= 20) ? a.number - b.number : 0)'],
  ['numeric-only-sort',
    'Date.parse(a.created_at) - Date.parse(b.created_at) || a.number - b.number',
    'a.number - b.number']
];
for (const [name, needle, replacement] of mutants) {
  assert.equal(source.split(needle).length, 2, 'Mutation target not unique: ' + name);
  const damaged = source.replace(needle, replacement);
  assert.notEqual(damaged, source);
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(damaged).toString('base64');
  const mutated = await import(moduleUrl);
  assert.throws(() => verify(mutated), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('STOROZHA_QUOTA_TIE_BREAK_MUTATIONS_PASS 4/4');
