# СЛИЯНИЕ — прогресс задания «Слить всё неслитое и пополнить библиотеку» (10.11.2026)

Это файл-память задания. ChatGPT после КАЖДОГО PR сразу меняет его строку и пушит в main (одна правка). При зависании новый запуск продолжает с первой строки, где «Сделано» пусто.
Колонку «GitHub» и строку «Итог» заполняет бот `sliyanie-status` (каждый час и при закрытии PR) — правду о PR он берёт из самого GitHub, поэтому прогресс не теряется, даже если ChatGPT не успел записать.

Итог: всего 68, слито 2, закрыто 58, открыто 8 — бот, 2026-11-13 18:54 UTC

| PR | Группа | Ветка | Название | GitHub | Сделано (ChatGPT: слит SHA / закрыт причина / НУЖЕН CLAUDE причина / в работе) |
|---|---|---|---|---|---|
| #208 | эталон | `lab/ashen-path-asset-pack-restore-1109` | Restore original Ashen Path asset pack reference after sync | closed | НУЖЕН CLAUDE: KONTUR Guard отклоняет исходный LEGACY_LIGHTS, [красный прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/42756903905), [PR #208](https://github.com/mpaykin1/meta6-lab/pull/208) |
| #207 | эталон | `lab/king-of-ash-original-upload-1109` | Эталон: Король Пепла — исходная игра и каталог 34 ассетов | closed | НУЖЕН CLAUDE: старый коммит трогает protected, [красный guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42771440585), [обновлённая ветка](https://github.com/mpaykin1/meta6-lab/commit/40b5090ea328c9b4fd4c916da526f6e0833ea4c1) |
| #206 | эталон | `lab/king-of-ash-reference-1109` | Эталон: Король Пепла (оригинальный HTML) | closed | закрыт: дубль, сохранён [PR #207](https://github.com/mpaykin1/meta6-lab/pull/207), [PR #206](https://github.com/mpaykin1/meta6-lab/pull/206) |
| #202 | эталон | `lab/archer-in-fog-reference-20261109` | Эталон: Лучник в тумане — исходный HTML владельца | closed | НУЖЕН CLAUDE: старый коммит трогает protected, [красный guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42771316201), [обновлённая ветка](https://github.com/mpaykin1/meta6-lab/commit/ac1a411c2298720060207695c854d458b5e38a15) |
| #201 | эталон | `lab/reference-foggy-awakening-scene-1` | Эталон: Сцена 1 — Туманное пробуждение | closed | НУЖЕН CLAUDE: распаковать бинарный ZIP в Actions, [PR #201](https://github.com/mpaykin1/meta6-lab/pull/201) |
| #191 | эталон | `lab/sunken-city-reference-1109` | Эталон «Затонувший город»: исходный ZIP, 3D-витрина и катало | open | в работе 2026-11-10 04:47 UTC |
| #189 | эталон | `lab/endless-valleys-golden-knight-reference-1109` | Add Endless Valleys — Golden Knight as owner-supplied refere | closed | НУЖЕН CLAUDE: старый коммит трогает protected, [красный guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42771627962), [обновлённая ветка](https://github.com/mpaykin1/meta6-lab/commit/b10c1038e060c692de837f1c91ffead8d92d51c7) |
| #137 | эталон | `lab/demonic-hand-webgl2-reference` | Add Demonic Hand as owner-approved WebGL2 reference | closed | | закрыт stale: конфликт с main, красный [Portal Visited](https://github.com/mpaykin1/meta6-lab/actions/runs/42496471465), [PR #137](https://github.com/mpaykin1/meta6-lab/pull/137) |
| #134 | эталон | `lab/abyss-glow-owner-reference-20261108` | ABYSS GLOW — второй эталон графики и анимации | open | НУЖЕН CLAUDE: авторский исходник LEGACY_LIGHTS нельзя изменять, [красный KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/42773917984), [ловушка К3](https://github.com/mpaykin1/meta6-lab/commit/e570c011db563c2d566f045a1dbd98326889935a) |
| #133 | эталон | `lab/asqura-single-graphics-reference-20261108` | ASQURA Office — первый эталон графики и анимации | open | в работе: [К3 ловушка и журнал](https://github.com/mpaykin1/meta6-lab/commit/633ad10443f9c5e9f1132b6d91d68ad3955b0159), [зелёный kontur-guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42773326044), нужен независимый ревьюер для самослияния |
| #213 | код | `lab/library-machine-sync` | L1: Library Machine — индекс нового эталона skin-trainer | closed | |
| #212 | код | `lab/claude-context-compact-v2` | Сократить контекст Claude: STATUS, короткие Actions, PROMPT_ | closed | |
| #211 | код | `lab/claude-context-compact` | Compact agent context: STATUS, rules, CI summaries and traps | closed | |
| #210 | код | `lab/skin-factory` | SKIN FACTORY: ножницы и ловушки для parts-sheet | open dirty | НУЖЕН CLAUDE: меняет защищённые `.github/workflows/skin-factory.yml` и `skin-pack.yml`; визуальная приёмка восьми ракурсов ещё не подтверждена; [PR #210](https://github.com/mpaykin1/meta6-lab/pull/210), [прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/42769690652) |
| #209 | код | `lab/library-catalog` | L1 ч.3 + L3: каталог игровых систем для MCP ИИ | closed | |
| #205 | код | `lab/owner-pult` | Пульт владельца — прогресс и свежие игры | closed | |
| #204 | код | `lab/rules-bot-trainer` | B6/B7 ч.1: бот правил — тренажёр, экран и звуковой мастер | closed | |
| #203 | код | `lab/skin-rusty-robot` | SKINY: rusty robot — runtime, asset pack, S1–S12, preview | open | |
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
| #87 | код | `lab/platform-play-connect-earn-20261107` | feat(portal): Play / Connect / Earn navigation and functiona | open | |
| #86 | код | `lab/sumerki2-bot-controls-20261107-1839` | bot: honest Sumerki II input strategy and bounded run contra | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42382769013), [PR #86](https://github.com/mpaykin1/meta6-lab/pull/86) |
| #81 | код | `lab/sumerki-bot-controls-20261107-1746` | bot: strict input-only strategy for Sumerki i Pepel 2 | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42378567198), [PR #81](https://github.com/mpaykin1/meta6-lab/pull/81) |
| #73 | код | `lab/sumerki-bot-config-20261107` | feat(bot): strict browser enrollment for Sumerki II | closed | закрыт stale: >48ч без коммита, [красный CI](https://github.com/mpaykin1/meta6-lab/actions/runs/42372675764), [PR #73](https://github.com/mpaykin1/meta6-lab/pull/73) |
| #72 | код | `lab/immersive-dishonored-principles-20261107` | Геймдизайн META GAMES: пять принципов IM1–IM5 | open | |
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
| #3 | код | `lab/twilight-island-bot` | lab: Twilight Island — бот проходит весь остров | open dirty | |
| #2 | код | `lab/twilight-isles-pass` | lab: Twilight Isles GPU optimization, single RAF, first-isla | closed | закрыт stale: 48ч+ без коммита, [красный bot](https://github.com/mpaykin1/meta6-lab/actions/runs/42356322630), [PR #2](https://github.com/mpaykin1/meta6-lab/pull/2) |
| #1 | код | `lab/twilight-island-pass` | lab: Twilight Island bot pass — combined #291 and #303 | closed | закрыт stale: красный META BOT, нет коммитов >48 ч — [PR #1](https://github.com/mpaykin1/meta6-lab/pull/1), [прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/42356940858) |

## Библиотека

В станке: 14 из 24 (по описи docs/INVENTORY_LAB_GAMES_2026-11-10.md). Обновлять после каждого прогона library-machine.yml со ссылкой на прогон.
