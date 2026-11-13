// Do not let a newer harmless PR diff turn an older unsafe commit green.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const url = new URL('../storozha/reference-head.mjs', import.meta.url);
const source = readFileSync(url, 'utf8');
const production = await import(url);

function verify(mod) {
  for (const [old, current] of [['a', 'b'], ['c', 'd']]) {
    mod.verifyReferenceHead({head: {sha: old.repeat(40)}}, old.repeat(40));
    assert.throws(() => mod.verifyReferenceHead({head: {sha: current.repeat(40)}}, old.repeat(40)),
      /PR HEAD differs/);
  }
  for (const value of ['', undefined, 'z'.repeat(40), 'a'.repeat(39)]) {
    assert.throws(() => mod.verifyReferenceHead({head: {sha: value}}, value), /missing or invalid/);
  }
  assert.throws(() => mod.verifyReferenceHead({}, 'a'.repeat(40)), /missing or invalid/);
}
verify(production);
const mutants = [
  ['accept-different-head', 'if (snapshotHead !== checkoutHead)', 'if (false)'],
  ['accept-unknown-head', 'if (!valid(snapshotHead) || !valid(checkoutHead))', 'if (false)'],
  ['one-sha-cheat', 'if (snapshotHead !== checkoutHead)',
    "if (snapshotHead !== checkoutHead && checkoutHead !== 'a'.repeat(40))"]
];
for (const [name, anchor, replacement] of mutants) {
  assert.equal(source.split(anchor).length, 2, 'Unique mutation anchor: ' + name);
  const module = await import('data:text/javascript;base64,' +
    Buffer.from(source.replace(anchor, replacement)).toString('base64'));
  assert.throws(() => verify(module), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('REFERENCE_HEAD_MUTATIONS_PASS 3/3');
