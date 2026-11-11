// K5/K10: execute the SAME fixtures against deliberately damaged production code.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verify, verifyWiring, productionSources} from './verify-storozha.mjs';
import * as production from './core.mjs';

verify(production);
verifyWiring(productionSources());
const source = readFileSync(new URL('./core.mjs', import.meta.url), 'utf8');
const mutants = [
  ['branch: duplicate conflicts', 'const unique = [...new Map(entries.map(entry => [entry.id, entry.text])).values()];',
    'const unique = entries.map(entry => entry.text);'],
  ['branch: never clear resolved conflict', 'const unique = [...new Map(entries.map(entry => [entry.id, entry.text])).values()];',
    'const unique = entries.length ? [...new Map(entries.map(entry => [entry.id, entry.text])).values()] : ["| #7 | stale |"];'],
  ['branch: lie about exact conflict file', 'return [...new Set(paths.filter(p => p && !/[\\n\\r|]/.test(p)))].sort();',
    'return ["reference/old/wrong.glb"];'],
  ['quota: sixth PR erroneously green', 'living.length > 5', 'living.length > 6'],
  ['quota: fifth PR erroneously red', 'const reject = Boolean(pr &&', 'const reject = Boolean(pr && living.length >= 5 &&'],
  ['quota: hardcoded green for everyone', 'const reject = Boolean(pr &&', 'const reject = Boolean(false && pr &&'],
  ['stale: close after one day', '72 * 60 * 60 * 1000', '24 * 60 * 60 * 1000'],
  ['stale: keep abandoned PR forever', "const close = pr.state === 'open' &&", "const close = false && pr.state === 'open' &&"],
  ['stale: delete PR branches', 'return {close, deleteBranch: false};',
    'return {close, deleteBranch: true};'],
  ['reference: permit modified original', "if (status !== 'added') errors.push",
    "if (status === 'deleted') errors.push"],
  ['reference: permit additions to existing folder', 'const paths = [...existing];',
    'const paths = [];'],
  ['reference: bypass with extra modifications', 'files.length !== additions.length',
    'false'],
  ['reference: workflow bypass', "if (/^\\.github\\/workflows\\//.test(p) ||",
    'if (false ||'],
  ['reference: treat only removed test as protected', "status !== 'added') {",
    "status === 'deleted') {"]
];
let caught = 0;
for (const [label, needle, replacement] of mutants) {
  assert.ok(source.includes(needle), 'Mutation target not found: ' + label);
  const changed = source.replace(needle, replacement);
  assert.notEqual(changed, source, 'Mutation did not change production code: ' + label);
  const uri = 'data:text/javascript;base64,' + Buffer.from(changed, 'utf8').toString('base64');
  const modified = await import(uri);
  let failed = false;
  try { verify(modified); } catch (error) {
    if (!(error instanceof assert.AssertionError)) throw error;
    failed = true;
  }
  assert.equal(failed, true, 'MUTATION_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
  caught++;
}
const wiring = [
  ['branch: API accidentally merges instead of updating', 'update-branch', 'merge'],
  ['branch: errors erase queue', 'if (!process.exitCode) await writeQueue(rows)',
    'if (false) await writeQueue(rows)'],
  ['branch: conflict swallowed', "fresh.mergeable_state === 'dirty'",
    "fresh.mergeable_state === 'never'"]
];
const original = productionSources();
for (const [label, needle, replacement] of wiring) {
  assert.ok(original.branch.includes(needle), 'Missing wiring mutation target: ' + label);
  assert.throws(() => verifyWiring({...original, branch: original.branch.replace(needle, replacement)}),
    assert.AssertionError, 'MUTATION_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
  caught++;
}
console.log('STOROZHA_MUTATIONS_PASS ' + caught + ' / ' + (mutants.length + wiring.length));
