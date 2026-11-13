// Real production snapshot reader: batching, pagination and head/check integrity.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const url = new URL('../dispetcher/snapshot.mjs', import.meta.url);
const source = readFileSync(url, 'utf8');
const production = await import(url);

async function exercise(load, failure = '', start = 10) {
  const calls = [];
  const request = async (endpoint, options) => {
    assert.equal(endpoint, 'https://api.github.com/graphql', 'No REST request per PR');
    assert.equal(options.method, 'POST');
    const body = JSON.parse(options.body);
    assert.equal(body.variables.owner, 'owner');
    assert.equal(body.variables.name, 'repo');
    assert.match(body.query, /states:OPEN/);
    assert.doesNotMatch(body.query, /baseRefName/, 'Do not silently omit PRs targeting another branch');
    calls.push(body.variables.cursor);
    assert.ok(calls.length <= 3, 'Frozen pagination must fail promptly');
    const number = start + (body.variables.cursor ? 1 : 0);
    const commit = {oid: 'sha-' + number, committedDate: '2026-11-12T01:00:00Z',
      statusCheckRollup: {contexts: {pageInfo: {hasNextPage: failure === 'truncated-checks'}, nodes: [
        {__typename: 'CheckRun', name: 'guard', conclusion: 'FAILURE', detailsUrl: 'https://checks/guard'},
        {__typename: 'StatusContext', context: 'external', state: 'ERROR', targetUrl: 'https://checks/ext'}
      ]}}};
    if (failure === 'wrong-head') commit.oid = 'superseded';
    const node = {number, state: 'OPEN', title: 'Task', body: '', headRefName: 'lab/task',
      headRefOid: 'sha-' + number, mergeable: 'UNKNOWN', commits: {nodes: [{commit}]}};
    const page = {nodes: [node], pageInfo: {
      hasNextPage: !body.variables.cursor || failure === 'frozen-cursor', endCursor: 'second-page'
    }};
    return {ok: failure !== 'http-403', status: failure === 'http-403' ? 403 : 200,
      json: async () => ({data: {repository: {pullRequests: page}},
        ...(failure === 'graphql-error' ? {errors: [{message: 'denied'}]} : {})})};
  };
  const map = await load('owner/repo', 'token', request);
  assert.deepEqual(calls, [null, 'second-page']);
  assert.deepEqual([...map.keys()], [start, start + 1]);
  assert.equal(map.get(start).pr.mergeable, null, 'Unknown is not a clean merge');
  assert.equal(map.get(start).checks.check_runs[0].conclusion, 'failure');
  assert.equal(map.get(start).statuses.statuses[0].state, 'error');
  assert.equal(map.get(start).commit.commit.committer.date, '2026-11-12T01:00:00Z');
}

async function verify(module) {
  await exercise(module.loadSnapshot);
  await exercise(module.loadSnapshot, '', 100);
  for (const failure of ['http-403', 'graphql-error', 'wrong-head', 'truncated-checks', 'frozen-cursor']) {
    await assert.rejects(exercise(module.loadSnapshot, failure), undefined, 'Missing rejection: ' + failure);
  }
}
await verify(production);
const mutants = [
  ['drop-second-page', 'if (!page.pageInfo.hasNextPage) break;', 'break;'],
  ['ignore-http-error', 'if (!response.ok)', 'if (false)'],
  ['ignore-graphql-error', 'if (data.errors?.length)', 'if (false)'],
  ['ignore-head-lease', 'commit?.oid !== node.headRefOid', 'false'],
  ['fixture-range-cheat', 'for (const node of page.nodes) {',
    'for (const node of page.nodes) { if (node.number > 20) continue;']
];
for (const [name, target, replacement] of mutants) {
  assert.equal(source.split(target).length, 2, 'Mutation target not unique: ' + name);
  const module = await import('data:text/javascript;base64,' + Buffer.from(source.replace(target, replacement))
    .toString('base64'));
  await assert.rejects(verify(module), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('DISPATCHER_SNAPSHOT_MUTATIONS_PASS 5/5');
