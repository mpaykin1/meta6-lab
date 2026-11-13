// Fixture tests for the production exports; deliberately independent of CI / network.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import * as core from './core.mjs';

export function verify(c) {
  const t = Date.parse('2026-11-13T12:00:00Z');
  const conflict = 'CONFLICT (content): Merge conflict in reference/old/file.glb\n' +
    'CONFLICT (content): Merge conflict in reference/old/file.glb\n';
  assert.deepEqual(c.conflictFiles(conflict), ['reference/old/file.glb'],
    'Real merge conflict must expose exact unique file paths');
  const manual = '# Сохранить ручной текст\n\n';
  const rows = [{id: 7, text: '| #7 | branch | a.js | 2026-11-13 |'},
    {id: 7, text: '| #7 | branch | b.js | 2026-11-13 |'}];
  const deduped = c.reconcileSection(manual, 'CONFLICTS', rows);
  assert.equal((deduped.match(/\| #7 \|/g) || []).length, 1, 'One line per PR');
  assert.ok(deduped.includes('b.js') && deduped.includes(manual), 'Newest conflict and manual notes retained');
  assert.equal(c.reconcileSection(deduped, 'CONFLICTS', rows), deduped, 'Idempotent queue writes');
  const cleaned = c.reconcileSection(deduped, 'CONFLICTS', []);
  assert.ok(!cleaned.includes('| #7 |'), 'Resolved conflicts must disappear');
  assert.ok(cleaned.includes(manual), 'Manual notes must survive resolution');
  assert.throws(() => c.reconcileSection('<!-- STOROZHA:CONFLICTS:BEGIN -->', 'CONFLICTS', []),
    /Malformed/, 'Malformed queue must not be silently replaced');
  const six = Array.from({length: 6}, (_, i) => ({
    number: i + 1, created_at: new Date(Date.parse('2026-11-12T01:00:00Z') + i * 60000).toISOString(),
    lastCommitAt: new Date(t - 1000).toISOString(), state: 'open'
  }));
  assert.equal(c.quota(six.slice(0, 5), 5, t).reject, false, 'The fifth live PR is green');
  assert.equal(c.quota(six, 5, t).reject, false, 'The oldest five still pass when six exist');
  assert.equal(c.quota(six, 6, t).reject, true, 'The sixth live PR is red');
  assert.match(c.quota(six, 6, t).message, /#1.*#5/, 'Error tells which old PRs to finish');
  const required72Hours = 72 * 60 * 60 * 1000;
  const old = {...six[0], lastCommitAt: new Date(t - required72Hours - 1000).toISOString()};
  const recent = {...six[0], lastCommitAt: new Date(t - required72Hours + 1000).toISOString()};
  assert.equal(c.staleDecision(old, t).close, true, '72+ hours: close abandoned PR');
  assert.equal(c.staleDecision(old, t).deleteBranch, false, 'Never delete a stale PR branch');
  assert.equal(c.staleDecision(recent, t).close, false, 'Recent PR stays open');
  assert.equal(c.staleDecision({...old, state: 'closed'}, t).close, false, 'Do not close twice');
  const baseline = ['reference/old/file.glb', 'reference/old/texture.png'];
  assert.deepEqual(c.referenceGate([
    {filename: 'reference/new-world/index.html', status: 'added'},
    {filename: 'reference/new-world/model.glb', status: 'added'}
  ], baseline), [], 'Only new files in a new reference folder pass');
  assert.ok(c.referenceGate([{filename: 'reference/old/file.glb', status: 'modified'}], baseline).length,
    'Even one altered byte in an old reference is red');
  assert.ok(c.referenceGate([{filename: 'reference/old/addition.png', status: 'added'}], baseline).length,
    'An old reference folder cannot be extended by bypass');
  assert.ok(c.referenceGate([
    {filename: 'reference/new-world/index.html', status: 'added'},
    {filename: 'README.md', status: 'modified'}
  ], baseline).length, 'New reference exception must be ONLY additions');
  const gate = files => c.referenceGate(files, baseline);
  for (const core of ['storozha-reference.yml', 'kontur-guard.yml', 'meta-games-guard.yml', 'meta-bot.yml',
    'report-completion-guard.yml', 'lab-shared-deletion-guard.yml', 'pr-autofinish.yml', 'sync-from-meta6.yml']) {
    assert.ok(gate([{filename: '.github/workflows/' + core, status: 'modified', deletions: 1}]).length,
      'Core guard workflow requires Claude: ' + core);
  }
  assert.ok(gate([{filename: '.github/workflows/storozha-new.yml', status: 'added'}]).length,
    'A new storozha-* workflow is core too');
  assert.deepEqual(gate([{filename: '.github/workflows/auditor.yml', status: 'modified', deletions: 3}]), [],
    'ChatGPT changes its own (non-core) bot workflow without waiting for Claude');
  assert.deepEqual(gate([{filename: '.github/workflows/new-bot.yml', status: 'added'}]), [],
    'A new non-core workflow is allowed');
  assert.ok(gate([{filename: '.github/workflows/auditor.yml', status: 'removed'}]).length,
    'Deleting any workflow is red');
  assert.ok(gate([{filename: '.github/workflows/auditor.yml', status: 'renamed'}]).length,
    'Renaming a workflow away is red');
  assert.ok(gate([{filename: 'scripts/meta-bot/engine.mjs', status: 'modified'}]).length,
    'Bot changes require Claude');
  assert.ok(gate([{filename: 'scripts/kontur/guard.mjs', status: 'modified'}]).length,
    'Guard changes require Claude');
  assert.ok(gate([{filename: 'scripts/storozha/core.mjs', status: 'modified', deletions: 0}]).length,
    'Storozha core requires Claude even for pure additions');
  assert.ok(gate([{filename: 'scripts/feature/test-input.mjs', status: 'modified', deletions: 1}]).length,
    'Weakening a test (removed line) requires Claude');
  assert.ok(gate([{filename: 'scripts/feature/test-input.mjs', status: 'modified'}]).length,
    'Unknown deletions count is treated as weakening');
  assert.deepEqual(gate([{filename: 'scripts/auditor/mutate-auditor.mjs', status: 'modified', deletions: 0}]), [],
    'Extending an existing test with new checks only is allowed');
  assert.ok(gate([{filename: 'scripts/engine/tests/input.js', status: 'modified', deletions: 2}]).length,
    'Nested tests directory weakening requires Claude');
  assert.ok(gate([{filename: 'scripts/engine/player.spec.ts', status: 'removed', deletions: 9}]).length,
    'Deleting a spec file requires Claude');
  assert.ok(gate([{filename: 'scripts/engine/player.spec.ts', status: 'renamed', deletions: 0}]).length,
    'Moving a test away (rename) requires Claude');
  assert.deepEqual(c.referenceGate([{filename: 'scripts/engine/tests/new.test.js', status: 'added'}],
    baseline), [], 'New test files are allowed without changing existing tests');
}
export function verifyWiring(sources) {
  assert.doesNotMatch(sources.branch, /update-branch|\/merges'/,
    'Branch watcher must NOT push into PR heads (GITHUB_TOKEN pushes start no CI)');
  assert.match(sources.branch, /NO_HEAD_PUSH/, 'NO_HEAD_PUSH note must stay');
  assert.match(sources.branch, /if \(!process\.exitCode\) await writeQueue\(rows\)/,
    'Failed reconciliation must not silently drop conflict entries');
  assert.match(sources.branch, /fresh\.mergeable_state === 'dirty'/,
    'Conflicts must be detected from the GitHub mergeability state');
  assert.match(sources.weekly, /'\/pulls\/' \+ pr\.number, 'PATCH', \{state: 'closed'\}/,
    'Stale PR closes; its branch is not deleted');
  assert.doesNotMatch(sources.weekly, /git\/refs.*DELETE|\/git\/refs.*DELETE/,
    'No branch deletion endpoint in weekly watcher');
}
export function productionSources() {
  return {
    branch: readFileSync(new URL('./branch-watch.mjs', import.meta.url), 'utf8'),
    weekly: readFileSync(new URL('./weekly-watch.mjs', import.meta.url), 'utf8')
  };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  verify(core);
  verifyWiring(productionSources());
  console.log('STOROZHA_TESTS_PASS branch, quota, stale branches, new references, protected paths');
}
