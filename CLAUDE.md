## КОНЕЧНАЯ ЦЕЛЬ ПРОЕКТА META GAMES — сверяться в каждом чате

Прочитать [rules/09-platforma/META_GAMES_PLATFORM.md](rules/09-platforma/META_GAMES_PLATFORM.md): склад и конструктор игр, автоулучшение всех игр по правилам с ChatGPT, бот-проходчик уровней, проверка Claude, журнал решений владельца (§11).

## БЕЗ РЕКЛАМЫ — игры META GAMES без встроенной рекламы (07.11.2026)

Все версии игр в META GAMES (веб-каталог, Android, Steam) публикуются без рекламного кода, рекламных SDK и наград «за рекламу». Реклама — только в отдельных версиях для Playgama. Полное правило: [rules/09-platforma/BEZ_REKLAMY.md](rules/09-platforma/BEZ_REKLAMY.md).

## ОТЧЁТ ВЛАДЕЛЬЦУ — только «Осталось сделать» (07.11.2026)

В чате владельцу ChatGPT, Codex и Claude пишут только список того, что ещё не готово, и что мешает. Сделанное не перечислять — оно в PR, прогонах и LAB_QUEUE. Всё готово — «Осталось: ничего». Полное правило: §5 [rules/06-rabota-ii-s-kodom/OTCHETY_DLYA_CLAUDE.md](rules/06-rabota-ii-s-kodom/OTCHETY_DLYA_CLAUDE.md).

## ОТЧЁТЫ ДЛЯ CLAUDE — все результаты видны на GitHub (07.11.2026)

Каждая работа ChatGPT и агентов — PR со свежим описанием, прогон Actions с понятной причиной провала, карточка LAB_QUEUE. Ничего важного только в чате. Полное правило: [rules/06-rabota-ii-s-kodom/OTCHETY_DLYA_CLAUDE.md](rules/06-rabota-ii-s-kodom/OTCHETY_DLYA_CLAUDE.md).

## META GAMES — обязательный закрытый список источников (06.11.2026)

Для создания новых игр META GAMES повторно использовать игровые ассеты и код разрешено из пяти исходных эталонов **и всех игр Claude**: Twilight Island (`observer-world-en-v7/`), Ashen Path (`ashen-sumerek/`), Underwater World (`underwater-world/`), Three Worlds (`three-worlds-game/`), Veil Terraces (`meta-games-worlds/veil-terraces/`). **Все созданные и загруженные Claude игры автоматически становятся дополнительными эталонами и кода, и ассетов (уже существующие и будущие), с проверкой происхождения и прав сторонних компонентов.** Полное обязательное правило: [rules/06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md](rules/06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md).

Для автозадач действует automation/prompts/chatgpt-autotask.md: отчёты, новые тесты, handoff и evidence запрещены; требования GRAF, abyss.md, evolve.md и других файлов о тестах, отчётах, evidence и gate к автозадачам не применяются
## ЧИСТЫЙ ЭКРАН — никаких лишних надписей в игре (обязательно, все игры, 2026-10-31)

На экране игры остаётся **только графика и кнопки управления**. Всё остальное спрятано в меню, кнопка меню — **в правом верхнем углу** (иконка ☰).
1. Запрещены на игровом экране: заголовки и названия игры, счётчики и подписи, подсказки управления, всплывающие тосты и сообщения, предупреждения текстом, надписи на кнопках («Сонар», «Выйти», «Каталог»…). Кнопки — только пиктограммы (aria-label обязателен), см. graf.md §26.
2. Состояние показывается графикой: вспышка, свечение, цвет, виньетка, кольцо заряда на кнопке, маяк в мире — не текстом.
3. В меню (☰, правый верхний угол): продолжить, режимы, управление (подсказки клавиш и жестов), находки/счёт, каталог, выход. Текст допустим только внутри открытого меню и его подэкранов.
4. Загрузочный экран — без текста, только полоса загрузки. Текст ошибки показывать, только если игра не запустилась.
5. При любой правке игры проверить: в игровом режиме на экране нет ни одного видимого текстового узла, кроме открытого меню.

