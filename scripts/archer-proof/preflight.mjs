// Preflight: required proof must exist, optional game modules are checked when present.
import {spawnSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(process.argv[2] || resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const required = ['scripts/archer-proof/archer.mjs'];
const optional = ['games/archer-in-the-fog/src/goal-target.js',
  'games/archer-in-the-fog/src/arc2_module.js'];

function checked(relative) {
  const source = resolve(root, relative);
  if (!existsSync(source) || !statSync(source).isFile()) throw Error('Missing required source: ' + relative);
  const result = spawnSync(process.execPath, ['--check', source], {encoding: 'utf8'});
  if (result.status !== 0) throw Error('Syntax invalid: ' + relative + '\n' + result.stderr);
}
try {
  for (const rel of required) checked(rel);
  for (const rel of optional) if (existsSync(resolve(root, rel))) checked(rel);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
