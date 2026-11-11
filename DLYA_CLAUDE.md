# Для Claude — подтверждённые блокировки

<!-- STOROZHA:PROTECTED:BEGIN -->
| #238 | lab/pr-autofinish-1111 | НУЖЕН CLAUDE: .github/workflows/journal-projections.yml, .github/workflows/pr-autofinish.yml, .github/workflows/report-completion-guard.yml, .github/workflows/storozha-branches.yml, .github/workflows/storozha-quota.yml, .github/workflows/storozha-reference.yml, .github/workflows/storozha-tests.yml, .github/workflows/storozha-weekly.yml; scripts/autofinish/run.mjs; scripts/storozha/** | 2026-11-11 |
| #246 | lab/link-guard-200 | .github/workflows/lab-pages.yml: изменение защищённого workflow/охранника/бота/теста — только Claude; .github/workflows/link-guard.yml: изменение защищённого workflow/охранника/бота/теста — только Claude | 2026-11-11 |
<!-- STOROZHA:PROTECTED:END -->

<!-- STOROZHA:CONFLICTS:BEGIN -->
| #54 | lab/render-visibility-optimization | docs/progress/PR54_59_60.md | 2026-11-11 |
| #129 | lab/cycle4-twilight-isles-no-ads-1108 | .github/workflows/sync-from-meta6.yml | 2026-11-11 |
| #132 | lab/cycle5-archer-meta-adfree-1108 | OSHIBKI.md | 2026-11-11 |
| #133 | lab/asqura-single-graphics-reference-20261108 | OSHIBKI.md | 2026-11-11 |
| #134 | lab/abyss-glow-owner-reference-20261108 | OSHIBKI.md | 2026-11-11 |
| #190 | lab/bot-batch-1 | OSHIBKI.md | 2026-11-11 |
| #191 | lab/sunken-city-reference-1109 | OSHIBKI.md | 2026-11-11 |
| #192 | lab/mcp-connect | OSHIBKI.md | 2026-11-11 |
| #200 | lab/bot-batch-2 | OSHIBKI.md, shared/library/index.json | 2026-11-11 |
| #203 | lab/skin-rusty-robot | OSHIBKI.md, games/skin-trainer/index.html, rules/01-stil-i-grafika/SKINY.md | 2026-11-11 |
| #204 | lab/rules-bot-trainer | OSHIBKI.md | 2026-11-11 |
| #205 | lab/owner-pult | OSHIBKI.md | 2026-11-11 |
| #209 | lab/library-catalog | BIBLIOTEKA.md, OSHIBKI.md | 2026-11-11 |
| #218 | lab/remont-r1-library | OSHIBKI.md | 2026-11-11 |
| #219 | lab/status-a1-20261110 | OSHIBKI.md, SMENA.md | 2026-11-11 |
| #220 | lab/zadachi-conflicts | OSHIBKI.md | 2026-11-11 |
| #221 | lab/zadachi-tolkach | OSHIBKI.md, rules/06-rabota-ii-s-kodom/TABLITSA_ZADACH.md | 2026-11-11 |
| #225 | lab/render-broken-city-safe-1110 | OSHIBKI.md, SMENA.md | 2026-11-11 |
| #235 | lab/fix-mobile-screen-all-games-1111 | OSHIBKI.md, SMENA.md | 2026-11-11 |
| #237 | lab/chat-pr-queue-1111 | SMENA.md, automation/chat/PROGRESS_SOZDANIE.md | 2026-11-11 |
| #241 | lab/shared-index-symlink-1111 | OSHIBKI.md | 2026-11-11 |
<!-- STOROZHA:CONFLICTS:END -->
| #242 | lab/seo-claude-adfree-1111 | НУЖЕН CLAUDE: красные verify, bot, guard; SEO PR меняет claude-games/games/*/index.html (17 игр), а базовый PR #234 содержит несовпадение SHA256 защищённого pod-i-nad; не изменять эталон/охранник, проверить базовую ветку и CI: https://github.com/mpaykin1/meta6-lab/actions/runs/42981201117 | 2026-11-11 |
| #245 | lab/remont-main-veil-terraces | НУЖЕН CLAUDE: автоматический `Library Machine` после каждой правки `games/veil-terraces/index.html` добавляет `shared/library/index.json` и `shared/library/veil-terraces.json` в PR, нарушая «одна игровая папка». После очистки [cd3d652](https://github.com/mpaykin1/meta6-lab/commit/cd3d652fde6d87af7dfc2dce280862028a4b3c70) те же файлы добавлены снова [c4764ae](https://github.com/mpaykin1/meta6-lab/commit/c4764aedc4511a47a8d581e89fbd561cb0632a6f), а META BOT на текущем head получил [action_required 43012547592](https://github.com/mpaykin1/meta6-lab/actions/runs/43012547592). Нужна разрешённая настройка защищённой автоматики и подтверждение прогона на актуальном head; бота и workflow ChatGPT не меняет. Исходная ошибка: [main 42982185772](https://github.com/mpaykin1/meta6-lab/actions/runs/42982185772) | 2026-11-11 |
