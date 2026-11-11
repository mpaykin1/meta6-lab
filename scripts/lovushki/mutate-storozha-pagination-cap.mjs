// Regression trap for GraphQL PR pagination bounds, filtering and advancing cursors.
// A bounded listing must fail closed rather than silently omit remaining PRs.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const productionUrl = new URL('../storozha/gh-list.mjs', import.meta.url);
const source = readFileSync(productionUrl, 'utf8');
const production = await import(productionUrl);
const repo = 'mpaykin1/meta6-lab';
const jsonPage = (hasNextPage, cursor) => ({data: {repository: {pullRequests: {
  nodes: [], pageInfo: {hasNextPage, endCursor: cursor}
}}}});

async function verify(api) {
  const savedFetch = globalThis.fetch;
  let count = 0;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://api.github.com/graphql');
    assert.equal(init.method, 'POST');
    const payload = JSON.parse(init.body);
    assert.equal(payload.variables.owner, 'mpaykin1');
    assert.equal(payload.variables.name, 'meta6-lab');
    assert.equal(payload.variables.after, count ? 'cursor-' + count : null);
    assert.match(payload.query, /states:OPEN/);
    assert.match(payload.query, /baseRefName:"main"/);
    assert.match(payload.query, /first:100/);
    count++;
    assert.ok(count <= 20, 'Request after pagination ceiling');
    return {ok: true, status: 200, json: async () => jsonPage(true, 'cursor-' + count)};
  };
  try {
    await assert.rejects(api.openPulls(repo, 'fixture-token'),
      /Refusing truncated GraphQL pagination/);
    assert.equal(count, 20, 'Pagination guard must examine 20 pages before rejecting');
  } finally {
    globalThis.fetch = savedFetch;
  }

  count = 0;
  globalThis.fetch = async () => {
    count++;
    assert.equal(count, 1, 'One-page results must stop immediately');
    return {ok: true, status: 200, json: async () => jsonPage(false, null)};
  };
  try {
    assert.deepEqual(await api.openPulls(repo, 'fixture-token'), []);
    assert.equal(count, 1);
  } finally {
    globalThis.fetch = savedFetch;
  }
}

await verify(production);
const mutants = [
  ['cap-raised', 'page < 20', 'page < 21'],
  ['cap-lowered', 'page < 20', 'page < 1'],
  ['truncated-page-silently-accepted', "throw Error('Refusing truncated GraphQL pagination');", 'return result;'],
  ['wrong-state-filter', 'states:OPEN', 'states:MERGED'],
  ['wrong-base-filter', 'baseRefName:"main"', 'baseRefName:"dev"'],
  ['frozen-cursor', 'after = data.pageInfo.endCursor;', "after = 'cursor-1';"]
];
for (const [label, before, after] of mutants) {
  assert.ok(source.includes(before), 'Missing mutation target: ' + label);
  const mutated = source.replace(before, after);
  const url = 'data:text/javascript;base64,' + Buffer.from(mutated).toString('base64');
  const api = await import(url);
  await assert.rejects(() => verify(api), assert.AssertionError, 'MUTANT_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
}
console.log('STOROZHA_PAGINATION_MUTATIONS_PASS ' + mutants.length + '/' + mutants.length);
