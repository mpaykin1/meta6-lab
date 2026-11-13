// Intentional RED mutation proof; remove this temporary file after GitHub Actions records the failure.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../storozha/reference-snapshot.mjs', import.meta.url), 'utf8');
const needle = 'paths.has(file.path)';
assert.equal(source.split(needle).length, 2);
const broken = await import('data:text/javascript;base64,' +
  Buffer.from(source.replace(needle, 'false')).toString('base64'));
let page = 0;
const request = async () => {
  const second = ++page > 1;
  return {ok: true, json: async () => ({data: {repository: {pullRequest: {
    number: 248, state: 'OPEN', baseRefName: 'main', baseRefOid: 'a'.repeat(40),
    headRefName: 'lab/demo', headRefOid: 'b'.repeat(40), changedFiles: 2,
    files: {totalCount: 2, nodes: [{path: 'reference/duplicated/a.glb', changeType: 'ADDED'}],
      pageInfo: {hasNextPage: !second, endCursor: second ? null : 'second'}}
  }}}})};
};
// The intentional mutant incorrectly accepts the duplicate path: this assertion MUST fail.
await assert.rejects(
  broken.referenceSnapshot('owner/repo', 'token', 248, request),
  /Unsafe or duplicate reference file/,
  'CONTROL_MUTATION_MUST_BE_REJECTED'
);
