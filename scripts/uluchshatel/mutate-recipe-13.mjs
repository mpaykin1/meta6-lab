// K5: the recipe must reject loss of source, read-only invariant and dishonest acceptance.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verifyRecipe } from './verify-recipe-13.mjs';

const recipe = readFileSync(
  fileURLToPath(new URL('../../rules/09-platforma/RECEPTY/13.md', import.meta.url)),
  'utf8'
);
verifyRecipe(recipe);
const mutations = [
  ['remove source provenance', '90d83a77049e8edb7aab847ecbbf4e9723a3c2e5', 'unknown'],
  ['remove read-only behavior', 'state()` не меняет игровое состояние', 'state()` меняет игровое состояние'],
  ['false PASS bypass (deception)', 'не отмечать правило «сделано»', 'отмечать правило «сделано»']
];
for (const [label, before, after] of mutations) {
  assert.ok(recipe.includes(before), 'mutant anchor not found: ' + label);
  const changed = recipe.replace(before, after);
  assert.notEqual(changed, recipe);
  assert.throws(() => verifyRecipe(changed), undefined, 'recipe mutant survived: ' + label);
  console.log('TRAPPED: ' + label);
}
console.log('MUTATE recipe 13: 3/3');
