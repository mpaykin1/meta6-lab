import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
const paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const checked = [];
const errors = [];
for (const file of paths) {
  if (!file.startsWith('scripts/repair-bot/') || !/\.(?:mjs|cjs|js)$/.test(file)) continue;
  if (!fs.existsSync(file)) continue;
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  checked.push(file);
  if (result.status !== 0) errors.push(file + ': ' + String(result.stderr).slice(0, 400));
}
if (errors.length) {
  for (const msg of errors) console.log('::error title=JavaScript syntax::' + msg.replace(/\r?\n/g, ' '));
  process.exitCode = 1;
}
console.log('Repair bot JavaScript syntax: ' + checked.length + ' checked, ' + errors.length + ' errors');
