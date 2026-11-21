import { readFileSync } from 'node:fs';
const lock = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const entries = Object.keys(lock.dependencies);
const failures = [];
for (const name of entries) {
  try { console.log('FOUND', name, import.meta.resolve(name)); }
  catch (err) { failures.push(name + ': ' + err.message); }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('JS_DEPENDENCIES_OK', entries.length);
