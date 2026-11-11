// Claude 5acb771: one GraphQL page fetch, no REST N+1, no suppressed API failure.
import assert from 'node:assert/strict';

const node = (number, date) => ({
  number, url: 'https://github.com/example/repo/pull/' + number,
  createdAt: '2026-11-11T00:00:00Z', mergeable: 'CONFLICTING',
  headRefName: 'lab/work-' + number, headRefOid: 'sha-' + number,
  headRepository: {nameWithOwner: 'example/repo'},
  commits: {nodes: [{commit: {committedDate: date}}]}
});
const page = (nodes, next = false) => ({
  data: {repository: {pullRequests: {nodes,
    pageInfo: {hasNextPage: next, endCursor: next ? 'cursor-2' : null}}}}
});

export async function verifyClaudeGraphql(mod) {
  const saved = globalThis.fetch;
  const times = ['2026-11-10T01:00:00Z', '2026-11-11T03:00:00Z'];
  try {
    let calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({url, options});
      return {ok: true, status: 200, json: async () => page([
        node(10, times[0]), node(11, times[1])])};
    };
    const list = await mod.openPulls('example/repo', 'secret');
    assert.equal(calls.length, 1, 'N+1 list of PRs');
    assert.equal(calls[0].url, 'https://api.github.com/graphql', 'REST list is forbidden');
    assert.equal(calls[0].options.method, 'POST');
    assert.deepEqual(list.map(pr => pr.lastCommitAt), times,
      'commit date must come from API, not a constant');

    calls = [];
    const pages = [page([node(10, times[0])], true),
      page([node(11, times[1])])];
    globalThis.fetch = async (url, options) => {
      calls.push({url, options});
      return {ok: true, status: 200, json: async () => pages.shift()};
    };
    const all = await mod.openPulls('example/repo', 'secret');
    assert.deepEqual(all.map(pr => pr.number), [10, 11], 'pagination lost PRs');
    assert.equal(calls.length, 2, 'two pages require two GraphQL calls');
    assert.equal(JSON.parse(calls[1].options.body).variables.after, 'cursor-2');

    globalThis.fetch = async () => ({
      ok: false, status: 403, json: async () => page([node(10, times[0])])
    });
    await assert.rejects(mod.openPulls('example/repo', 'secret'),
      /GraphQL open PR list HTTP 403/, 'quota exhausted must fail closed');

    globalThis.fetch = async () => ({
      ok: true, status: 200, json: async () => page([node(20, '')])
    });
    await assert.rejects(mod.openPulls('example/repo', 'secret'),
      /Unknown last commit date/, 'missing commit date must fail closed');
  } finally {
    globalThis.fetch = saved;
  }
}
