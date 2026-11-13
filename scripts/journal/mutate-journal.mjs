// Permanent mutation fixtures for split journal entrypoints (K3/K5).
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

function sources() {
  return {
    build: readFileSync(new URL('./build.mjs', import.meta.url), 'utf8'),
    validate: readFileSync(new URL('./validate.mjs', import.meta.url), 'utf8'),
    write: readFileSync(new URL('./write.mjs', import.meta.url), 'utf8')
  };
}
function verify(v) {
  assert.match(v.build, /export function build\(validate\)/, 'Library has explicit build contract');
  assert.doesNotMatch(v.build, /process\.argv/, 'Library must not branch on runner/test arguments');
  assert.match(v.validate, /build\(true\)/, 'Validation entrypoint does not modify journal');
  assert.match(v.write, /build\(false\)/, 'Publish entrypoint builds and writes views');
  assert.match(v.build, /if\(!existsSync\(dir\)\)throw Error/, 'Missing entry source must fail closed');
}
const baseline = sources();
verify(baseline);
const mutations = [
  ['mode deception: argv gates results', 'build', 'export function build(validate){',
    "export function build(validate){ if(process.argv.includes('--test')) return;"],
  ['validation wrongly publishes', 'validate', 'build(true);', 'build(false);'],
  ['writer becomes dry-run', 'write', 'build(false);', 'build(true);'],
  ['missing source journal silently accepted', 'build', "if(!existsSync(dir))throw Error",
    "if(false)throw Error"]
];
for (const [name, file, needle, replacement] of mutations) {
  assert.ok(baseline[file].includes(needle), 'Missing mutation source: ' + name);
  const changed = {...baseline, [file]: baseline[file].replace(needle, replacement)};
  assert.throws(() => verify(changed), assert.AssertionError, 'MUTATION_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('JOURNAL_MUTATION_PASS ' + mutations.length);
