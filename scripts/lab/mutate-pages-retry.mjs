// Ловушка (OSHIBKI 2026112403): deploy-pages падал «No artifacts named github-pages» сразу после загрузки.
// lab-pages.yml обязан повторять публикацию после паузы, иначе МГЛ снова застрянет.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
export function validate(src) {
  const e = [];
  if (!/id: deployment\n\s+continue-on-error: true\n\s+uses: actions\/deploy-pages/.test(src)) e.push('first deploy not tolerant');
  if (!/if: steps\.deployment\.outcome == 'failure'\n\s+run: sleep \d+/.test(src)) e.push('no pause before retry');
  if (!/id: deployment_retry\n\s+if: steps\.deployment\.outcome == 'failure'\n\s+uses: actions\/deploy-pages/.test(src)) e.push('no retry deploy');
  return e;
}
const src = readFileSync(new URL('../../.github/workflows/lab-pages.yml', import.meta.url), 'utf8');
assert.deepEqual(validate(src), []);
for (const [l, m] of [['no continue', src.replace('continue-on-error: true\n', '')], ['no sleep', src.replace(/run: sleep \d+/, 'run: true')], ['no retry', src.replace('id: deployment_retry', 'id: x')]]) {
  assert.ok(validate(m).length, 'uncaught ' + l); console.log('PAGES_RETRY_MUTATION_CAUGHT ' + l);
}
console.log('PAGES_RETRY_PASS');
