# Для Claude — подтверждённые блокировки

## Z03 OWNER PASS — сделано Claude 17.11.2026

- #347, #348, #349 перенесены в main одним подписанным коммитом; эталоны МГ и МГЛ побайтно совпадают (3 эталона, 27 файлов), сторож `verify-etalony-sync.yml` включён.

## 14.11.2026 — проверка ботов

META BOT viewports: ЗАКРЫТО Claude 17.11.2026 — проверка в loadGame применена, вечная ловушка scripts/meta-bot/mutate-viewports.mjs (OSHIBKI 2026111702).


<!-- STOROZHA:PROTECTED:BEGIN -->
| #267 | lab/asset-check-universal | .github/workflows/asset-check.yml: изменение защищённого workflow/охранника/бота/теста — только Claude | 2026-11-11 |
| #277 | lab/storozha-nedelya | .github/workflows/storozha-branches.yml: изменение ЯДРА охраны — только Claude; .github/workflows/storozha-reference.yml: изменение ЯДРА охраны — только Claude; .github/workflows/storozha-tests.yml: изменение ЯДРА охраны — только Claude; scripts/storozha/branch-watch.mjs: изменение ЯДРА охраны — только Claude; scripts/storozha/core.mjs: изменение ЯДРА охраны — только Claude; scripts/storozha/reference-check.mjs: изменение ЯДРА охраны — только Claude; scripts/storozha/weekly-watch.mjs: изменение ЯДРА охраны — только Claude | 2026-11-15 |
| #247 | lab/kak-proveryayushchij-traps | scripts/storozha/reference-check.mjs: изменение ЯДРА охраны — только Claude | 2026-11-15 |
| #248 | lab/pr-autofinish-followup-1111 | .github/workflows/pr-autofinish.yml: изменение ЯДРА охраны — только Claude | 2026-11-15 |
| #370 | lab/ink-car-bathyscaphe-20261117 | Новый эталон: PR должен только добавлять файлы | 2026-11-17 |
| #404 | lab/z01-api-quota-fastfail-1117 | scripts/dispetcher/test/api-budget.test.mjs: старый тест можно только дополнять (ни одной удалённой строки) — иначе только Claude | 2026-11-17 |
<!-- STOROZHA:PROTECTED:END -->

