# MERGE PROGRESS — META GAMES / META GAMES LAB

Источник истины: GitHub PR, HEAD SHA и GitHub Actions. В МГ не сливать.

| UTC | Репозиторий | PR | Шаг | Результат | SHA / ссылка | Попытки |
|---|---|---|---|---|---|---|
| 2026-11-10T06:07:36.685Z | meta6-lab | — | 0 | Создан журнал. Исходный файл отсутствовал в main. На начало сканирования: 69 PR МГЛ и 16 PR МГ. | https://github.com/mpaykin1/meta6-lab/tree/lab/merge-universal | 0 |
| 2026-11-10T06:13:42.934Z | meta6-lab + meta6 | все открытые | 0.1 | Повторно собрана очередь: 83 PR; таблица с 53 mergeable=false и отсутствующими замерами, с учётом параллельной работы агентов. | [коммит таблицы](https://github.com/mpaykin1/meta6-lab/commit/4995d2314f9b1c48236bd26c9cec95f1f3131094) | 0 |
| 2026-11-10T06:13:42.934Z | meta6-lab | #215 | 3 | На head 5a988a39: META BOT, B1, storefront, Portal Visited — success; повторный KONTUR Guard queued, merge запрещён до всех зелёных. Производительность: ещё нет сравнимых замеров. | [Actions](https://github.com/mpaykin1/meta6-lab/actions/runs/42766201982) / [PR](https://github.com/mpaykin1/meta6-lab/pull/215) | 0 |
| 2026-11-10T06:13:42.934Z | meta6-lab | #216 | 3 | На head 6e3ddc25: status-dlya-claude и KONTUR success; B1 queued, merge запрещён до всех зелёных. | [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/42761934038) | 0 |
| 2026-11-10T06:13:42.934Z | meta6-lab | #54 | 2/3 | Ветка меняется параллельно: актуальный head 88edfce0; CI включает LAB Render Performance и META BOT, пока queued. Никаких неподтверждённых замеров. | [Render Performance](https://github.com/mpaykin1/meta6-lab/actions/runs/42766689636) | 0 |
| 2026-11-10T06:21:13.557Z | meta6-lab | #3 | 1 | Конфликт LAB_QUEUE разрешён объединением карточки без потери main; 16 новых исходных файлов игры перенесены как исходные blob SHA; черновик, мобильные p95/draw calls и бот ещё не подтверждены. | [merge 7756160](https://github.com/mpaykin1/meta6-lab/commit/77561601a5246a95d160c7a0f7ba2301d481e005) / [PR #3](https://github.com/mpaykin1/meta6-lab/pull/3) | 1 |
