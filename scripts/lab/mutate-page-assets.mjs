// Permanent mutation gate for first-party resource availability on published HTML pages.
import { spawnSync } from 'node:child_process';

for (const [program, args] of [
  ['python3', ['scripts/lab/mutate-page-assets.py']],
  ['bash', ['scripts/lab/verify-check-page-assets.sh']],
]) {
  const run = spawnSync(program, args, { stdio: 'inherit', timeout: 60000 });
  if (run.error || run.status !== 0) {
    throw new Error('Page assets trap failed: ' + program + ' ' + args.join(' '));
  }
}
console.log('mutate-page-assets: PASS');
