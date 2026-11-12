// Reproducible code-based source inventory. No estimates and no in-game mutation.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const source = readFileSync(
  fileURLToPath(new URL('../../games/sumerki-i-pepel-2-copy/index.html', import.meta.url)),
  'utf8'
);
const before = source.replace('\n<script src="./bot-observer.js"></script>', '');
const grouped = new Map();
for (const match of before.matchAll(/^\s*define([A-Z][A-Za-z]+)\(\s*['"]([^'"]+)['"]/gm)) {
  const [, kind, id] = match;
  if (!grouped.has(kind)) grouped.set(kind, new Set());
  grouped.get(kind).add(id);
}
const packs = [...before.matchAll(/packBegin\s*\(\s*\{\s*"id":\s*"([^"]+)"/g)]
  .map(match => match[1]);
const sorted = [...grouped].sort(([a], [b]) => a.localeCompare(b));
const total = sorted.reduce((n, [, ids]) => n + ids.size, 0);
if (!packs.length || !total) throw new Error('Inventory parser found no source definitions');
console.log('# Опись games/sumerki-i-pepel-2-copy');
console.log('');
console.log('Источник: games/sumerki-i-pepel-2-copy/index.html, без добавленного script-тега.');
console.log('Копия исходника: Git blob 90d83a77049e8edb7aab847ecbbf4e9723a3c2e5.');
console.log('Генератор: scripts/uluchshatel/inventory-sumerki-copy.mjs.');
console.log('');
console.log('| Категория (вызовы define*) | Идентификаторов |');
console.log('|---|---:|');
for (const [kind, ids] of sorted) console.log('| ' + kind + ' | ' + ids.size + ' |');
console.log('| Всего буквальных идентификаторов | ' + total + ' |');
console.log('');
console.log('Пакетов packBegin: ' + packs.length + ' (' + packs.join(', ') + ').');
console.log('GLSL-блоков: ' + (before.match(/\/\*\s*glsl\s*\*\/`/g) || []).length + '.');
console.log('Внешних звуковых файлов (mp3, ogg, wav) в HTML: ' +
  (before.match(/\.(mp3|ogg|wav)\b/g) || []).length + '.');
console.log('Число динамических объектов, анимаций и кадров определяется во время игры; не приравнивается к статическому перечню.');
console.log('FPS p95: нет замера. Проходимость ботом: нет подтверждённого run.');
