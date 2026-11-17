import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const documentPath = join(root, 'automation/AVTOZADACHI.md');
const expected = ['Z01_ZAVALY.md', 'Z02_STOROZHA.md', 'Z03_ETALONY.md'];

function verifyCardLinks(source) {
  const withoutComments = source.replace(/<!--[\s\S]*?-->/g, '');
  const line = withoutComments.split('\n').find(text => text.startsWith('Файлы задач:'));
  assert.ok(line, 'Не найдена инструкция «Файлы задач»');
  const active = line.split('Не пытайся открывать')[0];
  const match = active.match(/Точные имена карточек Z01[–-]Z03:\s*(.*?);\s*индекс/);
  assert.ok(match, 'Точные пути Z01–Z03 должны находиться в действующей инструкции');
  const names = [...match[1].matchAll(/\x60([^\x60]+)\x60/g)].map(item => item[1]);
  assert.deepEqual(names, expected, 'Неправильный путь хотя бы одной карточки');
  for (const filename of names) {
    assert.ok(existsSync(join(root, 'automation/zadachi', filename)), filename + ': 404');
  }
}

const original = readFileSync(documentPath, 'utf8');
verifyCardLinks(original);
const correct = 'Точные имена карточек Z01–Z03: ' +
  '\x60Z01_ZAVALY.md\x60, \x60Z02_STOROZHA.md\x60, \x60Z03_ETALONY.md\x60; индекс';
const mutants = [
  ['Z01 404', original.replace('\x60Z01_ZAVALY.md\x60', '\x60Z01.md\x60')],
  ['Z02 404', original.replace('\x60Z02_STOROZHA.md\x60', '\x60Z02.md\x60')],
  ['Z03 404', original.replace('\x60Z03_ETALONY.md\x60', '\x60Z03.md\x60')],
  ['Обман: верные пути только в комментарии', original.replace(correct,
    '<!-- ' + correct + ' --> ' +
    'Точные имена карточек Z01–Z03: \x60Z01.md\x60, \x60Z02.md\x60, \x60Z03.md\x60; индекс')]
];
for (const [name, mutant] of mutants) {
  assert.notEqual(mutant, original, name + ': мутант не создан');
  assert.throws(() => verifyCardLinks(mutant), undefined, name + ': мутант прошёл проверку');
}
console.log('Карточки Z01–Z03: PASS; 4 мутации пойманы, включая обман');
