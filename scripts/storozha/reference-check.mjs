// Trusted-main PR guard. Never executes the PR's code.
import {execFileSync} from 'node:child_process';
import {referenceGate, reconcileSection} from './core.mjs';
import {referenceSnapshot} from './reference-snapshot.mjs';
import {updateReferenceQueue} from './reference-queue.mjs';

const repo = process.env.STOROZHA_REPO;
const token = process.env.STOROZHA_TOKEN;
const number = Number(process.env.STOROZHA_PR_NUMBER);
if (!repo || !token || !Number.isInteger(number) || number < 1) throw Error('Missing PR guard inputs');
const {pr, files} = await referenceSnapshot(repo, token, number);
// The checkout is trusted main; only read old tree metadata.
const stdout = execFileSync('git', ['ls-tree', '-r', '--name-only',
  pr.base.sha, 'reference/'], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
const existing = stdout.trim() ? stdout.trim().split('\n') : [];
const errors = referenceGate(files, existing);
const row = '| #' + number + ' | ' + pr.head.ref + ' | ' +
  errors.join('; ').replace(/[\r\n|]/g, ' ') + ' | ' +
  new Date().toISOString().slice(0, 10) + ' |';
if (process.env.STOROZHA_READ_ONLY !== '1') {
await updateReferenceQueue(repo, token, before => {
  const begin = '<!-- STOROZHA:PROTECTED:BEGIN -->';
  const end = '<!-- STOROZHA:PROTECTED:END -->';
  const a = before.indexOf(begin), b = before.indexOf(end);
  if ((a < 0) !== (b < 0)) throw Error('Malformed PROTECTED section');
  const prior = a < 0 ? [] : before.slice(a + begin.length, b).split('\n')
    .filter(x => /^\|\s*#\d+\s*\|/.test(x));
  const retained = prior.filter(line => !new RegExp('^\\|\\s*#' + number + '\\s*\\|').test(line));
  const entries = retained.map(line => ({
    id: Number((line.match(/#(\d+)/) || [])[1]), text: line
  }));
  if (errors.length) entries.push({id: number, text: row});
  return reconcileSection(before, 'PROTECTED', entries);
});
}
if (errors.length) {
  errors.forEach(error => console.error('::error title=Нужен Claude::' + error));
  process.exitCode = 1;
} else {
  console.log('STOROZHA_REFERENCE_PASS #' + number);
}

