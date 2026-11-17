// Каркас Claude. Вечная ловушка ядра META BOT (OSHIBKI 2026111702): bot.json с пустым или неизвестным
// списком экранов не может дать «успех» без открытия игры. Проверяется НАСТОЯЩЕЕ ядро core.mjs,
// затем 3 мутации ядра в памяти должны быть пойманы. Запускается KONTUR на каждом PR (scripts/**/mutate-*.mjs).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const coreFile = path.join(root, 'scripts/meta-bot/core.mjs');
const source = fs.readFileSync(coreFile, 'utf8');

async function moduleFrom(text) {
  for (const [specifier, target] of [
    ['playwright', 'node_modules/playwright/index.mjs'],
    ['./input.mjs', 'scripts/meta-bot/input.mjs'],
    ['./checks.mjs', 'scripts/meta-bot/checks.mjs']
  ]) text = text.replace("from '" + specifier + "'", "from '" + pathToFileURL(path.join(root, target)) + "'");
  return import('data:text/javascript;base64,' + Buffer.from(text).toString('base64'));
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'meta-bot-viewports-'));
const write = cfg => fs.writeFileSync(path.join(dir, 'bot.json'), JSON.stringify(cfg));
const INVALID = [[], null, 'mobile', ['mobile', 'unknown'], ['toString'], {}, [1]];
const VALID = [['mobile'], ['desktop'], ['desktop', 'mobile'], ['mobile', 'desktop']];

async function verify(mod) {
  for (const v of INVALID) {
    write({ viewports: v, skipChecks: ['noRepeat'] });
    await assert.rejects(() => mod.loadGame(dir), /viewports/, 'принят неверный viewports: ' + JSON.stringify(v));
    // Исходный ложный успех: checkGame возвращал { ok: true, runs: [] }, не открыв игру.
    await assert.rejects(() => mod.checkGame({ gameDir: dir, repoRoot: dir, baseUrl: 'http://127.0.0.1:9' }), /viewports/,
      'checkGame не отклонил viewports: ' + JSON.stringify(v));
  }
  for (const v of VALID) { write({ viewports: v }); assert.deepEqual((await mod.loadGame(dir)).cfg.viewports, v); }
  fs.rmSync(path.join(dir, 'bot.json'));
  assert.deepEqual((await mod.loadGame(dir)).cfg.viewports, ['mobile', 'desktop'], 'без bot.json — оба экрана по умолчанию');
}

try {
  await verify(await import(pathToFileURL(coreFile).href));
  console.log('META_BOT_VIEWPORTS_PASS: real core, ' + INVALID.length + ' invalid, ' + VALID.length + ' valid, default');
  const mutants = [
    ['empty-list-bypass', 'cfg.viewports.length === 0', 'false'],
    ['unknown-screen-bypass', '!Object.hasOwn(VIEWPORTS, name)', 'false'],
    ['validation-removed', "throw new Error('bot.json viewports must contain supported screens: mobile, desktop');", ';']
  ];
  for (const [name, from, to] of mutants) {
    assert(source.includes(from), 'в ядре нет места мутации ' + name + ' — проверка ядра удалена или изменена');
    await assert.rejects(async () => verify(await moduleFrom(source.replace(from, to))), { name: 'AssertionError' }, 'мутант выжил: ' + name);
    console.log('META_BOT_VIEWPORTS_MUTATION_CAUGHT ' + name);
  }
} finally {
  assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep));
  fs.rmSync(dir, { recursive: true, force: true });
}