## REUSE — сначала найди готовое, потом пиши (обязательное правило для всех AI)

Перед написанием любого кода **сначала найди в репозитории готовую реализацию** в играх владельца — «Остров сумерек» = ТОЛЬКО версия владельца: https://claude.ai/code/artifact/b94ef394-100a-4e31-83f2-b52447e074ea (копии в репозитории `island-sumerek-biomes` и `observer-world-*` — другие ветки, они НЕ эталон), «Затонувший город» (`underwater-world/`, `reference/sunken-city/`, `three-worlds-game/models/`), «Пепельный путь» — и **переиспользуй её без переписывания**: бой, 21 оружие, камеру, управление, врагов, модели, звук. Новый код пиши только там, где нигде нет готового. Дублировать уже работающее запрещено; вместо этого подключай или переноси исходный код как есть. Принятые версии не ломать.

## ИСТОЧНИК ОТ ВЛАДЕЛЬЦА — главнее всего

Если владелец дал ссылку на артефакт или файл, это ЕДИНСТВЕННЫЙ источник. Запрещено подменять его «похожей» версией из репозитория или памяти. Перед началом работы: прочитать именно эту ссылку и в первой строке ответа написать, какой источник взят и 3 его отличительных признака (например: выбор героя, реликвии, жители). Если ссылку прочитать не удалось, остановиться и сообщить, а не брать другую версию. После работы сверить результат с этими признаками.

## ПЕРЕНОС МИРОВ — переносить ВСЁ, ничего не пересоздавать

Когда мир/биом/персонажа из одного артефакта или игры переносят в другую, берутся ИСХОДНЫЕ файлы (.glb, showcase.json, текстуры, звуки) целиком, через копирование файлов из исходного артефакта. Запрещено заменять их перекраской текстур, процедурными «похожими» объектами или общим генератором.
Перед началом: составить список всего, что есть в источнике (постройки, существа, рыбы, транспорт, батискаф, свет, звук). После переноса: сверить список по пунктам и в отчёте написать, что перенесено, чего нет. «Готово» писать только когда в списке не осталось пропусков.

## ПЕРЕЧЕНЬ ОБЪЕКТОВ — только из открытого источника, не по памяти

Список объектов, персонажей, оружия, моделей и эффектов любой игры составляется ТОЛЬКО после того, как источник открыт и прочитан целиком в этой сессии (артефакт через Artifact read, файлы через чтение/grep/скрипт). Запрещено составлять список по памяти, по «заметкам» или по прошлым чатам.
Список вытаскивать скриптом из самого источника (ключи в showcase.json, имена .glb, таблицы вроде WEAPONS/FOE/BIOME_DEFS, тайлы), а не пересказывать. Сохранить результат файлом docs/INVENTORY_<игра>.md с датой, id/ссылкой источника и числом пунктов по каждой категории.
Фразы «проверьте по оригиналу», «возможно не всё» и «список по заметкам» запрещены: проверка — работа агента, не владельца. В отчёте писать числа: «в источнике N, перенесено N, не перенесено M — вот что и почему».

## НОВЫЙ УРОВЕНЬ — сначала инвентаризация всего, что уже есть (обязательно, все игры)

Перед тем как рисовать или добавлять новый уровень, локацию, комнату или этап в любой игре, агент обязан провести полную инвентаризацию текущей версии игры, чтобы в новой версии ничего не потерялось.
1. Открыть и прочитать игру целиком в этой сессии (правило «ПЕРЕЧЕНЬ ОБЪЕКТОВ» выше: только из источника, не по памяти).
2. Пересчитать все визуальные ассеты по категориям: персонажи (и их детали, причёски, аксессуары, анимации), предметы и мебель (включая состояния, например экраны монитора), комната/окружение (пол, стены, окна, фон, декор), свет, эффекты и частицы, игровой интерфейс (пузыри, иконки, прогресс, указатели), панели и меню, звук.
3. Сохранить список файлом docs/INVENTORY_<игра>.md с датой, ссылкой на источник и числом по каждой категории и общим итогом.
4. Отдельно написать, что из имеющегося переиспользуется в новом уровне, а что рисуется заново (с числом новых ассетов).
5. После сборки сверить новую версию со списком по пунктам: все прежние ассеты, механики, уровни и интерфейс должны остаться и работать. В отчёте: «было N, осталось N, потеряно 0». Если что-то потерялось, это FAIL, вернуть до сдачи.
Первый уровень при добавлении второго не удалять и не перерисовывать; новый уровень только добавляется.

