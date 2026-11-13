// K5/K10: a PR is stale only with a valid, non-future HEAD date >= 72 hours old.
// Protected scripts/storozha/core.mjs remains unchanged. Four counterexample mutants.
import assert from 'node:assert/strict';
import {Buffer} from 'node:buffer';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../storozha/core.mjs', import.meta.url), 'utf8');
const production = await import(new URL('../storozha/core.mjs', import.meta.url));
const now = Date.parse('2026-11-15T12:00:00Z');
const age = 72 * 60 * 60 * 1000;
const pr = (id, time, state = 'open') => ({number: id, state, lastCommitAt: time});
const iso = time => new Date(time).toISOString();

function verify(mod) {
  const close = (id, date, state) => mod.staleDecision(pr(id, date, state), now).close;
  assert.equal(close(901, iso(now - age)), true, 'Exactly 72 hours is stale');
  assert.equal(close(902, iso(now - age + 1)), false, 'One millisecond before cutoff is fresh');
  assert.equal(close(903, iso(now + age + 1)), false, 'Future-dated HEAD cannot be stale');
  assert.equal(close(904, ''), false, 'Missing commit date cannot be deemed stale');
  assert.equal(close(905, 'not-a-date'), false, 'Malformed commit date cannot be deemed stale');
  assert.equal(close(999, iso(now - age - 1)), true, 'No PR-number exceptions');
  assert.equal(close(907, iso(now - age - 1), 'closed'), false, 'Closed PR is not open');
  assert.equal(mod.staleDecision(pr(908, iso(now - age - 1)), now).deleteBranch, false,
    'Never delete an abandoned PR branch');
}
verify(production);
const mutants = [
  ['future-date-signed-age',
    'date <= now && now - date >= THREE_DAYS;',
    'Math.abs(now - date) >= THREE_DAYS;'],
  ['missing-date-fabricated-old',
    "const date = Date.parse(pr.lastCommitAt || '');",
    'const date = Date.parse(pr.lastCommitAt || new Date(now - THREE_DAYS).toISOString());'],
  ['hardcoded-pr-exemption',
    'date <= now && now - date >= THREE_DAYS;',
    'date <= now && now - date >= THREE_DAYS && pr.number !== 999;'],
  ['cutoff-off-by-one',
    'date <= now && now - date >= THREE_DAYS;',
    'date <= now && now - date > THREE_DAYS;']
];
for (const [label, target, replacement] of mutants) {
  assert.equal(source.split(target).length - 1, 1, 'Mutation target not unique: ' + label);
  const mutatedSource = source.replace(target, replacement);
  const url = 'data:text/javascript;base64,' + Buffer.from(mutatedSource).toString('base64');
  const broken = await import(url);
  assert.throws(() => verify(broken), assert.AssertionError, 'MUTANT_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
}
console.log('STOROZHA_STALE_CLOCK_MUTATIONS_PASS ' + mutants.length + '/' + mutants.length);
