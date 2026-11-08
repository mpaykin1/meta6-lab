#!/usr/bin/env node
// Read-only static audit. A link is necessary evidence, never runtime proof.
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname, extname, relative, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const index = JSON.parse(await readFile(resolve(root, 'shared/index.json'), 'utf8'));
const failures = [];
const rows = [];
const safe = p => p === root || (p.startsWith(root + sep) && !relative(root, p).startsWith('..'));
const read = async p => { try { return await readFile(p, 'utf8'); } catch { return null; } };
const gameRoots = game => [resolve(root, 'games', game), resolve(root, game)];
async function linkedFromHtml(htmlPath, expected) {
  const seen = new Set();
  const queue = [htmlPath];
  let files = 0;
  while (queue.length && files < 300) {
    const path = queue.shift();
    if (!safe(path) || seen.has(path)) continue;
    seen.add(path);
    const source = await read(path);
    if (source === null) continue;
    files++;
    if (source.includes(expected)) return { linked: true, files };
    // Follow only statically declared local script/import dependencies.
    const deps = [
      ...source.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi),
      ...source.matchAll(/\b(?:import|export)\s+(?:[^;]*?\s+from\s*)?["']([^"']+)["']/g),
      ...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)
    ];
    for (const match of deps) {
      const ref = match[1].split(/[?#]/)[0];
      if (!ref || /^(?:https?:|data:|\/\/)/i.test(ref)) continue;
      const next = resolve(dirname(path), ref);
      if (safe(next) && ['.js', '.mjs', '.html'].includes(extname(next))) queue.push(next);
    }
  }
  return { linked: false, files, truncated: queue.length > 0 };
}
for (const component of index.components ?? []) {
  const { id, entry } = component;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || !/^[\w.-]+\.m?js$/.test(entry)) {
    failures.push(`invalid component id/entry: ${id}`);
    continue;
  }
  try { await access(resolve(root, 'shared/components', id, entry)); }
  catch { failures.push(`missing component entry: ${id}/${entry}`); }
  for (const game of component.used_by ?? []) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(game)) {
      failures.push(`invalid game identifier: ${game}`);
      continue;
    }
    const expected = `shared/components/${id}/${entry}`;
    const candidates = gameRoots(game).map(p => resolve(p, 'index.html'));
    const htmlPath = (await Promise.all(candidates.map(read))).findIndex(v => v !== null);
    if (htmlPath < 0) {
      rows.push({ component: id, game, status: 'inconclusive', reason: 'game HTML not present in either known location' });
      continue;
    }
    const evidence = await linkedFromHtml(candidates[htmlPath], expected);
    const status = evidence.linked ? 'static-link-found' : 'inconclusive';
    rows.push({ component: id, game, status, ...evidence });
    // Missing a static link is not evidence of no runtime use: dynamic imports exist.
  }
}
console.log(JSON.stringify({ audited: rows.length, rows, failures }, null, 2));
if (failures.length) process.exitCode = 1;
