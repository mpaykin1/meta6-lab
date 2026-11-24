// Permanent trap (OSHIBKI 2026112402): МГЛ site grew to 1.95 GB (429 lab previews) and every Pages deploy failed.
// build-site.sh must skip stale previews (age + LINKS exception) and refuse a site above the size cap.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

export function validateBuildSite(src) {
  const errors = [];
  if (!/PREVIEW_MAX_AGE_DAYS/.test(src) || !/git log -1 --format=%ct/.test(src)) errors.push('no stale-preview age filter');
  if (!/grep -q "\/preview\/\$safe\/" LINKS\.txt/.test(src)) errors.push('linked previews not kept');
  if (!/skip stale preview[^\n]*\n\s*fi/.test(src) && !/skip stale preview[^\n]*continue/.test(src)) errors.push('stale preview not skipped');
  if (!/SITE_MAX_MB/.test(src) || !/exit 1; fi/.test(src.slice(src.indexOf('SITE_MAX_MB')))) errors.push('no site size cap');
  return errors;
}
const src = readFileSync(new URL('./build-site.sh', import.meta.url), 'utf8');
assert.deepEqual(validateBuildSite(src), [], 'build-site.sh: ' + validateBuildSite(src).join(', '));
const mutants = [
  ['age filter removed', src.replace(/PREVIEW_MAX_AGE_DAYS/g, 'X')],
  ['links exception removed', src.replace(/ && ! grep -q "\/preview\/\$safe\/" LINKS\.txt 2>\/dev\/null/, '')],
  ['skip removed', src.replace(/echo "skip stale preview[^\n]*continue/, 'true')],
  ['size cap removed', src.replace(/SITE_MAX_MB/g, 'Y')]
];
for (const [label, m] of mutants) {
  assert.ok(validateBuildSite(m).length, 'uncaught mutation: ' + label);
  console.log('SITE_SIZE_MUTATION_CAUGHT ' + label);
}
console.log('SITE_SIZE_PASS');
