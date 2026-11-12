# СВОДКА ДЛЯ CLAUDE
UTC: 2026-11-12T08:51:54.346Z | МГЛ: 62377781025c127863c73de1e10e3c946b3d82d7 | МГ: 573ec644a032aa3cbf999193c09fa2176ce69a7a | https://github.com/mpaykin1/meta6-lab/actions/runs/43186337136
## ПРОВЕРИТЬ CLAUDE
- PR #246 72a2be2281e8f4c54785599732024b111d50bfd1: .github/workflows/lab-pages.yml, .github/workflows/link-guard.yml, scripts/lab/mutate-link-ok.sh, scripts/lab/mutate-page-assets.mjs, scripts/lab/mutate-page-assets.py, scripts/lab/verify-check-page-assets.sh, … (сокращено)
- PR #265 f0a6d79bdda5416da56a145901e0216808cba97e: .github/workflows/asset-check.yml, automation/asset-check/test_check_pack.py
- PR #251 5016e0750ad94d53798200f6db159f9c37f55ab1: .github/workflows/auditor.yml, scripts/auditor/mutate-auditor.mjs
- ещё 9: https://github.com/mpaykin1/meta6-lab/pulls
- МГЛ: META BOT | https://github.com/mpaykin1/meta6-lab/actions/runs/43182878550 | Play all games
- МГЛ: MG Dispatcher | https://github.com/mpaykin1/meta6-lab/actions/runs/43174592471 | Run node scripts/dispetcher/run.mjs
- | PR | Группа | Ветка | Название | GitHub | Сделано (ChatGPT: слит SHA / закрыт причина / НУЖЕН CLAUDE причина / в работе) |
- | #208 | эталон | `lab/ashen-path-asset-pack-restore-1109` | Restore original Ashen Path asset pack reference after sync | open | НУЖЕН CLAUDE: KONTUR Guard отклоняет исходный LEGACY_LIGHTS, [красный прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/4… (сокращено)
- | #207 | эталон | `lab/king-of-ash-original-upload-1109` | Эталон: Король Пепла — исходная игра и каталог 34 ассетов | open | НУЖЕН CLAUDE: старый коммит трогает protected, [красный guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42771440585), [обнов… (сокращено)
- ещё 6: https://github.com/mpaykin1/meta6-lab/blob/main/automation/SLIYANIE.md
- | M6 | lab/mcp-connect | свободно (зависло 6 ч, было: MG-строитель-3) | 2026-11-09 22:25 UTC |
- | К7 | lab/kontur-k7-review | свободно (зависло 6 ч, было: ВОЗВРАЩЁН Claude (ложные срабатывания, см. комментарий в PR #193) — попытка 1 из 2) | 2026-11-09 17:50 |
- | B2 ч.1 (twilight-isle-classic, twilight-isles, archer-in-the-fog) | lab/bot-batch-1 | свободно (зависло 6 ч, было: чат ChatGPT) | 2026-11-09 15:15 |
- ещё 3: https://github.com/mpaykin1/meta6-lab/blob/main/rules/09-platforma/ZANYATO.md
## ФИНИШ
готовы: ничего
M1 — нет данных: нет данных
M2 — нет данных: нет данных
M3 — нет данных: нет данных
M4 — нет данных: нет данных
M5 — нет данных: нет данных
M6 — нет данных: нет данных
B1 — нет данных: нет данных
B2 — нет данных: нет данных
B3 — нет данных: нет данных
B4 — нет данных: нет данных
B5 — нет данных: нет данных
B6 — нет данных: нет данных
B7 — нет данных: нет данных
L1 — нет данных: нет данных
L2 — нет данных: нет данных
L3 — нет данных: нет данных
L4 — нет данных: нет данных
P1 — нет данных: нет данных
Л1 — нет данных: нет данных
Л2 — нет данных: нет данных
Л3 — нет данных: нет данных
Л4 — нет данных: нет данных
Л5 — нет данных: нет данных
Л6 — нет данных: нет данных
С1 — нет данных: нет данных
С2 — нет данных: нет данных
Э1 — нет данных: нет данных
Э2 — нет данных: нет данных
## PR МГЛ
открыто: 53 | конфликт: нет данных | слито: 22 | закрыто: 50
#257 docs(zadachi): не создавать дубли задач по одному PR | 79f4465b6667092e16115222325c012ca73cc137
#256 docs: сохранить многоразовый промпт ТОЛКАЧ МГ/МГЛ | 2d6875a04b80e3ca3d8caea4e1c867c9eadc2dec
#243 Геймдизайн-аудит META GAMES — чистый PR без защищённой истор | 98d7334782dfeac39984972d3b2bf2067828bd81
ещё 19: https://github.com/mpaykin1/meta6-lab/pulls?q=is%3Apr+is%3Amerged
## ИЗМЕНИЛОСЬ ПОСЛЕ ПРОВЕРКИ CLAUDE
МГЛ: 1282 коммитов | нет данных
МГ: 5 коммитов | AGENTS.md:1, automation:1, CLAUDE.md:1, ink:6, ink.md:1, rules:2
## ИГРЫ
archer-in-the-fog — не запускалась | витрина: да
asqura-ilya-reference — не запускалась | витрина: нет
broken-city — не запускалась | витрина: да
broken-city-copy — не запускалась | витрина: да
rainbow-acceleration — не запускалась | витрина: нет
skin-trainer — не запускалась | витрина: нет
sumerki-i-pepel-2 — не запускалась | витрина: да
sumerki-i-pepel-2-copy — не запускалась | витрина: нет
twilight-isle-classic — не запускалась | витрина: да
twilight-isles — не запускалась | витрина: да
veil-terraces — не прошла | витрина: да
## НОВЫЕ ОШИБКИ
| 32 | 10.11.2026 | CI запускал удалённую `games/veil-terraces-shared`, поэтому бот не находил `window.__META_BOT__` | [.github/workflows/lab-veil-shared.yml](.github/workflows/lab-veil-shared.yml) | `scripts/lab/mutate-veil-workflow-target.mjs`: отсутствующая… (сокращено)
| 33 | 10.11.2026 | Portal Visited ожидал жёсткие 12 карточек при 11 реальных ссылках; изменение каталога ломало проверку, не механику | [check-portal-visits.mjs](scripts/lab/check-portal-visits.mjs) | `scripts/lab/mutate-portal-links.mjs`: пустой каталог, дуб… (сокращено)
| 24 | 10.11.2026 | Сводка без progress.json или при ошибке GitHub API могла бы выдавать непроверенные пункты как «готово» и прятать красные прогоны; старые варианты #211/#212 не защищали эту сводку полным набором мутаций | Изолированные ответы: отсутствующий … (сокращено)
ещё 14: https://github.com/mpaykin1/meta6-lab/blob/main/OSHIBKI.md
