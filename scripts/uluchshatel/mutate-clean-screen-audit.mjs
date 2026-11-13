import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runSuite } from './verify-clean-screen-audit.mjs';

const root = new URL('./clean-screen-audit.mjs', import.meta.url);
const original = await readFile(root, 'utf8');
const mutations = [
  {
    name: 'hide-permanent-caption',
    old: 'if (after.some(frame =>',
    replacement: 'if (false && after.some(frame =>'
  },
  {
    name: 'remove-button-accessibility',
    old: 'if (isButton && !aria) {',
    replacement: 'if (false && isButton && !aria) {'
  },
  {
    name: 'forged-fade-class',
    old: 'if (!textFirstSeen.has(node.id)) textFirstSeen.set(node.id, frame.timeMs);',
    replacement: "if (node.className === 'fade-6s') continue;\n" +
      '      if (!textFirstSeen.has(node.id)) textFirstSeen.set(node.id, frame.timeMs);'
  },
  {
    name: 'allow-text-buttons',
    old: 'if (isButton && text &&',
    replacement: 'if (false && isButton && text &&'
  }
];

const dir = await mkdtemp(join(tmpdir(), 'mg-clean-screen-mutations-'));
try {
  for (let i = 0; i < mutations.length; i++) {
    const mutation = mutations[i];
    assert.ok(original.includes(mutation.old), 'Mutation target missing: ' + mutation.name);
    const changed = original.replace(mutation.old, mutation.replacement);
    assert.notEqual(changed, original, 'Mutation did not change production code');
    const path = join(dir, 'mutant-' + i + '.mjs');
    await writeFile(path, changed);
    const mutated = await import(pathToFileURL(path).href);
    let detected = false;
    try {
      runSuite(mutated.auditCleanScreen);
    } catch (error) {
      if (!(error instanceof assert.AssertionError)) throw error;
      detected = true;
    }
    assert.equal(detected, true, 'Escaped mutation: ' + mutation.name);
    console.log('caught: ' + mutation.name);
  }
} finally {
  await rm(dir, { recursive: true, force: true });
}
console.log('clean-screen mutation gate: ' + mutations.length + '/4 caught');