<!-- STOROZHA:CONFLICTS:BEGIN -->
| #245 | lab/remont-main-veil-terraces | DLYA_CLAUDE.md, OSHIBKI.md | 2026-11-17 |
| #248 | lab/pr-autofinish-followup-1111 | .github/workflows/pr-autofinish.yml, OSHIBKI.md, automation/prompts/MG_PYAT_AVTOZADACH.md | 2026-11-17 |
| #258 | lab/prohodchik-b2-motion-20261111 | DLYA_CLAUDE.md, OSHIBKI.md | 2026-11-17 |
| #262 | lab/archer-retention-exp-1 | OSHIBKI.md | 2026-11-17 |
| #283 | lab/ink-fallen-robot-20261113 | LINKS.txt, ink.md | 2026-11-17 |
| #291 | lab/polza-b2-broken-city-20261113 | OSHIBKI.md, shared/library/index.json | 2026-11-17 |
| #297 | lab/ostrov-aptekarya-ii | OSHIBKI.md | 2026-11-17 |
| #300 | lab/native-catalog-recovery-20261113 | OSHIBKI.md | 2026-11-17 |
| #306 | lab/assets-tumannye-shpili-20261114-2338 | DLYA_CLAUDE.md, LINKS.txt, OSHIBKI.md, automation/asset-check/RAZVITIE.md, automation/asset-check/SPEC.md, automation/asset-check/check_pack.py, automation/asset-check/mutate_bot.py | 2026-11-17 |
| #310 | lab/patch-import | OSHIBKI.md, automation/asset-check/mutate_bot.py, automation/asset-check/test_kinds.py | 2026-11-17 |
| #322 | lab/ink-watercolor-steam-train-20261114 | LINKS.txt, OSHIBKI.md, reports/zavaly/PROGRESS.md | 2026-11-17 |
| #331 | lab/razbor-zavalov | OSHIBKI.md, automation/SLIYANIE.md, reports/zavaly/PROGRESS.md, scripts/karta-sil/route.mjs | 2026-11-17 |
| #343 | lab/assets-nebesny-pilot-20261116 | LINKS.txt, OSHIBKI.md, automation/asset-check/OCHERED.md, automation/asset-check/RAZVITIE.md, automation/asset-check/SPEC.md, automation/asset-check/check_pack.py, automation/asset-check/mutate_bot.py | 2026-11-17 |
| #351 | lab/autotask1-migration-journal-20261117 | automation/NADZOR.md | 2026-11-17 |
| #353 | lab/fix-etalony-concurrency-20261117 | .github/workflows/verify-etalony-sync.yml, OSHIBKI.md | 2026-11-17 |
| #354 | lab/3d-master-visual-split-20261117 | reports/zavaly/PROGRESS.md | 2026-11-17 |
| #360 | lab/mg-remontnik-nadzor-20261117 | automation/NADZOR.md | 2026-11-17 |
| #364 | lab/assets-vorona-v-tumane-20261117 | automation/asset-check/SPEC.md, automation/asset-check/check_pack.py, automation/asset-check/mutate_bot.py, automation/asset-check/test_kinds.py | 2026-11-17 |
| #365 | lab/avto2-fix-zadachi-links-20261117 | OSHIBKI.md | 2026-11-17 |
| #366 | lab/mg-builder4-z01-safe-pr-triage-1117 | automation/NADZOR.md | 2026-11-17 |
| #367 | lab/assets-nebesny-gothic-city-20261117 | OSHIBKI.md, automation/asset-check/RAZVITIE.md, automation/asset-check/SPEC.md, automation/asset-check/check_pack.py, automation/asset-check/mutate_bot.py | 2026-11-17 |
| #368 | lab/z20-meta-bot-second-run-hash-20261117 | OSHIBKI.md | 2026-11-17 |
| #371 | lab/assets-ink-valley-20261117 | ZADACHI.md, automation/asset-check/OCHERED.md, automation/asset-check/SPEC.md | 2026-11-17 |
| #374 | lab/z01-preserve-summary-conflicts-builder3-1117 | reports/zavaly/PROGRESS.md | 2026-11-17 |
| #375 | lab/assets-shpili-cover-20261117-gpt6 | automation/asset-check/OCHERED.md | 2026-11-17 |
| #385 | lab/assets-black-train-puddle-reflections-20261117-gpt6 | asset-packs/incoming/black-train/src/scene.js | 2026-11-17 |
| #386 | lab/assets-black-train-mist-light-20261117 | asset-packs/incoming/black-train/makers.js, asset-packs/incoming/black-train/src/scene.js | 2026-11-17 |
| #390 | lab/avto4-z01-closed361-20261117 | automation/NADZOR.md, automation/zadachi/Z01_ZAVALY.md | 2026-11-17 |
| #391 | lab/auto2-z01-pr361-state-1117 | automation/NADZOR.md, automation/zadachi/Z01_ZAVALY.md | 2026-11-17 |
| #392 | lab/assets-last-healer-video-20261117 | ZADACHI.md, automation/asset-check/SPEC.md | 2026-11-17 |
| #393 | lab/assets-last-healer-video-20261117-gpt6 | automation/asset-check/SPEC.md | 2026-11-17 |
| #396 | lab/z01-pr-api-null-guard-1117 | automation/NADZOR.md, automation/zadachi/Z01_ZAVALY.md | 2026-11-17 |
| #397 | lab/autotask1-z01-merged361-20261117 | automation/NADZOR.md, automation/zadachi/Z01_ZAVALY.md | 2026-11-17 |
| #398 | lab/mg5-z01-pr-triage-1117 | automation/NADZOR.md, automation/zadachi/Z01_ZAVALY.md | 2026-11-17 |
| #399 | lab/avto1-nadzor-20261117-2000 | automation/NADZOR.md | 2026-11-17 |
<!-- STOROZHA:CONFLICTS:END -->
| #242 | lab/seo-claude-adfree-1111 | НУЖЕН CLAUDE: красные verify, bot, guard; SEO PR меняет claude-games/games/*/index.html (17 игр), а базовый PR #234 содержит несовпадение SHA256 защищённого pod-i-nad; не изменять эталон/охранник, проверить базовую ветку и CI: https://github.com/mpaykin1/meta6-lab/actions/runs/42981201117 | 2026-11-11 |
| #245 | lab/remont-main-veil-terraces | НУЖЕН CLAUDE: игровая правка [PR #245](https://github.com/mpaykin1/meta6-lab/pull/245) прошла [META BOT на PR](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984334) и [focused 6/6](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984307), но на main PASS нет. После безопасного слияния актуального main в ремонтную ветку [13d85bb](https://github.com/mpaykin1/meta6-lab/commit/13d85bbf4e324cb01729c8a8464bf73364889a74) автоматический Library Machine **повторно** внёс посторонние `shared/library/index.json`, `shared/library/veil-terraces.json` коммитом [02ba0f5](https://github.com/mpaykin1/meta6-lab/commit/02ba0f5812afcae9467cdefa5cb7f3b381f6ee2f). Новый [META BOT](https://github.com/mpaykin1/meta6-lab/actions/runs/43018578169) имеет `action_required`, не PASS. STOROZHA [43012984349](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984349) дважды FAIL HTTP 403 GitHub API rate limit. Третья очистка бесполезна: машинная запись восстанавливает изменения, защищённые workflow/сторож не править. Нужны одобрение новых Actions (если доступно), устранение автоматического загрязнения PR и независимая проверка до squash; затем 2 PASS META BOT на main. | 2026-11-11 |
| #192 | lab/mcp-connect | НУЖЕН CLAUDE: защищённый `.github/workflows/mcp-connect-m6.yml`; HEAD `61f0e781306400952ff0d6cf54f21b4f62d59220`, конфликт с main (`OSHIBKI.md`), красные [Portal Visited](https://github.com/mpaykin1/meta6-lab/actions/runs/42711867873) и [META BOT](https://github.com/mpaykin1/meta6-lab/actions/runs/42711868016); самостоятельно не сливать. | 2026-11-11 |
| #218 | lab/remont-r1-library | НУЖЕН CLAUDE: PR меняет защищённый `.github/workflows/library-machine.yml`; конфликт с main затрагивает `OSHIBKI.md`. Самослияние запрещено; требуется разрешение конфликта, независимая проверка и зелёный CI. PR: https://github.com/mpaykin1/meta6-lab/pull/218 | 2026-11-11 |
| #221 | lab/zadachi-tolkach | НУЖЕН CLAUDE: PR изменяет защищённые `.github/workflows/zadachi-watch.yml`, `scripts/zadachi/mutate.mjs`, `scripts/zadachi/verify.mjs`, `scripts/zadachi/watch.mjs`, `rules/06-rabota-ii-s-kodom/TABLITSA_ZADACH.md`; конфликт с main (`OSHIBKI.md`, `TABLITSA_ZADACH.md`), HEAD `757890f0aa4809e92d3466c55a1db98269f133e6`; самослияние запрещено. https://github.com/mpaykin1/meta6-lab/pull/221 | 2026-11-11 |
| #87 | lab/platform-play-connect-earn-20261107 | НУЖЕН CLAUDE: исторические коммиты `faf69f129ae3510a81e59a48328534fed8a5f944`, `d66f304967540ca9b9c144140ea51c971b3e2365` затрагивают защищённый `.github/protected` без Claude-трейлера; META GAMES guard FAIL https://github.com/mpaykin1/meta6-lab/actions/runs/42975697783 . HEAD `2a1d22c9bcd5ddb1e4f2eb6ae599a6816371ef7d`; требуется одобрение безопасного переноса только `meta-games/index.html` в чистую ветку, затем независимая проверка. Самослияние запрещено. | 2026-11-11 |
| #133 | lab/asqura-single-graphics-reference-20261108 | НУЖЕН CLAUDE: PR изменяет принятый эталон `reference/asqura-office/index.html` и `reference/asqura-office/REFERENCE.json`; конфликт `OSHIBKI.md`, HEAD `633ad10443f9c5e9f1132b6d91d68ad3955b0159`; проверить источник и защищённые изменения перед решением о слиянии. https://github.com/mpaykin1/meta6-lab/pull/133 | 2026-11-11 |

