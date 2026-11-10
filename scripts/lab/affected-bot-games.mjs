// Supplemental CI selector; the protected META BOT workflow still runs ALL games.
// Git diff and filenames are input data, never shell commands.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(base || '')) {
  throw new Error('Expected an exact base commit SHA');
}
const changed = execFileSync('git', [
  'diff', '--name-only', '-z', '--diff-filter=ACMR',
  base, 'HEAD', '--', 'games/'
], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
  .split('\0').filter(Boolean);

const names = new Set();
for (const file of changed) {
  const match = /^games\/([a-z0-9-]+)\//.exec(file);
  if (!match) continue;
  const dir = `games/${match[1]}`;
  if (fs.existsSync(path.join(dir, 'index.html'))) names.add(dir);
}
const selected = [...names].sort();
const games = selected.join(' ');
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `games=${games}\n`);
}
console.log(`Affected playable games: ${games || '(none)'}`);
console.log('The canonical protected META BOT remains mandatory for every PR.');
