import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const original = readFileSync(resolve(here, 'quota.mjs'), 'utf8');
const mutation = [
  ['ignore-api-quota', 'return snapshotPresent &&', 'return false && snapshotPresent &&'],
  ['claim-snapshot-when-missing', 'return snapshotPresent &&', 'return true &&'],
  ['mask-all-403-permission-errors', 'rate limit exceeded', '403|rate limit exceeded'],
];
const d = mkdtempSync(join(tmpdir(), 'dispatcher-quota-'));
let failures = 0;
for (const [name, from, to] of mutation) {
  if (!original.includes(from)) { console.error('MUTATION_MISSING', name); failures++; continue; }
  const f = join(d, 'quota.mjs');
  writeFileSync(f, original.replace(from, to));
  const p = spawnSync(process.execPath, ['--test', resolve(here, 'test/quota.test.mjs')],
    {env: {...process.env, DISPATCHER_QUOTA_MODULE: f}, encoding: 'utf8'});
  if (p.status === 0) { console.error('MUTATION_SURVIVED', name); failures++; }
  else console.log('caught', name);
}
console.log(failures ? 'DISPATCHER_MUTATE_FAIL '+failures : 'DISPATCHER_MUTATE_OK 3/3');
process.exit(failures ? 1 : 0);
