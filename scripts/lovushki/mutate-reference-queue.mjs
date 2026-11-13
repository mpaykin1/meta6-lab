// Production GraphQL queue writer: CAS races must preserve the latest foreign notes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const url = new URL('../storozha/reference-queue.mjs', import.meta.url);
const source = readFileSync(url, 'utf8');
const production = await import(url);
const marker = '| #247 | решение |';
const transform = before => before.includes(marker) ? before : before + marker + '\n';

async function scenario(mod, mode = 'race') {
  let calls = 0, writes = 0, version = 1;
  let text = 'OWNER_NOTE: сохранить русский текст 🧩\n' + (mode === 'noop' ? marker + '\n' : '');
  let committed;
  const oid = () => String(version).repeat(40);
  const request = async (endpoint, options) => {
    assert.equal(endpoint, 'https://api.github.com/graphql', 'REST quota must not be used');
    assert.equal(options.method, 'POST');
    const {query, variables} = JSON.parse(options.body);
    calls++;
    assert.ok(calls <= 21, 'Head conflicts must have a finite retry limit');
    let data;
    if (query.includes('ref(qualifiedName:')) {
      assert.match(query, /refs\/heads\/main/);
      data = {repository: {ref: {target: {oid: oid()}}}};
    } else if (query.includes('object(expression:')) {
      assert.equal(variables.expression, oid() + ':DLYA_CLAUDE.md', 'Read immutable snapshot');
      data = {repository: {object: mode === 'new-file' ? null : {
        __typename: 'Blob', text, isBinary: false, isTruncated: mode === 'truncated'
      }}};
    } else {
      assert.match(query, /createCommitOnBranch/);
      const input = variables.input;
      assert.deepEqual(input.branch, {repositoryNameWithOwner: 'mpaykin1/meta6-lab', branchName: 'main'});
      assert.equal(input.expectedHeadOid, oid(), 'The write must lease the exact read HEAD');
      assert.deepEqual(Object.keys(input.fileChanges), ['additions']);
      assert.equal(input.fileChanges.additions.length, 1);
      assert.equal(input.fileChanges.additions[0].path, 'DLYA_CLAUDE.md');
      const proposed = Buffer.from(input.fileChanges.additions[0].contents, 'base64').toString('utf8');
      assert.equal(proposed, transform(mode === 'new-file' ?
        '# Для Claude — только подтверждённые блокировки\n' : text));
      writes++;
      if (mode === 'permission') {
        return {ok: true, json: async () => ({errors: [{type: 'FORBIDDEN', message: 'denied'}]})};
      }
      if (mode === 'exhausted' || (mode === 'race' && writes === 1)) {
        version++;
        text += 'FOREIGN_UPDATE: чужое изменение ' + version + '\n';
        return {ok: true, json: async () => ({errors: [{type: 'STALE_DATA',
          message: 'Expected branch to point to the previous HEAD'}]})};
      }
      if (mode === 'unconfirmed') data = {createCommitOnBranch: {commit: null}};
      else {
        committed = proposed;
        data = {createCommitOnBranch: {commit: {oid: 'f'.repeat(40)}}};
      }
    }
    return {ok: mode !== 'http', status: mode === 'http' ? 403 : 200, json: async () => ({data})};
  };
  if (mode === 'wrong-repo') {
    await assert.rejects(mod.updateReferenceQueue('mpaykin1/meta6', 'token', transform, request),
      /restricted to meta6-lab/);
    assert.equal(calls, 0);
  } else if (mode === 'http') {
    await assert.rejects(mod.updateReferenceQueue('mpaykin1/meta6-lab', 'token', transform, request), /HTTP 403/);
    assert.equal(calls, 1);
  } else if (mode === 'truncated') {
    await assert.rejects(mod.updateReferenceQueue('mpaykin1/meta6-lab', 'token', transform, request),
      /not complete text/);
    assert.equal(writes, 0);
  } else if (mode === 'permission') {
    await assert.rejects(mod.updateReferenceQueue('mpaykin1/meta6-lab', 'token', transform, request), /denied/);
    assert.equal(writes, 1, 'Permission errors must not be retried');
  } else if (mode === 'exhausted') {
    await assert.rejects(mod.updateReferenceQueue('mpaykin1/meta6-lab', 'token', transform, request),
      /Expected branch/);
    assert.equal(writes, 7);
    assert.equal(calls, 21);
  } else if (mode === 'unconfirmed') {
    await assert.rejects(mod.updateReferenceQueue('mpaykin1/meta6-lab', 'token', transform, request),
      /not confirmed/);
  } else {
    const result = await mod.updateReferenceQueue('mpaykin1/meta6-lab', 'token', transform, request);
    if (mode === 'noop') {
      assert.equal(result.changed, false);
      assert.equal(writes, 0);
      assert.equal(calls, 2);
    } else {
      assert.equal(result.changed, true);
      assert.equal(result.head, 'f'.repeat(40));
      assert.ok(committed.includes(marker));
      if (mode !== 'new-file') assert.ok(committed.includes('OWNER_NOTE: сохранить русский текст 🧩'));
      if (mode === 'race') {
        assert.equal(writes, 2);
        assert.ok(committed.includes('FOREIGN_UPDATE'), 'Reapply change to the fresh foreign content');
      }
    }
  }
}
async function verify(mod) {
  for (const mode of ['race', 'noop', 'new-file', 'wrong-repo', 'http', 'truncated',
    'permission', 'exhausted', 'unconfirmed']) await scenario(mod, mode);
}
await verify(production);
const mutants = [
  ['missing-head-lease', 'expectedHeadOid: head,', 'expectedHeadOid: undefined,'],
  ['mutable-main-read', "head + ':DLYA_CLAUDE.md'", "'main:DLYA_CLAUDE.md'"],
  ['no-head-race-retry', 'if (!error.headConflict || attempt === 6)', 'if (true)'],
  ['permission-retry', 'if (!error.headConflict || attempt === 6)', 'if (attempt === 6)'],
  ['erase-owner-note-cheat', 'const after = transform(before);',
    "const after = transform(before.replace(/OWNER_NOTE[^\\n]*\\n/g, ''));"],
  ['repo-fence-removed', "repo !== 'mpaykin1/meta6-lab' || ", ''],
  ['wrong-output-path', "path: 'DLYA_CLAUDE.md'", "path: 'OSHIBKI.md'"],
  ['truncated-blob-accepted', 'blob.isTruncated !== false', 'false'],
  ['unconfirmed-commit-accepted', 'if (!validOid(committed))', 'if (false)'],
  ['ignore-http-failure', 'if (!response.ok)', 'if (false)']
];
for (const [name, anchor, replacement] of mutants) {
  assert.equal(source.split(anchor).length, 2, 'Unique mutation target: ' + name);
  const module = await import('data:text/javascript;base64,' +
    Buffer.from(source.replace(anchor, replacement)).toString('base64'));
  await assert.rejects(verify(module), undefined, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('REFERENCE_QUEUE_MUTATIONS_PASS 10/10');