| #233 | lab/import-five-cc0-packs | НУЖЕН ВЛАДЕЛЕЦ: PR draft, импорт 4/5; оригинальный `Overworld Files.zip` (Tiny Overworld) не получен с интерактивной страницы https://ansimuz.itch.io/tiny-overworld/purchase; не заменять другим архивом и не сливать как 5/5. HEAD `34176a2e47a2195492db486d1440428252d0a34d`, зелёные KONTUR Guard/META GAMES guard на этом SHA. https://github.com/mpaykin1/meta6-lab/pull/233 | 2026-11-11 |
| #203 | lab/skin-rusty-robot | НУЖЕН CLAUDE: PR изменяет защищённые `.github/workflows/skin-live.yml`, `.github/workflows/skin-pack.yml`; конфликт с main (`OSHIBKI.md`, `games/skin-trainer/index.html`, `rules/01-stil-i-grafika/SKINY.md`); самостоятельное слияние запрещено. https://github.com/mpaykin1/meta6-lab/pull/203 | 2026-11-11 |
| #200 | lab/bot-batch-2 | НУЖЕН CLAUDE: PR меняет защищённый `.github/workflows/b2-batch-2.yml` и проверки `scripts/meta-bot-adapters-2/verify-motion.mjs`, `verify-sources.mjs`, `verify-steering.mjs`; конфликт с main (`OSHIBKI.md`, `shared/library/index.json`); самослияние запрещено. https://github.com/mpaykin1/meta6-lab/pull/200 | 2026-11-11 |
| #3 | lab/twilight-island-bot | НУЖЕН CLAUDE: старейший доступный ЗАВИС из ZADACHI.md (взято 2026-11-06 14:45 UTC); PR изменяет существующую игру `games/twilight-island/` (index.html, bot-adapter.js, bot-strategy.mjs, управление и другие файлы), что запрещено разделом «НЕДЕЛЯ БЕЗ CLAUDE» без Claude. HEAD `bf899da496d873ea677fa960d3e6c688d1a337ab`. https://github.com/mpaykin1/meta6-lab/pull/3 | 2026-11-13 |
| #131 | lab/owner-graphics-animation-references-20261108 | НУЖЕН CLAUDE: защищённый `.github/workflows/extract-owner-graphics-assets.yml`; изменения существующего `meta-games/index.html` и большой набор эталонных файлов; PR конфликтует с main. Самослияние запрещено. https://github.com/mpaykin1/meta6-lab/pull/131 | 2026-11-11 |
| #201 | lab/reference-foggy-awakening-scene-1 | НУЖЕН CLAUDE: PR добавляет исходный ZIP-эталон `reference-uploads/foggy-awakening-scene-1/Сцена 1 — Туманное пробуждение.zip`; принятие оригинала защищено, самостоятельное слияние запрещено; PR конфликтует с main, нет подтверждённого запуска игры и META BOT PASS. https://github.com/mpaykin1/meta6-lab/pull/201 | 2026-11-11 |

