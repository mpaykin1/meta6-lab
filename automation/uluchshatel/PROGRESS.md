# Улучшатель игр — прогресс

Обработано до: main `8cb7ccd856e122fa9da6e307c2f8719dc956d933`; 2026-11-11T14:19:59.042Z.

## Текущий круг
- 2026-11-11T14:19:59.042Z — вход: `automation/uluchshatel/PROGRESS.md` отсутствовал. Создан в рабочей ветке.
- 2026-11-11T14:19:59.042Z — тренировочная игра `games/skin-trainer`, правило №13 (бот-ручка): НЕ ЗАХВАЧЕНА.
  Блокер: открытые PR [#203](https://github.com/mpaykin1/meta6-lab/pull/203) и
  [#210](https://github.com/mpaykin1/meta6-lab/pull/210) меняют `games/skin-trainer/index.html`.
  Последний коммит в game на main: `4a1f60140e3b5b57fc29a5a18eaf4f361b8b73d2`
  от 2026-11-10T04:07:51Z. Не делать параллельную правку.
- 2026-11-11T14:19:59.042Z — улучшение способа, пункт а: сохранить промпт и добавить предохранитель от конкурентных PR.
  Статус: в работе; до зелёного Actions и проверки реальной игры статус правила не менять.

## Выполненные пары «игра × правило»
Нет подтверждённых пар (PR, точный SHA, зелёный Actions обязательны).

## Саморазвитие — очередь
- [ ] а) `automation/prompts/ULUCHSHATEL.md`: повторяемый промпт.
- [ ] б) рецепты `rules/09-platforma/RECEPTY/<номер>.md`.
- [ ] в) общие модули только после двух одинаковых реализаций.
- [ ] г) матрица игр × 14 правил, только по подтверждённому коду.
- [ ] д) измеритель гармоничных/дисгармоничных звуков.
- [ ] е) проверка чередования открытий.

## Урок
Наличие игры в `ZANYATO.md` не заменяет проверку изменённых файлов **всех открытых PR**:
до захвата читать PR/files, затем блокировать запись в игру до разрешения конфликтов.

