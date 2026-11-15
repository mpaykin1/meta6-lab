# ПОЛЬЗА — общая память чата и пяти автозадач

## Линии
- Veil Terraces #245: после актуального main [7714044](https://github.com/mpaykin1/meta6-lab/commit/77140442cddcec81e4a18b22f86edea90e56beec) подтвердили [6/6 desktop, mobile, mobile-repeat](https://github.com/mpaykin1/meta6-lab/actions/runs/43749067384). [Library Machine](https://github.com/mpaykin1/meta6-lab/actions/runs/43749067284) красная до регенерации индекса (новый ostrov-aptekarya обязан остаться). Это польза на PR, пока не единица FINISH на main.
- B2 PR #258: повторное слияние со свежим main [e2ee93a](https://github.com/mpaykin1/meta6-lab/commit/e2ee93ab45ffe7258207dac504c417e79d6220dc), [B2 PASS в Actions #43748112666](https://github.com/mpaykin1/meta6-lab/actions/runs/43748112666), PR [mergeable=true](https://github.com/mpaykin1/meta6-lab/pull/258). Ожидается отдельный B1 и подтверждение на main; не считать единицей пользы FINISH.
- B2, broken-city: исходный адаптер из конфликтного PR #200 отделён в [PR #291](https://github.com/mpaykin1/meta6-lab/pull/291); обнаружено и исправлено преждевременное объявление API. Полное прохождение уровня пока красное.
- B2, archer-in-the-fog: герой стационарный; реальное движение отсутствует, нельзя заменять камерой.
- PR #258: конфликт с main снят [merge-коммитом 1278c996](https://github.com/mpaykin1/meta6-lab/commit/1278c996fddd8f464abeed7823e2c21526cbc6fe), B2 на ПК и телефоне [PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43420129986); по историческим защищённым изменениям требуется Claude.

## Очередь для автозадач
- Пока свободных задач нет: отсутствует слитый одобренный пример адаптера, запрещено раздавать неподтверждённый шаблон.

## Не смог
- PR #245: `shared/library/index.json` 4.17 MiB: создание обновлённого blob/contents через подключённый GitHub API завершилось ошибкой транспорта h2; нельзя заменять индекс старой версией без ostrov-aptekarya. Нужна генерация штатным `node scripts/library/extract-all.mjs` на ветке #245, затем CI: [красный прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/43749067284).
- B2 archer-in-the-fog: в исходном режиме ввод стреляет (pointer), прямое перемещение героя с помощью WASD отсутствует; запрещено имитировать его координатами камеры. B2_MOTION_PASS без изменения механики честно получить невозможно.
- B2 broken-city: [focused 43417988025](https://github.com/mpaykin1/meta6-lab/actions/runs/43417988025) — уровень 1 не пройден за 180 с при FPS 2.8; старт движка обгонял установку API (исправлено в PR #291), но полного зелёного прогона игры пока нет.
- В PR #291 упираемся в [квоту открытых PR](https://github.com/mpaykin1/meta6-lab/actions/runs/43419411230); сторожа не ослаблять.
- На старте нет общего automation/prompts/POLZA.md. Не выдавать чатовый текст за утверждённый промпт для пяти автозадач.

## Замеры
- 2026-11-15, 19 UTC (чат): [main](https://github.com/mpaykin1/meta6-lab/commits/main) — 45 открытых PR, 23 из них mergeable=false (проверены 45 PR); из 144 коммитов после 14.11 19 UTC — 109 от ботов/автоматики, лидеры status-dlya-claude 36 и zadachi-watch 31. Из 9 целевых игр ручка window.__META_BOT__ подтверждена только у Veil (1/9), в очереди 0 свободных задач без слитого шаблона, единиц пользы на main в этой сессии 0, FINISH 7/18. PR [#258](https://github.com/mpaykin1/meta6-lab/pull/258) B1/B2 зелёные, PR [#245](https://github.com/mpaykin1/meta6-lab/pull/245) 6/6 ×3, но индекс библиотеки красный.
- 2026-11-15 (чат, продолжение): единиц пользы по main 0, B2 на #258 [PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43748597509), Veil #245 [6/6 ×3 на PR](https://github.com/mpaykin1/meta6-lab/actions/runs/43749067384) без переноса в main, свободных задач 0, поскольку нет слитого шаблона; FINISH 7/18, открытых PR ранее 45.
- 2026-11-15 (чат): новых зелёных пунктов FINISH на main 0; B2 PASS только в PR #258, #291 остаётся draft; main минимум 1 игра с ручкой из 8 известных проблемных игр; свободных задач для автозадач 0 — слитого образца нет; 45 открытых PR; FINISH 7/18. [PR #258](https://github.com/mpaykin1/meta6-lab/pull/258), [Actions B2](https://github.com/mpaykin1/meta6-lab/actions/runs/43748112666).
- 2026-11-13 11:51 UTC (чат): 0 новых FINISH на зелёном main; [#258 B2 PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43420129986) только PR, [#291](https://github.com/mpaykin1/meta6-lab/pull/291) ещё не принят; ручка в main подтверждена минимум у 1 игры (Veil Terraces); свободных задач в очереди 0 (слитого шаблона нет); PR открыто 49; конфликты и бот-коммиты за сутки не пересчитаны. FINISH 7/18.
- 2026-11-13 UTC (чат, исходный замер): FINISH 7/18 по main; пример B2 только PR #258, в main отсутствует.

## Уроки
- Делай так, а не так: после изменения games/ обновляй `shared/library/veil-terraces.json` и общий индекс штатным `node scripts/library/extract-all.mjs` в том же PR; одних зелёных игровых прогонов недостаточно. Не откатывать общий каталог ради устранения конфликта: он содержит новые игры. [Блокирующий прогон #43749067284](https://github.com/mpaykin1/meta6-lab/actions/runs/43749067284).
- Главная помеха достижению 3 единиц пользы: зелёные B2 и полное прохождение Veil пока только на PR-ветках, отсутствие слитого примера запрещает раздавать автоочередь. Следующая сессия: довести каталог #245, получить принятие #258 и подготовить проверяемую следующую игру, а не создавать ещё один gate.
- Для статичного лучника нельзя считать движение камеры перемещением героя.
- Из PR #200 переносить только одну игру и сохранять исходный движок точно, без изменения геймплея.
- Делай отложенное объявление __META_BOT__ после инициализации настоящего модуля, а не объявляй API до появления игрового состояния.
- При проверке snapshot-объектов используй глубокое сравнение, а не ссылочное равенство между независимыми вызовами.

## Уточнения
- Автозадача: сначала бери верхнюю свободную задачу из раздела «Очередь для автозадач», отметь её взятой; не получилось за запуск — запиши причину в «Не смог» и бери следующую.

## Сделано
- сделано: PR #258 сведен с актуальным main [e2ee93a](https://github.com/mpaykin1/meta6-lab/commit/e2ee93ab45ffe7258207dac504c417e79d6220dc); B2 успешно проверен [43748112666](https://github.com/mpaykin1/meta6-lab/actions/runs/43748112666). Окончательная приёмка main ещё не выполнена.
- сделано: B2 PR #258 синхронизирован с main без удаления старых тестов — https://github.com/mpaykin1/meta6-lab/commit/1278c996fddd8f464abeed7823e2c21526cbc6fe ; B2 PASS https://github.com/mpaykin1/meta6-lab/actions/runs/43420129986
- сделано: Broken City — отделён read-only API от PR #200, исправлена отложенная установка и добавлены четыре мутационные ловушки — https://github.com/mpaykin1/meta6-lab/pull/291
