// K5: preserve every unrelated Claude queue entry and owner note during STALE updates.
// The protected storozha/core.mjs stays untouched. Five deliberately broken variants must fail.
import assert from 'node:assert/strict';
import {Buffer} from 'node:buffer';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../storozha/core.mjs', import.meta.url), 'utf8');
const production = await import(new URL('../storozha/core.mjs', import.meta.url));

function verify(mod) {
  const begin = '<!-- STOROZHA:STALE:BEGIN -->';
  const end = '<!-- STOROZHA:STALE:END -->';
  const fixture = [
    '# Для Claude', '',
    '<!-- STOROZHA:PROTECTED:BEGIN -->',
    '| #91 | protected |',
    '<!-- STOROZHA:PROTECTED:END -->', '',
    begin, '| #8 | obsolete |', end, '',
    'Owner note: KEEP', ''
  ].join('\n');
  const entries = [
    {id: 11, text: '| #11 | new |'},
    {id: 12, text: '| #12 | superseded |'},
    {id: 12, text: '| #12 | latest |'}
  ];
  const result = mod.reconcileSection(fixture, 'STALE', entries);
  assert.ok(result.startsWith('# Для Claude'), 'Document header must survive');
  assert.ok(result.includes('| #91 | protected |'), 'Protected records must survive');
  assert.ok(result.includes('Owner note: KEEP'), 'Owner notes must survive');
  assert.ok(!result.includes('| #8 | obsolete |'), 'Replace old STALE content');
  assert.ok(!result.includes('| #12 | superseded |'), 'No duplicate PR records');
  assert.ok(result.includes('| #12 | latest |'), 'Retain newest record per PR');
  assert.equal(result.split('| #12 | latest |').length - 1, 1, 'No duplicate PR ID');
  assert.equal(mod.reconcileSection(result, 'STALE', entries), result, 'Repeat must be idempotent');
  assert.throws(() => mod.reconcileSection(fixture.replace(begin + '\n', ''), 'STALE', entries),
    /Malformed/, 'A half-present STALE section must fail closed');
  const missing = mod.reconcileSection('# Для Claude\n\nOwner note: KEEP\n', 'STALE', entries);
  assert.ok(missing.startsWith('# Для Claude') && missing.includes('Owner note: KEEP') &&
    missing.includes('| #12 | latest |'), 'First write must preserve existing prose');
}

verify(production);
const mutants = [
  ['erase-other-sections',
    'return content.slice(0, first) + block + content.slice(last + end.length);',
    'return block;'],
  ['duplicate-pr-rows',
    'const unique = [...new Map(entries.map(entry => [entry.id, entry.text])).values()];',
    'const unique = entries.map(entry => entry.text);'],
  ['ignore-unpaired-marker',
    "if ((first < 0) !== (last < 0)) throw Error('Malformed DLYA_CLAUDE markers for ' + key);",
    "if (false) throw Error('Malformed DLYA_CLAUDE markers for ' + key);"],
  ['hardcoded-id-exclusion-cheat',
    'const unique = [...new Map(entries.map(entry => [entry.id, entry.text])).values()];',
    'const unique = [...new Map(entries.filter(e => e.id !== 12).map(e => [e.id, e.text])).values()];'],
  ['erase-owner-note-on-first-write',
    "return content.replace(/\\s*$/, '') + '\\n\\n' + block + '\\n';",
    'return block;']
];

for (const [label, original, damaged] of mutants) {
  assert.equal(source.split(original).length - 1, 1, 'Non-unique mutation target: ' + label);
  const mutation = source.replace(original, damaged);
  assert.notEqual(mutation, source, 'No-op mutation: ' + label);
  const url = 'data:text/javascript;base64,' + Buffer.from(mutation).toString('base64');
  const broken = await import(url);
  assert.throws(() => verify(broken), assert.AssertionError, 'MUTANT_ESCAPED ' + label);
  console.log('MUTATION_KILLED ' + label);
}
console.log('STOROZHA_JOURNAL_PRESERVATION_MUTATIONS_PASS ' + mutants.length + '/' + mutants.length);
