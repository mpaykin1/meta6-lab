// K5: a watchdog must never report a durable queue entry before GitHub acknowledges the write.
// Read-only guard: the protected weekly watchdog source is never modified by this script.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../storozha/weekly-watch.mjs', import.meta.url), 'utf8');
const beginMarker = 'async function updateMain(path, build, message) {';
const endMarker = '\nfunction currentRows(document, key) {';

function verify(script) {
  const begin = script.indexOf(beginMarker);
  const end = script.indexOf(endMarker, begin + beginMarker.length);
  assert.ok(begin >= 0 && end > begin, 'Missing durable updateMain routine');
  // A claim inside a comment must not satisfy a safety invariant (K5 deception mutant).
  const block = script.slice(begin, end).replace(/\/\/[^\n]*/g, '');
  const requirements = [
    'for (let attempt = 0; attempt < 7; attempt++)',
    "if (!/HTTP 404/.test(String(error))) throw error;",
    'const after = build(before);',
    'if (before === after) return;',
    '...(current ? {sha: current.sha} : {})',
    "try { await api('/contents/' + path, 'PUT', payload); return; }",
    'if (attempt === 6 || !/HTTP (409|422)/.test(String(error))) throw error;'
  ];
  let prior = -1;
  for (const step of requirements) {
    const index = block.indexOf(step);
    assert.ok(index > prior, 'Durability gate missing, spoofed or reordered: ' + step);
    prior = index;
  }
  assert.equal(block.split("await api('/contents/' + path, 'PUT', payload)").length - 1, 1,
    'Exactly one acknowledged write must precede success');
}

verify(source);
const mutants = [
  ['unawaited-write',
    "try { await api('/contents/' + path, 'PUT', payload); return; }",
    "try { api('/contents/' + path, 'PUT', payload); return; }"],
  ['missing-sha-lease',
    '...(current ? {sha: current.sha} : {})',
    '...(current ? {} : {})'],
  ['swallow-api-403',
    'if (attempt === 6 || !/HTTP (409|422)/.test(String(error))) throw error;',
    'if (attempt === 6) throw error;'],
  ['no-conflict-retry',
    'for (let attempt = 0; attempt < 7; attempt++)',
    'for (let attempt = 0; attempt < 1; attempt++)'],
  ['comment-spoof',
    "try { await api('/contents/' + path, 'PUT', payload); return; }",
    "try { await Promise.resolve(); /* await api('/contents/' + path, 'PUT', payload) */ return; }"]
];
for (const [name, target, replacement] of mutants) {
  assert.equal(source.split(target).length - 1, 1, 'Ambiguous mutation target: ' + name);
  const broken = source.replace(target, replacement);
  assert.throws(() => verify(broken), assert.AssertionError, 'MUTANT_ESCAPED ' + name);
  console.log('MUTATION_KILLED ' + name);
}
console.log('STOROZHA_DURABLE_WRITE_MUTATIONS_PASS ' + mutants.length + '/' + mutants.length);
