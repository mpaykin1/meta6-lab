// An accepted reference cannot be edited, and new reference packs must be isolated.
// Mutations run in memory; protected scripts/storozha/core.mjs is never modified.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../storozha/core.mjs', import.meta.url), 'utf8');
const production = await import(new URL('../storozha/core.mjs', import.meta.url));
const entry = (filename, status) => ({filename, status});
const messages = (mod, files, existing = []) => mod.referenceGate(files, existing).join('\n');

function verify(mod) {
  assert.equal(messages(mod, [
    entry('reference/fresh/character.glb', 'added'),
    entry('reference/fresh/textures/skin.png', 'added')
  ], ['reference/other/model.glb']), '', 'One new reference folder is permitted');
  assert.match(messages(mod, [entry('reference/old/model.glb', 'modified')],
    ['reference/old/model.glb']), /существующий эталон/, 'Existing reference may not change');
  assert.match(messages(mod, [entry('reference/fresh/mesh.glb', 'added'),
    entry('games/unrelated/index.html', 'modified')]), /PR должен только добавлять файлы/,
    'New reference must not piggyback other changes');
  assert.match(messages(mod, [entry('reference/old/new.glb', 'added')],
    ['reference/old/index.html']), /папка эталона уже существует/,
    'Added files in an existing reference folder are not a new reference');
  assert.match(messages(mod, [entry('reference/a/one.glb', 'added'),
    entry('reference/b/two.glb', 'added')]), /ровно одна новая папка/,
    'New reference must occupy exactly one folder');
  assert.match(messages(mod, [entry('.github/workflows/meta-games-guard.yml', 'modified')]),
    /только Claude/, 'Core workflow is protected');
  assert.match(messages(mod, [entry('scripts/storozha/core.mjs', 'modified')]),
    /только Claude/, 'Existing watcher is protected');
  assert.match(messages(mod, [entry('scripts/lab/tests/helper.ts', 'modified')]),
    /только Claude/, 'Nested tests are protected');
  assert.equal(messages(mod, [entry('.github/workflows/auditor.yml', 'modified')]), '',
    'Ordinary workflow edits follow the accepted main policy');
  assert.match(messages(mod, [entry('.github/workflows/auditor.yml', 'removed')]),
    /только Claude/, 'Deleting an ordinary workflow remains forbidden');
  assert.match(messages(mod, [entry('.github/workflows/auditor.yml', 'renamed')]),
    /только Claude/, 'Renaming an ordinary workflow remains forbidden');
  assert.equal(messages(mod, [{...entry('scripts/lab/tests/helper.ts', 'modified'), deletions: 0}]), '',
    'Appending to an existing test is allowed by the accepted main policy');
  assert.match(messages(mod, [{...entry('scripts/lab/tests/helper.ts', 'modified'), deletions: 1}]),
    /только Claude/, 'Removing even one existing assertion remains forbidden');
  assert.equal(messages(mod, [entry('scripts/lovushki/new-guard.mjs', 'added')]), '',
    'Adding a separate new guard is allowed');
}

verify(production);
const mutations = [
  ['ignore-core-workflow', 'const coreWorkflow = CORE_WORKFLOW.test(p);', 'const coreWorkflow = false;'],
  ['allow-reference-edit', "if (status !== 'added') errors.push", "if (false) errors.push"],
  ['mixed-reference-pr', "if (files.length !== additions.length) errors.push", "if (false) errors.push"],
  ['allow-existing-reference-folder', "if (paths.some(p => p === folder || p.startsWith(folder + '/'))) {", "if (false) {"],
  ['multiple-reference-folders', 'if (folders.size !== 1 || additions.some', 'if (false && additions.some'],
  ['ignore-workflow-changes', '/^\\.github\\/workflows\\//.test(p)', '/^\\.github\\/missing-workflows\\//.test(p)'],
  ['ignore-protected-script', 'const protectedScript = /^scripts\\/', 'const protectedScript = /^not-scripts\\/'],
  ['ignore-nested-tests', '/(?:^|\\/)(?:__tests?__|tests?|specs?)\\//i.test(p)', '/^IMPOSSIBLE_NESTED_TEST_PATH/i.test(p)']
];
for (const [name, needle, replacement] of mutations) {
  assert.equal(source.split(needle).length - 1, 1, 'Mutation target must occur once: ' + name);
  const mutatedSource = source.replace(needle, replacement);
  const url = 'data:text/javascript;base64,' + Buffer.from(mutatedSource).toString('base64');
  const mutated = await import(url);
  assert.throws(() => verify(mutated), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('STOROZHA_REFERENCE_BOUNDARY_MUTATIONS_PASS ' + mutations.length + '/' + mutations.length);