## НЕ МЕНЯТЬ НЕЗАПРОШЕННОЕ — перенос это добавление, а не замена

Делать только то, что владелец прямо просил. Идеи «заодно улучшить» или «заменить» запрещены, пока владелец не одобрил их словами.
Неприкосновенны, если их не просили менять: герой «Острова сумерек», 20 видов оружия и кулаки (21 позиция), управление, камера, HUD, физика, враги базовой игры. Перенос мира, биома или врагов из другой игры только ДОБАВЛЯЕТ их в базовую игру. Герой, оружие и механики базы остаются как есть. Оружие и персонажи из другой игры появляются только как предметы или NPC в мире, если владелец не сказал иначе.
Перед началом работы: написать одной строкой, что МЕНЯЕТСЯ и что НЕ ТРОГАЕТСЯ. Если в плане есть пункт, которого владелец не просил, вычеркнуть его до начала кода, а не после того, как владелец заметил.

## THREE-WORLDS — объединение «Остров сумерек» + «Пепельный путь» + «Затонувший город»

Пароль `three-worlds`: сначала прочитать [three-worlds.md](three-worlds.md) и [docs/THREE_WORLDS_MERGE_RU.md](docs/THREE_WORLDS_MERGE_RU.md), затем [graf.md](graf.md) §27 (HARD FAIL: никаких самодельных спутников, новых экранных кнопок, вода только как вход в проходимый мир). Это дизайн, не вердикт владельца.

## WEATHER — принятая GRAF 3D-погода (OWNER PASS, 2026-10-17)

Для задач «погода», «листопад», «лепестки», «светлячки» и нового атмосферного освещения **сначала прочитать [weather.md](weather.md) и [graf.md](graf.md) §27**. Автономный 3D HTML с 11 режимами и одной кнопкой доступен в [weather-showcase-graf-20261017/](weather-showcase-graf-20261017/); постоянная страница: https://mpaykin1.github.io/meta6/weather-showcase-graf-20261017/ . Владелец подтвердил PASS **только Weather Lab**, уроки зафиксированы в [docs/SUCCESS_WEATHER_LAB_2026-10-17.md](docs/SUCCESS_WEATHER_LAB_2026-10-17.md). Не менять Observer World V7. При переносе FX в Three.js использовать один штатный renderer, не копировать второй loop. iPhone 11 аппаратно не тестировался.

## FIX — обязательное правило статичного экрана (незакрытый блокер)

Если пользователь говорит **fix**, «закрепи экран», «экран тянется», «статичный экран», «неподвижная камера» или агент меняет игровое управление, **сначала прочитать [fix.md](fix.md)**. Быстрый публичный адрес: https://mpaykin1.github.io/meta6/fix/ . Это сквозной контракт для всех игр. Пользователь поставил **PASS всем остальным компонентам подводной игры**, но **не принял закрепление экрана**. Проверка одного `scrollY===0` или `overflow:hidden` — недостаточна: отдельно обязательно проверить камеру и неподвижность мировых ориентиров при джойстике. Нельзя автоматически закрывать FIX либо записывать его PASS/FAIL до решения владельца. Исправление ведётся на принятых исходниках; никаких дублирующих автозадач.

## EVOLVE — универсальное саморазвитие технологий

