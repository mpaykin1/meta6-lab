// Каркас Claude. Запуск: node scripts/meta-bot/run.mjs [games/<игра> ...]
// Без аргументов — все папки games/*, где есть bot-strategy.mjs, bot.json или ручка __META_BOT__ в index.html. Итог — в консоли и в сводке GitHub Actions.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './server.mjs';
import { checkGame } from './core.mjs';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let dirs = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!dirs.length) { const g = path.join(repoRoot, 'games'); dirs = fs.existsSync(g) ? fs.readdirSync(g).map(d => path.join('games', d)).filter(d => ['bot-strategy.mjs', 'bot.json'].some(f => fs.existsSync(path.join(repoRoot, d, f))) || /__META_BOT__/.test((() => { try { return fs.readFileSync(path.join(repoRoot, d, 'index.html'), 'utf8'); } catch { return ''; } })())) : []; }
if (!dirs.length) { console.log('Нет игр с ручкой бота — нечего проверять.'); process.exit(0); }
const srv = await serve(repoRoot);
const results = [];
for (const d of dirs) { console.log(`▶ ${d}`); const r = await checkGame({ gameDir: path.resolve(repoRoot, d), repoRoot, baseUrl: srv.url }); results.push(r);
  for (const x of r.runs) console.log(`  ${x.ok ? '✅' : '❌'} ${x.viewport}: уровней ${x.levels}, пройдено ${x.passed}, FPS ${x.fps ?? '—'}${x.errors.length ? '\n     - ' + x.errors.join('\n     - ') : ''}`); }
srv.close();
// Аннотации GitHub: ошибки видны в прогоне и через API без входа.
if (process.env.GITHUB_ACTIONS) for (const r of results) for (const x of r.runs) for (const e of x.errors) console.log(`::error title=META BOT ${r.game} ${x.viewport}::${e.replace(/\r?\n/g, ' ')}`);
const lines = ['## META BOT — проходимость игр', '', '| Игра | Экран | Уровней | Пройдено | FPS | Итог |', '|---|---|---|---|---|---|'];
for (const r of results) for (const x of r.runs) lines.push(`| ${r.game} | ${x.viewport} | ${x.levels} | ${x.passed} | ${x.fps ?? '—'} | ${x.ok ? '✅' : '❌ ' + x.errors.join('; ').replace(/\|/g, '/')} |`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
process.exit(results.every(r => r.ok) ? 0 : 1);
