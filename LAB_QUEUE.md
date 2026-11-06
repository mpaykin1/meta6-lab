# LAB_QUEUE — очередь идей песочницы

Формат карточки и правила: [automation/prompts/meta6-lab-sandbox.md](automation/prompts/meta6-lab-sandbox.md) §5. Новые карточки — сверху, не длиннее 15 строк. «Михаил» — только его слова. «ЗАБРАНО → SHA» ставит только Claude.

Бот для карточки: ссылка на прогон `META BOT` на PR `lab/<имя>` → `main` в этом репозитории.

<!-- карточки ниже -->

### Native catalog + Steam/Android candidates
- Польза: новые игры автоматически обнаруживаются, но в релиз магазинов попадают только после проверки прав и бота.
- Ветka: `lab/native-catalog-and-steam`, основной код: `ae20bb0`.
- Поиграть: https://mpaykin1.github.io/meta6-lab/preview/native-catalog-and-steam/meta-games/
- Изменения: `platforms/` (каталог, сборщик, Electron), новый workflow нативных сборок; эталоны не изменены.
- CI: https://github.com/mpaykin1/meta6-lab/actions/runs/42284378472 — 3/3 PASS, Android APK/AAB и Windows-папка доступны в артефактах.
- Бот: игры-эталоны не изменены; нативное прохождение на устройствах ещё не подтверждено.
- Статус: В РАБОТЕ (ожидает проверку на устройствах и решение владельца).
- Михаил: решение о принятии не получено.


