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

## Продолжение 2026-11-12 — ветка `lab/uluchshatel-sumerki-copy-bot13-20261112`
- Источник предыдущего круга: [PR #260](https://github.com/mpaykin1/meta6-lab/pull/260), в main файл PROGRESS.md пока отсутствует. Предыдущие завершённые пары: **0**.
- Проверка захвата: `games/skin-trainer` занят [#203](https://github.com/mpaykin1/meta6-lab/pull/203) и [#210](https://github.com/mpaykin1/meta6-lab/pull/210); `broken-city-copy` пересекается с [#234](https://github.com/mpaykin1/meta6-lab/pull/234). Выбрана существующая свободная `games/sumerki-i-pepel-2-copy`, последний коммит [937f76d0d0ef873a0c86cf68a79305275a657370](https://github.com/mpaykin1/meta6-lab/commit/937f76d0d0ef873a0c86cf68a79305275a657370) от 2026-11-09T14:36:42Z; другие открытые PR её не затрагивают (проверка изменённых путей 52 PR). Захват ZADACHI и ZANYATO в main: [b8efc2d96a1a7403aff4a2f129095cb69002bee9](https://github.com/mpaykin1/meta6-lab/commit/b8efc2d96a1a7403aff4a2f129095cb69002bee9), [89ab94b83e38f378ede2932c10572aba3b659935](https://github.com/mpaykin1/meta6-lab/commit/89ab94b83e38f378ede2932c10572aba3b659935).
- Меняется: только тренировочная копия × правило №13 (read-only состояние героя/цели/уровня). Не трогаются: герой, 25 зарегистрированных видов оружия, управление, камера, физика, лор, шейдеры и ассеты.
- Исходник `games/sumerki-i-pepel-2-copy/index.html`, blob `90d83a77049e8edb7aab847ecbbf4e9723a3c2e5`; опись [docs/INVENTORY_sumerki-i-pepel-2-copy.md](../../docs/INVENTORY_sumerki-i-pepel-2-copy.md) из кода: 141 статическое определение → 141, потеряно 0; пакетов 5 → 5, GLSL-маркеров 49 → 49, звуковых регистраций 10 → 10, типов оружия 25 → 25.
- 2026-11-12 UTC: наблюдатель `window.__META_BOT__` без управляющих методов добавлен [053c953d3cc99938baf67f1c0100a042cc7280a1](https://github.com/mpaykin1/meta6-lab/commit/053c953d3cc99938baf67f1c0100a042cc7280a1), загрузка в конце исходной игры [47195073b97d409703c590d60aef2f0ff0f1d155](https://github.com/mpaykin1/meta6-lab/commit/47195073b97d409703c590d60aef2f0ff0f1d155). После удаления добавленного script-тега содержимое HTML строго равно main: проверено сравнением строк. Игровых методов не добавлено, рекламных SDK нет.
- 2026-11-12 UTC: проверка состояния [35bc719f80fb38c63084b08ba34de614c4b8a9b9](https://github.com/mpaykin1/meta6-lab/commit/35bc719f80fb38c63084b08ba34de614c4b8a9b9), 3 мутации включая обман [a776987ac9eb616329688569bc75a08c93118dc2](https://github.com/mpaykin1/meta6-lab/commit/a776987ac9eb616329688569bc75a08c93118dc2), генератор описи [62f7bacf44068f8a00a8e3e86139ca06ce66dc6a](https://github.com/mpaykin1/meta6-lab/commit/62f7bacf44068f8a00a8e3e86139ca06ce66dc6a), снимок описи [457ccad6979d78a76855d40364a16264d583544a](https://github.com/mpaykin1/meta6-lab/commit/457ccad6979d78a76855d40364a16264d583544a).
- Три мутации пойманы в локальном JS-изоляте: null goal, поддельная координата Y, модификация G.kills при state(). **Не равно GitHub Actions PASS.** Требуются зелёные verify+mutate на Actions, браузер ПК/390×844 touch, контроль FPS p95 и реальная проходимость ботом. Статус №13 в RULES_CHECKLIST.md **не изменён**.

### Урок 3
Если тренировочная игра занята, использовать уже существующую `*-copy` только после полного чтения затрагиваемых путей открытых PR; исходный HTML сохранять идентичным, меняя лишь подключение read-only модуля, а отсутствие live-замера честно фиксировать.

## Точки продолжения текущего круга
- Игра × №13: [PR #272](https://github.com/mpaykin1/meta6-lab/pull/272) (draft, только техническое предложение); контрольный GitHub Actions KONTUR Guard [run 43173846309](https://github.com/mpaykin1/meta6-lab/actions/runs/43173846309), META BOT [run 43173846087](https://github.com/mpaykin1/meta6-lab/actions/runs/43173846087), браузер [run 43173846299](https://github.com/mpaykin1/meta6-lab/actions/runs/43173846299) — на момент записи не подтверждены зелёными. Не отмечать пару выполненной, пока CI не завершился и нет полного сравнения FPS и прохождения.
- Саморазвитие (б): отдельный [PR #273](https://github.com/mpaykin1/meta6-lab/pull/273) с `rules/09-platforma/RECEPTY/13.md`, `verify-recipe-13.mjs`, `mutate-recipe-13.mjs`. KONTUR Guard [run 43174281209](https://github.com/mpaykin1/meta6-lab/actions/runs/43174281209) на момент записи ещё не подтверждён зелёным. Пункт (а) — [PR #260](https://github.com/mpaykin1/meta6-lab/pull/260), тоже без принятого зелёного финала.
- Следующий шаг: проверить **текущий HEAD каждого PR**, результаты требуемых Actions, исправить подтверждённые сбои (не больше 2 реальных попыток). Затем live-проверка ПК + 390×844 touch, FPS p95 и проходимость. Только после этого обновлять статус и просить Claude перенести защищённые изменения.

- 2026-11-12 UTC — усилена автоматическая проверка: мутационный запуск KONTUR теперь **сначала** вызывает `verifyFiles()` (SHA-256 сохранённого оригинала, реальная загрузка наблюдателя, отсутствие рекламы и read-only сценарии), затем 3 искажения. [Коммит af4888d530715168f78573f7738387db5a24cad9](https://github.com/mpaykin1/meta6-lab/commit/af4888d530715168f78573f7738387db5a24cad9). Результат Actions на этом SHA ещё не подтверждён; FPS/прохождение не измерены.