При задачах ежедневного развития графики, анимации, ассетов и оптимизации любой игры обязательно прочитай [**evolve.md**](evolve.md) вместе с [graf.md](graf.md). Короткий пароль для всех агентов: **evolve**. Это общий GitHub-контракт для Claude, ChatGPT, Codex, OpenCode, OpenHuman; расписание 02:00 Asia/Tbilisi только после реальной настройки и тестового запуска. Не создавать шестую AKA-задачу; сохранять 50/50 CLEAN_SERVER/GRAPHICS, текущие контракты и owner-only PASS/FAIL.

## ABYSS — правила ассетов игры ABYSS GLOW (обязательно)

Пароль `abyss`: перед любой работой над подводной игрой про рыбку ABYSS GLOW (ассеты, графика, анимация, код) **сначала прочитать [abyss.md](abyss.md) целиком**, затем [graf.md](graf.md). Это обязательный свод правил создания ассетов: стиль Selective Pixel Rim Lighting with Darkness Falloff (чёрное непрозрачное тело, свет с одной стороны, затухание, битые пиксели, палитра из 7 цветов), 5 стадий «милое → жуткое», одновременно 2D + 2.5D + 3D, управление пальцем или мышью без джойстика, бесконечный мир по X и Y, автоматические проверки ассетов. Инвентарь источника: [docs/INVENTORY_abyss-glow.md](docs/INVENTORY_abyss-glow.md). Нарушение HARD-правила = FAIL; PASS/FAIL ставит только владелец. **Запрет примитивной графики (2026-10-23):** пасти-атаки и ассеты — только по эскизам владельца, анимированные; процедурные челюсти и простые фигуры = FAIL, см. abyss.md §15а.

# Claude / Codex — canonical game entrypoint
## GRAF — обязательный стандарт графики всех наших игр

**GRAF v1.2 — ЖЁСТКИЕ ИНВАРИАНТЫ (читай полный [graf.md](graf.md)):** единую процедурную 3D + GLB/glTF фабрику с экспортом анимированных 2D/2.5D и HybridLOD использовать при создании графики; миры с ландшафтом обязаны иметь **неплоский объёмный рельеф и бесконечный бесшовный seeded chunk streaming** во все направления (без края/пустоты/сквозных швов), bounded RAM/GPU; на телефоне canvas/viewport статичен, joystick **двигает героя, не страницу/мир/камеру**, Eye/map drag отдельный. Для каждой игры иметь проверяемые touch tests, world traversal tests и FPS p95/perceptual guard; отсутствие live-тестов не PASS. Референсы фиксированного экрана: https://openttdonline.com/play/ и https://micropolisweb.com/ . Короткая команда: `graf mpaykin1/meta6`. Принятые версии не ломать.

При любом создании, улучшении, переносе, оптимизации или ревью **графики и анимации** сначала полностью прочитай [**graf.md — Hybrid 2D / 2.5D / 3D**](graf.md). Это единый публичный стандарт для Claude, Codex, ChatGPT и других AI; применять к любой игре с учётом принятого baseline и её стилистики. Для гибридного MVP обязательны одновременно анимированные 2D, 2.5D и 3D персонажи и объекты; PASS/FAIL назначает только владелец. Не считай появление документа доказательством выполнения графической интеграции.


**CURRENT ACCEPTED GAME: Observer World V7 — OWNER PASS (2026-10-16)**

- Live: https://mpaykin1.github.io/meta6/observer-world-en-v7/
- Full V7 development guide: [observer-world-en-v7/CLAUDE.md](observer-world-en-v7/CLAUDE.md)
- Complete source catalog: [SOURCE_INDEX.md](SOURCE_INDEX.md)
- Machine-readable version index: [game-source-index.json](game-source-index.json)
- Official user PASS evidence: [docs/SUCCESS_OBSERVER_WORLD_V7_MOBILE_2026-10-16.md](docs/SUCCESS_OBSERVER_WORLD_V7_MOBILE_2026-10-16.md)
- Technical CI green: https://github.com/mpaykin1/meta6/actions/runs/38896347402

