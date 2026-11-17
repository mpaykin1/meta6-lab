import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const path = fileURLToPath(new URL('../../automation/zadachi/Z01_ZAVALY.md', import.meta.url));
const source = readFileSync(path, 'utf8');

function verify(text) {
  const active = text.replace(/<!--[\s\S]*?-->/g, '');
  const rule = active.split('\n').find(line => line.startsWith('3. **Конфликт с main**'));
  assert.ok(rule, 'Шаг 3 Z01 отсутствует');
  for (const required of [
    'проверь источник генерации',
    'сохрани независимые добавления обеих веток',
    'все изменения PR уже воспроизводятся генератором',
    'сверяй diff'
  ]) {
    assert.ok(rule.includes(required), 'Шаг 3 теряет защиту: ' + required);
  }
  assert.ok(!rule.includes('берёшь main для таблиц-сводок'),
    'Безусловное предпочтение main способно удалить уникальные изменения');
}

verify(source);
const good = source.split('\n').find(line => line.startsWith('3. **Конфликт с main**'));
const mutants = [
  ['main без сравнения', source.replace(
    'сохрани независимые добавления обеих веток', 'бери main без проверки')],
  ['нет проверки источника', source.replace('проверь источник генерации', 'пропусти проверку')],
  ['нет проверки diff', source.replace('сверяй diff', 'заверши без сравнения')],
  ['обман: верное правило только в комментарии', source.replace(
    good, '<!-- ' + good + ' -->\n3. **Конфликт с main** → берёшь main для таблиц-сводок')]
];
for (const [name, mutant] of mutants) {
  assert.notEqual(mutant, source, name + ': мутация не применена');
  assert.throws(() => verify(mutant), undefined, name + ': опасный вариант не обнаружен');
}
console.log('Z01 conflict preservation PASS; 4 mutations caught, including deception');
