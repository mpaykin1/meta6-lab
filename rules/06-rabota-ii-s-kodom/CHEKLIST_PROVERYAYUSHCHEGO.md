# ЧЕК-ЛИСТ ПРОВЕРЯЮЩЕГО (живой файл — его улучшает цикл развития)

Правило: [MNOGORAZOVYE_PROMPTY.md](MNOGORAZOVYE_PROMPTY.md). Каждый пункт — вопрос, на который проверяющий отвечает по каждому PR. Рядом — откуда пункт взялся (SHA/PR) и где ловушка. Пункт, который ни разу ничего не поймал, можно убрать с обоснованием.

| № | Вопрос | Откуда | Ловушка |
|---|---|---|---|
| 1 | Бот на GITHUB_TOKEN пушит в ветки PR? (такой пуш не запускает CI — PR остаётся без проверок) | d1d9910 (Claude, 11.11) | verify-storozha.mjs: NO_HEAD_PUSH |
| 2 | Скрипт делает REST-запрос на каждый PR/коммит? (лимит 1000/час; списки — одним GraphQL, все страницы) | [5acb771](https://github.com/mpaykin1/meta6-lab/commit/5acb77140d3b050fc64bb227f1bee1fc1cf96e32) (Claude, 11.11) | `scripts/lovushki/mutate-storozha-gh-list.mjs` (8 мутаций) |
| 3 | Расписание чаще раза в час у нескольких workflow сразу? (совместно выедают лимит API) | d1d9910 | — нужна |
| 4 | Изменение «чинит» игру, ослабляя бота, тест, порог или охранника? | KONTUR К1–К12 | kontur-guard |
| 5 | В игре есть код, который ведёт себя для бота иначе, чем для человека? | «Зелёный судья», 11.11 | — нужна |
| 6 | При конфликте журнала потеряны строки одной из сторон? | DLYA_CLAUDE CONFLICTS | — нужна |
| 7 | Утверждение в отчёте без ссылки на SHA/прогон/PR? | правило владельца | report-guard |
| 8 | Удалена или переименована чужая работа, чтобы «просто собралось»? | OSHIBKI №15 (rsync --delete) | — нужна |
| 9 | Если HTML имеет HTTP 200, все ли его same-origin JS/CSS/изображения/аудио тоже имеют HTTP 200? | OSHIBKI №1002, PR #246 | scripts/lab/mutate-page-assets.mjs (3 мутации + HTML200/JS404) |
| 13 | Список PR при HTTP 403, `GraphQL.errors` или пропущенной дате коммита прекращает работу с ошибкой, а не возвращает ложное «всё нормально»? | [OSHIBKI #45](../../OSHIBKI.md), [5acb771](https://github.com/mpaykin1/meta6-lab/commit/5acb77140d3b050fc64bb227f1bee1fc1cf96e32) | `scripts/lovushki/mutate-storozha-gh-list.mjs` |
| 14 | Если список PR превышает 20 страниц, происходит явный отказ без усечения? GraphQL запрашивает только OPEN/main и корректно продвигает cursor? | [OSHIBKI #44](../../OSHIBKI.md), [7d06c9c](https://github.com/mpaykin1/meta6-lab/commit/7d06c9c868667349b6540f58fce0908ba66d4777) | `scripts/lovushki/mutate-storozha-pagination-cap.mjs` (6 мутаций) |
| 15 | Закрытие устаревшего PR сохраняет запись о блокировке **до** PATCH close, заново сверяет HEAD и возраст, не удаляет ветку? | [PR #238](https://github.com/mpaykin1/meta6-lab/pull/238), [OSHIBKI #46](../../OSHIBKI.md) | `scripts/lovushki/mutate-storozha-safe-close.mjs` (5 мутаций) |
| 16 | Запись в `DLYA_CLAUDE.md` действительно дождалась GitHub PUT, защищена blob SHA и при HTTP 403 не считается успешной? 409/422 повторяют чтение свежего SHA; комментарий с `await` не засчитывается как код? | [OSHIBKI #47](../../OSHIBKI.md), [48ebf2c](https://github.com/mpaykin1/meta6-lab/commit/48ebf2c9f4f4139e0ef50d396ac01ea3ee7f41ed) | `scripts/lovushki/mutate-storozha-durable-write.mjs` (5 мутаций) |
| 17 | При обновлении `DLYA_CLAUDE.md` не удаляются ли чужие блоки, owner notes и записи PR? Повтор операции идемпотентен; половинные маркеры вызывают ошибку? | [OSHIBKI #48](../../OSHIBKI.md), [5801a35](https://github.com/mpaykin1/meta6-lab/commit/5801a35593ed3eb702b1477dd7e32bb03117895a) | `scripts/lovushki/mutate-storozha-journal-preservation.mjs` (5 мутаций) |
| 18 | Квота игнорирует отсутствующие и будущие даты коммитов, исключает PR ровно 72 часа назад, выбирает пять старейших и сохраняет исключения для старых PR и `lab/remont-main-*`? | [OSHIBKI #49](../../OSHIBKI.md), [64ff122](https://github.com/mpaykin1/meta6-lab/commit/64ff1229952613e62c2b260d447bc496f256f75b) | `scripts/lovushki/mutate-storozha-quota-timestamp.mjs` (7 мутаций, обман) |

| 19 | Проверка закрытия заброшенного PR не принимает будущую, отсутствующую или испорченную дату HEAD и не сдвигает ровно 72-часовую границу? Не обходится ли номер PR хардкодом? | [OSHIBKI #50](../../OSHIBKI.md), [c577705](https://github.com/mpaykin1/meta6-lab/commit/c577705a58d6becae49577a84695a336c35b8092) | `scripts/lovushki/mutate-storozha-stale-clock.mjs` (4 мутации) |

| 20 | Если PR добавляет новую папку `reference/`, содержит ли он **только** файлы `added` в одной ранее не существовавшей папке? Блокируются ли изменения существующих `reference/`, workflow, сторожей и вложенных тестов? | [OSHIBKI #51](../../OSHIBKI.md), [f3a6637](https://github.com/mpaykin1/meta6-lab/commit/f3a663757931eb80f6596d172b14cd57eb3381ad) | `scripts/lovushki/mutate-storozha-reference-boundary.mjs` (7 мутаций) |

| 21 | Запускаются ли все прежние ловушки на свежем main до добавления новых? Отличается ли ошибка подготовки мутации от обнаружения дефекта, однозначна ли цель среди похожих функций и комментариев? | [OSHIBKI #52](../../OSHIBKI.md), [исправление на подпись](https://github.com/mpaykin1/meta6-lab/commit/dc3dec13a006a8d7d90388462495998c90721d10) | scripts/lovushki/mutate-quota-mutation-target.mjs: broad-target, wrong-function, comment-cheat |

| 22 | При одинаковом `created_at` для нескольких живых PR квота выбирает старейшие пять детерминированно (номер PR как tie-break), независимо от порядка GraphQL/API, не поддаётся hardcode одного диапазона и не теряет приоритет времени? | [OSHIBKI #53](../../OSHIBKI.md), [ffa2d35](https://github.com/mpaykin1/meta6-lab/commit/ffa2d35beb05ed11856d0cbb6705384852de5ff9) | `scripts/lovushki/mutate-storozha-quota-tie-break.mjs` (4 мутации; Actions ещё не подтверждён) |
