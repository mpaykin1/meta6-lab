import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyReferences, verifyUpdates} from './verify-resume.mjs';
import * as core from './core.mjs';
import {updateHeads} from './update-heads.mjs';

verifyReferences(core);
await verifyUpdates({updateHeads});
const references = readFileSync(new URL('./core.mjs', import.meta.url), 'utf8');
const updates = readFileSync(new URL('./update-heads.mjs', import.meta.url), 'utf8');
const mutants = [
  ['rename ignored', references, 'if (file.previous_filename &&', 'if (false && file.previous_filename &&',
    verifyReferences],
  ['rename special-case cheat', references, 'if (file.previous_filename &&',
    "if (p !== 'games/moved.html' && file.previous_filename &&", verifyReferences],
  ['registry ignored', references, 'protectedPaths.some(root =>', 'false && protectedPaths.some(root =>',
    verifyReferences],
  ['other guards ignored', references, '/^scripts\\/.*(?:guard|bot)(?:[/._-]|$)/i.test(p)', 'false',
    verifyReferences],
  ['no actual update', updates, "await updateApi('/pulls/'", "await Promise.resolve('/pulls/'", verifyUpdates],
  ['missing head lease', updates, 'expected_head_sha: pr.head.sha', 'expected_head_sha: undefined', verifyUpdates],
  ['conflict update', updates, "if (pr.mergeable_state === 'dirty') continue;", '', verifyUpdates],
  ['repo fence removed', updates, "repo !== 'mpaykin1/meta6-lab'", 'false', verifyUpdates],
  ['hardcoded PR cheat', updates, "'/pulls/' + pr.number + '/update-branch'",
    "'/pulls/31/update-branch'", verifyUpdates],
  ['superseded run approved', updates, "run.head_sha !== fresh.head.sha || ", '', verifyUpdates]
];
for (const [label, source, needle, replacement, verify] of mutants) {
  assert.ok(source.includes(needle), 'Missing mutation anchor: ' + label);
  const changed = source.replace(needle, replacement);
  const candidate = await import('data:text/javascript;base64,' + Buffer.from(changed).toString('base64'));
  let caught = false;
  try { await verify(candidate); } catch (error) {
    if (!(error instanceof assert.AssertionError)) throw error;
    caught = true;
  }
  assert.ok(caught, 'MUTATION_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
}
console.log('STOROZHA_RESUME_MUTATIONS_PASS ' + mutants.length);
