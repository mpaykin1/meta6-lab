#!/usr/bin/env node
// Read-only static audit. An import/link is not proof of runtime use.
import { readFile, access, realpath } from 'node:fs/promises';
import { resolve, dirname, extname, relative, isAbsolute, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const realRoot = await realpath(root);
const index = JSON.parse(await readFile(resolve(root, 'shared/index.json'), 'utf8'));
const failures = [];
const rows = [];
const inside = (base, path) => {
  const rel = relative(base, path);
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel));
};
const fileAt = async path => {
  if (!inside(root, path)) return null;
  try {
    const actual = await realpath(path);
    if (!inside(realRoot, actual)) return null; // Reject symlinks outside the repo.
    return { path: actual, source: await readFile(actual, 'utf8') };
  } catch { return null; }
};
const gameRoots = game => [resolve(root, 'games', game), resolve(root, game)];

// Preserve offsets of JS code while hiding comments and string/template literals.
// This prevents a fake import in a comment or text string becoming evidence.
function codeMask(source) {
  const out = [...source];
  const hide = at => { if (out[at] !== '\n' && out[at] !== '\r') out[at] = ' '; };
  let i = 0;
  while (i < source.length) {
    const a = source[i], b = source[i + 1];
    if (a === '/' && b === '/') {
      hide(i++); hide(i++);
      while (i < source.length && source[i] !== '\n') hide(i++);
    } else if (a === '/' && b === '*') {
      hide(i++); hide(i++);
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) hide(i++);
      if (i < source.length) { hide(i++); hide(i++); }
    } else if (a === '"' || a === "'" || a === String.fromCharCode(96)) {
      const quote = a;
      hide(i++);
      while (i < source.length) {
        if (source[i] === '\\') { hide(i++); if (i < source.length) hide(i++); continue; }
        if (source[i] === quote) { hide(i++); break; }
        hide(i++);
      }
    } else i++;
  }
  return out.join('');
}
function jsRefs(source) {
  const mask = codeMask(source);
  const refs = [];
  for (const token of mask.matchAll(/\b(?:import|export)\b/g)) {
    const pos = token.index;
    const word = token[0];
    const tail = source.slice(pos, pos + 512);
    if (word === 'import') {
      // Side-effect imports and literal dynamic imports.
      const direct = tail.match(/^import\s*(?:\(\s*(['"])([^'"\\\r\n]+)\1\s*\)|(['"])([^'"\\\r\n]+)\3)/);
      if (direct) { refs.push(direct[2] || direct[4]); continue; }
      if (/^import\s*\./.test(tail)) continue; // import.meta is not a dependency.
    }
    // Re-exports and named/default imports: only a visible from token.
    const rest = mask.slice(pos + word.length, pos + 512);
    const from = /\bfrom\b/g.exec(rest);
    const semi = rest.indexOf(';');
    if (!from || (semi >= 0 && semi < from.index)) continue;
    const after = source.slice(pos + word.length + from.index + 4);
    const match = after.match(/^\s*(['"])([^'"\\\r\n]+)\1/);
    if (match) refs.push(match[2]);
  }
  return refs;
}
function htmlRefs(source) {
  const html = source.replace(/<!--[\s\S]*?-->/g, '').replace(/<template\b[^>]*>[\s\S]*?<\/template\s*>/gi, '');
  const refs = [];
  for (const tag of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attrs = tag[1];
    const src = attrs.match(/(?:^|\s)src\s*=\s*(['"])(.*?)\1/i);
    if (src) { refs.push(src[2]); continue; }
    const type = attrs.match(/(?:^|\s)type\s*=\s*(['"])(.*?)\1/i)?.[2]?.toLowerCase();
    if (!type || type === 'module' || /^(?:application|text)\/(?:java|ecma)script$/.test(type)) {
      refs.push(...jsRefs(tag[2]));
    }
  }
  return refs;
}
function localRef(from, ref) {
  if (!ref || /^(?:https?:|data:|blob:|\/\/|#)/i.test(ref) || ref.includes('\\')) return null;
  const clean = ref.split(/[?#]/)[0];
  // Bare specifiers, browser CDN URLs and encoded traversal are inconclusive.
  if (!clean || /%[0-9a-f]{2}/i.test(clean)) return null;
  if (clean.startsWith('/')) return resolve(root, '.' + clean);
  if (!clean.startsWith('./') && !clean.startsWith('../')) return null;
  return resolve(dirname(from), clean);
}
async function linkedFromHtml(htmlPath, expected) {
  const entry = await fileAt(expected);
  if (!entry) return { linked: false, files: 0, reason: 'component entry not readable or outside repository' };
  const seen = new Set();
  const queue = [htmlPath];
  let files = 0;
  while (queue.length && files < 300) {
    const next = queue.shift();
    const file = await fileAt(next);
    if (!file || seen.has(file.path)) continue;
    seen.add(file.path);
    files++;
    const deps = extname(file.path) === '.html' ? htmlRefs(file.source) : jsRefs(file.source);
    for (const ref of deps) {
      const target = localRef(next, ref);
      if (!target || !['.js', '.mjs', '.html'].includes(extname(target))) continue;
      const resolved = await fileAt(target);
      if (!resolved) continue;
      if (resolved.path === entry.path) return { linked: true, files };
      if (['.js', '.mjs', '.html'].includes(extname(resolved.path)) && !seen.has(resolved.path)) queue.push(target);
    }
  }
  return { linked: false, files, truncated: queue.length > 0 };
}
for (const component of index.components ?? []) {
  const { id, entry } = component;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || !/^[\w.-]+\.m?js$/.test(entry)) {
    failures.push('invalid component id/entry: ' + id);
    continue;
  }
  const entryPath = resolve(root, 'shared/components', id, entry);
  try {
    await access(entryPath);
    if (!await fileAt(entryPath)) failures.push('unsafe component entry: ' + id + '/' + entry);
  } catch { failures.push('missing component entry: ' + id + '/' + entry); }
  for (const game of component.used_by ?? []) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(game)) {
      failures.push('invalid game identifier: ' + game);
      continue;
    }
    const candidates = gameRoots(game).map(p => resolve(p, 'index.html'));
    const present = await Promise.all(candidates.map(fileAt));
    const htmlPath = present.findIndex(Boolean);
    if (htmlPath < 0) {
      rows.push({ component: id, game, status: 'inconclusive', reason: 'game HTML not present in either known location' });
      continue;
    }
    const evidence = await linkedFromHtml(candidates[htmlPath], entryPath);
    rows.push({ component: id, game, status: evidence.linked ? 'static-link-found' : 'inconclusive', ...evidence });
    // No static reference is not proof of no runtime use (generated imports exist).
  }
}
console.log(JSON.stringify({ audited: rows.length, rows, failures }, null, 2));
if (failures.length) process.exitCode = 1;
