// Claude 991b6c17: emergency main repair must not be blocked by the normal PR quota.
import assert from 'node:assert/strict';

export function verifyClaudeQuota(mod) {
  const now = Date.parse('2026-11-14T12:00:00Z');
  const prs = Array.from({length: 6}, (_, i) => ({
    number: i + 1,
    state: 'open',
    created_at: new Date(Date.parse('2026-11-13T00:00:00Z') + i * 60000).toISOString(),
    lastCommitAt: '2026-11-14T10:00:00Z',
    head: {ref: 'lab/ordinary-' + (i + 1)}
  }));
  const normal = mod.quota(prs, 6, now);
  assert.equal(normal.reject, true, 'sixth ordinary PR must be blocked');
  assert.equal(normal.living, 6, 'fresh PR count must be preserved');
  assert.deepEqual(normal.oldest, [1, 2, 3, 4, 5], 'oldest PRs must be prioritized');
  assert.equal(mod.quota(prs, 5, now).reject, false, 'fifth PR remains eligible');

  prs[5].head.ref = 'lab/remont-main-meta-bot';
  assert.equal(mod.quota(prs, 6, now).reject, false,
    'emergency repair of main must bypass quota');

  for (const other of ['lab/remont-mainx-meta-bot', 'lab/remont-branch',
    'lab/ordinary-6', 'lab/remont-main', 'fix/remont-main-meta-bot']) {
    prs[5].head.ref = other;
    assert.equal(mod.quota(prs, 6, now).reject, true,
      'normal branch bypassed quota: ' + other);
  }

  prs[5].head.ref = 'lab/remont-main-meta-bot';
  prs[5].lastCommitAt = '2026-11-01T00:00:00Z';
  assert.equal(mod.quota(prs, 6, now).living, 5, 'abandoned PR is not live');
  assert.equal(mod.quota(prs, 6, now).reject, false, 'repair still permitted');
}
