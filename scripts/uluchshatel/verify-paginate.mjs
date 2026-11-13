// Regression for the real 12 Nov incident: PR #234 was beyond a manually selected shortlist.
import assert from 'node:assert/strict';
import { blockersFor } from './claim.mjs';
import { allPages, allChangedPaths } from './paginate.mjs';

const BASE = '/repos/mpaykin1/meta6-lab';

export async function verifyPagination(paginate = allPages, expand = allChangedPaths) {
  const firstHundred = Array.from({ length: 100 }, (_, index) => ({
    number: index + 1,
    html_url: 'https://github.com/mpaykin1/meta6-lab/pull/' + (index + 1),
    head: { ref: 'lab/other-' + index, repo: { full_name: 'mpaykin1/meta6-lab' } }
  }));
  const otherFiles = Array.from({ length: 100 }, (_, index) => ({
    filename: 'docs/other-' + index + '.md'
  }));
  const missingPR = {
    number: 234,
    title: 'SEO catalog (no game name in title)',
    html_url: 'https://github.com/mpaykin1/meta6-lab/pull/234',
    head: { ref: 'lab/claude-adfree-catalog-1110', repo: { full_name: 'mpaykin1/meta6-lab' } }
  };
  const api = async path => {
    const page = Number(new URL('https://api.github.com' + path).searchParams.get('page'));
    if (path.includes('/pulls?state=open')) {
      return page === 1 ? firstHundred : page === 2 ? [missingPR] : [];
    }
    if (path.includes('/pulls/234/files')) {
      return page === 1 ? otherFiles :
        page === 2 ? [{ filename: 'docs/seo-renamed.html', status: 'renamed',
          previous_filename: 'games/broken-city-copy/index.html' }] : [];
    }
    if (path.includes('/pulls/') && path.includes('/files')) return [];
    throw new Error('unexpected fixture request: ' + path);
  };

  const open = await paginate(BASE + '/pulls?state=open', api);
  assert.equal(open.length, 101, 'PR beyond first 100 must be included');
  assert.equal(open.at(-1).number, 234, 'late SEO PR must not vanish');
  const checked = await Promise.all(open.map(async pr => ({
    number: pr.number,
    url: pr.html_url,
    branch: pr.head.ref,
    repo: pr.head.repo.full_name,
    files: expand(await paginate(BASE + '/pulls/' + pr.number + '/files', api))
  })));
  assert.equal(checked.at(-1).files.length, 102, 'last page and renamed source path must be included');
  const blockers = blockersFor({
    game: 'games/broken-city-copy',
    branch: 'lab/uluchshatel-broken-copy',
    prs: checked,
    lastCommitAt: '2026-11-10T04:07:51Z',
    locks: [],
    nowMs: Date.parse('2026-11-12T10:13:00Z')
  });
  assert.equal(blockers.length, 1, 'PR #234 must block the game');
  assert.match(blockers[0], /#234/);

  assert.ok(checked.at(-1).files.includes('games/broken-city-copy/index.html'),
    'renamed source game must be checked even when destination is not a game');
  assert.ok(checked.at(-1).files.includes('docs/seo-renamed.html'),
    'destination path must remain authentic, not be replaced by a hardcoded game');
  assert.throws(() => expand([{ filename: 'docs/renamed.html', status: 'renamed' }]),
    /previous_filename/, 'rename without original path must fail closed');
  assert.throws(() => expand([{ status: 'added' }]), /filename/,
    'malformed file without a path must fail closed');

  await assert.rejects(
    () => paginate(BASE + '/pulls?state=open', async () => ({ truncated: true })),
    /incomplete page/i, 'malformed response must fail closed'
  );
  await assert.rejects(
    () => paginate(BASE + '/pulls?state=open', async () => firstHundred),
    /exceeded 20 pages/i, 'unbounded result must not silently truncate'
  );
  return { prs: open.length, changedPaths: checked.at(-1).files.length, blockers: blockers.length };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const result = await verifyPagination();
  console.log('verify-paginate: complete PR scan and late-file conflict detected', result);
}
