import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const excluded = /(^|\\/)(node_modules|\\.git|dist|build|coverage|vendor)(\\/|$)/;
const tracked = execFileSync('git', ['ls-files', '-z'], {encoding:'utf8'}).split('\\0').filter(Boolean);
let repaired = 0, invalid = 0;
for (const name of tracked) {
  if (!name.endsWith('.json') || excluded.test(name)) continue;
  let original;
  try { original = fs.readFileSync(path.resolve(name), 'utf8'); } catch { continue; }
  try { JSON.parse(original); continue; } catch {}
  let fixed = original.replace(/^\\uFEFF/, '');
  let output = '', quoted = false, escaped = false;
  for (let i = 0; i < fixed.length; i++) {
    const c = fixed[i];
    if (quoted) {
      output += c;
      if (escaped) escaped = false;
      else if (c === '\\\\') escaped = true;
      else if (c === '"') quoted = false;
      continue;
    }
    if (c === '"') { quoted = true; output += c; continue; }
    if (c === ',') {
      let j = i + 1;
      while (j < fixed.length && /\\s/.test(fixed[j])) j++;
      if (fixed[j] === '}' || fixed[j] === ']') continue;
    }
    output += c;
  }
  try {
    JSON.parse(output);
    if (output !== original) { fs.writeFileSync(name, output); repaired++; console.log('REPAIRED ' + name); }
  } catch { invalid++; console.log('UNRESOLVED ' + name); }
}
console.log('Repair bot: repaired=' + repaired + ', unresolved=' + invalid);
if (invalid) process.exitCode = 2;