<!-- STOROZHA:STALE:BEGIN -->
| #131 | lab/owner-graphics-animation-references-20261108 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-11 |
| #129 | lab/cycle4-twilight-isles-no-ads-1108 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-12 |
| #193 | lab/kontur-k7-review | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-12 |
| #201 | lab/reference-foggy-awakening-scene-1 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-12 |
| #205 | lab/owner-pult | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-12 |
| #192 | lab/mcp-connect | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-12 |
| #204 | lab/rules-bot-trainer | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #54 | lab/render-visibility-optimization | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #189 | lab/endless-valleys-golden-knight-reference-1109 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #190 | lab/bot-batch-1 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #200 | lab/bot-batch-2 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #202 | lab/archer-in-fog-reference-20261109 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #207 | lab/king-of-ash-original-upload-1109 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #208 | lab/ashen-path-asset-pack-restore-1109 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #209 | lab/library-catalog | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #222 | lab/ci-ochered-concurrency | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-13 |
| #87 | lab/platform-play-connect-earn-20261107 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-14 |
| #225 | lab/render-broken-city-safe-1110 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-14 |
| #203 | lab/skin-rusty-robot | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-14 |
| #233 | lab/import-five-cc0-packs | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-14 |
| #273 | lab/uluchshatel-recipe13-20261112 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-15 |
| #3 | lab/twilight-island-bot | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-15 |
| #191 | lab/sunken-city-reference-1109 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-15 |
| #235 | lab/fix-mobile-screen-all-games-1111 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-15 |
| #272 | lab/uluchshatel-sumerki-copy-bot13-20261112 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-15 |
| #234 | lab/claude-adfree-catalog-1110 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #255 | lab/archer-meta-adfree-clean-1111 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #277 | lab/storozha-nedelya | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #280 | lab/ink-forest-1113 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #218 | lab/remont-r1-library | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #220 | lab/zadachi-conflicts | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #247 | lab/kak-proveryayushchij-traps | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #254 | lab/auditor-truthful-cycle-20261111 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #260 | lab/uluchshatel-preflight-20261111 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #261 | lab/biblioteka-contract-20261111 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #268 | lab/link-guard-recovery-1111 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #284 | lab/ink-fallen-guardian-reference-20261113 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #286 | lab/ink-fallen-guardian-recipe-20261113 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #289 | lab/antisueta | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #303 | lab/asset-pack-shpili | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
| #305 | lab/assets-tumannye-shpili-20261114 | закрыт сторожем как заброшенный; ветка сохранена | 2026-11-16 |
<!-- STOROZHA:STALE:END -->
| #190 | lab/bot-batch-1 | НУЖЕН CLAUDE: защищённый `.github/workflows/bot-adapters-b2.yml`; конфликт с main (`OSHIBKI.md`); проверка B2 охватывает 2/3 игр, `archer-in-the-fog` не подтверждён. Самослияние запрещено. https://github.com/mpaykin1/meta6-lab/pull/190 | 2026-11-11 |
| #54 | lab/render-visibility-optimization | НУЖЕН CLAUDE: PR изменяет защищённый `.github/workflows/lab-render-performance.yml` и существующий эталон `games/veil-terraces/index.html`; конфликт с main (`docs/progress/PR54_59_60.md`), самостоятельное слияние запрещено. https://github.com/mpaykin1/meta6-lab/pull/54 | 2026-11-12 |

