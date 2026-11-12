// New K5 mutation guard: never count impossible timestamps or deny grandfathered/repair PRs.
// Production storozha/core.mjs remains untouched. This guard needs no token/network.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../storozha/core.mjs', import.meta.url), 'utf8');
const production = await import(new URL('../storozha/core.mjs', import.meta.url));
const now = Date.parse('2026-11-14T12:00:00Z');
const iso = ms => new Date(ms).toISOString();
const make = (number, created, lastCommitAt, ref = 'lab/feature') => ({
  number, state: 'open', created_at: created, lastCommitAt, head: {ref}
});
const recent = iso(now - 60_000);
const five = [104, 102, 105, 101, 103].map(n =>
  make(n, iso(Date.parse('2026-11-12T01:00:00Z') + (n - 100) * 60_000), recent));
const sixth = make(106, '2026-11-12T01:07:00Z', recent);
const seven = make(107, '2026-11-12T01:08:00Z', recent);

function verify(mod) {
  assert.equal(mod.alive(make(10, iso(now), iso(now + 1000)), now), false,
    'A future-dated commit must not consume a live PR slot');
  assert.equal(mod.alive(make(11, iso(now), ''), now), false,
    'A missing commit date must not be fabricated');
  assert.equal(mod.alive(make(12, iso(now), iso(now - 72 * 3600_000)), now), false,
    'Exactly 72 hours old is not alive');
  assert.deepEqual(mod.quota([...five, sixth], 106, now).oldest, [101, 102, 103, 104, 105],
    'Oldest five must be chosen by creation date, not API order');
  assert.equal(mod.quota([...five, sixth], 106, now).reject, true,
    'Sixth post-cutoff PR must be rejected');
  assert.equal(mod.quota([...five, sixth, seven], 107, now).reject, true,
    'Seventh post-cutoff PR cannot be hardcoded green');
  const unknown = make(108, iso(now), '');
  assert.equal(mod.quota([...five, unknown], 108, now).living, 5,
    'Missing date must not inflate the live count');
  const future = make(109, iso(now), iso(now + 1000));
  assert.equal(mod.quota([...five, future], 109, now).living, 5,
    'Future date must not inflate the live count');
  const legacy = Array.from({length: 6}, (_, i) =>
    make(201 + i, iso(Date.parse('2026-11-11T01:00:00Z') + i * 60_000), recent));
  assert.equal(mod.quota(legacy, 206, now).reject, false,
    'Existing pre-cutoff PRs are grandfathered, even when they are sixth');
  const repair = make(300, iso(now - 1000), recent, 'lab/remont-main-urgent');
  assert.equal(mod.quota([...five, sixth, repair], 300, now).reject, false,
    'Repair of red main remains explicitly exempt');
}

verify(production);
const mutants = [
  ['future-timestamp-counted', '&& timestamp <= now;', ';'],
  ['exact-72h-counted', 'now - timestamp < THREE_DAYS', 'now - timestamp <= THREE_DAYS'],
  ['unknown-date-faked-as-now', "Date.parse(pr.lastCommitAt || '')",
    'Date.parse(pr.lastCommitAt || new Date(now).toISOString())'],
  ['newest-pr-first', 'Date.parse(a.created_at) - Date.parse(b.created_at)',
    'Date.parse(b.created_at) - Date.parse(a.created_at)'],
  ['grandfathered-pr-denied', 'Date.parse(pr.created_at) > CUTOFF &&', 'true &&'],
  ['main-repair-denied', 'pr && !repair &&', 'pr && true &&'],
  ['hardcoded-sixth-pr-cheat', '!selected.some(p => p.number === number)',
    '!selected.some(p => p.number === number) && number !== 106']
];
for (const [label, target, replacement] of mutants) {
  assert.equal(source.split(target).length - 1, 1, 'Expected one mutation target: ' + label);
  const damaged = source.replace(target, replacement);
  assert.notEqual(damaged, source);
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(damaged).toString('base64');
  const mutated = await import(moduleUrl);
  assert.throws(() => verify(mutated), assert.AssertionError, 'MUTANT_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
}
console.log('STOROZHA_QUOTA_TIMESTAMP_MUTATIONS_PASS ' + mutants.length + '/' + mutants.length);
