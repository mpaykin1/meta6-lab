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
  ['quota: fifth PR erroneously red', 'living.slice(0, 5)', 'living.slice(0, 4)'],
  ['quota: draft PRs block the queue again', '&& p.draft !== true)', ')'],
  ['git files: deleted original reported as added', "D: 'removed'", "D: 'added'"],
  ['git files: deletions dropped', 'deletions: del === \'-\' ? 1 : Number(del) || 0', 'deletions: 0'],
  ['git files: unknown status accepted', "if (!status) throw Error('Unknown git status ' + code + ' for ' + filename);", ''],
  ['quota: hardcoded green for everyone', 'const reject = Boolean(pr &&', 'const reject = Boolean(false && pr &&'],
  ['stale: close after one day', '72 * 60 * 60 * 1000', '24 * 60 * 60 * 1000'],
  ['stale: keep abandoned PR forever', "const close = pr.state === 'open' &&", "const close = false && pr.state === 'open' &&"],
  ['stale: delete PR branches', 'return {close, deleteBranch: false};',
    'return {close, deleteBranch: true};'],
  ['reference: permit modified original', "if (status !== 'added') errors.push(p + ': существующий эталон нельзя изменять или удалять');\n      else additions.push(p);",
    "if (status !== 'added') continue;\n      else additions.push(p);"],
  ['reference: permit additions to existing folder', 'const paths = [...existing];',
    'const paths = [];'],
  ['reference: bypass with extra modifications', 'files.length !== additions.length',
    'false'],
  ['reference: core workflow bypass', 'if (coreWorkflow ||', 'if (false ||'],
  ['reference: core workflow list emptied', '(?:storozha-[^/]+|kontur-guard|', '(?:nothing-at-all|'],
  ['reference: allow workflow deletion', "workflow && status !== 'added' && status !== 'modified'", 'false'],
  ['reference: allow core script additions only check', "protectedScript && status !== 'added'", 'false'],
  ['reference: treat test line removal as fine', "Number(file.deletions) !== 0", 'Number(file.deletions) > 5'],
  ['reference: modified test never checked', "(status !== 'modified' ||", '(false ||'],
  ['reference: bypass nested test directory', 'const protectedTest = /',
    'const protectedTest = false && /'],
  ['reference: bypass TypeScript spec file',
    '/\\.(?:test|spec)\\.[cm]?[jt]sx?$/i.test(p);',
    '/\\.(?:test)\\.[cm]?[jt]sx?$/i.test(p);']
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
  ['branch: watcher starts pushing into PR heads', '// NO_HEAD_PUSH', "await api('/pulls/' + pr.number + '/update-branch', 'PUT'); //"],
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