| #234 | lab/claude-adfree-catalog-1110 | НУЖЕН CLAUDE: PR меняет существующие игры `games/*` и защищённые `scripts/storozha/*`; красный CI, самостоятельно исправлять защищённое и сливать запрещено. https://github.com/mpaykin1/meta6-lab/pull/234 | 2026-11-12 |

| #191 | lab/sunken-city-reference-1109 | НУЖЕН CLAUDE: PR содержит исходный ZIP `reference-archives/zatonuvshiy-gorod-2026-11-09.zip` и существующий эталон `games/sunken-city-reference/index.html`, `games/sunken-city-reference/bot-adapter.js`; HEAD `e135682bcca49e309e117383c94046228b6facef`. Проверить целостность оригинала и обязательные META BOT/CI, самослияние запрещено. https://github.com/mpaykin1/meta6-lab/pull/191 | 2026-11-12 |

## Ждёт Claude

| #353 | `lab/fix-etalony-concurrency-20261117` | Исправление защищённого `.github/workflows/verify-etalony-sync.yml`: `cancel-in-progress: false` для main/schedule. [HEAD 31db37e](https://github.com/mpaykin1/meta6-lab/commit/31db37ec5cc99dc27564159681567747b91af43b), [KONTUR PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/44002079345), [browser PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/44002079368); mergeable=false, Claude должен устранить конфликт и проверить текущий HEAD перед слиянием. Разблокирует [#351](https://github.com/mpaykin1/meta6-lab/pull/351). | 2026-11-17 |


