# LAB_QUEUE — очередь идей песочницы

Формат карточки и правила: [automation/prompts/meta6-lab-sandbox.md](automation/prompts/meta6-lab-sandbox.md) §5. Новые карточки — сверху, не длиннее 15 строк. «Михаил» — только его слова. «ЗАБРАНО → SHA» ставит только Claude.

Бот для карточки: ссылка на прогон `META BOT` на PR `lab/<имя>` → `main` в этом репозитории.

<!-- карточки ниже -->
### lab/twilight-island-bot — Остров сумерек: честное прохождение острова
- Что даёт игроку: адаптивная графика на слабых устройствах; бот проверяет реальный маршрут, лечение и возрождение.
- Поиграть: https://mpaykin1.github.io/meta6-lab/preview/twilight-island-bot/games/twilight-island/
- Ветка / SHA кода: lab/twilight-island-bot / 776cc4884ea73938aa409904535f6061e3194171
- Файлы: 15 исходных файлов игры из PR #303 (SHA 5f0882228c16cc04897b9e18b3ea254e38836be2), добавлен adaptive-quality.js (27 строк); изменены index.html (+4), bot-adapter.js (+12), bot-strategy.mjs (+53)
- Ассеты: перенесены исходные 15 файлов; новых графических ассетов 0
- Бот: проверка не завершена; полный остров 1/1 на трёх запусках пока НЕ подтверждён
- FPS: исходный прогон 6.8; новый FPS не измерен, fpsBaseline исходного bot.json = 3.8 (подлежит обновлению по измерению)
- Запрещённые файлы: https://github.com/mpaykin1/meta6-lab/compare/main...lab/twilight-island-bot
- Статус: В РАБОТЕ
- Михаил: —
- Claude: —


