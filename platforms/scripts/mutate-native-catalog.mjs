import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const original = fs.readFileSync(path.join(here, 'build-catalog.mjs'), 'utf8');
const integrity = fs.readFileSync(path.join(here, 'check-native-integrity.mjs'), 'utf8');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'native-catalog-mutations-'));

try {
  const scripts = path.join(root, 'platforms', 'scripts');
  fs.mkdirSync(scripts, { recursive: true });
  fs.mkdirSync(path.join(root, 'meta-games'));
  for (const game of ['one', 'two']) {
    fs.mkdirSync(path.join(root, game));
    fs.writeFileSync(path.join(root, game, 'index.html'), '<html><head></head></html>');
  }
  fs.writeFileSync(path.join(root, 'meta-games', 'index.html'),
    '<a class="game" href="../one/">First</a>\n' +
    '<a href="../two/" class="game">Second</a>\n');
  fs.writeFileSync(path.join(scripts, 'check-native-integrity.mjs'), integrity);

  function check(source) {
    fs.writeFileSync(path.join(scripts, 'build-catalog.mjs'), source);
    return spawnSync(process.execPath, [path.join(scripts, 'check-native-integrity.mjs')], {
      cwd: root, encoding: 'utf8'
    });
  }
  const baseline = check(original);
  assert.equal(baseline.status, 0,
    'unmodified source must pass: ' + baseline.stdout + baseline.stderr);
  const cases = [
    {
      id: 'deception-constant-hash',
      from: "return hash.digest('hex');",
      to: "return '0'.repeat(64);"
    },
    {
      id: 'symlink-smuggling',
      from: "if(item.isSymbolicLink()) throw new Error('Symlinked game asset is forbidden: '+rel);",
      to: "if(item.isSymbolicLink()) continue;"
    },
    {
      id: 'deception-one-game-only',
      from: '    games.push({',
      to: '    if (games.length > 0) break;\n    games.push({'
    }
  ];
  for (const mutation of cases) {
    assert.ok(original.includes(mutation.from),
      'mutation anchor disappeared: ' + mutation.id);
    const result = check(original.replace(mutation.from, mutation.to));
    assert.notEqual(result.status, 0,
      'undetected mutation: ' + mutation.id);
    console.log('MUTATION_CAUGHT ' + mutation.id);
  }
  console.log('NATIVE_CATALOG_MUTATIONS_PASS: 3/3');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
