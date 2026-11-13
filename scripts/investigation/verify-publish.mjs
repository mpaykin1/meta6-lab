// Offline facts-only snapshot publisher verification. Accept alternate module for mutation testing.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const target = resolve(process.argv[2] || new URL('./publish.mjs', import.meta.url).pathname);
const {publicationDecision: decide, publicationFacts} = await import(pathToFileURL(target).href);
let failed = 0;
const ok = (name, cond) => { if (!cond) { failed++; console.error('FAIL', name); } };
const now = Date.parse('2026-11-13T12:00:00Z');
const old = {generated_at: '2026-11-13T10:00:00Z', warnings: [], readiness: {done: 7}};
const fresh = {...old, generated_at: '2026-11-13T12:00:00Z'};
ok('first snapshot is published', decide(null, fresh, now) === 'publish');
ok('same facts but different timestamps must not publish', decide(old, fresh, now) === 'unchanged');
ok('different facts after an hour publish', decide(old,
  {...fresh, readiness: {done: 8}}, now) === 'publish');
ok('facts changed during the last hour must not publish', decide({...old, generated_at: '2026-11-13T11:30:00Z'},
  {...fresh, readiness: {done: 8}}, now) === 'throttled');
ok('API 403 must retain known snapshot, not publish guesses', decide(old,
  {...fresh, readiness: {done: 0}, warnings: ['API недоступен: /pulls (403)']}, now) ===
  'retain-incomplete');
ok('volatile metadata is not a fact',
  JSON.stringify(publicationFacts(old)) === JSON.stringify(publicationFacts(fresh)));
console.log(failed ? 'INVESTIGATION_PUBLISH_FAIL ' + failed : 'INVESTIGATION_PUBLISH_OK');
process.exit(failed ? 1 : 0);
