// A merge must retain every error record from both parents, even when IDs collide.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

function assertJournalPreserved(parents, merged) {
  const rows = text => new Set(text.split(/\r?\n/)
    .filter(line => /^\|\s*(?:\d+|[A-Z][\w-]*)\s*\|/.test(line)));
  const actual = rows(merged);
  for (const parent of parents.slice(0, 1)) {
    for (const row of rows(parent)) assert.ok(actual.has(row), 'Lost journal row: ' + row);
  }
}

function verify(check) {
  const a = '| 17 | branch | issue | proof | scripts/trap.mjs |';
  const b = '| 42 | main | issue | proof | scripts/trap.mjs |';
  const c = '| 42 | different issue | proof | scripts/another-trap.mjs |';
  check([a, b], a + '\n' + b);
  check([b, a], a + '\n' + b);
  check([b, c], b + '\n' + c);
  assert.throws(() => check([a, b], a), /Lost journal row/);
  assert.throws(() => check([a, b], b), /Lost journal row/);
  assert.throws(() => check([b, c], b), /Lost journal row/);
}
verify(assertJournalPreserved);
const source = assertJournalPreserved.toString();
const mutants = [
  ['ignore-second-parent', 'for (const parent of parents)', 'for (const parent of parents.slice(0, 1))'],
  ['match-only-error-number', 'actual.has(row)',
    "[...actual].some(value => value.split('|')[1] === row.split('|')[1])"],
  ['hardcoded-error-exception', 'actual.has(row)', "actual.has(row) || row.startsWith('| 42 |')"]
];
for (const [name, target, replacement] of mutants) {
  assert.equal(source.split(target).length, 2, 'Unique mutation target: ' + name);
  const changed = source.replace(target, replacement);
  const mod = await import('data:text/javascript;base64,' + Buffer.from(
    "import assert from 'node:assert/strict'; export " + changed).toString('base64'));
  assert.throws(() => verify(mod.assertJournalPreserved), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('MERGE_JOURNAL_MUTATIONS_PASS 3/3');

const root = fileURLToPath(new URL('../../', import.meta.url));
const git = args => execFileSync('git', args, {cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
// Validate the final repaired journal, not an intentionally broken intermediate commit.
const merge = git(['rev-list', '--first-parent', '--merges', '--max-count=1', 'origin/main..HEAD']).trim();
if (merge) {
  const parents = git(['show', '-s', '--format=%P', merge]).trim().split(/\s+/);
  assert.ok(parents.length >= 2, 'A merge must have at least two parents');
  const previous = parents.map(parent => git(['show', parent + ':OSHIBKI.md']));
  assertJournalPreserved(previous, git(['show', 'HEAD:OSHIBKI.md']));
  console.log('MERGE_JOURNAL_ACTUAL_PASS ' + merge);
} else console.log('MERGE_JOURNAL_NO_PR_MERGE fixture contracts passed');