Одна строка на PR; автоматическое слияние защищённых проверок запрещено.
| #325 | lab/ink-black-grin-monster-20261115 | ЯДРО: после нормального [merge main b848d00](https://github.com/mpaykin1/meta6-lab/commit/b848d00f5ca3185be66363b3b1885db9639084ea) [META GAMES guard FAIL #43995067772](https://github.com/mpaykin1/meta6-lab/actions/runs/43995067772): исторический [a044eb6](https://github.com/mpaykin1/meta6-lab/commit/a044eb6c85fd457af8b7ad3a557ac23c46fddc02) меняет `.github/protected` без подписи Claude. Не переписывать историю/не обходить guard; нужен Claude. | 2026-11-17 |
| #326 | lab/ink-sky-viaduct-20261115 | ЯДРО: после нормального [merge main c5e20dd](https://github.com/mpaykin1/meta6-lab/commit/c5e20dd4558e16d9be8b110ca1bc72cc8a8a9160) [META GAMES guard FAIL #43995125843](https://github.com/mpaykin1/meta6-lab/actions/runs/43995125843): исторический [ff586b3](https://github.com/mpaykin1/meta6-lab/commit/ff586b34283cb369cd4e412f6b17128c632fe16d) меняет `.github/protected` без подписи Claude. [INK 3D preview PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43995125678); история/guard не изменялись, нужен Claude. | 2026-11-17 |

| #208 | `lab/ashen-path-asset-pack-restore-1109` | **НУЖЕН CLAUDE:** источник владельца `reference/ashen-path-asset-pack/index.html` идентичен оригиналу (Git blob `a5911f6d0a0e36fc4fc0ad581be071dfb6d7882c`), но [KONTUR FAIL 42799091174](https://github.com/mpaykin1/meta6-lab/actions/runs/42799091174) отклоняет исходный `LEGACY_LIGHTS` (К4.1). Не менять авторские байты и защищённый `scripts/kontur/guard.mjs` силами толкача; Claude должен определить безопасное исключение с ловушками и получить зелёные проверки **до** merge. [PR #208](https://github.com/mpaykin1/meta6-lab/pull/208), HEAD `ad81a3d4196a19e81a50a60a3dd4faaef904ced6`; на этом SHA **зелёного KONTUR нет**. | 2026-11-12 |

| #247 | `lab/kak-proveryayushchij-traps` | РЕШЕНИЕ НА ПОДПИСЬ CLAUDE: [HEAD 0ad2066](https://github.com/mpaykin1/meta6-lab/commit/0ad2066e74a828459cb40fc2133f27a513c40499). GraphQL reference read/write + checkout SHA; новый патч добавляет gates к уже принятому Claude fetch-depth 0. Исправлена несовместимая фикстура core-only, 7 атак сохранены + 1 новая: [красный KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/43413334165). [KONTUR PASS: 43 скрипта](https://github.com/mpaykin1/meta6-lab/actions/runs/43413709893), [B1 PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43413710375); [reference guard требует подпись ядра](https://github.com/mpaykin1/meta6-lab/actions/runs/43413710307). Claude: принять защищённый reference-check, проверить дополнительный patch/gates и live writer на main. Самослияние запрещено. | 2026-11-13 |

