import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const original = readFileSync(resolve(here, 'publish.mjs'), 'utf8');
const mutations = [
  ['hourly-throttle-removed',
    'if (previous && now - Date.parse(previous.generated_at) < 3600_000) {',
    'if (false) {'],
  ['false-pass-after-API-403',
    "if ((next.warnings || []).some(note => /API недоступен/.test(note))) {",
    'if (false) {'],
  ['time-change-misreported-as-fact',
    'JSON.stringify(publicationFacts(previous)) === JSON.stringify(publicationFacts(next))',
    'JSON.stringify(previous) === JSON.stringify(next)']
];
const temp = mkdtempSync(join(tmpdir(), 'investigation-publish-'));
let failures = 0;
for (const [name, before, after] of mutations) {
  if (!original.includes(before)) { console.error('MUTATION_MISSING', name); failures++; continue; }
  const file = join(temp, 'publish.mjs');
  writeFileSync(file, original.replace(before, after));
  const result = spawnSync(process.execPath, [resolve(here, 'verify-publish.mjs'), file],
    {encoding: 'utf8'});
  if (result.status === 0) { console.error('MUTATION_SURVIVED', name); failures++; }
  else console.log('caught', name);
}
console.log(failures ? 'INVESTIGATION_MUTATE_FAIL '+failures : 'INVESTIGATION_MUTATE_OK 3/3');
process.exit(failures ? 1 : 0);