Repository visibility has been confirmed **PUBLIC**. You can read the sources from a new chat or Claude session without asking the user to re-upload files. Public access does **not** confer push privileges: write access still requires separately authorized GitHub account permissions. Do not modify the owner's accepted V7 directly; start V8 or a reviewable PR for future changes.


## CURRENT DEVELOPMENT TARGET: V7 smartphone game (2026-10-16)

**Live URL:** https://mpaykin1.github.io/meta6/observer-world-en-v7/

**Full guide to the current source:** [observer-world-en-v7/CLAUDE.md](observer-world-en-v7/CLAUDE.md).

The owner has accepted the V5 graphics and the portrait HUD mockup. The V7 mobile implementation uses that original Three.js game with `mobile-controls.js`, `mobile-controls.css` and `editor.js`. **Phone only:** joystick and 3 right pixel buttons (weapon swap, hammer build, combined jump+attack/fire), scrollable bottom glyph toolbar. Tap near the character to choose a building site, press hammer; native tree destruction and support plinths clear terrain, overlapping buildings forbidden. PC keyboard/mouse logic remains from V6.

**Verified automated Chrome/WebGL test:** https://github.com/mpaykin1/meta6/actions/runs/38896347402. **OWNER PASS = ACCEPTED 2026-10-16** for V7 (explicit user verdict); Chrome touch simulation technical PASS is separate.

Do not tell the user to reupload source; read this public repository. For GitHub changes, Claude needs an authorized connected GitHub account. Keep accepted V5, V6 and V7 unchanged; create V8 for future development.

## Current V6 gameplay implementation (2026-10-16)

**The owner's visual approval is V5; V6 adds historical gameplay without touching the original perspective camera.**

