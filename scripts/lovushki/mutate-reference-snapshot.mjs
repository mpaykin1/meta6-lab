// K5: reference guard must never accept partial files or a different HEAD.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const url = new URL('../storozha/reference-snapshot.mjs', import.meta.url);
const source = readFileSync(url, 'utf8');
const production = await import(url);

async function scenario(mod, fault = '') {
  let calls = 0;
  const request = async (endpoint, options) => {
    calls++;
    assert.ok(calls <= 3, 'unbounded requests');
    assert.equal(endpoint, 'https://api.github.com/graphql');
    assert.equal(options.method, 'POST');
    const body = JSON.parse(options.body);
    assert.equal(body.variables.number, 247);
    assert.equal(body.variables.after, calls === 1 ? null : 'next');
    const second = calls > 1;
    const pr = {number: 247, state: 'OPEN', baseRefName: 'main', baseRefOid: 'a'.repeat(40),
      headRefName: 'lab/proposed', headRefOid: 'b'.repeat(40), changedFiles: 2,
      files: {totalCount: 2, nodes: [{path: second ? 'scripts/one.mjs' : 'reference/new/one.glb',
        changeType: second ? 'MODIFIED' : 'ADDED'}],
      pageInfo: {hasNextPage: !second, endCursor: second ? null : 'next'}}};
    if (fault === 'head-race' && second) pr.headRefOid = 'c'.repeat(40);
    if (fault === 'truncated' && !second) pr.files.pageInfo.hasNextPage = false;
    if (fault === 'rename') pr.files.nodes[0].changeType = 'RENAMED';
    if (fault === 'graphql') return {ok: true, json: async () => ({errors: [{message: 'denied'}]})};
    return {ok: fault !== 'http', status: 403,
      json: async () => ({data: {repository: {pullRequest: pr}}})};
  };
  const snapshot = await mod.referenceSnapshot('owner/repo', 'token', 247, request);
  assert.equal(calls, 2);
  assert.deepEqual(snapshot.files.map(f => f.status), ['added', 'modified']);
  assert.equal(snapshot.pr.base.sha, 'a'.repeat(40));
  assert.equal(snapshot.pr.head.sha, 'b'.repeat(40));
}
async function verify(mod) {
  await scenario(mod);
  for (const [fault, reason] of [
    ['http', /Reference GraphQL HTTP 403/], ['graphql', /Reference GraphQL errors/],
    ['head-race', /PR changed during pagination/], ['truncated', /Truncated reference file list/],
    ['rename', /Unsafe or duplicate reference file/]
  ]) await assert.rejects(scenario(mod, fault), reason, fault);
}
await verify(production);
const mutants = [
  ['ignore-http', 'if (!response.ok)', 'if (false)'],
  ['accept-mixed-head', 'if (identity && identity !== current)', 'if (false)'],
  ['accept-truncated-list', 'if (files.length !== pr.changedFiles)', 'if (false)'],
  ['renamed-protected-source-cheat', "DELETED: 'removed'", "DELETED: 'removed', RENAMED: 'added'"],
  ['skip-second-page', 'if (!connection.pageInfo.hasNextPage)', 'if (true)']
];
for (const [name, anchor, replacement] of mutants) {
  assert.equal(source.split(anchor).length, 2, 'unique mutation anchor: ' + name);
  const mod = await import('data:text/javascript;base64,' +
    Buffer.from(source.replace(anchor, replacement)).toString('base64'));
  await assert.rejects(verify(mod), undefined, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('REFERENCE_SNAPSHOT_MUTATIONS_PASS 5/5');
