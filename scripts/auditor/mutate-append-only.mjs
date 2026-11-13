import assert from 'node:assert/strict';
import { assertAppendOnly } from './append-only.mjs';

const original = 'import assert from "node:assert";\nassert(check());\n';
assertAppendOnly(original, original + 'assert(extraCheck());\n');
assertAppendOnly(original, original.replaceAll('\n', '\r\n'));
for (const [name, broken] of [
  ['deleted assertion', original.replace('assert(check());\n', '')],
  ['replaced assertion', original.replace('assert(check())', 'assert(true)')],
  ['deception assertion mentioned in comment', original.replace('assert(check());', '// assert(check());')]
]) {
  assert.throws(() => assertAppendOnly(original, broken), /Existing test line/);
  console.log('CAUGHT broken version:', name);
}
console.log('PASS fixed version: original test retained with additive checks; 3/3 mutations caught');
