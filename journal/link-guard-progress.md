# ССЫЛКА = 200 — прогресс

| Шаг | Статус | Доказательство / блокер |
|---|---|---|
| 1. HTTP 200 living-watercolor | НЕ ГОТОВО | [LAB Pages 43014011230](https://github.com/mpaykin1/meta6-lab/actions/runs/43014011230): старый запуск блокировался GitHub API 403. Прямой POST с повторами: [f4db67c](https://github.com/mpaykin1/meta6-lab/commit/f4db67c614099f8c6f2c7ec825b345f853313f32), [успешный kick-main 43014520205](https://github.com/mpaykin1/meta6-lab/actions/runs/43014520205). Main deploy [43014947075](https://github.com/mpaykin1/meta6-lab/actions/runs/43014947075) ожидает исполнения; строки 200 для акварели пока нет. |
| 2. link-ok.sh | КОД + ЛОВУШКИ PASS | [044338e](https://github.com/mpaykin1/meta6-lab/commit/044338e3eb3218a66c37225d0c8959e439e6eec2), [Link Guard 43014018459](https://github.com/mpaykin1/meta6-lab/actions/runs/43014018459): 200/404, 3 мутации, включая CI-обман. |
| 3. lab-pages.yml проверяет все index | КОД В PR, НЕ ОПУБЛИКОВАН | Генерация полного _site/LINKS.txt: [d7dba0f](https://github.com/mpaykin1/meta6-lab/commit/d7dba0f32465b904336c9794dfd97b4e578086f8); проверка реестра: [64bf6be](https://github.com/mpaykin1/meta6-lab/commit/64bf6bedd595142ef31be184d210cf37b7364553). Нужен успешный Pages на main после merge. |
| 4. LINKS.txt | ЧАСТИЧНО | 15 известных ссылок владельца и LAB_QUEUE: [5af0522](https://github.com/mpaykin1/meta6-lab/commit/5af0522263b87299b9e05d17eaa73c0d4c15d823). Все фактические папки index автоматически добавляются в опубликованный _site/LINKS.txt при сборке, ещё не в исходный реестр GitHub. Исторический аудит не завершён. |
| 5. ежечасный сторож | ЧАСТИЧНО | [d887e07](https://github.com/mpaykin1/meta6-lab/commit/d887e07dae03d2e0ddcb6fd8c6ed5d1715055e8a): проверка реестров, запуск LAB Pages при 404, вторая проверка и диагностика. Добавлено безопасное перенаправление старых корневых URL на единственный существующий preview ([3b7f10b](https://github.com/mpaykin1/meta6-lab/commit/3b7f10b30c31fefa2d6611c526f6523c9dbe28df)); прямой POST с повторами на лимит API ([e0d03e1](https://github.com/mpaykin1/meta6-lab/commit/e0d03e12cc68e75b8a5cd2254a6b86092d8e7372)). Автоисправление произвольных пропавших файлов через PR не внедрено: allow_auto_merge=false, подменять игру нельзя. |
| 6. правило и 5 автозадач | ЧАСТИЧНО | Правило в AGENTS.md и общем MG_PYAT_AVTOZADACH.md — [PR #246](https://github.com/mpaykin1/meta6-lab/pull/246). В meta6 не записывать: по AGENTS этот репозиторий только для чтения. |
| 7. развитие | НАЧАТО, НЕ ЗАКРЫТО | Новая вечная ловушка 404/ложного 200 и CI-обмана: [run 43014018459](https://github.com/mpaykin1/meta6-lab/actions/runs/43014018459); [OSHIBKI L200-1](https://github.com/mpaykin1/meta6-lab/commit/1928cfc7e7e66bc39e7f5c87365e819cffed8168). |

## Развитие
- Обработано до: PR #246 / d887e07, GitHub Actions 43014018459, 11.11.2026.
- Сторож: различает HTTP 200 и 404; не принимает фальшивый успех из-за CI или чужого домена; ограничивает ожидание 300 сек на URL; собирает все публичные index в развёрнутый реестр; при однозначном совпадении старого URL и единственного preview создаёт перенаправление.
- Следующий тип: HTML отдаёт 200, но относительные JS/CSS/изображения/аудио дают 404 — добавить проверку ресурсов из того же origin и мутации.
- Счёт 11.11.2026: новых правил 1; мутаций 3, пойманы 3; повторов 0; пунктов с неподтверждённым live 1–6.
