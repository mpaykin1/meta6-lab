// Run the actual guard against a local Git tree and a network-free GraphQL fixture.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const directory = new URL('../storozha/', import.meta.url);
const guard = readFileSync(new URL('reference-check.mjs', directory), 'utf8');
const originals = Object.fromEntries(['core.mjs', 'reference-snapshot.mjs', 'reference-queue.mjs', 'reference-head.mjs']
  .map(name => [name, readFileSync(new URL(name, directory), 'utf8')]));
const before = '# Owner note: сохранить\n<!-- STOROZHA:PROTECTED:BEGIN -->\n' +
  '| #247 | lab/old | old | 2026-11-12 |\n| #248 | lab/other | preserve | 2026-11-12 |\n' +
  '<!-- STOROZHA:PROTECTED:END -->\n# Foreign footer\n';

function verify(candidate) {
  const prefix = join(tmpdir(), 'reference-queue-');
  const root = mkdtempSync(prefix);
  try {
    const scripts = join(root, 'scripts/storozha');
    mkdirSync(scripts, {recursive: true});
    mkdirSync(join(root, 'reference/old'), {recursive: true});
    writeFileSync(join(root, 'reference/old/original.txt'), 'unchanged original');
    for (const [name, text] of Object.entries(originals)) writeFileSync(join(scripts, name), text);
    writeFileSync(join(scripts, 'reference-check.mjs'), candidate);
    const git = args => execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
    git(['init', '--quiet']);
    git(['add', 'reference']);
    const tree = git(['write-tree']);
    const head = git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
      'commit-tree', tree, '-m', 'fixture']);
    git(['update-ref', 'HEAD', head]);
    const preload = join(root, 'fixture.mjs');
    writeFileSync(preload, `import assert from 'node:assert/strict';
      import {appendFileSync} from 'node:fs';
      const head = ${JSON.stringify(head)}, before = ${JSON.stringify(before)};
      globalThis.fetch = async (endpoint, options) => {
        assert.equal(endpoint, 'https://api.github.com/graphql');
        const {query, variables} = JSON.parse(options.body);
        let data;
        if (query.includes('pullRequest(number:')) {
          data = {repository: {pullRequest: {number: 247, state: 'OPEN', baseRefName: 'main',
            baseRefOid: head, headRefName: 'lab/fresh',
            headRefOid: process.env.QUEUE_FIXTURE_STALE_HEAD === '1' ? 'c'.repeat(40) : head, changedFiles: 1,
            files: {totalCount: 1, nodes: [{path: 'reference/new/a.glb', changeType: 'ADDED'}],
              pageInfo: {hasNextPage: false, endCursor: null}}}}};
        } else if (query.includes('ref(qualifiedName:')) data = {repository: {ref: {target: {oid: head}}}};
        else if (query.includes('object(expression:')) {
          assert.equal(variables.expression, head + ':DLYA_CLAUDE.md');
          data = {repository: {object: {__typename: 'Blob', text: before,
            isBinary: false, isTruncated: false}}};
        } else {
          assert.match(query, /createCommitOnBranch/);
          appendFileSync(process.env.QUEUE_FIXTURE_LOG, JSON.stringify(variables.input) + '\\n');
          data = {createCommitOnBranch: {commit: {oid: 'f'.repeat(40)}}};
        }
        return {ok: true, json: async () => ({data})};
      };`);
    for (const [readOnly, stale] of [['0', '0'], ['1', '0'], ['1', '1']]) {
      const log = join(root, 'writes-' + readOnly + '-' + stale + '.jsonl');
      const result = spawnSync(process.execPath,
        ['--import', pathToFileURL(preload).href, join(scripts, 'reference-check.mjs')], {
        cwd: root, encoding: 'utf8', timeout: 10000,
        env: {...process.env, STOROZHA_REPO: 'mpaykin1/meta6-lab', STOROZHA_TOKEN: 'fixture',
          STOROZHA_PR_NUMBER: '247', STOROZHA_READ_ONLY: readOnly, QUEUE_FIXTURE_LOG: log,
          QUEUE_FIXTURE_STALE_HEAD: stale}
      });
      assert.ifError(result.error);
      if (stale === '1') {
        assert.equal(result.status, 1, 'A different API HEAD must not pass on the old checkout');
        assert.match(result.stderr, /PR HEAD differs/);
        assert.equal(existsSync(log), false, 'A stale read-only check must not write');
        continue;
      }
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /STOROZHA_REFERENCE_PASS #247/);
      if (readOnly === '1') assert.equal(existsSync(log), false, 'PR guard must not write');
      else {
        assert.equal(existsSync(log), true, 'Trusted guard must persist removal of a resolved row');
        const writes = readFileSync(log, 'utf8').trim().split('\n').map(line => JSON.parse(line));
        assert.equal(writes.length, 1);
        assert.equal(writes[0].expectedHeadOid, head);
        assert.equal(writes[0].fileChanges.additions[0].path, 'DLYA_CLAUDE.md');
        const after = Buffer.from(writes[0].fileChanges.additions[0].contents, 'base64').toString('utf8');
        assert.ok(!after.includes('| #247 |'));
        assert.ok(after.includes('| #248 | lab/other | preserve | 2026-11-12 |'));
        assert.ok(after.includes('# Owner note: сохранить'));
        assert.ok(after.includes('# Foreign footer'));
      }
    }
  } finally {
    assert.ok(root.startsWith(prefix), 'Only the created fixture directory may be removed');
    rmSync(root, {recursive: true, force: true});
  }
}
verify(guard);
const mutants = [
  ['skip-queue-persistence', guard.replace(/await updateReferenceQueue\(repo, token, before => \{[\s\S]*?\n\}\);/,
    '// queue persistence removed')],
  ['write-from-read-only-pr', guard.replace("if (process.env.STOROZHA_READ_ONLY !== '1')", 'if (true)')],
  ['delete-other-pr-rows-cheat', guard.replace("return reconcileSection(before, 'PROTECTED', entries);",
    "return reconcileSection(before, 'PROTECTED', []);")],
  ['skip-checkout-head-lease', guard.replace('verifyReferenceHead(pr, checkoutHead);', '')]
];
for (const [name, candidate] of mutants) {
  assert.notEqual(candidate, guard, 'Mutation target missing: ' + name);
  assert.throws(() => verify(candidate), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('REFERENCE_QUEUE_WIRING_MUTATIONS_PASS 4/4');