## Итог текущего шага — 2026-11-11T14:29:05.126Z
- Саморазвитие (а): `automation/prompts/ULUCHSHATEL.md` создан,
  проверка конфликтов `scripts/uluchshatel/preflight.mjs` создана с 12 сценариями
  и 4 мутациями; [PR #260](https://github.com/mpaykin1/meta6-lab/pull/260).
- Алгоритм из PR: 8 прямых сценариев и 4 сценария с намеренными искажениями
  проверены в JS-изоляте; **это не Actions PASS**. Настоящий запуск Node и CI
  всё ещё требует подтверждения на HEAD PR.
- STOROZHA отклонил добавление защищённого workflow:
  [красный run 43038459899](https://github.com/mpaykin1/meta6-lab/actions/runs/43038459899).
  Файл удалён [коммитом 2d38e8cbbb1eb0056e08c7805301a15c9f6521cc](https://github.com/mpaykin1/meta6-lab/commit/2d38e8cbbb1eb0056e08c7805301a15c9f6521cc).
  Нового workflow в итоговом diff нет.
- Тренировочная игра осталась без изменений. Правило №13 НЕ внесено,
  боевой тест, мобильный FPS p95 и META BOT не запускались.
- Следующая попытка: только после освобождения `games/skin-trainer`
  или появления уже существующей свободной `*-copy`, и только после
  зелёных `verify` + `mutate` на Actions.

## Урок 2
Новый файл в `.github/workflows/**` также защищён. Не создавать
его самостоятельно даже ради собственных тестов; запросить у Claude
подключение команд к доверенному Actions-процессу, не ослабляя STOROZHA.


## Цикл 2026-11-12T10:27:59.359Z: блокировка скрытого пересечения PR по файлам

- Восстановлен пропущенный блокер: открытый [PR #234](https://github.com/mpaykin1/meta6-lab/pull/234) изменяет `games/broken-city-copy/index.html`, хотя его заголовок не содержит имя игры.
- Попытка `games/broken-city-copy × №13` [PR #276](https://github.com/mpaykin1/meta6-lab/pull/276) **закрыта без слияния** после обнаружения пересечения. Правило не засчитывается, игровой результат не опубликован. Захват освобождён: [ZANYATO](https://github.com/mpaykin1/meta6-lab/commit/009501933d25be60fb13349ca0510b34330dc9f5) и [ZADACHI](https://github.com/mpaykin1/meta6-lab/commit/cb1ce070300a94ed4184d8f0584ae8d0f85870c8).
- Саморазвитие а), усиление раннего захвата: общий `paginate.mjs` [17e679b](https://github.com/mpaykin1/meta6-lab/commit/17e679b28b3287bae71d17eb3a95c901024c55fa), проверка 101 PR и 101 файлов [fed9811](https://github.com/mpaykin1/meta6-lab/commit/fed9811acae9ddd5f6589e70e1d7f64aeb5c8b05), 4 мутации, включая обман с исчезновением PR #234 [3e79a82](https://github.com/mpaykin1/meta6-lab/commit/3e79a821f9479e8861264619dec2ee0b30c88543), подключено к прежним `verify-preflight`/`mutate-preflight`. [PR #260](https://github.com/mpaykin1/meta6-lab/pull/260).
- Урок: **запрещено** выбирать свободную игру по названию PR или выборочно просмотренным PR; сначала полный пагинированный список изменённых файлов каждого открытого PR с ошибкой при неполных данных. Даже при срочности не начинать игровую правку, если проверка недоступна.
- Статус: ни одна новая пара «игра × правило» не подтверждена; зелёный Actions на последнем SHA #260 и реальные мобильные/ПК/FPS/META BOT проверки ещё не подтверждены. RULES_CHECKLIST **не менять**.

## Продолжение 2026-11-12T14:28:35.581Z — ловушка на переименование игры

- Игровая пара: `games/sumerki-i-pepel-2-copy × №13` остаётся в [PR #272](https://github.com/mpaykin1/meta6-lab/pull/272). На HEAD `9178386cbff6b86ced2b237b26516f5e74106783` KONTUR Guard, META BOT и браузерная проверка зелёные, но [LAB focused META BOT #43186923586](https://github.com/mpaykin1/meta6-lab/actions/runs/43186923586) красный (Chromium CDP touch: page/browser closed); [квота #43186923330](https://github.com/mpaykin1/meta6-lab/actions/runs/43186923330) красная. FPS p95, 390×844 touch и полная проходимость не подтверждены, правило не засчитывается.
- Саморазвитие а), [PR #260](https://github.com/mpaykin1/meta6-lab/pull/260): ранний захват теперь проверяет `filename` **и** `previous_filename` для переименований; переименование исходника игры в другую папку больше не скрывает пересечение. Код [0811fed3f38215d42bd08d6f1ee87d5f12cbf16f](https://github.com/mpaykin1/meta6-lab/commit/0811fed3f38215d42bd08d6f1ee87d5f12cbf16f), подключение [78fb6f2e8f319eddb50fd99368ba972f2538bc9b](https://github.com/mpaykin1/meta6-lab/commit/78fb6f2e8f319eddb50fd99368ba972f2538bc9b), проверка [a3b6bcc23db107a04eff69216f82b4d7a445eeb4](https://github.com/mpaykin1/meta6-lab/commit/a3b6bcc23db107a04eff69216f82b4d7a445eeb4), 3 новые мутации [608e0a99ee260055baee33075c2025908e721004](https://github.com/mpaykin1/meta6-lab/commit/608e0a99ee260055baee33075c2025908e721004). Проверки Actions на итоговом HEAD ещё не подтверждены.
- Урок: GitHub сообщает при `status=renamed` два пути; одного `filename` недостаточно. Правило для следующего круга — проверять оба имени с fail-closed при пропущенном `previous_filename`, включая вторую страницу списка файлов.
- На 5 играх с заполненным статусом в RULES_CHECKLIST: подтверждённо сделано по старому срезу 10/70; 60/70 не подтверждены (включая частичные и неопределённое №14). Новых подтверждённых пар в этом цикле: 0.

## Цикл 2026-11-13T03:41:03.291Z — захват без PR через ZADACHI

- Игра × правило: тренировочные `skin-trainer × №13` заняты [#203](https://github.com/mpaykin1/meta6-lab/pull/203) и [#210](https://github.com/mpaykin1/meta6-lab/pull/210); `broken-city-copy × №13` пересекается с [#234](https://github.com/mpaykin1/meta6-lab/pull/234); `sumerki-i-pepel-2-copy × №13` исчерпала 2 попытки [#272](https://github.com/mpaykin1/meta6-lab/pull/272). **Игровые файлы не изменены; новое правило не засчитывается.**
- Саморазвитие (а), [PR #260](https://github.com/mpaykin1/meta6-lab/pull/260): до захвата дополнительно читается таблица `ZADACHI.md` и блокируются строки незакрытых чужих задач без PR. Реализация [d0131cf0ab4a0161ecac8f54cb25f2bb9e8dd4dd](https://github.com/mpaykin1/meta6-lab/commit/d0131cf0ab4a0161ecac8f54cb25f2bb9e8dd4dd) + [0e4fdbeba6e0f35799a62e654cab9a088f7aadae](https://github.com/mpaykin1/meta6-lab/commit/0e4fdbeba6e0f35799a62e654cab9a088f7aadae).
- Ловушки: [verify-task-locks.mjs](https://github.com/mpaykin1/meta6-lab/commit/a24cec5581863558d3f35aaad1bb9aa913d8c83a) и [mutate-task-locks.mjs](https://github.com/mpaykin1/meta6-lab/commit/3947e27489b5194dab2041c9469e72280bbb6450) с 3 мутациями; запуск включён в прежние [verify-preflight](https://github.com/mpaykin1/meta6-lab/commit/9fcbb06c24ad9e25253174d9554c1f672080ffe9) и [mutate-preflight](https://github.com/mpaykin1/meta6-lab/commit/2af207529021b9d30068e1b4fcbcba703fb010ed). Журнал ошибки [#42](https://github.com/mpaykin1/meta6-lab/commit/52d7a0953bd2f31ac254fe9e643c54db412b9647).
- На предыдущем HEAD #260: [KONTUR Guard зелёный](https://github.com/mpaykin1/meta6-lab/actions/runs/43239153686), [STOROZHA красный](https://github.com/mpaykin1/meta6-lab/actions/runs/43239153681): GitHub API HTTP 403 rate limit. На новом HEAD CI, ПК/телефон, FPS p95 и бот-прохождение пока **не подтверждены**.
- Матрица пяти игр со статусами в `RULES_CHECKLIST.md`: **10/70 сделано, 60/70 осталось** (частичные считаются незавершёнными); нет новых подтверждённых пар.
- Урок: запись `ZADACHI.md` до первого PR — полноценный замок. Следующий запуск обязан читать обе таблицы замков и все файлы открытых PR; при HTTP 403 отказывать в захвате без обхода.


### 13.11: синхронизация с автоматически обновляемой таблицей
Сохранена точная свежая таблица main, чтобы старые статусы не конфликтовали с ZADACHI watch. Уникальная историческая формулировка прежней строки перенесена сюда без потери ссылок:

| 🛑 ЗАВИС 6+ ч — ТОЛКНУТЬ | Улучшатель: восстановить PR #260 после расхождения с main; тренировка заблокирована, Кто: улучшатель · История ветки до синхронизации: НУЖЕН CLAUDE: Улучшатель — защита ZADACHI до PR; [SHA 90465ba6](https://github.com/mpaykin1/meta6-lab/commit/90465ba637f5b99f9404a7d8f4bd72e39be87336), [STOROZHA green](https://github.com/mpaykin1/meta6-lab/actions/runs/43360672931), KONTUR на HEAD не подтверждён | МГЛ | чат ChatGPT: проверяющий, ремонт конфликта | `lab/uluchshatel-preflight-20261111` | [#260](https://github.com/mpaykin1/meta6-lab/pull/260) | 2026-11-13 10:20 | 2026-11-13 03:44 |
