// Каркас Claude. Самопроверка ядра бота: хорошая мини-игра проходит, плохие ловятся.
// Если этот тест красный — сломано ядро (или его ослабили). Запуск: node scripts/meta-bot/selftest.mjs
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { serve } from './server.mjs';
import { checkGame } from './core.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const repoRoot = path.resolve(here, '../..');
const gameDir = path.join(here, 'fixture');
const srv = await serve(repoRoot);
const cases = [
  { q: '', expect: true, name: 'хорошая игра проходится' },
  { q: '?rot=1', expect: true, name: 'повёрнутая камера: калибровка ходьбы проходит' },
  { q: '?form=data', expect: true, name: 'ручка-данные (форма ChatGPT) поддерживается' },
  { q: '?goals=2', expect: true, name: 'цель меняется внутри уровня — не ложное застревание' },
  { q: '?bad=scroll', expect: /FIX/, name: 'прокрутка во время удержания джойстика поймана' },
  { q: '', expect: /прошлых прогонах/, name: 'падение FPS против прошлых прогонов поймано', fps: 100000 },
  { q: '?fight=1', expect: true, name: 'бой у цели дольше stuckSec с настоящим уроном (progress) проходит' },
  { q: '?bad=fightstuck', expect: /застрял/, name: 'бой без урона пойман как застревание' },
  { q: '?bad=longscroll', expect: /FIX/, name: 'сдвиг экрана после долгого удержания (не в первых жестах) пойман' },
  { q: '?bad=text', expect: /ЧИСТЫЙ ЭКРАН/, name: 'текст на экране пойман' },
  { q: '?bad=stuck', expect: /застрял/, name: 'застревание поймано' },
  { q: '?bad=repeat', expect: /БЕЗ ПОВТОРОВ/, name: 'повтор раскладки пойман' },
  { q: '?bad=cheat', expect: /запрещённые ключи/, name: 'чит в ручке пойман' }
];
let ok = true;
for (const c of cases) {
  if (c.fps) { const f = path.join(os.tmpdir(), 'meta-bot-fps-selftest.json'); fs.writeFileSync(f, JSON.stringify({ 'fixture:mobile': [c.fps], 'fixture:desktop': [c.fps] })); process.env.META_BOT_FPS_FILE = f; }
  else delete process.env.META_BOT_FPS_FILE;
  const r = await checkGame({ gameDir, repoRoot, baseUrl: srv.url, query: c.q });
  const errs = r.runs.flatMap(x => x.errors).join(' | ');
  const pass = c.expect === true ? r.ok : (!r.ok && c.expect.test(errs));
  console.log(`${pass ? '✅' : '❌'} ${c.name}${pass ? '' : ' → ' + (errs || 'ошибок нет')}`);
  ok = ok && pass;
}
srv.close();
process.exit(ok ? 0 : 1);
