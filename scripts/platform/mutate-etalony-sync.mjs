#!/usr/bin/env node
// Fail on one-byte drift, missing files, extra files and forged passport claims.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const verify = path.join(path.dirname(fileURLToPath(import.meta.url)), 'verify-etalony-sync.mjs');
const root = mkdtempSync(path.join(tmpdir(), 'etalon-sync-'));
const mg = path.join(root, 'mg');
const lab = path.join(root, 'lab');
const dir = 'reference/ink-fixture';
const html = path.join(dir, 'index.html');
const passport = path.join(dir, 'REFERENCE.json');
function write(base, file, data) {
  mkdirSync(path.dirname(path.join(base, file)), { recursive: true });
  writeFileSync(path.join(base, file), data);
}
function reset() {
  rmSync(lab, { recursive: true, force: true });
  cpSync(path.join(mg, 'reference'), path.join(lab, 'reference'), { recursive: true });
}
function check() {
  const result = spawnSync(process.execPath, [verify, '--mg-root', mg, '--lab-root', lab], {
    encoding: 'utf8', timeout: 10000,
  });
  if (result.error) throw result.error;
  return result.status;
}
try {
  write(mg, 'AGENTS.md', 'Эталон **INK · Fixture** (OWNER PASS 15.11.2026): ' +
    '\x60reference/ink-fixture/\x60 — test\n');
  write(mg, html, '<html>canonical</html>\n');
  write(mg, passport, '{"files":[{"path":"reference/ink-fixture/index.html","git_blob_sha":"canonical"}]}\n');
  write(mg, path.join(dir, 'shared', 'shader.glsl'), 'void main() {}\n');
  reset();
  assert.equal(check(), 0, 'Unmodified reference must pass');
  const cases = [
    ['one-byte', () => {
      const bytes = readFileSync(path.join(lab, html));
      bytes[6] ^= 1;
      writeFileSync(path.join(lab, html), bytes);
    }],
    ['missing-file', () => unlinkSync(path.join(lab, html))],
    ['unexpected-file', () => write(lab, path.join(dir, 'unapproved.js'), 'alert(1)')],
    ['forged-passport', () => {
      write(lab, html, '<html>forged</html>\n');
      write(lab, passport,
        '{"files":[{"path":"reference/ink-fixture/index.html","git_blob_sha":"canonical"}]}\n');
    }],
  ];
  for (const [name, mutate] of cases) {
    reset();
    mutate();
    assert.notEqual(check(), 0, 'Mutation escaped: ' + name);
    console.log('CAUGHT: ' + name);
  }
  console.log('PASS: 4 OWNER PASS mutation traps');
} finally {
  rmSync(root, { recursive: true, force: true });
}
