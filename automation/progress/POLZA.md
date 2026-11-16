# ПОЛЬЗА — прогресс, версия 3

## Линии
- А (замок): не занимал; новый PR заблокирован установленным лимитом 10 при 49 открытых.
- Б (тишина): занято PR #220 / lab/zadachi-conflicts, 13.11 11:20 UTC; чужую линию не менять.
- В1 (B2, #258): занято, HEAD 010171d0f80e1fe7dbcfab18ed839eade08b793d, обновлено 13.11 11:11 UTC; опубликован B2 PASS по Veil только на старом SHA 00339711, main не закрыт.
- В2: games/archer-in-the-fog занят PR #264 (обновлено 13.11 11:04 UTC); skin-trainer имеет ввод/движение героя, отдельный B2 PR не открывать, пока >10 PR.

## Сделано
- ЧАТ 2026-11-16: ядро #258 эскалировано Claude [коммит 69cf5b5](https://github.com/mpaykin1/meta6-lab/commit/69cf5b5c1533d21522cb7ad46001daf005510c1f), [B2 real-motion PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43802754806), [guard FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/43802754797). Не единица пользы на main.

- ЧАТ 2026-11-16: дефект постоянного layoutHash исправлен по реальной сетке башни [cd5c3b8](https://github.com/mpaykin1/meta6-lab/commit/cd5c3b8d3f5300775d0a476b65a19a27202295f9); добавлены [3 негативные мутации](https://github.com/mpaykin1/meta6-lab/commit/0b209d0641086fc4ced9a8b7f5b32a7bb5f56e6e), [подключены к CI](https://github.com/mpaykin1/meta6-lab/commit/ab83fb4178dfb1918b63255ac14ef238f3ab2a45), [реальная цель-дракон учтена тестом](https://github.com/mpaykin1/meta6-lab/commit/86e6e127c0f46f08983d720d108d5efc09b8eaf1), [OSHIBKI](https://github.com/mpaykin1/meta6-lab/commit/5799c29c9ae1c3d022d983956e5bfce6292ee46d). До зелёного main не единица пользы.

- ЧАТ 2026-11-16: B2 Archer чтение геометрии башни/настоящих координат без симуляции, [SHA 4f9518e](https://github.com/mpaykin1/meta6-lab/commit/4f9518e90e9d08e2ff861cf5c852985b76466c5f), [SHA 77544b3](https://github.com/mpaykin1/meta6-lab/commit/77544b37e74ab42bbd9fffb1c9dcf8e75d0bca3d), [SHA 06762e3](https://github.com/mpaykin1/meta6-lab/commit/06762e3de51ce55c0086e1c25ff2d48646e049cf). Не main, НЕ единица пользы. Занято в [ZANYATO SHA 5cd4cb5](https://github.com/mpaykin1/meta6-lab/commit/5cd4cb5e1df59aa8277a431cf473dc61ad975f2b).

- 2026-11-13T11:31:08.634Z: сохранена общая инструкция v3 в ветке lab/polza-bez-suety-v3-20261113: https://github.com/mpaykin1/meta6-lab/commit/2be9d73a0cec526012119002b3309cf7bffaa407 . Это организационный шаг, НЕ единица пользы.
- 2026-11-13T11:31:08.634Z: переключены пять существующих автозадач MG-строитель-1…4 и MG-ремонтник на единый промпт v3, расписания сохранены; прямые проверки инструмента обновления = success для каждой. Это организационный шаг, НЕ единица пользы.

## Замеры
| UTC | Единиц пользы, подтверждённых зелёным main | Игр с __META_BOT__ | FINISH готово | Открытых PR | Конфликтных | Бот-коммитов за 24 ч | Доля пользы |
| 2026-11-16T13:02Z, чат | 0 — нет нового зелёного main | 1/9 | 7/18 | 30 | 25 | 115 (авторы-боты; все main-коммиты за 24 ч: 160) | 0 подтверждено; 5 задач в резерве до снижения открытых PR до 10 |
|---|---|---|---|---|---|---|---|
| 2026-11-13T11:31:08.634Z | 0 (нет нового зелёного Actions на main) | 1/9 (9 папок games/ без *-copy, индексы просмотрены) | 7/18 | 49 ([PR](https://github.com/mpaykin1/meta6-lab/pulls)) | не измерено | 255 (строгая классификация по имени автора, [commits](https://github.com/mpaykin1/meta6-lab/commits/main/); 525 коммитов всего за скользящие 24 ч) | не измерено |


- 2026-11-13 12:17 UTC, MG-строитель-2: проверены актуальные FINISH.md (7/18), ZANYATO.md, POLZA v3, и index.html игр rainbow-acceleration (blob 8eaae064), skin-trainer (blob 01eacedd). В обоих на main нет `window.__META_BOT__`; `scripts/prohodchik/verify-motion.mjs` на main отсутствует (404). Проверяемый следующий кодовый шаг: сначала перенести/довести verifier из PR #258 без ослабления тестов, затем добавить read-only ручку одной свободной игре и запустить desktop/mobile. Новых PR не создавать при превышении лимита. Единиц пользы в этом запуске: 0; зелёный Action не подтверждён.


- 2026-11-13 17:14 UTC, MG-строитель-2: перепроверены POLZA v3 (в main отсутствует), AGENTS, FINISH, ZANYATO и 50 открытых PR через GitHub Search. PR #258 открыт, mergeable=true по API, меняет 12 файлов (в том числе B2 verifier и workflow); PR #291 уже содержит отдельный адаптер broken-city, поэтому не дублировать работу над игрой. Новые PR запрещены (>10). Подтверждённых новых зелёных Actions на main и B2 desktop/mobile для всех игр нет; пользы 0. Конфликтных PR и бот-коммитов за сутки в этом запуске не измерено.


- 2026-11-13 18:13 UTC, MG-строитель-2: свежий POLZA v3 прочитан из lab (main: 404); AGENTS, FINISH, ZANYATO проверены. GitHub REST `/pulls?state=open&per_page=100`: 50 PR; #258, #264, #291 открыты и имеют mergeable=false (GitHub API); FINISH 7/18. Выбран конкретный кодовый следующий шаг: разрешить конфликт существующего PR #258, не удаляя строки verify/mutate и не изменяя ядро, затем запустить desktop/mobile B2 verifier. Новые PR запрещены. Новых зелёных Actions на main, игровых изменений и подтверждённых B2 PASS за запуск: 0. Бот-коммиты и конфликтные PR полностью не измерены.

- 2026-11-16 12:52 UTC | чат: 0 новых единиц пользы с зелёным main; бот 1/9; FINISH 7/18; открытых PR 30; конфликтных и бот-коммитов/24ч — не проверено; очередь 5 зарезервировано до снижения PR ≤10 / 0 в работе / 0 завершено. [Открытые PR](https://github.com/mpaykin1/meta6-lab/pulls), [FINISH](https://github.com/mpaykin1/meta6-lab/blob/main/rules/09-platforma/FINISH.md).

## Не смог
- 2026-11-16T12:52Z (чат): B2 Archer не закрыт: #264 draft и конфликт main, реальный browser B2 ещё не PASS; #258 реальный B2 Veil PASS, но guard FAILED из-за ядра охраны. [PR #264](https://github.com/mpaykin1/meta6-lab/pull/264), [PR #258](https://github.com/mpaykin1/meta6-lab/pull/258).

## Очередь для автозадач
- [ ] СВОБОДНА ПОСЛЕ КВОТЫ (<11 открытых PR): Three Worlds `three-worlds-game/ash-archipelago.mjs` → `shared/components/three-worlds-ash-archipelago/{component.json,entry.js}`, `shared/index.json`; точный SHA blob `fec149c120cf9bf747f4b883c960175a833fe143`. Образец слит [#50](https://github.com/mpaykin1/meta6-lab/pull/50); `node scripts/shared/build-index.mjs && node scripts/shared/build-index.mjs --check && node --check shared/components/three-worlds-ash-archipelago/entry.js`; ждать `verified, deduplicated owner-approved shared components`; PR `ПОЛЬЗА: FINISH L1`. Только точные оригинальные байты, не менять оригинал.
- [ ] СВОБОДНА ПОСЛЕ КВОТЫ: Three Worlds `three-worlds-game/dialogue.mjs` → `shared/components/three-worlds-dialogue/{component.json,entry.js}`, `shared/index.json`; blob `a9680a2b81c5fccd8208f0a77901531920d4bc1e`; образец [#50](https://github.com/mpaykin1/meta6-lab/pull/50); `node scripts/shared/build-index.mjs && node scripts/shared/build-index.mjs --check && node --check shared/components/three-worlds-dialogue/entry.js`; ждать `verified, deduplicated owner-approved shared components`; PR `ПОЛЬЗА: FINISH L1`. Не брать параллельно предыдущей задаче: единый индекс.
- [ ] СВОБОДНА ПОСЛЕ КВОТЫ: Three Worlds `three-worlds-game/guest-roster.mjs` → `shared/components/three-worlds-guest-roster/{component.json,entry.js}`, `shared/index.json`; blob `adbc01eea15adb282bd8a3153d70c19efb7ef6f4`; образец [#50](https://github.com/mpaykin1/meta6-lab/pull/50); `node scripts/shared/build-index.mjs && node scripts/shared/build-index.mjs --check && node --check shared/components/three-worlds-guest-roster/entry.js`; ждать `verified, deduplicated owner-approved shared components`; PR `ПОЛЬЗА: FINISH L1`. Только после слияния предыдущей.
- [ ] СВОБОДНА ПОСЛЕ КВОТЫ: Three Worlds `three-worlds-game/keeper-bubble.mjs` → `shared/components/three-worlds-keeper-bubble/{component.json,entry.js}`, `shared/index.json`; blob `3b0e3e1db24f9f88630fea85f6c70bd843251a15`; образец [#50](https://github.com/mpaykin1/meta6-lab/pull/50); `node scripts/shared/build-index.mjs && node scripts/shared/build-index.mjs --check && node --check shared/components/three-worlds-keeper-bubble/entry.js`; ждать `verified, deduplicated owner-approved shared components`; PR `ПОЛЬЗА: FINISH L1`. Только после слияния предыдущей.
- [ ] СВОБОДНА ПОСЛЕ КВОТЫ: Three Worlds `three-worlds-game/seabed.mjs` → `shared/components/three-worlds-seabed/{component.json,entry.js}`, `shared/index.json`; blob `835fcf880117d0dad50e7a5561078569a62edd46`; образец [#50](https://github.com/mpaykin1/meta6-lab/pull/50); `node scripts/shared/build-index.mjs && node scripts/shared/build-index.mjs --check && node --check shared/components/three-worlds-seabed/entry.js`; ждать `verified, deduplicated owner-approved shared components`; PR `ПОЛЬЗА: FINISH L1`. Только после слияния предыдущей.
- Запрет: пять компонентов одного источника НЕ оформлять пятью параллельными PR; правило «по игре на PR». При квоте или приоритете B2 выше L1 этот блок только резерв, а не исполняемая очередь.

## Уроки
- 2026-11-16 чат: свыше 30 коммитов подтверждён счётчиком GitHub: 115/160 за 24 ч, основная нагрузка status-dlya-claude (45) и zadachi-watch (29); новый game-only PR не создаём до очереди ≤10. Нулевая польза — отказ от расширения документов; следующий подход: завершать существующий B2 и снимать guard-блокер у Claude.

- ЧАТ: хеш первой башни вычислять по геометрии blocks, а не по постоянному origin/size; проверять одну изменённую грань мутацией, не выпускать ложный «без повторов».
- ЧАТ: B2 стратегия обязана реально попадать по дракону; прежний full bot [FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/43869619771) из-за 20 с без progress. Нельзя увеличивать stuckSec или помечать PASS.

- ЧАТ 2026-11-16: считать полезным только зелёный main, не считать новый статус готовности по кодовым коммитам в draft #264; PR #258 B2 success не означает FINISH B2 для каталога.

- Не объявлять B2 зелёным для всех игр после прогона одной: подтверждение для Veil не означает готовность девяти игр.
- Не начинать одновременно с активным исполнителем; ветка PR #258 и Archer #264 обновлены менее трёх часов назад.
- Не создавать 50-й PR при лимите 10: сначала безопасно устранить затор через свободную линию Б.
- Не выдавать число bot-коммитов за точную авторизацию: считать по авторам, помечать критерий.

- GitHub Search сейчас возвращает 50 открытых PR; прежнее число 49 не использовать без повторной проверки.

## Уточнения
- Автозадача: сначала бери верхнюю свободную задачу из раздела «Очередь для автозадач», отметь её взятой; не получилось за запуск — запиши причину в «Не смог» и бери следующую. Пока PR >10, новую ветку/PR не создавать.

- Фактически games/ содержит 11 папок, из них 2 *-copy; в девяти разных index.html на main только veil-terraces включает __META_BOT__. В новых замерах указать N=9.
- Непринятый B2 verifier находится в PR #258 (ветка lab/prohodchik-b2-motion-20261111), отсутствует в main; не писать B2_MOTION_PASS до настоящего desktop/mobile Chromium.
- Пять автозадач сейчас читают канонический промпт из отдельной ветки lab/polza-bez-suety-v3-20261113, чтобы избежать запрещённого прямого пуша документов в main.
