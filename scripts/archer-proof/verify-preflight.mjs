// Permanent mutation trap: detect fake green if optional source disappears from the preflight.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const original = join(here, 'preflight.mjs');
const source = readFileSync(original, 'utf8');
const anchor = 'if (existsSync(resolve(root, rel))) checked(rel)';
assert(source.includes(anchor), 'Preflight optional source validation missing');
const temp = mkdtempSync(join(tmpdir(), 'archer-syntax-traps-'));
const fixtures = join(temp, 'fixtures');
const required = join(fixtures, 'scripts/archer-proof/archer.mjs');
const optional = join(fixtures, 'games/archer-in-the-fog/src/goal-target.js');
const mutant = join(temp, 'preflight-mutant.mjs');
mkdirSync(dirname(required), {recursive: true});
mkdirSync(dirname(optional), {recursive: true});
const run = (file = original) => spawnSync(process.execPath, [file, fixtures], {encoding: 'utf8'}).status;
try {
  writeFileSync(required, 'export const proof = true;\n');
  assert.equal(run(), 0, 'Parent workflow branch without child game source must pass');
  writeFileSync(optional, 'function broken( {\n');
  assert.notEqual(run(), 0, 'Broken optional game module must fail: original RED');
  writeFileSync(optional, 'export const fixed = true;\n');
  assert.equal(run(), 0, 'Corrected game module must pass: fixed GREEN');
  rmSync(required);
  assert.notEqual(run(), 0, 'Missing required proof script must fail');
  writeFileSync(required, 'export const proof = true;\n');
  writeFileSync(optional, 'function broken( {\n');
  writeFileSync(mutant, source.replace(anchor, 'if (false && existsSync(resolve(root, rel))) checked(rel)'));
  assert.equal(run(mutant), 0, 'Expected broken mutant to evade checks: trap not effective');
  assert.notEqual(run(), 0, 'Trap must reject the same broken code that mutant accepts');
  console.log('ARCHER PREFLIGHT: source parent PASS; broken source RED; fixed source PASS; missing proof RED; mutant exposed');
} finally {
  rmSync(temp, {recursive: true, force: true});
}
