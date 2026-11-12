import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import * as core from './core.mjs';
import {updateHeads} from './update-heads.mjs';

export function verifyReferences(candidate) {
  for (const lastCommitAt of ['', 'invalid', '2999-01-01T00:00:00Z']) {
    assert.equal(candidate.staleDecision({state: 'open', lastCommitAt}, Date.now()).close, false,
      'Missing, invalid or future fresh commit dates cannot authorize closure');
  }
  const existing = ['reference/old/game.html'];
  const registry = ['observer-world-en-v7', 'scripts/special-check.mjs'];
  for (const destination of ['games/moved.html', 'reference/new/game.html']) {
    assert.ok(candidate.referenceGate([{filename: destination,
      previous_filename: 'reference/old/game.html', status: 'renamed'}], existing).length,
    'Renaming an existing reference is a deletion, including a move out of reference/');
  }
  assert.ok(candidate.referenceGate([{filename: 'README.md',
    previous_filename: '.github/workflows/old.yml', status: 'renamed'}], existing).length,
  'Workflow rename must stay protected');
  for (const filename of ['observer-world-en-v7/index.html', 'scripts/special-check.mjs']) {
    assert.ok(candidate.referenceGate([{filename, status: 'modified'}], existing, registry).length,
      'Registry protection applies outside reference/ too');
  }
  for (const filename of ['scripts/platform/game-bot.mjs', 'scripts/custom-guard.mjs']) {
    assert.ok(candidate.referenceGate([{filename, status: 'modified'}], existing).length,
      'Other existing bots and guards are protected');
  }
  assert.deepEqual(candidate.referenceGate([
    {filename: 'reference/new/game.html', status: 'added'}
  ], existing, registry), [], 'New reference remains allowed');
  assert.deepEqual(candidate.referenceGate([
    {filename: 'docs/new.md', status: 'added'}
  ], existing, registry), [], 'Unrelated additions remain allowed');
}

export async function verifyUpdates(candidate) {
  const now = Date.parse('2026-11-14T12:00:00Z');
  function fixture({number = 31, dirty = false, foreign = false, stale = false} = {}) {
    const calls = [];
    const pr = {number, state: 'open', base: {ref: 'main'}, mergeable: true,
      mergeable_state: dirty ? 'dirty' : 'behind',
      head: {sha: 'head-' + number, repo: {full_name: foreign ? 'other/fork' : 'mpaykin1/meta6-lab'}}};
    const api = async (path, method = 'GET', body) => {
      calls.push({path, method, body, credential: 'workflow'});
      if (path === '/pulls/' + number) return pr;
      if (path.startsWith('/compare/')) return {behind_by: 2};
      if (path.startsWith('/actions/runs?')) return {workflow_runs: [
        {id: 42, head_sha: pr.head.sha, conclusion: 'action_required'},
        {id: 43, head_sha: 'superseded', conclusion: 'action_required'}]};
      if (/^\/actions\/runs\/\d+\/approve$/.test(path)) return {};
      throw Error('Unexpected API call: ' + path);
    };
    const updateApi = async (path, method, body) => {
      calls.push({path, method, body, credential: 'update'});
      return {};
    };
    return {calls, input: {repo: 'mpaykin1/meta6-lab', now, api, updateApi, log: () => {},
      prs: [{number, lastCommitAt: new Date(now - (stale ? 73 : 1) * 3600000).toISOString()}]}};
  }
  for (const number of [31, 91]) {
    const f = fixture({number});
    await candidate.updateHeads(f.input);
    const writes = f.calls.filter(c => c.credential === 'update');
    assert.equal(writes.length, 1, 'A stale head must actually be updated once');
    assert.equal(writes[0].path, '/pulls/' + number + '/update-branch');
    assert.equal(writes[0].method, 'PUT');
    assert.equal(writes[0].body.expected_head_sha, 'head-' + number, 'Update uses a head lease');
    assert.equal(f.calls.filter(c => c.path === '/actions/runs/42/approve').length, 1);
    assert.ok(!f.calls.some(c => c.path.includes('/43/approve')), 'Do not approve superseded runs');
  }
  const missing = fixture();
  await assert.rejects(candidate.updateHeads({...missing.input, updateApi: null}), /UPDATE_TOKEN/);
  assert.ok(!missing.calls.some(c => c.path.endsWith('/update-branch')), 'No workflow-token fallback');
  for (const options of [{dirty: true}, {foreign: true}, {stale: true}]) {
    const f = fixture(options);
    await candidate.updateHeads(f.input);
    assert.ok(!f.calls.some(c => c.credential === 'update'), 'Do not update conflict/fork/abandoned PR');
  }
  const blocked = fixture();
  await assert.rejects(candidate.updateHeads({...blocked.input, repo: 'mpaykin1/meta6'}), /meta6-lab/);
  assert.equal(blocked.calls.length, 0, 'meta6 must receive no API calls');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  verifyReferences(core);
  await verifyUpdates({updateHeads});
  console.log('STOROZHA_RESUME_PASS reference renames, registry, update leases, CI token, approvals, repo fence');
}
