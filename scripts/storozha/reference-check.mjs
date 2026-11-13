// Trusted-main PR guard. Never executes the PR's code.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {referenceGate, reconcileSection} from './core.mjs';

const repo = process.env.STOROZHA_REPO;
const token = process.env.STOROZHA_TOKEN;
const number = Number(process.env.STOROZHA_PR_NUMBER);
if (repo !== 'mpaykin1/meta6-lab' || !token || !Number.isInteger(number) || number < 1) {
  throw Error('Only trusted meta6-lab PRs are writable');
}
const root = 'https://api.github.com/repos/' + repo;
const headers = {Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'};
async function api(path, method = 'GET', body) {
  const r = await fetch(root + path, {method, headers,
    ...(body === undefined ? {} : {body: JSON.stringify(body)})});
  const raw = await r.text();
  let out;
  try { out = raw ? JSON.parse(raw) : {}; } catch (error) { throw Error('Bad JSON: ' + path); }
  if (!r.ok) throw Error(method + ' ' + path + ' HTTP ' + r.status + ' ' + out.message);
  return out;
}
async function prFiles() {
  const files = [];
  for (let page = 1; page <= 10; page++) {
    const chunk = await api('/pulls/' + number + '/files?per_page=100&page=' + page);
    files.push(...chunk);
    if (chunk.length < 100) return files;
  }
  throw Error('Too many PR files — cannot verify reference safety');
}
const pr = await api('/pulls/' + number);
if (pr.base.ref !== 'main') throw Error('PR must target main');
const files = await prFiles();
// The checkout is trusted main; only read old tree metadata.
const stdout = execFileSync('git', ['ls-tree', '-r', '--name-only',
  pr.base.sha, 'reference/'], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
const existing = stdout.trim() ? stdout.trim().split('\n') : [];
const protectedPaths = readFileSync('.github/protected/paths.txt', 'utf8').split(/\r?\n/)
  .map(line => line.trim()).filter(line => line && !line.startsWith('#'));
const errors = pr.state === 'closed' ? [] : referenceGate(files, existing, protectedPaths);
const row = '| #' + number + ' | ' + pr.head.ref + ' | ' +
  errors.join('; ').replace(/[\r\n|]/g, ' ') + ' | ' +
  new Date().toISOString().slice(0, 10) + ' |';
if (process.env.STOROZHA_READ_ONLY !== '1') {
for (let attempt = 0; attempt < 7; attempt++) {
  let current;
  try { current = await api('/contents/DLYA_CLAUDE.md'); }
  catch (error) {
    if (!/HTTP 404/.test(String(error))) throw error;
    current = null;
  }
  const before = current ? Buffer.from(current.content, 'base64').toString('utf8') :
    '# Для Claude — только подтверждённые блокировки\n';
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
  const after = reconcileSection(before, 'PROTECTED', entries);
  if (before === after) break;
  try {
    await api('/contents/DLYA_CLAUDE.md', 'PUT', {
      branch: 'main',message: 'chore(storozha): PR #' + number + ' protected paths',
      content: Buffer.from(after).toString('base64'), ...(current ? {sha: current.sha} : {})
    });
    break;
  } catch (error) {
    if (attempt === 6 || !/HTTP (409|422)/.test(String(error))) throw error;
  }
}
}
if (errors.length) {
  errors.forEach(error => console.error('::error title=Нужен Claude::' + error));
  process.exitCode = 1;
} else {
  console.log('STOROZHA_REFERENCE_PASS #' + number);
}