- [Open playable V6](https://mpaykin1.github.io/meta6/observer-world-en-v6/)
- [V6 code and complete source map](observer-world-en-v6/CLAUDE.md)
- [36 original-atlas building architectures](observer-world-en-v6/building-assets.js)
- [16 animated character roles](observer-world-en-v6/npc-catalog.js)
- [NPC fighting, companions, betrayal, hero death and New rebirth](observer-world-en-v6/combat-relations.js)
- [Causal history and full-screen reading](observer-world-en-v6/story-system.js)
- [V6 tests](.github/workflows/observer-v6-gate.yml)

Keep V5 untouched as approved visual reference. Use V6 as the game currently being developed. The user should not need to re-upload files in any chat. Writing changes still requires connected GitHub permissions.

# CLAUDE — meta6 / Observer World

This repository contains multiple game editions. The **current exact-reference implementation** is [Observer World V5](observer-world-en-v5/).

**IMPORTANT:** The owner provided the full original HTML “Остров сумерек (1)(5).html” (SHA-256 `fdbda0240b53f49d6e34aa0965531856e31a0154f4a12339e1682d60d5fe5c1f`) and its screenshot. The intent is to use the **exact original Three.js 3D renderer and camera**, NOT to approximate it using a separate 2D painter. The full game and existing physics must remain editable and reproducible.

Start here: [observer-world-en-v5/CLAUDE.md](observer-world-en-v5/CLAUDE.md).

Source of the running 3D game, all shaders, terrain, water, camera, effects, enemies, weapons and original sounds: [observer-world-en-v5/index.html](observer-world-en-v5/index.html). Editor and bottom buttons: [observer-world-en-v5/editor.js](observer-world-en-v5/editor.js). Additional Krieger music: [observer-world-en-v5/audio.js](observer-world-en-v5/audio.js).

Original source archives: [expanded original](observer-world-en-v4/reference/ostrov-sumerek-expanded-original.html) and [first original](observer-world-en-v4/reference/ostrov-sumerek-original.html).

The owner requires all non-building controls in a collapsible menu, bottom row for placement of historical objects, and game viewport otherwise mostly unobscured.

Live version: https://mpaykin1.github.io/meta6/observer-world-en-v5/

Technical gate: [V5 CI](.github/workflows/observer-v5-gate.yml); requires original camera code unchanged and actual WebGL building placed in headless Chrome. **Visual equivalence to screenshot, iPhone sound, AI integration, full history are NOT owner-PASS.** Never assert they are done merely because CI is green.

All game source links: [SOURCE_INDEX.md](SOURCE_INDEX.md) and [game-source-index.json](game-source-index.json).

Do not overwrite previous accepted V2–V4; do not use paid APIs or print tokens; do not merge speculative breaking code without tests and owner's PASS.

## New connected underwater game — active integration (16–17 October 2026)

Source of truth for the new project: [underwater-world/CLAUDE.md](underwater-world/CLAUDE.md); [current game source](underwater-world/index.html); [seeded underwater world engine](underwater-world/underwater-runtime.js); [real Sunken City 3D models](underwater-world/models/); [procedural asset generator](underwater-world/generator/src/). Owner task and release rule: [World_server issue #522](https://github.com/mpaykin1/World_server/issues/522); implementation [PR #3](https://github.com/mpaykin1/meta6/pull/3).

The game is an extension of accepted V7; original land gameplay, 21-weapon arsenal, camera and building editor must remain. Underwater mobile **lower button = ascend only**, middle button = attack with a legitimately picked ranged weapon when aboard bathyscaphe, upper weapon-swap button = enter/exit bathyscaphe. Hold jump / Space to rise and release to sink. No mobile touch overlay on desktop (WASD, arrows, Space, mouse/touchpad LMB/RMB). Fixed phone viewport, infinite deterministic chunks, distinct ghost quests and non-constant combat.

The release workflow uses `.github/workflows/twilight-browser-smoke.yml` and `.github/workflows/build-twilight-sunken-assets.yml`; store screenshots under `underwater-world/evidence/` as CI artifacts and report visible gameplay coverage. **DO NOT issue a public test link before the published route, mobile + PC browser QA, visual difference >85%, and source asset loading have been verified. Never record owner PASS or FAIL without explicit user decision.**

Primary integrator modifies runtime/terrain/controls; parallel Codex lane modifies only `underwater-world/quests/`, `underwater-world/creatures/`, `underwater-world/docs/CODEX_HANDOFF.md`; retain non-overlapping work until reviewed integration. Current game progress is tracked via GitHub, not chat memory.

## ISLAND-BIOMES — независимые миры Острова сумерек (owner verdict pending)

Пароль `island-biomes` / «биомы острова»: сразу открыть [корневой alias](island-biomes.md), [исходный Three.js HTML](island-sumerek-biomes/index.html) и [правила разработки](island-sumerek-biomes/README.md). Это публичный источник для новых чатов Claude, Codex и ChatGPT; никакой повторной загрузки. Игровой маршрут: https://mpaykin1.github.io/meta6/island-sumerek-biomes/ . Исходная Observer World V7 не изменена. Все технические тесты и коммиты не означают решения владельца PASS/FAIL.

**GRAF v1.2 MOBILE CANON — OVERRIDES PREVIOUS STATIC-CAMERA ASSUMPTION:** читай [graf.md](graf.md) §26 и [docs/graf-mobile-follow-camera.md](docs/graf-mobile-follow-camera.md). Эталон пользовательского управления «Остров сумерек(7).html»: на телефоне левый floating joystick двигает персонажа camera-relative; независимый правый pointer вращает yaw/pitch камеры; камера ПЛАВНО **сопровождает персонажа** по его world position + velocity lead, collision-safe и damping; HTML page/canvas/HUD остаются неподвижными, stick pointer не управляет панорамой напрямую. Кнопки действий только **разные уникальные пиксель-арт пиктограммы**, никакого видимого текста на кнопках; aria-label нужен; не менять утверждённое размещение кнопок. E2E: joystick 10s, camera follows hero while canvas rect unchanged and scroll=0, dual touch stick+camera and stick+action, no FPS regression; physical iPhone11 отдельно от browser emulation. Не путать fixed viewport с неподвижной 3D камерой. Это обязательно для всех игр с персонажем, включая будущие и текущие при редактировании.
