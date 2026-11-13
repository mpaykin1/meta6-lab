// K5: a GraphQL reference snapshot must be complete, non-repeating and for an open PR.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const url = new URL('../storozha/reference-snapshot.mjs', import.meta.url);
const source = readFileSync(url, 'utf8');
const production = await import(url);

async function scenario(mod, fault = '') {
  const seen = [];
  const request = async (endpoint, options) => {
    assert.equal(endpoint, 'https://api.github.com/graphql');
    assert.equal(options.method, 'POST');
    const vars = JSON.parse(options.body).variables;
    assert.deepEqual([vars.owner, vars.name, vars.number], ['owner', 'repo', 248]);
    seen.push(vars.after);
    if (seen.length > 3) throw Error('Fixture blocked endless pagination');
    const first = vars.after === null;
    const pr = {
      number: 248, state: fault === 'closed-pr' ? 'CLOSED' : 'OPEN', baseRefName: 'main',
      baseRefOid: 'a'.repeat(40), headRefName: 'lab/proposed', headRefOid: 'b'.repeat(40),
      changedFiles: 3,
      files: {
        totalCount: fault === 'wrong-total' ? 2 : 3,
        nodes: first ? [
          {path: 'reference/fresh/a.glb', changeType: 'ADDED'},
          {path: 'reference/fresh/b.glb', changeType: 'ADDED'}
        ] : [{path: fault === 'duplicate-path' ? 'reference/fresh/a.glb' :
          'reference/fresh/c.glb', changeType: 'ADDED'}],
        pageInfo: {hasNextPage: first || fault === 'frozen-cursor',
          endCursor: first || fault === 'frozen-cursor' ? 'page-two' : null}
      }
    };
    return {ok: true, json: async () => ({data: {repository: {pullRequest: pr}}})};
  };
  const out = await mod.referenceSnapshot('owner/repo', 'token', 248, request);
  assert.deepEqual(seen, [null, 'page-two']);
  assert.deepEqual(out.files.map(x => x.filename), [
    'reference/fresh/a.glb', 'reference/fresh/b.glb', 'reference/fresh/c.glb'
  ]);
  return out;
}

async function verify(mod) {
  await scenario(mod);
  for (const [fault, reason] of [
    ['duplicate-path', /Unsafe or duplicate reference file/],
    ['frozen-cursor', /Reference file cursor did not advance/],
    ['wrong-total', /Incomplete reference file connection/],
    ['closed-pr', /Invalid reference PR identity/]
  ]) await assert.rejects(scenario(mod, fault), reason, fault);
}
await verify(production);

const mutants = [
  ['accept-duplicate-across-pages', 'paths.has(file.path)', 'false'],
  ['accept-frozen-pagination', 'cursors.has(after)', 'false'],
  ['ignore-total-count', 'connection?.totalCount !== pr.changedFiles', 'false'],
  ['accept-closed-pr-cheat', "pr.state !== 'OPEN'", "pr.state !== 'OPEN' && number === 247"]
];
for (const [name, target, replacement] of mutants) {
  assert.equal(source.split(target).length, 2, 'Non-unique mutation target: ' + name);
  const mod = await import('data:text/javascript;base64,' +
    Buffer.from(source.replace(target, replacement)).toString('base64'));
  await assert.rejects(verify(mod), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('REFERENCE_SNAPSHOT_INTEGRITY_MUTATIONS_PASS 4/4');