| #133 | `lab/asqura-single-graphics-reference-20261108` | **НУЖЕН CLAUDE:** [PR #133](https://github.com/mpaykin1/meta6-lab/pull/133) HEAD `bcbdb6ef08a95d9739bd86baf3cbcf4ca8f1ea30` содержит исходный эталон `reference/asqura-office/`, а проверка STOROZHA [43239240778](https://github.com/mpaykin1/meta6-lab/actions/runs/43239240778/job/131674186810) после повторного запуска FAIL: «Новый эталон: PR должен только добавлять файлы»; историческое изменение `OSHIBKI.md` и `scripts/lab/mutate-owner-reference-placement.mjs` нельзя удалить обычным merge main. Безопасное решение — Claude одобряет чистую ветку только с оригиналом и отдельный PR для ловушек, затем новая независимая проверка; сейчас нет зелёного run, не сливать. | 2026-11-13 |
| #87 | `lab/platform-play-connect-earn-20261107` | **НУЖЕН CLAUDE:** [PR #87](https://github.com/mpaykin1/meta6-lab/pull/87), HEAD [`2a1d22c9bcd5ddb1e4f2eb6ae599a6816371ef7d`](https://github.com/mpaykin1/meta6-lab/commit/2a1d22c9bcd5ddb1e4f2eb6ae599a6816371ef7d): [META GAMES guard FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/42975697783/job/130374149800) — исторические `faf69f1` и `d66f304` меняли `.github/protected` без подписи; [KONTUR PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/42976938005). Одобрить перенос **только** `meta-games/index.html` в чистую ветку и независимую проверку; старую историю не переписывать, guard не отключать. **Полного зелёного CI нет; без слияния.** | 2026-11-13 |
| #189 | lab/endless-valleys-golden-knight-reference-1109 | НУЖЕН CLAUDE: унаследованный merge-коммит `32e113f6f6bef74a92b2333004481ff07991db2e` затрагивает защищённую `.github/protected`; `kontur-guard` FAIL, переписывание истории/обход охранника запрещены. https://github.com/mpaykin1/meta6-lab/pull/189 ; https://github.com/mpaykin1/meta6-lab/actions/runs/42771627962 | 2026-11-13 |

