// Contract for reusable rule-13 recipe; validates the source and gates, not a fake game PASS.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const recipePath = fileURLToPath(new URL('../../rules/09-platforma/RECEPTY/13.md', import.meta.url));

export function verifyRecipe(recipe) {
  const required = [
    /bot-observer\.js/,
    /90d83a77049e8edb7aab847ecbbf4e9723a3c2e5/,
    /ZANYATO\.md/,
    /было N → осталось N, потеряно 0/,
    /героя и цели — \*\*реальные x, y, z\*\*/,
    /до победы не должна быть `null`/,
    /state\(\)\` не меняет игровое состояние/,
    /метода движения героя\*\*/,
    /Object\.freeze/,
    /Object\.defineProperty/,
    /writable:false/,
    /configurable:false/,
    /побайтно/,
    /verify-\*\.mjs/,
    /mutate-\*\.mjs/,
    /включая \*\*обман\*\*/,
    /GitHub Actions/,
    /390×844/,
    /FPS p95/,
    /без самостоятельного merge/,
    /не отмечать правило «сделано»/
  ];
  for (const re of required) assert.match(recipe, re, 'rule 13 recipe contract: ' + re.source);
  assert.ok(recipe.includes('PR #272'), 'source PR must be traceable');
  assert.ok(recipe.includes('PR #200'), 'original adapter precedent must be traceable');
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === recipePath.replace(/rules\/09-platforma\/RECEPTY\/13\.md$/, 'scripts/uluchshatel/verify-recipe-13.mjs')) {
  verifyRecipe(readFileSync(recipePath, 'utf8'));
  console.log('VERIFY recipe 13: origin, safety, real state and green-run gates');
}
