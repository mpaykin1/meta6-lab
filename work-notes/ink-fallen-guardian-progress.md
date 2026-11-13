# INK · Павший великан — прогресс

2026-11-13 — Из GitHub прочитаны AGENTS.md (МГ и МГЛ), ink.md, паспорт v1 и исходники робота/леса.

- PR #284 (эталонная ссылка) и PR #283 (файлы v1) пока не слиты: storozha-quota FAIL, LIVE=40, требуется сначала завершить старые #3/#72/#87/#133/#134. Не отключать охранник.
- Файлы одобренного рендера не изменены.
- Шаг рецепта: создано правило, шаблон INK, ссылки в МГЛ AGENTS.md и ink.md; в meta6 записывать запрещает ПЕСОЧНИЦА (только Claude).
- Следующие независимые шаги: тестовый колокол отдельным PR; v2 робота отдельным PR, без изменения v1; после зелёного CI и снижения числа открытых PR — слияние PR #284 перед #283, затем обновление паспорта и охранников только штатным владельцем.

2026-11-13 — [PR #286](https://github.com/mpaykin1/meta6-lab/pull/286): рецепт+шаблон; [PR #287](https://github.com/mpaykin1/meta6-lab/pull/287): анимация робота v2, шарниры/16 частиц/скрип, isolated preview; [PR #288](https://github.com/mpaykin1/meta6-lab/pull/288): новый каменный колокол, isolated preview. JS обоих превью и модулей успешно разобран парсером; браузерный визуальный прогон и реальный мобильный FPS ещё не подтверждены.

Дополнительная ловушка рецепта: не заменять изначальный неравномерный scale детали через setScalar в анимации. Исправлено у колокола и в шаблоне. Vercel 13.11: лимит free 100 деплоев/сутки, публикация новых превью отклонена Vercel bot (PR #287, #288). Не придумывать живую ссылку.

2026-11-13 — Для v1 добавлен независимый SHA-охранник в [PR #283](https://github.com/mpaykin1/meta6-lab/pull/283): [коммит 5c61a60780b67197886f7edec78c739731a6a03f](https://github.com/mpaykin1/meta6-lab/commit/5c61a60780b67197886f7edec78c739731a6a03f), 7 принятых Git blob SHA, три мутации включая фальшивый паспорт. Основные protected/paths.txt и SHA256SUMS не изменены: их допускается менять только Claude по локальным правилам. В MG (meta6) только чтение. Живой эталон и preview не подтверждены из-за незавершённых слияний и лимита Vercel; не считать их опубликованными.

2026-11-13 — Временная бесплатная публикация минуя лимит Vercel:
- v2: https://rawcdn.githack.com/mpaykin1/meta6-lab/17b6c42bc758ffc493e50eb1845f1b31e26846f8/preview/ink-fallen-guardian-v2/index.html?ink=forest&palette=color ; HTTP 200 в https://github.com/mpaykin1/meta6-lab/actions/runs/43413822844 .
- Колокол (sandbox, не сливать до OWNER PASS): https://rawcdn.githack.com/mpaykin1/meta6-lab/828c03e8f4d94dd110987c5af8868ccce6909680/preview/ink-stone-bell/index.html?ink=forest&palette=color ; HTTP 200 в https://github.com/mpaykin1/meta6-lab/actions/runs/43414393198 .
- v1/v2 сравнение Chrome desktop 1280×800 и phone-layout 390×844: console/pageerror 0; разница 0.01%/0.00% при начальной позе; v2 FPS estimate 57.8 на GitHub Linux Chromium, это НЕ физический телефон. Browser CI https://github.com/mpaykin1/meta6-lab/actions/runs/43414752516 PASS.
- Фото-/аппаратный реальный телефон 30 FPS не подтверждён. Главная ссылка v1 GitHub Pages ещё ожидает завершения PR #284/#283; storozha-quota FAIL, защищённые пути меняет только Claude, перенос в meta6 также только Claude.
