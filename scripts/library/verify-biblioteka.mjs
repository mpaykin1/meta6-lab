import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {linkedAssets} from './asset-links.mjs';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (root, name) => fs.readFileSync(path.join(root, name), 'utf8');
const json = (root, name) => JSON.parse(read(root, name));
// Only pinned source commits count as numerical evidence; bare 0 cannot pass.
const provenNumber = /\[(\d+)\]\(https:\/\/github\.com\/mpaykin1\/meta6-lab\/blob\/[a-f0-9]{7,40}\/[^)]+\)/g;
const allNumbers = cell => [...cell.matchAll(provenNumber)]
  .map(match => Number(match[1]));
const firstNumber = cell => {
  const proven = allNumbers(cell);
  if (proven.length) return proven[0];
  if (/\d/.test(cell)) throw Error('BIBLIOTEKA invalid: number without pinned source link');
  return 0; // "—" and "не подтверждено" are not measured results.
};
const check = (condition, message) => assert.ok(condition, 'BIBLIOTEKA invalid: ' + message);

export function verifyBiblioteka(root = DEFAULT_ROOT, {strict = false} = {}) {
  const markdown = read(root, 'BIBLIOTEKA.md');
  const catalog = json(root, 'shared/library/catalog-solutions.json');
  const index = json(root, 'shared/library/index.json');
  check(Array.isArray(catalog.solutions), 'missing systems catalog');
  check(Array.isArray(index.entries), 'missing asset index');
  const solutions = catalog.solutions;
  if (strict) check(solutions.some(item => item.load_ok === true),
    'all load_ok=false — cannot accept a nonfunctional catalog');
  check(solutions.length === catalog.solution_count, 'wrong catalog solution_count');
  const byGame = new Map();
  for (const item of solutions) {
    check(!/-copy$/i.test(item.game), 'copy game counted as a source: ' + item.game);
    if (!byGame.has(item.game)) byGame.set(item.game, []);
    byGame.get(item.game).push(item);
  }

  const lines = markdown.split('\n').filter(line => /^\| /.test(line));
  const annotated = lines.filter(line => line.includes('<!--catalog:'));
  check(annotated.length > 0, 'missing machine-tagged per-game rows');
  const covered = new Set();
  const totals = {systems: 0, loaded: 0, linked: 0, assets: 0, main: 0, games: 0};
  for (const line of annotated) {
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    check(cells.length === 10, 'wrong column count: ' + line.slice(0, 70));
    const match = /<!--catalog:([^>]+)-->/i.exec(cells[0]);
    const keys = match[1].split(',').map(value => value.trim());
    check(keys.every(Boolean) && new Set(keys).size === keys.length, 'invalid game keys');
    const copy = keys.some(key => /-copy$/i.test(key));
    if (copy) {
      check(cells[1].includes('копия — исключена'), 'copy counted as original');
      check(cells.slice(2, 5).every(cell => cell === '—'), 'copy contributes systems');
      continue;
    }
    totals.games++;
    if (cells[1].includes('да (файлы)')) totals.main++;
    const items = keys.flatMap(key => {
      check(!covered.has(key), 'game repeated: ' + key);
      covered.add(key);
      return byGame.get(key) || [];
    });
    const found = items.length;
    const loaded = items.filter(item => item.load_ok === true).length;
    const linked = items.filter(item => (item.asset_ids || []).length > 0).length;
    const assets = index.entries.filter(item => keys.includes(item.game) && item.kind !== 'solution').length;
    const expectedLoad = found ? [loaded, found] : [];
    check(firstNumber(cells[2]) === found, 'system count differs for ' + keys.join(','));
    check(JSON.stringify(allNumbers(cells[3])) === JSON.stringify(expectedLoad),
      'load_ok differs for ' + keys.join(','));
    check(firstNumber(cells[4]) === linked, 'asset links differ for ' + keys.join(','));
    check(firstNumber(cells[5]) === assets, 'indexed assets differ for ' + keys.join(','));
    totals.systems += found;
    totals.loaded += loaded;
    totals.linked += linked;
    totals.assets += assets;
  }
  for (const game of byGame.keys()) check(covered.has(game), 'missing catalog game row: ' + game);
  check(totals.systems === solutions.length, 'some systems omitted');

  const totalRow = lines.find(line => line.startsWith('| **ИТОГО** |'));
  check(totalRow, 'missing total row');
  const cells = totalRow.split('|').slice(1, -1).map(cell => cell.trim());
  check(cells.length === 10, 'wrong total columns');
  check(JSON.stringify(allNumbers(cells[1])) === JSON.stringify([totals.main, totals.games]),
    'main game totals are not proven');
  check(firstNumber(cells[2]) === totals.systems, 'summary systems differ');
  check(JSON.stringify(allNumbers(cells[3])) === JSON.stringify([totals.loaded, totals.systems]),
    'summary load_ok differs');
  check(firstNumber(cells[4]) === totals.linked, 'summary asset links differ');
  check(firstNumber(cells[5]) === totals.assets, 'summary indexed assets differ');
  const footer = /системы\s+(\d+)\s*\/\s*(\d+)\s+загружаются;\s*связаны с ассетами\s+(\d+)/.exec(markdown);
  check(footer && Number(footer[1]) === totals.loaded
    && Number(footer[2]) === totals.systems && Number(footer[3]) === totals.linked,
  'machine summary disagrees with catalog');

  if (strict) {
    for (const solution of solutions) {
      const code = (solution.lines || []).map(segment => {
        const file = path.resolve(root, segment.source_path);
        check(file.startsWith(root + path.sep), 'source escaped root');
        return fs.readFileSync(file, 'utf8').split('\\n').slice(segment.start - 1, segment.end).join('\\n');
      }).join('\\n');
      const {ids, unresolved} = linkedAssets(code, solution.game, index.entries);
      check(JSON.stringify([...new Set(solution.asset_ids || [])].sort()) === JSON.stringify(ids),
        'missing or invented asset_ids: ' + solution.id);
      check(unresolved.length === 0,
        'unresolved referenced assets: ' + solution.id + ' ' +
        unresolved.map(item => item.reference).join(', '));
    }
  }
  return totals;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(verifyBiblioteka(DEFAULT_ROOT, {strict: process.argv.includes('--strict')})));
}
