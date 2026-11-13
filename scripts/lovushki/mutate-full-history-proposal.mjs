// Verify the reviewable workflow patch; do not modify the active workflow or guard.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
const original = readFileSync(join(root, '.github/workflows/meta-games-guard.yml'), 'utf8').replace(/\r\n/g, '\n');
const patch = readFileSync(join(root, 'reports/proveryayushchij/META_GAMES_FULL_HISTORY.patch'), 'utf8')
  .replace(/\r\n/g, '\n');
const guardPath = join(root, 'scripts/meta-games-guard.sh').replaceAll('\\', '/');
const shell = process.platform === 'win32' ?
  join(process.env.ProgramFiles || 'C:/Program Files', 'Git/bin/bash.exe') : 'bash';
if (process.platform === 'win32') assert.ok(existsSync(shell), 'Git Bash is required for this guard fixture');
const prefix = join(tmpdir(), 'full-history-proposal-');
const sandbox = mkdtempSync(prefix);
const git = (cwd, args, input) => execFileSync('git', args, {
  cwd, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
}).trim();
const run = (cwd, args, env = {}) => {
  const result = spawnSync(shell, args, {cwd, encoding: 'utf8', timeout: 15000,
    env: {...process.env, ...env}});
  assert.ifError(result.error);
  return result;
};
function script(workflow, step) {
  const lines = workflow.split('\n');
  const start = lines.findIndex(line => line.trim() === '- name: ' + step);
  assert.ok(start >= 0, 'Missing history step: ' + step);
  let at = start + 1;
  while (at < lines.length && !/^        run: \|$/.test(lines[at])) {
    assert.ok(!/^      - /.test(lines[at]), 'Missing run block: ' + step);
    at++;
  }
  assert.ok(at < lines.length, 'Missing run block: ' + step);
  const body = [];
  for (at++; at < lines.length && lines[at].startsWith('          '); at++) body.push(lines[at].slice(10));
  return body.join('\n');
}
try {
  const repo = join(sandbox, 'source');
  mkdirSync(join(repo, '.github/protected'), {recursive: true});
  mkdirSync(join(repo, '.github/workflows'), {recursive: true});
  mkdirSync(join(repo, 'reference'), {recursive: true});
  writeFileSync(join(repo, '.gitattributes'), '* text eol=lf\n');
  writeFileSync(join(repo, '.github/workflows/meta-games-guard.yml'), original);
  writeFileSync(join(repo, 'reference/original.txt'), 'original\n');
  writeFileSync(join(repo, '.github/protected/paths.txt'), 'reference/original.txt\n');
  writeFileSync(join(repo, '.github/protected/must-contain.txt'), '');
  writeFileSync(join(repo, '.github/protected/SHA256SUMS'),
    createHash('sha256').update('original\n').digest('hex') + '  reference/original.txt\n');
  git(repo, ['init', '--quiet', '-b', 'main']);
  git(repo, ['config', 'core.autocrlf', 'false']);
  git(repo, ['config', 'user.name', 'Fixture']);
  git(repo, ['config', 'user.email', 'fixture@example.invalid']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  git(repo, ['add', '.']);
  git(repo, ['commit', '--quiet', '-m', 'initial fixture']);
  git(repo, ['checkout', '--quiet', '-b', 'feature']);
  for (let i = 1; i <= 4; i++) {
    writeFileSync(join(repo, 'feature.txt'), String(i));
    git(repo, ['add', 'feature.txt']);
    git(repo, ['commit', '--quiet', '-m', 'unsigned ordinary feature ' + i]);
  }
  git(repo, ['checkout', '--quiet', 'main']);
  writeFileSync(join(repo, 'main.txt'), 'main');
  git(repo, ['add', 'main.txt']);
  git(repo, ['commit', '--quiet', '-m', 'ordinary main update']);
  const base = git(repo, ['rev-parse', 'HEAD']);
  git(repo, ['checkout', '--quiet', 'feature']);
  git(repo, ['merge', '--quiet', '--no-edit', 'main']);
  const head = git(repo, ['rev-parse', 'HEAD']);
  const applyProposal = () => {
    const options = {cwd: repo, input: patch, encoding: 'utf8'};
    const forward = spawnSync('git', ['apply', '--check', '-'], options);
    assert.ifError(forward.error);
    if (forward.status === 0) git(repo, ['apply', '-'], patch);
    else {
      const reverse = spawnSync('git', ['apply', '--reverse', '--check', '-'], options);
      assert.ifError(reverse.error);
      assert.equal(reverse.status, 0, 'History proposal is neither applicable nor already applied: ' + reverse.stderr);
    }
  };
  applyProposal();
  const proposed = readFileSync(join(repo, '.github/workflows/meta-games-guard.yml'), 'utf8');
  applyProposal();
  assert.equal(readFileSync(join(repo, '.github/workflows/meta-games-guard.yml'), 'utf8'), proposed,
    'The permanent trap must remain valid after Claude applies the exact proposal');
  const clone = (name, depth = []) => {
    const target = join(sandbox, name);
    git(sandbox, ['-c', 'protocol.file.allow=always', 'clone', '--quiet', '--branch', 'feature',
      ...depth, pathToFileURL(repo).href, target]);
    return target;
  };
  const shallow = clone('shallow', ['--depth=2']);
  const complete = clone('complete');
  const env = {GUARD_BASE: base, GUARD_HEAD: head, GUARD_RANGE: base + '..' + head,
    GITHUB_OUTPUT: join(sandbox, 'guard-output.txt').replaceAll('\\', '/')};
  const falseReject = run(shallow, [guardPath, 'check'], env);
  assert.equal(falseReject.status, 1, falseReject.stderr);
  assert.match(falseReject.stdout, /изменил \.github\/protected без подписи/,
    'The real unchanged guard must reproduce shallow-boundary false attribution');
  const accepted = run(complete, [guardPath, 'check'], env);
  assert.equal(accepted.status, 0, accepted.stdout + accepted.stderr);
  const bad = clone('unsigned-protected');
  git(bad, ['config', 'user.name', 'Fixture']);
  git(bad, ['config', 'user.email', 'fixture@example.invalid']);
  git(bad, ['config', 'commit.gpgsign', 'false']);
  writeFileSync(join(bad, 'reference/original.txt'), 'unauthorized edit\n');
  git(bad, ['add', '.']);
  git(bad, ['commit', '--quiet', '-m', 'unsigned protected edit']);
  const rejected = run(bad, [guardPath, 'check'], {...env,
    GUARD_RANGE: base + '..' + git(bad, ['rev-parse', 'HEAD'])});
  assert.equal(rejected.status, 1);
  assert.match(rejected.stdout, /Защищённый файл изменён/);
  function verify(workflow) {
    assert.match(workflow, /^          fetch-depth: 0$/m, 'Checkout must fetch complete history');
    assert.ok(workflow.indexOf('- name: Require complete commit history') <
      workflow.indexOf('- name: Check protected files'), 'The gate must run before the guard');
    const history = script(workflow, 'Require complete commit history');
    assert.notEqual(run(shallow, ['-c', history], env).status, 0, 'Never inspect protected history in a shallow tree');
    assert.equal(run(complete, ['-c', history], env).status, 0);
    const range = script(workflow, 'Verify PR range objects');
    assert.equal(run(complete, ['-c', range], env).status, 0);
    for (const missing of ['f'.repeat(40), '0'.repeat(40)]) {
      assert.notEqual(run(complete, ['-c', range], {...env, GUARD_HEAD: missing}).status, 0,
        'Both commits must exist, not merely look like SHAs');
    }
    assert.ok(workflow.includes('run: bash scripts/meta-games-guard.sh check'), 'Keep the original guard');
  }
  verify(proposed);
  const range = script(proposed, 'Verify PR range objects');
  const checks = range.split('\n').filter(line => line.startsWith('git '))
    .map(line => '          ' + line).join('\n');
  const mutants = [
    ['finite-history', proposed.replace('fetch-depth: 0', 'fetch-depth: 300')],
    ['skip-shallow-gate', proposed.replace(
      'test "$(git rev-parse --is-shallow-repository)" = false', 'true # incomplete history accepted')],
    ['skip-range-objects', proposed.replace(checks, '          true # object verification removed')],
    ['one-missing-sha-cheat', proposed.replace(checks,
      '          if [ "$GUARD_HEAD" = "' + 'f'.repeat(40) + '" ]; then exit 1; fi')]
  ];
  for (const [name, candidate] of mutants) {
    assert.notEqual(candidate, proposed, 'Mutation target missing: ' + name);
    assert.throws(() => verify(candidate), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
    console.log('MUTATION_KILLED ' + name);
  }
  console.log('FULL_HISTORY_PROPOSAL_PASS 4/4; real shallow FAIL, complete PASS, unsigned edit FAIL');
} finally {
  assert.ok(sandbox.startsWith(prefix), 'Only the created fixture may be removed');
  rmSync(sandbox, {recursive: true, force: true, maxRetries: 3});
}
