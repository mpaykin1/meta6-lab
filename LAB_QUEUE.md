# LAB_QUEUE — очередь идей песочницы

Формат карточки и правила: [automation/prompts/meta6-lab-sandbox.md](automation/prompts/meta6-lab-sandbox.md) §5. Новые карточки — сверху, не длиннее 15 строк. «Михаил» — только его слова. «ЗАБРАНО → SHA» ставит только Claude.

Бот для карточки: ссылка на прогон `META BOT` на PR `lab/<имя>` → `main` в этом репозитории.

<!-- карточки ниже -->

### lab/world-doors-progress — Двери между мирами (портал)
- Игрок: посещённые миры подсвечиваются мягким свечением, прогресс хранится локально.
- Ветка: lab/world-doors-progress; файлы: meta-games/index.html и world-progress.mjs.
- Поиграть: https://mpaykin1.github.io/meta6-lab/preview/world-doors-progress/meta-games/
- Сохранение: только история посещения; игровые победы, инвентарь и уровни пока не синхронизированы.
- Статус: В РАБОТЕ (проверка публикации и владельца).
- Михаил: —
- Claude: —



### lab/oss-commercial-kit — Внешние библиотеки + световой остров
- Игрок: атмосферный 3D-остров, процедурный рельеф, подсвеченный маршрут к кристаллам, звуки и сенсорный джойстик.
- Поиграть: https://mpaykin1.github.io/meta6-lab/preview/oss-commercial-kit/meta-games/open-source-kit/
- Ветка / SHA: lab/oss-commercial-kit / 40d38f2e6415400ad61b1e15a9681d56673ac9a1
- Файлы: + shared/vendor/open-source/ (9), + meta-games/open-source-kit/ (3).
- Лицензии: 3× MIT, 1× ISC; исходники и тексты лицензий сохранены отдельно, зависимости автономны.
- Слияние только в песочницу: https://github.com/mpaykin1/meta6-lab/pull/5
- Бот: https://github.com/mpaykin1/meta6-lab/actions/runs/42284421604
- Статус: В РАБОТЕ (Pages опубликовано; бот проверяет)
- Михаил: —
- Claude: —

