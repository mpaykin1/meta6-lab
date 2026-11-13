// Regression: mutation setup must target alive(), not a matching staleDecision expression.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const guard = readFileSync(new URL('./mutate-storozha-quota-timestamp.mjs', import.meta.url), 'utf8');
const core = readFileSync(new URL('../storozha/core.mjs', import.meta.url), 'utf8');
const needle = "const timestamp = Date.parse(pr.lastCommitAt || '');";
const broad = "Date.parse(pr.lastCommitAt || '')";
const success = 'STOROZHA_QUOTA_TIMESTAMP_MUTATIONS_PASS 7/7';

function run(candidate, source = core) {
  const root = mkdtempSync(join(tmpdir(), 'quota-target-'));
  try {
    mkdirSync(join(root, 'storozha'));
    mkdirSync(join(root, 'lovushki'));
    writeFileSync(join(root, 'storozha/core.mjs'), source);
    const path = join(root, 'lovushki/mutate-storozha-quota-timestamp.mjs');
    writeFileSync(path, candidate);
    return spawnSync(process.execPath, [path], {encoding: 'utf8', timeout: 10000});
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
}

function verify(candidate) {
  for (const source of [core, core + '\n// Unrelated documentation: ' + broad + '\n']) {
    const result = run(candidate, source);
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes(success), 'All seven mutations must finish');
    assert.equal((result.stdout.match(/^MUTATION_KILLED /gm) || []).length, 7);
  }
}

verify(guard);
const mutants = [
  ['broad-target-regression', guard.replace(needle, broad)],
  ['wrong-function-target', guard.replace(needle, "const date = Date.parse(pr.lastCommitAt || '');")],
  ['comment-target-cheat', guard.replace(needle, '// ' + needle)]
];
for (const [name, candidate] of mutants) {
  assert.notEqual(candidate, guard, 'Mutation target missing: ' + name);
  assert.throws(() => verify(candidate), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('QUOTA_MUTATION_TARGET_PASS 3/3');
