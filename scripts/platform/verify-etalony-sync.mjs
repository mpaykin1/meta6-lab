#!/usr/bin/env node
// Compare every OWNER PASS reference in MG AGENTS.md against LAB by Git blob SHA.
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

function option(name) {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  if (!process.argv[index + 1] || process.argv[index + 1].startsWith('--')) {
    throw new Error('Missing value for ' + name);
  }
  return process.argv[index + 1];
}
const mgRoot = option('--mg-root') ? path.resolve(option('--mg-root')) : null;
const labRoot = path.resolve(option('--lab-root') || process.cwd());
function blobSha(data) {
  return createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
}
function ownerPassNames(agents) {
  const regex = /^Эталон \*\*[^*]+\*\* \(OWNER PASS [^)]+\):\s*\x60reference\/([a-z0-9-]+)\/\x60/gm;
  const names = [...agents.matchAll(regex)].map((match) => match[1]);
  if (!names.length || new Set(names).size !== names.length) {
    throw new Error('MG AGENTS.md: no OWNER PASS references or duplicate entries');
  }
  return names;
}
async function localFiles(root, folder) {
  const files = new Map();
  for (const item of await readdir(path.join(root, folder), { withFileTypes: true })) {
    const file = path.posix.join(folder, item.name);
    if (item.isDirectory()) {
      for (const [name, sha] of await localFiles(root, file)) files.set(name, sha);
    } else if (item.isFile()) {
      files.set(file, blobSha(await readFile(path.join(root, file))));
    } else {
      throw new Error('Unsupported local entry: ' + file);
    }
  }
  return files;
}
async function githubJson(url) {
  const headers = { 'User-Agent': 'meta-games-owner-pass-sync', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('GitHub API HTTP ' + response.status + ': ' + url);
  return response.json();
}
async function remoteSource() {
  const api = 'https://api.github.com/repos/mpaykin1/meta6';
  const ref = await githubJson(api + '/git/ref/heads/main');
  const sha = ref?.object?.sha;
  if (!/^[a-f0-9]{40}$/.test(sha || '')) throw new Error('Invalid MG main SHA');
  const info = await githubJson(api + '/contents/AGENTS.md?ref=' + sha);
  if (info.encoding !== 'base64') throw new Error('MG AGENTS.md is not base64');
  const agents = Buffer.from(info.content, 'base64').toString('utf8');
  async function remoteFiles(folder) {
    const items = await githubJson(api + '/contents/' + folder + '?ref=' + sha);
    if (!Array.isArray(items) || items.length >= 1000) {
      throw new Error('Incomplete GitHub listing: ' + folder);
    }
    const files = new Map();
    for (const item of items) {
      if (!item.path.startsWith(folder + '/')) throw new Error('Unexpected path: ' + item.path);
      if (item.type === 'dir') {
        for (const [name, hash] of await remoteFiles(item.path)) files.set(name, hash);
      } else if (item.type === 'file' && /^[a-f0-9]{40}$/.test(item.sha)) {
        files.set(item.path, item.sha);
      } else {
        throw new Error('Unsupported remote entry: ' + item.path);
      }
    }
    return files;
  }
  return { agents, remoteFiles, sha };
}
async function main() {
  const source = mgRoot
    ? { agents: await readFile(path.join(mgRoot, 'AGENTS.md'), 'utf8'),
        remoteFiles: (folder) => localFiles(mgRoot, folder), sha: 'local' }
    : await remoteSource();
  const names = ownerPassNames(source.agents);
  const errors = [];
  let count = 0;
  for (const name of names) {
    const folder = 'reference/' + name;
    const [expected, actual] = await Promise.all([
      source.remoteFiles(folder),
      localFiles(labRoot, folder).catch((error) => {
        errors.push(folder + ': LAB directory unavailable: ' + error.message);
        return new Map();
      }),
    ]);
    for (const [file, hash] of expected) {
      count += 1;
      if (!actual.has(file)) errors.push(file + ': missing in LAB');
      else if (actual.get(file) !== hash) errors.push(file + ': SHA mismatch');
    }
    for (const file of actual.keys()) {
      if (!expected.has(file)) errors.push(file + ': unexpected file in LAB');
    }
  }
  if (errors.length) throw new Error(errors.length + ' divergence(s):\n' + errors.join('\n'));
  console.log('PASS: ' + names.length + ' references, ' + count + ' identical files; MG ' + source.sha);
}
main().catch((error) => {
  console.error('FAIL verify-etalony-sync: ' + error.message);
  process.exitCode = 1;
});
