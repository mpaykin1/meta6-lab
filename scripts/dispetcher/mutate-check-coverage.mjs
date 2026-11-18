import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./build.mjs', import.meta.url), 'utf8');
const start = source.indexOf('if(!Array.isArray(checks.check_runs)');
const end = source.indexOf('const failed=checks.check_runs.filter', start);
assert.ok(start >= 0 && end > start, 'check-run coverage guard must exist');
const guard = source.slice(start, end);

function result(code, checks, statuses) {
  const isolated = '(function(checks,statuses,pr){' + code + '\nreturn "ok";})';
  try {
    vm.runInNewContext(isolated)(checks, statuses, { head: { sha: 'fixture' } });
    return 'ok';
  } catch (error) {
    return /неполный/.test(error.message) ? 'rejected' : 'wrong-error';
  }
}

function verifies(code) {
  const checks = { check_runs: [{ conclusion: 'success' }], total_count: 1 };
  const statuses = { statuses: [] };
  return result(code, checks, statuses) === 'ok' &&
    result(code, { check_runs: [], total_count: 0 }, statuses) === 'ok' &&
    result(code, { check_runs: [], total_count: 2 }, statuses) === 'rejected' &&
    result(code, { check_runs: [], total_count: undefined }, statuses) === 'rejected' &&
    result(code, { total_count: 0 }, statuses) === 'rejected' &&
    result(code, {}, statuses) === 'rejected' &&
    result(code, checks, {}) === 'rejected';
}

assert.equal(verifies(guard), true, 'actual guard must reject incomplete API responses');
const mutations = [
  guard.replace('!Array.isArray(checks.check_runs)||', 'false||'),
  guard.replace('checks.total_count!==checks.check_runs.length', 'false'),
  guard.replace('if(!Array.isArray(statuses.statuses))', 'if(false)')
];
assert.equal(new Set(mutations).size, 3, 'mutations must be distinct');
for (const [index, mutant] of mutations.entries()) {
  assert.notEqual(mutant, guard, 'mutation ' + (index + 1) + ' must change code');
  assert.equal(verifies(mutant), false, 'mutation ' + (index + 1) + ' escaped');
}
console.log('PASS: incomplete check runs rejected; 3 mutations caught');
