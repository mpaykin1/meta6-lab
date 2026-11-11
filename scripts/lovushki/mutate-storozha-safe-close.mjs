// Permanent K5 mutation guard for the weekly stale-PR closer.
// A stale PR may close only after durable queue entry, fresh HEAD and age checks.
// This is a read-only source contract: protected watchdog code is never changed here.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../storozha/weekly-watch.mjs', import.meta.url), 'utf8');
const startMarker = '  const expired = prs.filter(pr => staleDecision(pr, now).close);';
const endMarker = '  const day = new Date(now).toISOString().slice(0, 10);';

function verify(script) {
  const begin = script.indexOf(startMarker);
  const end = script.indexOf(endMarker, begin + startMarker.length);
  assert.ok(begin >= 0 && end > begin, 'Stale close block must exist');
  const block = script.slice(begin, end);
  const ordered = [
    "await updateMain('DLYA_CLAUDE.md'",
    "const fresh = await api('/pulls/' + pr.number);",
    "if (fresh.state !== 'open' || fresh.head.sha !== pr.head.sha) continue;",
    "const commit = await api('/commits/' + fresh.head.sha);",
    'if (now - date < THREE_DAYS) continue;',
    "await api('/issues/' + pr.number + '/comments', 'POST',",
    "await api('/pulls/' + pr.number, 'PATCH', {state: 'closed'});"
  ];
  let previous = -1;
  for (const step of ordered) {
    const position = block.indexOf(step);
    assert.ok(position > previous, 'Missing or out-of-order stale close gate: ' + step);
    previous = position;
  }
  assert.match(block, /if \(age < THREE_DAYS \|\| !Number\.isFinite\(age\)\) continue;/,
    'Initial age must be finite and >= 72 hours');
  assert.doesNotMatch(block, /api\([^\n;]*['"]DELETE['"]/,
    'Stale PR closure must never delete a branch');
}

verify(source);
const mutants = [
  ['missing-durable-journal',
    "await updateMain('DLYA_CLAUDE.md', before => {",
    "await Promise.resolve().then(before => {"],
  ['close-before-journal',
    "await updateMain('DLYA_CLAUDE.md', before => {",
    "await api('/pulls/' + pr.number, 'PATCH', {state: 'closed'});\n    await updateMain('DLYA_CLAUDE.md', before => {"],
  ['head-changed-while-closing',
    "if (fresh.state !== 'open' || fresh.head.sha !== pr.head.sha) continue;",
    'if (false) continue;'],
  ['recheck-age-removed',
    'if (now - date < THREE_DAYS) continue;',
    'if (false) continue;'],
  ['branch-deletion-after-close',
    "console.log('CLOSED_STALE #' + pr.number + ' (branch preserved)');",
    "await api('/git/refs/heads/' + pr.head.ref, 'DELETE');\n    console.log('CLOSED_STALE #' + pr.number + ' (branch preserved)');"]
];

for (const [name, needle, replacement] of mutants) {
  assert.equal(source.split(needle).length, 2, 'Mutation target must be unique: ' + name);
  const damaged = source.replace(needle, replacement);
  assert.notEqual(damaged, source);
  assert.throws(() => verify(damaged), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('STOROZHA_SAFE_CLOSE_MUTATIONS_PASS ' + mutants.length + '/' + mutants.length);
