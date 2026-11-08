#!/usr/bin/env node
// Independent, read-only audit of shared component consumers. Does not change scoring.
import { readFile, access } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const index = JSON.parse(await readFile(resolve(root, 'shared/index.json'), 'utf8'));
const failures = [];
const rows = [];
for (const component of index.components ?? []) {
  const id = component.id;
  const entry = component.entry;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || !/^[\w.-]+\.m?js$/.test(entry)) {
    failures.push(`invalid component id/entry: ${id}`);
    continue;
  }
  const source = resolve(root, 'shared/components', id, entry);
  try { await access(source); } catch { failures.push(`missing component entry: ${id}/${entry}`); }
  for (const game of component.used_by ?? []) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(game)) {
      failures.push(`invalid game identifier: ${game}`);
      continue;
    }
    const htmlPath = resolve(root, 'games', game, 'index.html');
    let html;
    try { html = await readFile(htmlPath, 'utf8'); }
    catch { failures.push(`missing game HTML for ${id}: ${game}`); continue; }
    // Presence of a script/import is necessary, but NOT proof of runtime use.
    const expected = `shared/components/${id}/${entry}`;
    const linked = html.includes(expected);
    rows.push({ component: id, game, linked, expected });
    if (!linked) failures.push(`unlinked used_by: ${id} -> ${game} (expected ${expected})`);
  }
}
console.log(JSON.stringify({ audited: rows.length, rows, failures }, null, 2));
if (failures.length) process.exitCode = 1;
