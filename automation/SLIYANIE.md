# СЛИЯНИЕ — прогресс задания «Слить всё неслитое и пополнить библиотеку» (10.11.2026)

Это файл-память задания. ChatGPT после КАЖДОГО PR сразу меняет его строку и пушит в main (одна правка). При зависании новый запуск продолжает с первой строки, где «Сделано» пусто.
Колонку «GitHub» и строку «Итог» заполняет бот `sliyanie-status` (каждый час и при закрытии PR) — правду о PR он берёт из самого GitHub, поэтому прогресс не теряется, даже если ChatGPT не успел записать.

Итог: всего 118, слито 8, закрыто 86, открыто 24 — бот, 2026-11-17 01:48 UTC

| PR | Группа | Ветка | Название | GitHub | Сделано (ChatGPT: слит SHA / закрыт причина / НУЖЕН CLAUDE причина / в работе) |
|---|---|---|---|---|---|
| #234 | код | — | Каталог игр без рекламы | closed | закрыт: без слияния; защищённое ядро не получило одобрения, исходная ветка сохранена; [PR #234](https://github.com/mpaykin1/meta6-lab/pull/234) |
| #242 | код | — | SEO каталога | open | draft: ЖДЁТ принятый каталог [#234](https://github.com/mpaykin1/meta6-lab/pull/234) и зелёный CI/SEO |
| #247 | код | — | Проверяющий и STOROZHA | closed | CLAUDE: да/нет? scripts/storozha/**; [STOROZHA FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/43414460298); draft |
| #254 | код | — | Auditor | closed | draft: ЖДЁТ конфликт main и CI [#254](https://github.com/mpaykin1/meta6-lab/pull/254); auditor не CORE_WORKFLOW |
| #258 | код | — | B2 проходчик | open dirty | draft: ЖДЁТ merge main и нового полного CI; [B2 PASS 43420129986](https://github.com/mpaykin1/meta6-lab/actions/runs/43420129986); Claude не нужен |
| #262 | код | — | Archer pixel proof | open dirty | draft: ЖДЁТ визуальный before/after и конфликт main [#262](https://github.com/mpaykin1/meta6-lab/pull/262) |
| #264 | код | — | Archer wall running | open dirty | draft: ЖДЁТ #262, конфликт main и визуальный PASS [#264](https://github.com/mpaykin1/meta6-lab/pull/264) |
| #268 | код | — | Ссылка 200 и Link Guard | closed | draft: ЖДЁТ зелёный CI и HTTP 200 восстановленных URL [#268](https://github.com/mpaykin1/meta6-lab/pull/268) |
| #280 | код | — | INK объекты | closed | draft: ЖДЁТ визуальный PASS пяти INK объектов и зелёный CI [#280](https://github.com/mpaykin1/meta6-lab/pull/280) |
| #283 | код | — | INK Fallen Guardian | open dirty | draft: ЖДЁТ сравнение с текущим INK эталоном и зависимость #284 [#283](https://github.com/mpaykin1/meta6-lab/pull/283) |
| #284 | код | — | INK эталон ZIP | closed | draft: ЖДЁТ безопасно сохранить ZIP_SNAPSHOT.json, не затереть уже существующий index.html в main [#284](https://github.com/mpaykin1/meta6-lab/pull/284) |
| #286 | код | — | INK рецепт | closed | draft: ЖДЁТ независимую проверку INK-рецепта и CI [#286](https://github.com/mpaykin1/meta6-lab/pull/286) |
| #287 | код | — | INK v2 | open dirty | draft: ЖДЁТ отдельный визуальный PASS v2 и CI [#287](https://github.com/mpaykin1/meta6-lab/pull/287) |
| #288 | код | — | INK stone bell | open dirty | draft: ЖДЁТ визуальный PASS колокола и CI [#288](https://github.com/mpaykin1/meta6-lab/pull/288) |
| #278 | код | — | ТОЛКАЧ safe merge | closed | закрыт: без слияния; отдельный PR не нужен, изменения консолидировались в [#331](https://github.com/mpaykin1/meta6-lab/pull/331); [PR #278](https://github.com/mpaykin1/meta6-lab/pull/278) |
| #289 | код | — | POLZA Gate | closed | draft: ЖДЁТ согласованного bootstrap POLZA и обязательного статуса в main [#289](https://github.com/mpaykin1/meta6-lab/pull/289); конфликт main |
| #290 | код | — | INK без паттернов | open dirty | draft: ЖДЁТ визуальную приёмку изменения принятого INK-движка и CI [#290](https://github.com/mpaykin1/meta6-lab/pull/290); main имеет другой shader SHA |
| #291 | код | — | B2 Broken City | open dirty | draft: ЖДЁТ реального прохождения broken-city ботом и changed-games [#291](https://github.com/mpaykin1/meta6-lab/pull/291) |
| #297 | код | — | Остров аптекаря II | open dirty | draft: ЖДЁТ бот-прохождения главы II, скриншоты ПК/мобилки и конфликт main [#297](https://github.com/mpaykin1/meta6-lab/pull/297) |
| #299 | код | — | CI concurrency | closed | draft: ЖДЁТ merge main и CI 23 изменённых workflow, без отмены main [#299](https://github.com/mpaykin1/meta6-lab/pull/299) |
| #300 | код | — | Native Catalog Candidate | open dirty | draft: ЖДЁТ конфликт main, Native Catalog Candidate CI и проверку релиза [#300](https://github.com/mpaykin1/meta6-lab/pull/300) |
| #303 | код | — | Туманные шпили 38 | closed | draft: ЖДЁТ HARD=0, сравнение эталонов и визуальный PASS [#303](https://github.com/mpaykin1/meta6-lab/pull/303) |
| #305 | код | — | Туманные шпили архитектура | closed | draft: ЖДЁТ HARD=0 и визуальную приёмку 38-ID архитектуры [#305](https://github.com/mpaykin1/meta6-lab/pull/305) |
| #306 | код | — | Туманные шпили страж | open dirty | draft: ЖДЁТ HARD=0 и визуальную приёмку «страж+собор» [#306](https://github.com/mpaykin1/meta6-lab/pull/306) |
| #310 | код | — | MIT PixelFX | open dirty | draft: ЖДЁТ устранения конфликта main, полного CI и лицензий PixelFX MIT [#310](https://github.com/mpaykin1/meta6-lab/pull/310) |
| #313 | код | — | Portal Play Connect Earn | open | draft: ЖДЁТ настоящий META BOT без застревания и полный CI [#313](https://github.com/mpaykin1/meta6-lab/pull/313) |
| #314 | код | — | Sunken City source ZIP | open | draft: ЖДЁТ зелёный META BOT и Library Machine; ZIP оригинала сохранить [#314](https://github.com/mpaykin1/meta6-lab/pull/314) |
| #319 | код | — | Source-only git 128 | open dirty | draft: ЖДЁТ source-only-base (отсутствует в main), зелёный Library Machine и новый CI [#319](https://github.com/mpaykin1/meta6-lab/pull/319) |
| #321 | код | — | INK Raven | merged | слит в feature-ветку `lab/ink-fallen-robot-20261113`, не в main: [SHA 00c22fba](https://github.com/mpaykin1/meta6-lab/commit/00c22fba0c1fbcf71a535ddd9342da286e875b27); [PR #321](https://github.com/mpaykin1/meta6-lab/pull/321) |
| #322 | код | — | INK Train | open dirty | draft: ЖДЁТ устранения [KONTUR FAIL 43749151115](https://github.com/mpaykin1/meta6-lab/actions/runs/43749151115) и визуального OWNER PASS [#322](https://github.com/mpaykin1/meta6-lab/pull/322) |
| #325 | код | — | INK Monster | open | draft: ЖДЁТ визуального OWNER PASS монстра и полного CI [#325](https://github.com/mpaykin1/meta6-lab/pull/325) |
| #326 | код | — | INK Viaduct | open | draft: ЖДЁТ визуального OWNER PASS 3D-виадуков и CI [#326](https://github.com/mpaykin1/meta6-lab/pull/326) |
| #332 | код | — | INK Carrion Stalker | open | draft: ЖДЁТ HTTP 200 превью и визуальный OWNER PASS робота [#332](https://github.com/mpaykin1/meta6-lab/pull/332) |
| #311 | код | `lab/bot-audit-20261114` | Ремонт JSON и ассетов | merged | ГОТОВ К ПРОВЕРКЕ: HEAD `7fa9bead6c68b6f82e730a126b2bd43ebfe73054`, 23 GitHub Actions PASS, 9 skipped, 0 failed; mergeable=true; внешний Vercel build-rate-limit, не считать полным CI PASS; [проверки](https://github.com/mpaykin1/meta6-lab/pull/311/checks) |
| #272 | игра | `lab/uluchshatel-sumerki-copy-bot13-20261112` | Read-only META BOT №13 | closed | закрыт: сторожем как заброшенный, без слияния; META BOT не подтверждён [PR #272](https://github.com/mpaykin1/meta6-lab/pull/272#issuecomment-6898808356) |
| #255 | игра | `lab/archer-meta-adfree-clean-1111` | Archer adfree и адаптивный FPS | closed | закрыт: без слияния; META BOT FAIL и конфликт, исходная ветка сохранена; [PR #255](https://github.com/mpaykin1/meta6-lab/pull/255) |
| #260 | код | `lab/uluchshatel-preflight-20261111` | Защита захвата игр | closed | закрыт: без слияния; конфликт main / STOROZHA, исходная ветка сохранена; [PR #260](https://github.com/mpaykin1/meta6-lab/pull/260) |
| #261 | код | `lab/biblioteka-contract-20261111` | Контракт библиотеки | closed | закрыт: без слияния; STOROZHA FAIL, исходная ветка сохранена; [PR #261](https://github.com/mpaykin1/meta6-lab/pull/261) |
| #218 | код | `lab/remont-r1-library` | R1: обновление библиотеки | closed | закрыт: без слияния; R1 не прошёл актуальную Library Machine, исходная ветка сохранена; [PR #218](https://github.com/mpaykin1/meta6-lab/pull/218) |
| #220 | код | `lab/zadachi-conflicts` | ZADACHI watch | closed | закрыт: без слияния; конфликт main и CI не устранены, исходная ветка сохранена; [PR #220](https://github.com/mpaykin1/meta6-lab/pull/220) |
| #270 | код | `lab/biblioteka-veil-camera-20261112` | Камера Veil Terraces как отдельный модуль | open | draft: ЖДЁТ source-only Library Machine, не Claude: [FAIL 43696794550](https://github.com/mpaykin1/meta6-lab/actions/runs/43696794550) — `scripts/library/verify-library.mjs` не является добавлением; имя PR очищено от устаревшего «НУЖЕН CLAUDE», guard не менять; [PR #270](https://github.com/mpaykin1/meta6-lab/pull/270) |
| #235 | игра | `lab/fix-mobile-screen-all-games-1111` | Неподвижный экран при джойстике | closed | закрыт: сторожем как заброшенный, без слияния; исправление экрана не подтверждено [PR #235](https://github.com/mpaykin1/meta6-lab/pull/235#issuecomment-6898807686) |
| #245 | игра | `lab/remont-main-veil-terraces` | Шесть воспоминаний без застреваний | open dirty | CLAUDE: да/нет? изменение принятого Veil Terraces; [вопрос #245](https://github.com/mpaykin1/meta6-lab/pull/245); draft |
| #277 | ядро | `lab/storozha-nedelya` | Три сторожа: update-heads и rename protection | closed | закрыт: без слияния; изменения ядра STOROZHA не согласованы, исходная ветка сохранена; [PR #277](https://github.com/mpaykin1/meta6-lab/pull/277) |
| #248 | ядро | `lab/pr-autofinish-followup-1111` | Доверенный автообновлятор PR и журнал | open dirty | CLAUDE: да/нет? защищённый pr-autofinish; [вопрос #248](https://github.com/mpaykin1/meta6-lab/pull/248); draft |
| #331 | код | `lab/razbor-zavalov` | Исправить undefined у #248/#277 и поставить мутационную ловушку | open dirty | draft: ЖДЁТ независимое принятие/merge; [коммит ab0ae49](https://github.com/mpaykin1/meta6-lab/commit/ab0ae49c33c02bb25da4110ac04940d24ed3cc6e), [8 CI PASS](https://github.com/mpaykin1/meta6-lab/pull/331/checks); внешний Vercel build-rate-limit |
| #316 | код | `lab/karta-sil-api-budget-20261114` | GitHub API quota, GraphQL batch, расписания ботов | merged | слит [4574e06a308792514a92db2f6328eb444f92d62a](https://github.com/mpaykin1/meta6-lab/commit/4574e06a308792514a92db2f6328eb444f92d62a), [11 зелёных проверок](https://github.com/mpaykin1/meta6-lab/pull/316/checks) |
| #317 | код | `lab/library-machine-branch-ownership-20261114` | Library Machine: ограничить запись служебной веткой | merged | слит [e02387721f8e2cbf126ba1af2ac6e4e803bebc03](https://github.com/mpaykin1/meta6-lab/commit/e02387721f8e2cbf126ba1af2ac6e4e803bebc03) |
| #312 | эталон | `lab/asqura-office-clean-transfer-20261114` | ASQURA Office — clean source-only #133 | merged | слит [bc24124303060dcb9ad75353d6a6f1ba967dd169](https://github.com/mpaykin1/meta6-lab/commit/bc24124303060dcb9ad75353d6a6f1ba967dd169) |
| #308 | код | `lab/immersive-docs-clean-20261114` | IM1–IM5 — чистый перенос вместо #72 | merged | слит [e07b085e4bec73081ff804be24a7398ada4b68c3](https://github.com/mpaykin1/meta6-lab/commit/e07b085e4bec73081ff804be24a7398ada4b68c3), [PR #308](https://github.com/mpaykin1/meta6-lab/pull/308) |
| #208 | эталон | `lab/ashen-path-asset-pack-restore-1109` | Restore original Ashen Path asset pack reference after sync | closed | НУЖЕН CLAUDE: KONTUR Guard отклоняет исходный LEGACY_LIGHTS, [красный прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/42756903905), [PR #208](https://github.com/mpaykin1/meta6-lab/pull/208) |
| #207 | эталон | `lab/king-of-ash-original-upload-1109` | Эталон: Король Пепла — исходная игра и каталог 34 ассетов | closed | НУЖЕН CLAUDE: старый коммит трогает protected, [красный guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42771440585), [обновлённая ветка](https://github.com/mpaykin1/meta6-lab/commit/40b5090ea328c9b4fd4c916da526f6e0833ea4c1) |
| #206 | эталон | `lab/king-of-ash-reference-1109` | Эталон: Король Пепла (оригинальный HTML) | closed | закрыт: дубль, сохранён [PR #207](https://github.com/mpaykin1/meta6-lab/pull/207), [PR #206](https://github.com/mpaykin1/meta6-lab/pull/206) |
| #202 | эталон | `lab/archer-in-fog-reference-20261109` | Эталон: Лучник в тумане — исходный HTML владельца | closed | НУЖЕН CLAUDE: старый коммит трогает protected, [красный guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42771316201), [обновлённая ветка](https://github.com/mpaykin1/meta6-lab/commit/ac1a411c2298720060207695c854d458b5e38a15) |
| #201 | эталон | `lab/reference-foggy-awakening-scene-1` | Эталон: Сцена 1 — Туманное пробуждение | closed | НУЖЕН CLAUDE: распаковать бинарный ZIP в Actions, [PR #201](https://github.com/mpaykin1/meta6-lab/pull/201) |
| #191 | эталон | `lab/sunken-city-reference-1109` | Эталон «Затонувший город»: исходный ZIP, 3D-витрина и катало | closed | закрыт: сторожем как заброшенный; ветка и оригинальный ZIP сохранены; замена [#314](https://github.com/mpaykin1/meta6-lab/pull/314) ещё draft |
| #189 | эталон | `lab/endless-valleys-golden-knight-reference-1109` | Add Endless Valleys — Golden Knight as owner-supplied refere | closed | НУЖЕН CLAUDE: старый коммит трогает protected, [красный guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42771627962), [обновлённая ветка](https://github.com/mpaykin1/meta6-lab/commit/b10c1038e060c692de837f1c91ffead8d92d51c7) |
| #137 | эталон | `lab/demonic-hand-webgl2-reference` | Add Demonic Hand as owner-approved WebGL2 reference | closed | | закрыт stale: конфликт с main, красный [Portal Visited](https://github.com/mpaykin1/meta6-lab/actions/runs/42496471465), [PR #137](https://github.com/mpaykin1/meta6-lab/pull/137) |
| #134 | эталон | `lab/abyss-glow-owner-reference-20261108` | ABYSS GLOW — второй эталон графики и анимации | closed | НУЖЕН CLAUDE: авторский исходник LEGACY_LIGHTS нельзя изменять, [красный KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/42773917984), [ловушка К3](https://github.com/mpaykin1/meta6-lab/commit/e570c011db563c2d566f045a1dbd98326889935a) |
| #133 | эталон | `lab/asqura-single-graphics-reference-20261108` | ASQURA Office — первый эталон графики и анимации | closed | закрыт: заменён [#312](https://github.com/mpaykin1/meta6-lab/pull/312), слит [bc241243](https://github.com/mpaykin1/meta6-lab/commit/bc24124303060dcb9ad75353d6a6f1ba967dd169)
| #213 | код | `lab/library-machine-sync` | L1: Library Machine — индекс нового эталона skin-trainer | closed | |
| #212 | код | `lab/claude-context-compact-v2` | Сократить контекст Claude: STATUS, короткие Actions, PROMPT_ | closed | |
| #211 | код | `lab/claude-context-compact` | Compact agent context: STATUS, rules, CI summaries and traps | closed | |
| #210 | код | `lab/skin-factory` | SKIN FACTORY: ножницы и ловушки для parts-sheet | closed | draft: ЖДЁТ 8 ракурсов и контраста ≥2,5:1; [FAIL 42767983352](https://github.com/mpaykin1/meta6-lab/actions/runs/42767983352); workflows не CORE_WORKFLOW |
| #209 | код | `lab/library-catalog` | L1 ч.3 + L3: каталог игровых систем для MCP ИИ | closed | |
| #205 | код | `lab/owner-pult` | Пульт владельца — прогресс и свежие игры | closed | |
| #204 | код | `lab/rules-bot-trainer` | B6/B7 ч.1: бот правил — тренажёр, экран и звуковой мастер | closed | |
| #203 | код | `lab/skin-rusty-robot` | SKINY: rusty robot — runtime, asset pack, S1–S12, preview | closed | |
| #200 | код | `lab/bot-batch-2` | B2 ч.2: ручки бота | closed | НУЖЕН CLAUDE: PR изменяет `.github/workflows/b2-batch-2.yml`, самослияние запрещено; [PR #200](https://github.com/mpaykin1/meta6-lab/pull/200) |
| #193 | код | `lab/kontur-k7-review` | K7: guard against repeated regression classes | closed | |
| #192 | код | `lab/mcp-connect` | M6: Connect — локальный MCP, конфиги клиентов и официальный  | closed | |
| #190 | код | `lab/bot-batch-1` | B2 (batch 1): read-only META BOT adapters for two Twilight g | closed | |
| #177 | код | `lab/automation-efficiency-rules-20261109` | Правила эффективности пяти автозадач: только измеримый резул | closed | |
| #172 | код | `lab/pod-i-nad-palette-cycle` | META GAMES: original dynamic palette cycle for sky, water, f | closed | |
| #169 | код | `lab/pod-i-nad-original-palettes` | META GAMES: extract source-exact dusk, twilight, night and d | closed | |
| #132 | код | `lab/cycle5-archer-meta-adfree-1108` | fix(meta): Archer in the Fog — no ads, local saves and one f | closed | |
| #131 | код | `lab/owner-graphics-animation-references-20261108` | META GAMES: 10 эталонов графики и анимации из оригиналов вла | closed | |
| #129 | код | `lab/cycle4-twilight-isles-no-ads-1108` | fix(meta): Twilight Isles 2 plays without ads, with free rev | closed | |
| #126 | код | `lab/sketch-to-game-standard` | Эталон: универсальный промпт Sketch → HTML Game → ZIP | merged | |
| #125 | код | `lore/alternative-last-seed-20261108` | Lore: alternative Last Seed mythology and inspiration bank | merged | |
| #124 | код | `lab/seed-of-last-world-canon` | ЛОР: Зерно последнего мира — эталон и карта мультивселенной  | closed | |
| #122 | код | `lab/meta-bot-real-game-hooks-1108` | feat(meta-bot): honest gameplay adapters for Broken City and | closed | |
| #116 | код | `lab/cycle1-broken-city-bot-strategy-1108` | feat(bot): Broken City real-input strategy scaffold | closed | |
| #113 | код | `lab/cycle2-broken-city-bot-config-20261107` | feat(bot): Broken City honest run configuration | closed | |
| #112 | код | `lab/cycle4-sumerki-real-bot-adapter-20261107` | bot: connect honest read-only Sumerki II adapter and strateg | closed | закрыт stale: 48ч+ без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42434278324), [PR #112](https://github.com/mpaykin1/meta6-lab/pull/112) |
| #106 | код | `lab/twilight-island-honest-runtime-20261107-2040` | feat(bot): exact Observer World V7 META copy and real read-o | closed | закрыт stale: 48ч+ без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42393307147), [PR #106](https://github.com/mpaykin1/meta6-lab/pull/106) |
| #105 | код | `lab/ashen-path-honest-runtime-20261107-2035` | feat(bot): full original Ashen Path META copy with genuine r | closed | закрыт stale: 48ч+ без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42393296367), [PR #105](https://github.com/mpaykin1/meta6-lab/pull/105) |
| #100 | код | `lab/classic-honest-bot-state-20261107-2003` | feat(bot): read-only Classic island state and genuine gamepl | closed | |
| #99 | код | `lab/classic-honest-observer-bot-20261107` | feat(bot): connect Twilight Isle Classic via original read-o | closed | закрыт stale: 48ч+ без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42389688065), [PR #99](https://github.com/mpaykin1/meta6-lab/pull/99) |
| #97 | код | `lab/archer-readonly-bot-20261107-gpt6` | feat(bot): honest Archer in the Fog state and real projected | closed | закрыт stale: 48ч+ без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42391344245), [PR #97](https://github.com/mpaykin1/meta6-lab/pull/97) |
| #96 | код | `lab/broken-city-honest-bot-20261107-1945` | feat(bot): honest Broken City read-only adapter and gameplay | closed | закрыт stale: 48ч+ без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42388050688), [PR #96](https://github.com/mpaykin1/meta6-lab/pull/96) |
| #95 | код | `lab/broken-city-honest-bot-20261107` | feat(bot): truthful Broken City state adapter and real contr | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42389910549), [PR #95](https://github.com/mpaykin1/meta6-lab/pull/95) |
| #92 | код | `lab/sumerki2-honest-combined-controls-20261107` | fix(bot): integrate Sumerki II read-only adapter, honest con | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42387142429), [PR #92](https://github.com/mpaykin1/meta6-lab/pull/92) |
| #90 | код | `lab/twilight-isles-bot-real-state-20261107-1831` | feat(meta-bot): honest read-only Twilight Isles state and re | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42383897543), [PR #90](https://github.com/mpaykin1/meta6-lab/pull/90) |
| #88 | код | `lab/sumerki2-honest-readonly-adapter-20261107` | feat(bot): real read-only Sumerki II adapter for existing in | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42383297858), [PR #88](https://github.com/mpaykin1/meta6-lab/pull/88) |
| #87 | код | `lab/platform-play-connect-earn-20261107` | feat(portal): Play / Connect / Earn navigation and functiona | closed | |
| #86 | код | `lab/sumerki2-bot-controls-20261107-1839` | bot: honest Sumerki II input strategy and bounded run contra | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42382769013), [PR #86](https://github.com/mpaykin1/meta6-lab/pull/86) |
| #81 | код | `lab/sumerki-bot-controls-20261107-1746` | bot: strict input-only strategy for Sumerki i Pepel 2 | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42378567198), [PR #81](https://github.com/mpaykin1/meta6-lab/pull/81) |
| #73 | код | `lab/sumerki-bot-config-20261107` | feat(bot): strict browser enrollment for Sumerki II | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42372675764), [PR #73](https://github.com/mpaykin1/meta6-lab/pull/73) |
| #72 | код | `lab/immersive-dishonored-principles-20261107` | Геймдизайн META GAMES: пять принципов IM1–IM5 | closed | закрыт: заменён слитым [#308](https://github.com/mpaykin1/meta6-lab/pull/308) — [SHA e07b085](https://github.com/mpaykin1/meta6-lab/commit/e07b085e4bec73081ff804be24a7398ada4b68c3) |
| #69 | код | `lab/classic-bot-config-20261107` | feat(bot): configure strict classic game browser checks | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42368011822), [PR #69](https://github.com/mpaykin1/meta6-lab/pull/69) |
| #60 | код | `lab/render-broken-city-adaptive` | Perf: adaptive WebGL/Three.js render resolution in Broken Ci | closed | |
| #59 | код | `lab/render-veil-shared-instancing` | Perf: apply proven WebGL2 instancing to shared Veil Terraces | closed | |
| #58 | код | `lab/approved-donor-confluence-vault-20261107` | Vault: replace prohibited procedural payload with SHA-pinned | closed | |
| #54 | код | `lab/render-visibility-optimization` | META GAMES LAB: shared voxel optimization + live frustum cul | closed | |
| #49 | код | `lab/veil-weather-connected-20261107` | Playable Veil uses exact original Three Worlds weather; regi | closed | |
| #43 | код | `lab/veil-weather-original-20261107` | Use exact original Three Worlds weather in playable Veil Ter | closed | закрыт stale: заменён PR #49; https://github.com/mpaykin1/meta6-lab/pull/43 |
| #16 | код | `lab/readiness-evidence-gates` | Evidence-gated META GAMES readiness: 10 elements, same-SHA C | closed | |
| #15 | код | `lab/shared-owner-approved-components` | Approved original-source library: token-efficient MCP search | closed | |
| #9 | код | `lab/agent-game-candidate` | [BLOCKED — source policy] Procedural World_server candidate  | closed | закрыт stale: политика исходников, [PR #9](https://github.com/mpaykin1/meta6-lab/pull/9) |
| #8 | код | `lab/bot-safe-autorepair` | Sandbox auto-repair: real META BOT replay, safe viewport fix | closed | закрыт stale: конфликт с main, защищённый workflow, [PR #8](https://github.com/mpaykin1/meta6-lab/pull/8) |
| #7 | код | `lab/reuse-library-search` | Reusable code library: source search, browser index, local M | closed | |
| #6 | код | `lab/world-doors-progress` | lab: persistent visited-world doors without touching accepte | closed | закрыт stale: 48ч+ без коммита, [красный deploy](https://github.com/mpaykin1/meta6-lab/actions/runs/42285373653), [PR #6](https://github.com/mpaykin1/meta6-lab/pull/6) |
| #5 | код | `lab/oss-commercial-kit` | lab: коммерчески разрешённые OSS-модули и игровая сцена | closed | закрыт stale: 48ч+ без коммита, [красный deploy](https://github.com/mpaykin1/meta6-lab/actions/runs/42286065563), [PR #5](https://github.com/mpaykin1/meta6-lab/pull/5) |
| #4 | код | `lab/native-catalog-and-steam` | lab: native catalog and safe Steam/Android candidates | closed | закрыт stale: 48ч+ без коммита, [красный deploy](https://github.com/mpaykin1/meta6-lab/actions/runs/42285011814), [PR #4](https://github.com/mpaykin1/meta6-lab/pull/4) |
| #3 | код | `lab/twilight-island-bot` | lab: Twilight Island — бот проходит весь остров | closed | закрыт: сторожем как заброшенный; ветка сохранена; чистый перенос ещё нужен [PR #3](https://github.com/mpaykin1/meta6-lab/pull/3#issuecomment-6898806224) |
| #2 | код | `lab/twilight-isles-pass` | lab: Twilight Isles GPU optimization, single RAF, first-isla | closed | закрыт stale: 48ч+ без коммита, [красный bot](https://github.com/mpaykin1/meta6-lab/actions/runs/42356322630), [PR #2](https://github.com/mpaykin1/meta6-lab/pull/2) |
| #1 | код | `lab/twilight-island-pass` | lab: Twilight Island bot pass — combined #291 and #303 | closed | закрыт stale: красный META BOT, нет коммитов >48 ч — [PR #1](https://github.com/mpaykin1/meta6-lab/pull/1), [прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/42356940858) |

## Библиотека

В станке: 14 из 24 (по описи docs/INVENTORY_LAB_GAMES_2026-11-10.md). Обновлять после каждого прогона library-machine.yml со ссылкой на прогон.
