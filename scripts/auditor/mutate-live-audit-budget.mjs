import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../../.github/workflows/auditor.yml', import.meta.url), 'utf8');
function verify(text) {
  const tests = text.indexOf('run: node scripts/auditor/mutate-auditor.mjs');
  const live = text.indexOf('- name: Audit five agent cycles');
  assert(tests >= 0 && tests < live, 'every PR must execute the complete integration mutation suite');
  assert(text.includes('node scripts/auditor/check-append-only.mjs'), 'append-only gate is mandatory');
  const block = text.slice(live, text.indexOf('          script: |', live));
  assert(block.includes("if: github.event_name != 'pull_request'"), 'PR must not rescan live repository');
  const testBlock = text.slice(text.lastIndexOf('- name:', tests), live);
  assert(!testBlock.includes('if:'), 'integration tests must run unconditionally');
}
verify(workflow);
for (const [name, broken] of [
  ['live API storm returns', workflow.replace("if: github.event_name != 'pull_request'", 'if: always()')],
  ['mutation suite removed', workflow.replace('run: node scripts/auditor/mutate-auditor.mjs', 'run: echo success')],
  ['deception tests skipped on PR', workflow.replace('      - name: Verify three auditor mutation traps',
    "      - name: Verify three auditor mutation traps\n        if: github.event_name != 'pull_request'")]
]) {
  assert.throws(() => verify(broken), undefined, 'escaped mutant: ' + name);
  console.log('CAUGHT broken version:', name);
}
console.log('PASS fixed version: full PR tests, live scheduled audit, zero PR reporting API calls');
