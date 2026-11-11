# Для Claude — подтверждённые блокировки

<!-- STOROZHA:PROTECTED:BEGIN -->
| #248 | lab/pr-autofinish-followup-1111 | .github/workflows/journal-projections.yml: изменение защищённого workflow/охранника/бота/теста — только Claude; .github/workflows/pr-autofinish.yml: изменение защищённого workflow/охранника/бота/теста — только Claude | 2026-11-11 |
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
| #245 | lab/remont-main-veil-terraces | НУЖЕН CLAUDE: игровая правка [PR #245](https://github.com/mpaykin1/meta6-lab/pull/245) прошла [META BOT на PR](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984334) и [focused 6/6](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984307), но на main PASS нет. После безопасного слияния актуального main в ремонтную ветку [13d85bb](https://github.com/mpaykin1/meta6-lab/commit/13d85bbf4e324cb01729c8a8464bf73364889a74) автоматический Library Machine **повторно** внёс посторонние `shared/library/index.json`, `shared/library/veil-terraces.json` коммитом [02ba0f5](https://github.com/mpaykin1/meta6-lab/commit/02ba0f5812afcae9467cdefa5cb7f3b381f6ee2f). Новый [META BOT](https://github.com/mpaykin1/meta6-lab/actions/runs/43018578169) имеет `action_required`, не PASS. STOROZHA [43012984349](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984349) дважды FAIL HTTP 403 GitHub API rate limit. Третья очистка бесполезна: машинная запись восстанавливает изменения, защищённые workflow/сторож не править. Нужны одобрение новых Actions (если доступно), устранение автоматического загрязнения PR и независимая проверка до squash; затем 2 PASS META BOT на main. | 2026-11-11 |
| #192 | lab/mcp-connect | НУЖЕН CLAUDE: защищённый `.github/workflows/mcp-connect-m6.yml`; HEAD `61f0e781306400952ff0d6cf54f21b4f62d59220`, конфликт с main (`OSHIBKI.md`), красные [Portal Visited](https://github.com/mpaykin1/meta6-lab/actions/runs/42711867873) и [META BOT](https://github.com/mpaykin1/meta6-lab/actions/runs/42711868016); самостоятельно не сливать. | 2026-11-11 |
| #218 | lab/remont-r1-library | НУЖЕН CLAUDE: PR меняет защищённый `.github/workflows/library-machine.yml`; конфликт с main затрагивает `OSHIBKI.md`. Самослияние запрещено; требуется разрешение конфликта, независимая проверка и зелёный CI. PR: https://github.com/mpaykin1/meta6-lab/pull/218 | 2026-11-11 |
