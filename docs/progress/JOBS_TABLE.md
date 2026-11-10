# Производительность и слияние PR #54, #59, #60

Общая таблица задач МГ/МГЛ: [ZADACHI.md](../../ZADACHI.md). Этот файл — детализация метрик, поскольку формат ZADACHI.md обслуживается сторожем и не содержит метрик.

| задача | PR | статус | p95 моб. | draw calls | ссылка (SHA / PR / Actions) | дата |
|---|---|---|---|---|---|---|
| Veil Terraces: frustum, instancing, packed vertices, perf | [#54](https://github.com/mpaykin1/meta6-lab/pull/54) | конфликт | На текущем HEAD нет замера (исторический: 33.4 мс) | На текущем HEAD нет замера (исторический: 12) | [HEAD 0d4c57d](https://github.com/mpaykin1/meta6-lab/commit/0d4c57d0dc66c598a92634762a6eb8711be22bd6), [красный benchmark](https://github.com/mpaykin1/meta6-lab/actions/runs/42357173122) | 2026-11-10 |
| Veil Terraces shared: instancing | [#59](https://github.com/mpaykin1/meta6-lab/pull/59) | конфликт | На текущем HEAD нет замера (исторический: 16.8 мс) | На текущем HEAD нет замера (исторический: 12) | [HEAD 0472a42](https://github.com/mpaykin1/meta6-lab/commit/0472a4299eca20299fb8045b2a098873a564faf4), [исторический benchmark](https://github.com/mpaykin1/meta6-lab/actions/runs/42356179593) | 2026-11-10 |
| Broken City: adaptive DPR and WebGL perf | [#60](https://github.com/mpaykin1/meta6-lab/pull/60) | в работе | Нет нового замера | Нет нового замера | [синхронизация с main 6e9c204](https://github.com/mpaykin1/meta6-lab/commit/6e9c2049a4a10f3b80dd200d9cc86cb06581edbf), [benchmark в очереди](https://github.com/mpaykin1/meta6-lab/actions/runs/42766594344) | 2026-11-10 |

Никакой PR не считается готовым без всех зелёных проверок, мобильного p95 ≤ 20 мс и draw calls ≤ 40 в сопоставимой сцене. Счётчик двух новых попыток — в [журнале](PR54_59_60.md).
