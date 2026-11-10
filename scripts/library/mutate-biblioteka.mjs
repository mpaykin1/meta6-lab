import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyBiblioteka} from './verify-biblioteka.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ledger = fs.readFileSync(path.join(root, 'BIBLIOTEKA.md'), 'utf8');
const catalog = fs.readFileSync(path.join(root, 'shared/library/catalog-solutions.json'), 'utf8');
const index = fs.readFileSync(path.join(root, 'shared/library/index.json'), 'utf8');
const scenarios = [
  ['wrong-total', data => {
    const count = JSON.parse(catalog).solution_count;
    data.ledger = data.ledger.replace('**[' + count + '](', '**[' + (count + 1) + '](');
    assert.notEqual(data.ledger, ledger, 'fixture lacks total marker');
  }],
  ['unlinked-zero', data => {
    // A bare "0" must not be accepted as a proved numerical result.
    data.ledger = data.ledger.replace(
      /\[0\]\(https:\/\/github\.com\/mpaykin1\/meta6-lab\/blob\/[a-f0-9]{7,40}\/shared\/library\/catalog-solutions\.json\)/,
      '0');
    assert.notEqual(data.ledger, ledger, 'fixture lacks linked zero');
  }],
  ['unrelated-github-number', data => {
    // A forged external GitHub link must not count as catalog evidence.
    data.ledger = data.ledger.replace(
      /\[0\]\(https:\/\/github\.com\/mpaykin1\/meta6-lab\/blob\/[a-f0-9]{7,40}\/shared\/library\/catalog-solutions\.json\)/,
      '[0](https://github.com/some-other-owner/repo/blob/abcdef1/fake.json)');
    assert.notEqual(data.ledger, ledger, 'fixture lacks catalog link');
  }],
  ['copy-as-exemplar', data => {
    data.ledger = data.ledger.replace('копия — исключена', 'да (файлы)');
    assert.notEqual(data.ledger, ledger, 'fixture lacks excluded copy marker');
  }],
  ['deceptive-fake-positive', data => {
    const parsed = JSON.parse(data.catalog);
    parsed.solutions[0].load_ok = !parsed.solutions[0].load_ok;
    data.catalog = JSON.stringify(parsed);
  }],
  ['all-systems-unloadable', data => {
    data.strict = true;
    const parsed = JSON.parse(data.catalog);
    for (const solution of parsed.solutions) solution.load_ok = false;
    data.catalog = JSON.stringify(parsed);
  }]
];
let passed = 0;
for (const [name, mutate] of scenarios) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'biblioteka-mutation-'));
  try {
    const dir = path.join(tmp, 'shared/library');
    fs.mkdirSync(dir, {recursive: true});
    const data = {ledger, catalog, index, strict: false};
    mutate(data);
    fs.writeFileSync(path.join(tmp, 'BIBLIOTEKA.md'), data.ledger);
    fs.writeFileSync(path.join(dir, 'catalog-solutions.json'), data.catalog);
    fs.writeFileSync(path.join(dir, 'index.json'), data.index);
    assert.throws(() => verifyBiblioteka(tmp, {strict: data.strict}),
      /BIBLIOTEKA invalid:/, 'Mutation escaped: ' + name);
    passed++;
    console.log('CAUGHT ' + name);
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
}
assert.equal(passed, scenarios.length);
console.log('BIBLIOTEKA mutations passed: ' + passed);
