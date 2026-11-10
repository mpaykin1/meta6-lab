# СЛИЯНИЕ — прогресс задания «Слить всё неслитое и пополнить библиотеку» (10.11.2026)

Это файл-память задания. ChatGPT после КАЖДОГО PR сразу меняет его строку и пушит в main (одна правка). При зависании новый запуск продолжает с первой строки, где «Сделано» пусто.
Колонку «GitHub» и строку «Итог» заполняет бот `sliyanie-status` (каждый час и при закрытии PR) — правду о PR он берёт из самого GitHub, поэтому прогресс не теряется, даже если ChatGPT не успел записать.

Итог: всего 68, слито 0, закрыто 4, открыто 64 — бот, 2026-11-10 05:11 UTC

| PR | Группа | Ветка | Название | GitHub | Сделано (ChatGPT: слит SHA / закрыт причина / НУЖЕН CLAUDE причина / в работе) |
|---|---|---|---|---|---|
| #208 | эталон | `lab/ashen-path-asset-pack-restore-1109` | Restore original Ashen Path asset pack reference after sync | open | НУЖЕН CLAUDE: KONTUR Guard отклоняет исходный LEGACY_LIGHTS, [красный прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/42756903905), [PR #208](https://github.com/mpaykin1/meta6-lab/pull/208) |
| #207 | эталон | `lab/king-of-ash-original-upload-1109` | Эталон: Король Пепла — исходная игра и каталог 34 ассетов | open | жду прогон [KONTUR Guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42757252697), [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/42757215058); PR [#207](https://github.com/mpaykin1/meta6-lab/pull/207) |
| #206 | эталон | `lab/king-of-ash-reference-1109` | Эталон: Король Пепла (оригинальный HTML) | closed | закрыт: дубль, сохранён [PR #207](https://github.com/mpaykin1/meta6-lab/pull/207), [PR #206](https://github.com/mpaykin1/meta6-lab/pull/206) |
| #202 | эталон | `lab/archer-in-fog-reference-20261109` | Эталон: Лучник в тумане — исходный HTML владельца | open | жду прогон [KONTUR Guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42757617454), [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/42757543335), [PR #202](https://github.com/mpaykin1/meta6-lab/pull/202) |
| #201 | эталон | `lab/reference-foggy-awakening-scene-1` | Эталон: Сцена 1 — Туманное пробуждение | open | НУЖЕН CLAUDE: распаковать бинарный ZIP в Actions, [PR #201](https://github.com/mpaykin1/meta6-lab/pull/201) |
| #191 | эталон | `lab/sunken-city-reference-1109` | Эталон «Затонувший город»: исходный ZIP, 3D-витрина и катало | open | в работе 2026-11-10 04:47 UTC |
| #189 | эталон | `lab/endless-valleys-golden-knight-reference-1109` | Add Endless Valleys — Golden Knight as owner-supplied refere | open | блокировано: 135 коммитов позади main, меняет LAB_QUEUE.md, нет обязательных зелёных CI; [разбор](https://github.com/mpaykin1/meta6-lab/pull/189#issuecomment-6759536405) |
| #137 | эталон | `lab/demonic-hand-webgl2-reference` | Add Demonic Hand as owner-approved WebGL2 reference | open | |
| #134 | эталон | `lab/abyss-glow-owner-reference-20261108` | ABYSS GLOW — второй эталон графики и анимации | open | |
| #133 | эталон | `lab/asqura-single-graphics-reference-20261108` | ASQURA Office — первый эталон графики и анимации | open | |
| #213 | код | `lab/library-machine-sync` | L1: Library Machine — индекс нового эталона skin-trainer | open | |
| #212 | код | `lab/claude-context-compact-v2` | Сократить контекст Claude: STATUS, короткие Actions, PROMPT_ | closed | |
| #211 | код | `lab/claude-context-compact` | Compact agent context: STATUS, rules, CI summaries and traps | closed | |
| #210 | код | `lab/skin-factory` | SKIN FACTORY: ножницы и ловушки для parts-sheet | open | |
| #209 | код | `lab/library-catalog` | L1 ч.3 + L3: каталог игровых систем для MCP ИИ | open dirty | |
| #205 | код | `lab/owner-pult` | Пульт владельца — прогресс и свежие игры | open | |
| #204 | код | `lab/rules-bot-trainer` | B6/B7 ч.1: бот правил — тренажёр, экран и звуковой мастер | open | |
| #203 | код | `lab/skin-rusty-robot` | SKINY: rusty robot — runtime, asset pack, S1–S12, preview | open | |
| #200 | код | `lab/bot-batch-2` | B2 ч.2: ручки бота | open | |
| #193 | код | `lab/kontur-k7-review` | K7: guard against repeated regression classes | open | |
| #192 | код | `lab/mcp-connect` | M6: Connect — локальный MCP, конфиги клиентов и официальный  | open | |
| #190 | код | `lab/bot-batch-1` | B2 (batch 1): read-only META BOT adapters for two Twilight g | open | |
| #177 | код | `lab/automation-efficiency-rules-20261109` | Правила эффективности пяти автозадач: только измеримый резул | open | |
| #172 | код | `lab/pod-i-nad-palette-cycle` | META GAMES: original dynamic palette cycle for sky, water, f | open | |
| #169 | код | `lab/pod-i-nad-original-palettes` | META GAMES: extract source-exact dusk, twilight, night and d | open | |
| #132 | код | `lab/cycle5-archer-meta-adfree-1108` | fix(meta): Archer in the Fog — no ads, local saves and one f | open | |
| #131 | код | `lab/owner-graphics-animation-references-20261108` | META GAMES: 10 эталонов графики и анимации из оригиналов вла | open | |
| #129 | код | `lab/cycle4-twilight-isles-no-ads-1108` | fix(meta): Twilight Isles 2 plays without ads, with free rev | open | |
| #126 | код | `lab/sketch-to-game-standard` | Эталон: универсальный промпт Sketch → HTML Game → ZIP | open | |
| #125 | код | `lore/alternative-last-seed-20261108` | Lore: alternative Last Seed mythology and inspiration bank | open | |
| #124 | код | `lab/seed-of-last-world-canon` | ЛОР: Зерно последнего мира — эталон и карта мультивселенной  | open | |
| #122 | код | `lab/meta-bot-real-game-hooks-1108` | feat(meta-bot): honest gameplay adapters for Broken City and | open | |
| #116 | код | `lab/cycle1-broken-city-bot-strategy-1108` | feat(bot): Broken City real-input strategy scaffold | open | |
| #113 | код | `lab/cycle2-broken-city-bot-config-20261107` | feat(bot): Broken City honest run configuration | open | |
| #112 | код | `lab/cycle4-sumerki-real-bot-adapter-20261107` | bot: connect honest read-only Sumerki II adapter and strateg | open | |
| #106 | код | `lab/twilight-island-honest-runtime-20261107-2040` | feat(bot): exact Observer World V7 META copy and real read-o | open | |
| #105 | код | `lab/ashen-path-honest-runtime-20261107-2035` | feat(bot): full original Ashen Path META copy with genuine r | open | |
| #100 | код | `lab/classic-honest-bot-state-20261107-2003` | feat(bot): read-only Classic island state and genuine gamepl | open | |
| #99 | код | `lab/classic-honest-observer-bot-20261107` | feat(bot): connect Twilight Isle Classic via original read-o | open | |
| #97 | код | `lab/archer-readonly-bot-20261107-gpt6` | feat(bot): honest Archer in the Fog state and real projected | open | |
| #96 | код | `lab/broken-city-honest-bot-20261107-1945` | feat(bot): honest Broken City read-only adapter and gameplay | open | |
| #95 | код | `lab/broken-city-honest-bot-20261107` | feat(bot): truthful Broken City state adapter and real contr | open | |
| #92 | код | `lab/sumerki2-honest-combined-controls-20261107` | fix(bot): integrate Sumerki II read-only adapter, honest con | open | |
| #90 | код | `lab/twilight-isles-bot-real-state-20261107-1831` | feat(meta-bot): honest read-only Twilight Isles state and re | open | |
| #88 | код | `lab/sumerki2-honest-readonly-adapter-20261107` | feat(bot): real read-only Sumerki II adapter for existing in | open | |
| #87 | код | `lab/platform-play-connect-earn-20261107` | feat(portal): Play / Connect / Earn navigation and functiona | open | |
| #86 | код | `lab/sumerki2-bot-controls-20261107-1839` | bot: honest Sumerki II input strategy and bounded run contra | open | |
| #81 | код | `lab/sumerki-bot-controls-20261107-1746` | bot: strict input-only strategy for Sumerki i Pepel 2 | open | |
| #73 | код | `lab/sumerki-bot-config-20261107` | feat(bot): strict browser enrollment for Sumerki II | open | |
| #72 | код | `lab/immersive-dishonored-principles-20261107` | Геймдизайн META GAMES: пять принципов IM1–IM5 | open | |
| #69 | код | `lab/classic-bot-config-20261107` | feat(bot): configure strict classic game browser checks | open | |
| #60 | код | `lab/render-broken-city-adaptive` | Perf: adaptive WebGL/Three.js render resolution in Broken Ci | open | |
| #59 | код | `lab/render-veil-shared-instancing` | Perf: apply proven WebGL2 instancing to shared Veil Terraces | open | |
| #58 | код | `lab/approved-donor-confluence-vault-20261107` | Vault: replace prohibited procedural payload with SHA-pinned | open | |
| #54 | код | `lab/render-visibility-optimization` | META GAMES LAB: shared voxel optimization + live frustum cul | open | |
| #49 | код | `lab/veil-weather-connected-20261107` | Playable Veil uses exact original Three Worlds weather; regi | open | |
| #43 | код | `lab/veil-weather-original-20261107` | Use exact original Three Worlds weather in playable Veil Ter | open | |
| #16 | код | `lab/readiness-evidence-gates` | Evidence-gated META GAMES readiness: 10 elements, same-SHA C | open | |
| #15 | код | `lab/shared-owner-approved-components` | Approved original-source library: token-efficient MCP search | open | |
| #9 | код | `lab/agent-game-candidate` | [BLOCKED — source policy] Procedural World_server candidate  | open | |
| #8 | код | `lab/bot-safe-autorepair` | Sandbox auto-repair: real META BOT replay, safe viewport fix | open | |
| #7 | код | `lab/reuse-library-search` | Reusable code library: source search, browser index, local M | open | |
| #6 | код | `lab/world-doors-progress` | lab: persistent visited-world doors without touching accepte | open | |
| #5 | код | `lab/oss-commercial-kit` | lab: коммерчески разрешённые OSS-модули и игровая сцена | open | |
| #4 | код | `lab/native-catalog-and-steam` | lab: native catalog and safe Steam/Android candidates | open | |
| #3 | код | `lab/twilight-island-bot` | lab: Twilight Island — бот проходит весь остров | open | |
| #2 | код | `lab/twilight-isles-pass` | lab: Twilight Isles GPU optimization, single RAF, first-isla | open | |
| #1 | код | `lab/twilight-island-pass` | lab: Twilight Island bot pass — combined #291 and #303 | closed | закрыт stale: красный META BOT, нет коммитов >48 ч — [PR #1](https://github.com/mpaykin1/meta6-lab/pull/1), [прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/42356940858) |

## Библиотека

В станке: 14 из 24 (по описи docs/INVENTORY_LAB_GAMES_2026-11-10.md). Обновлять после каждого прогона library-machine.yml со ссылкой на прогон.
