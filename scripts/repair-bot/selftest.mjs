import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./repair-json.mjs', import.meta.url));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'meta-repair-selftest-'));
const run = () => spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' });
try {
  execFileSync('git', ['init', '-q', dir]);
  const bad = path.join(dir, 'invalid.json');
  const good = path.join(dir, 'valid.json');
  fs.writeFileSync(bad, '\uFEFF{"note":"keep comma,} inside a string","items":[1,2,],}\n');
  fs.writeFileSync(good, '{"ok":true}\n');
  execFileSync('git', ['-C', dir, 'add', 'invalid.json', 'valid.json']);
  const first = run();
  assert.equal(first.status, 0, first.stderr || first.stdout);
  assert.deepEqual(JSON.parse(fs.readFileSync(bad, 'utf8')), {
    note: 'keep comma,} inside a string', items: [1, 2]
  });
  assert.equal(fs.readFileSync(good, 'utf8'), '{"ok":true}\n');
  const repairedText = fs.readFileSync(bad, 'utf8');
  const second = run();
  assert.equal(second.status, 0, second.stderr || second.stdout);
  assert.equal(fs.readFileSync(bad, 'utf8'), repairedText);
  const unresolved = path.join(dir, 'unresolved.json');
  fs.writeFileSync(unresolved, '{"broken": ');
  execFileSync('git', ['-C', dir, 'add', 'unresolved.json']);
  const third = run();
  assert.equal(third.status, 2, third.stderr || third.stdout);
  assert.equal(fs.readFileSync(unresolved, 'utf8'), '{"broken": ');
  console.log('Repair bot isolated fixture: success');
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
