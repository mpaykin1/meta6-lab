// K5: permanent GraphQL PR-list mutations for Claude's rate-limit repair (5acb771).
// Discovered automatically by scripts/kontur/guard.mjs; no network or workflow edits.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../storozha/gh-list.mjs', import.meta.url), 'utf8');
const production = await import(new URL('../storozha/gh-list.mjs', import.meta.url));
const date = '2026-11-11T10:00:00Z';
const pr = (number, commitDate = date) => ({
  number, url: 'https://github.com/mpaykin1/meta6-lab/pull/' + number,
  createdAt: date, mergeable: 'MERGEABLE', headRefName: 'lab/example-' + number,
  headRefOid: 'sha-' + number, headRepository: {nameWithOwner: 'mpaykin1/meta6-lab'},
  commits: {nodes: commitDate ? [{commit: {committedDate: commitDate}}] : []}
});
const page = (nodes, hasNextPage = false, endCursor = null) => ({
  data: {repository: {pullRequests: {nodes, pageInfo: {hasNextPage, endCursor}}}}
});
const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300, status, json: async () => body
});

async function mockFetch(responses, work) {
  const previous = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init) => {
    const index = requests.length;
    requests.push({url, init});
    assert.equal(url, 'https://api.github.com/graphql', 'REST N+1 calls are forbidden');
    assert.equal(init?.method, 'POST', 'GraphQL request must be POST');
    assert.equal(init?.headers?.Authorization, 'Bearer fixture-token');
    assert.ok(index < responses.length, 'Unexpected extra API call');
    const body = JSON.parse(init.body);
    assert.equal(body.variables.owner, 'mpaykin1');
    assert.equal(body.variables.name, 'meta6-lab');
    assert.equal(body.variables.after, index ? 'cursor1' : null, 'Cursor must advance');
    assert.match(body.query, /first:100/);
    assert.match(body.query, /baseRefName:"main"/);
    return responses[index];
  };
  try { await work(requests); } finally { globalThis.fetch = previous; }
}

async function verify(api) {
  await mockFetch([
    response(page([pr(41), pr(42)], true, 'cursor1')),
    response(page([pr(43)]))
  ], async requests => {
    const result = await api.openPulls('mpaykin1/meta6-lab', 'fixture-token');
    assert.equal(requests.length, 2, 'All pages must be consumed');
    assert.deepEqual(result.map(x => x.number), [41, 42, 43]);
    assert.deepEqual(result[2], {
      number: 43, html_url: 'https://github.com/mpaykin1/meta6-lab/pull/43',
      created_at: date, state: 'open', mergeable: 'MERGEABLE', lastCommitAt: date,
      head: {ref: 'lab/example-43', sha: 'sha-43', repo: {full_name: 'mpaykin1/meta6-lab'}}
    }, 'PR metadata must come from GitHub, not hardcoded fixtures');
  });
  await mockFetch([response(page([]))], async requests => {
    assert.deepEqual(await api.openPulls('mpaykin1/meta6-lab', 'fixture-token'), []);
    assert.equal(requests.length, 1);
  });
  await mockFetch([response({...page([pr(41)]), errors: [{message: 'rate limited'}]})], async () => {
    await assert.rejects(api.openPulls('mpaykin1/meta6-lab', 'fixture-token'), /GraphQL/,
      'A partial GraphQL response with errors must fail closed');
  });
  await mockFetch([response(page([pr(41)]), 403)], async () => {
    await assert.rejects(api.openPulls('mpaykin1/meta6-lab', 'fixture-token'), /403/,
      'A rate-limit error must not masquerade as a valid PR list');
  });
  await mockFetch([response(page([pr(41, null)]))], async () => {
    await assert.rejects(api.openPulls('mpaykin1/meta6-lab', 'fixture-token'), /last commit date/,
      'A PR with unknown last commit date cannot be treated as stale');
  });
}

await verify(production);
const mutants = [
  ['missing-second-page', 'if (!data.pageInfo.hasNextPage) return result;', 'return result;'],
  ['ignore-api-403', '!r.ok || json.errors || !data', 'json.errors || !data'],
  ['ignore-graphql-errors', '!r.ok || json.errors || !data', '!r.ok || !data'],
  ['hardcoded-last-commit', "n.commits.nodes[0]?.commit?.committedDate || ''",
    "n.commits.nodes[0]?.commit?.committedDate || '" + date + "'"],
  ['wrong-next-cursor', 'after = data.pageInfo.endCursor;', 'after = null;'],
  ['hardcoded-pr-head', 'sha: n.headRefOid', "sha: 'hardcoded'"],
  ['wrong-endpoint', "fetch('https://api.github.com/graphql'",
    "fetch('https://api.github.com/repos/hardcoded'"],
  ['hardcoded-list-cheat', 'if (!data.pageInfo.hasNextPage) return result;',
    "if (!data.pageInfo.hasNextPage) return [{number: 999, head: {sha: 'hardcoded'}}];"]
];
for (const [name, needle, replacement] of mutants) {
  assert.ok(source.includes(needle), 'Missing production mutation target: ' + name);
  const mutated = source.replace(needle, replacement);
  assert.notEqual(mutated, source);
  const url = 'data:text/javascript;base64,' + Buffer.from(mutated).toString('base64');
  const broken = await import(url);
  await assert.rejects(() => verify(broken), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('STOROZHA_GRAPHQL_MUTATIONS_PASS ' + mutants.length + '/' + mutants.length);
