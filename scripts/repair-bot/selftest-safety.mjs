import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const source = fs.readFileSync(new URL('./repair-json.mjs', import.meta.url), 'utf8');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repair-safety-'));
let sequence = 0;

function exercise(code) {
  const dir = path.join(root, 'case-' + sequence++);
  fs.mkdirSync(dir);
  const script = path.join(dir, 'repair.mjs');
  fs.writeFileSync(script, code);
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  execFileSync('git', ['init', '-q', repo]);
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe' });
  const run = () => spawnSync(process.execPath, [script], { cwd: repo, encoding: 'utf8', timeout: 10000 });
  const put = (name, contents) => fs.writeFileSync(path.join(repo, name), contents);

  put('missing.json', '{}');
  git('add', 'missing.json');
  fs.unlinkSync(path.join(repo, 'missing.json'));
  assert.equal(run().status, 2, 'missing tracked JSON must fail');
  git('rm', '--cached', '-q', 'missing.json');

  put('blocked.json', '{}');
  git('add', 'blocked.json');
  fs.unlinkSync(path.join(repo, 'blocked.json'));
  fs.mkdirSync(path.join(repo, 'blocked.json'));
  assert.equal(run().status, 2, 'directory replacing JSON must fail');
  git('rm', '--cached', '-q', 'blocked.json');

  const repairable = '\uFEFF{"text":"comma,} stays","items":[1,2,],}\n';
  put('repairable.json', repairable);
  put('unresolved.json', '{"unfinished":');
  git('add', 'repairable.json', 'unresolved.json');
  assert.equal(run().status, 2, 'unresolved syntax must fail');
  assert.equal(fs.readFileSync(path.join(repo, 'repairable.json'), 'utf8'), repairable,
    'failed batch must leave repairable JSON unchanged');
  git('rm', '--cached', '-q', 'unresolved.json');

  fs.mkdirSync(path.join(repo, 'linked'));
  put('linked/data.json', '{}');
  git('add', 'linked/data.json');
  fs.unlinkSync(path.join(repo, 'linked/data.json'));
  fs.rmdirSync(path.join(repo, 'linked'));
  const outside = path.join(dir, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'data.json'), '{"outside":true,}');
  fs.symlinkSync(outside, path.join(repo, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(run().status, 2, 'linked ancestor must fail');
  assert.equal(fs.readFileSync(path.join(outside, 'data.json'), 'utf8'), '{"outside":true,}',
    'repair must never modify a file outside repository');
  git('rm', '--cached', '-f', '-q', 'linked/data.json');

  assert.equal(run().status, 0, 'safe repair must still work');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(repo, 'repairable.json'), 'utf8')),
    { text: 'comma,} stays', items: [1, 2] });
  return true;
}

try {
  exercise(source);
  console.log('Repair safety: missing files, batch failure, linked ancestors, safe repair PASS');
  const mutations = [
    ['missing-is-success', '    invalid++;', '    // mutation: swallow read failure'],
    ['partial-batch-write', 'if (!invalid) {', 'if (true) {'],
    ['linked-directory-deception', 'fs.lstatSync(current)', 'fs.statSync(current)']
  ];
  for (const [name, from, to] of mutations) {
    assert(source.includes(from), 'mutation target missing: ' + name);
    assert.throws(() => exercise(source.replace(from, to)), { name: 'AssertionError' }, 'mutation survived: ' + name);
    console.log('Repair safety mutation caught: ' + name);
  }
} finally {
  assert(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
  fs.rmSync(root, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
