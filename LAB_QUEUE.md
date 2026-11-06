# LAB_QUEUE — очередь идей песочницы

Формат карточки и правила: [automation/prompts/meta6-lab-sandbox.md](automation/prompts/meta6-lab-sandbox.md) §5. Новые карточки — сверху, не длиннее 15 строк. «Михаил» — только его слова. «ЗАБРАНО → SHA» ставит только Claude.

Бот для карточки: ссылка на прогон `META BOT` на PR `lab/<имя>` → `main` в этом репозитории.

<!-- карточки ниже -->
### lab/twilight-island-bot — Остров сумерек: честное прохождение острова
- Что даёт игроку: адаптивная графика на слабых устройствах; бот проверяет реальный маршрут, лечение и возрождение.
- Поиграть: https://mpaykin1.github.io/meta6-lab/preview/twilight-island-bot/games/twilight-island/
- Ветка / SHA кода: lab/twilight-island-bot / c6fae56fe49095d7bb1ad4cab5c5903b843ba0b1
- Файлы (строк): index.html 4947, bot-adapter.js 228, bot-strategy.mjs 215, bot.json 14, adaptive-quality.js 27, audio.js 304, building-assets.js 75, combat-relations.js 152, editor.js 511, inventory.js 36, meta-runtime.css 15, meta-runtime.js 81, mobile-controls.css 51, mobile-controls.js 69, npc-catalog.js 68, story-system.js 84
- Ассеты: перенесены исходные 15 файлов; новых графических ассетов 0
- Бот: https://github.com/mpaykin1/meta6-lab/actions/runs/42237557144 (выполняется); 1/1 mobile, desktop и повтор пока НЕ подтверждены
- FPS: исходный прогон 6.8; новый FPS не измерен, fpsBaseline исходного bot.json = 3.8 (подлежит обновлению по измерению)
- Запрещённые файлы: https://github.com/mpaykin1/meta6-lab/compare/main...lab/twilight-island-bot
- Статус: В РАБОТЕ
- Михаил: —
- Claude: —


