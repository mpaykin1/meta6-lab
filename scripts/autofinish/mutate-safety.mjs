// Mutation proof for autofinish protection of the three new sentinels and reference-only gate.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('./run.mjs', import.meta.url), 'utf8');

function loadPolicy(text) {
  const first = text.indexOf('const protectedPaths=');
  const last = text.indexOf('export function independentReview');
  assert.ok(first >= 0 && last > first, 'Autofinish policy segment not found');
  const segment = text.slice(first, last).replaceAll('export const ', 'const ')
    .replaceAll('export function ', 'function ');
  return Function(segment + '\nreturn {safeFiles, green, onlyNewReference};')();
}

function contract(p) {
  const safe = p.safeFiles;
  const newReference = [{filename: 'reference/new-claude-world/game.html', status: 'added'},
    {filename: 'reference/new-claude-world/model.glb', status: 'added'}];
  assert.equal(safe(newReference), true, 'Only brand new reference files can proceed');
  assert.equal(safe([{filename: 'reference/old/file.glb', status: 'modified'}]), false,
    'Edited reference can never self-merge');
  assert.equal(safe([{filename: 'reference/new/a.glb', status: 'added'},
    {filename: 'reference/other/b.glb', status: 'added'}]), false,
    'One game must have exactly one new reference folder');
  assert.equal(safe([{filename: 'reference/new/a.glb', status: 'added'},
    {filename: 'README.md', status: 'modified'}]), false, 'Reference exception must be additive only');
  assert.equal(safe([{filename: '.github/workflows/storozha-quota.yml', status: 'modified'}]), false,
    'No workflow may self-merge');
  assert.equal(safe([{filename: 'scripts/storozha/core.mjs', status: 'modified'}]), false,
    'Storoza policy cannot self-merge');
  assert.equal(safe([{filename: 'scripts/autofinish/run.mjs', status: 'modified'}]), false,
    'Autofinish policy cannot self-merge');
  assert.equal(safe([{filename: 'scripts/meta-bot/core.mjs', status: 'modified'}]), false,
    'Bot core cannot self-merge');
  const required = ['mutate-kontur-guard', 'kontur-guard', 'guard'].map(name => ({
    name, status: 'completed', conclusion: 'success'
  }));
  assert.equal(p.green(required, [], newReference), false,
    'New reference requires successful new trusted reference-check job');
  assert.equal(p.green([...required, {name: 'storozha-reference', status: 'completed',
    conclusion: 'success'}], [], newReference), true,
    'Safe new reference requires all guardians');
}
contract(loadPolicy(source));
const mutants = [
  ['protected sentinel folder bypass', '/^scripts\\/storozha\\//', '/^scripts\\/unprotected\\//'],
  ['autofinish guard bypass', '/^scripts\\/autofinish\\//', '/^scripts\\/unprotected\\//'],
  ['reference status bypass', "f.status === 'added'", 'true'],
  ['reference crosses two folders', "new Set(files.map(f => f.filename.split('/').slice(0, 2).join('/'))).size === 1",
    "true"],
  ['reference CI check skipped', "&&!names.has('storozha-reference')", "&&false"],
  ['workflow protection bypass', '/^\\.github\\//', '/^unprotected\\//']
];
for (const [name, needle, replacement] of mutants) {
  assert.ok(source.includes(needle), 'Mutation target absent: ' + name);
  assert.notEqual(source.replace(needle, replacement), source, 'Mutation did not change code: ' + name);
  assert.throws(() => contract(loadPolicy(source.replace(needle, replacement))),
    assert.AssertionError, 'MUTATION_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('AUTOFINISH_SAFETY_MUTATION_PASS ' + mutants.length + '/' + mutants.length);