- 2026-11-13 · НУЖЕН CLAUDE: [PR #282](https://github.com/mpaykin1/meta6-lab/pull/282), ветка `lab/auditor-task-table-20261113`, защищённые `.github/workflows/auditor.yml`, `scripts/auditor/mutate-auditor.mjs`. Одобрить подключение нового task-table.cjs к отчёту после проверки текущего [SHA](https://github.com/mpaykin1/meta6-lab/commit/1086955d099df2db451317dd3409bf0356f661d0). [Auditor на первом SHA success](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251668); [STOROZHA protected failure](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251606), [quota failure LIVE=42](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251627); исходный [KONTUR failure](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251632) исправлен числовыми строками 1004/1005 и полным путём ловушки, итог нового run ещё не подтверждён. Не обходить проверки. Согласовать пересечение workflow с #254/#269/#275; отдельно расследовать редкое создание schedule и проверить GraphQL pin #253.

| #220 | `lab/zadachi-conflicts` | Одобрить защищённый zadachi-watch workflow и существующие изменения сторожа; конфликт устранён без правок его кода. [KONTUR PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43392373257), [B1 PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43392373208), [ZADACHI PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43392373305), [штатный protected FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/43392373214); HEAD `fb2cde9aa428959c33a44dd0af6d14dcf73e0ef2`, самослияния нет. | 2026-11-13 |

| #255 | lab/archer-meta-adfree-clean-1111 | НУЖЕН CLAUDE: конфликт журнала устранён [aff43ec](https://github.com/mpaykin1/meta6-lab/commit/aff43ecd7514f789ee448e05516c513f8d34d3f8), [KONTUR PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43409726797), [B1 PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43409726828). Остались [focused bot FAIL: уровни 5/6, progress=6, 20 с](https://github.com/mpaykin1/meta6-lab/actions/runs/43409727166/job/131832938881) и настоящий unsigned protected merge 55b7cbb: [guard FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/43409726812). [Общий бот также FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/43409726967/job/131832829500). Нужны исправление существующей стратегии/игры с проверкой 7/7 и разрешённое историческое решение; shallow-патч #247 не снимает этот запрет. Не сливать и не переписывать историю. | 2026-11-13 |

| #260 | lab/uluchshatel-preflight-20261111 | Конфликты сняты [dad5f9f](https://github.com/mpaykin1/meta6-lab/commit/dad5f9f42c9923e7c9f01bddc25edfde657cd976), [KONTUR PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43413130662), [B1 PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43413130857), [META GAMES PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43413130784). [Reference guard дважды HTTP 403](https://github.com/mpaykin1/meta6-lab/actions/runs/43413130789/job/131845211304); нужен ремонт ядра #247 или восстановление API-лимита и повтор guard. Draft на подпись: дополнены существующие preflight-тесты, по запрету этого запуска самослияния нет. | 2026-11-13 |
- УСКОРЕНИЕ 13.11.2026 — ядро STOROZHA: [branch updater 43409815373](https://github.com/mpaykin1/meta6-lab/actions/runs/43409815373) и [weekly 43409546447](https://github.com/mpaykin1/meta6-lab/actions/runs/43409546447) падают из-за GitHub API 403 rate limit; `scripts/storozha/weekly-watch.mjs` показывает «зависших 0» по stale PR вместо таблицы [ZADACHI.md](https://github.com/mpaykin1/meta6-lab/blob/main/ZADACHI.md) (24 зависших на последнем полном снимке). Требуется общий источник и экономия API внутри ядра; ядро не менялось.
| #314 | lab/sunken-city-clean-source-20261114 | CLAUDE: source-only замена #191 сохранила [187 исходных файлов, ZIP SHA ebc39f](https://github.com/mpaykin1/meta6-lab/commit/c6df59963f9ede875e7cf15768778e05c4370385), но [focused META BOT](https://github.com/mpaykin1/meta6-lab/actions/runs/43562767556/job/132349894621) FAIL: уровень 1, герой застрял 20 с, progress=0. Сохранить bytes оригинала: нужен отдельный игровой адаптер или разрешённое исправление без ослабления проверки/бота; оставить [#314](https://github.com/mpaykin1/meta6-lab/pull/314) draft. | 2026-11-14 |

- КАРТА СИЛ #301 / quota: #134 закрыт как заменённый #195 (сверены HTML и 4 PNG); #72 после merge main dc663fbc блокируется историческими merge-коммитами `.github/protected` без подписи ([guard](https://github.com/mpaykin1/meta6-lab/actions/runs/43551023196/job/132313248053)), как #87; #133 referenceGate требует одновременно source-only и вынести добавленные OSHIBKI/ловушку К3 без удаления проверки. Нужна правка/подпись только ядра охраны или разрешённый способ переноса истории; сами охранники и исходники не менялись. Квота блокирует #301 и первый расчёт main.

| #258 | lab/prohodchik-b2-motion-20261111 | CLAUDE: B2 real-motion на HEAD 95cd1017 — [PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43802754806), но [guard FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/43802754797); PR пока draft. Разобрать подпись/защищённые тесты/базу без удаления существующих проверок и ослабления порогов; затем зелёный CI и слияние. | 2026-11-16 |
