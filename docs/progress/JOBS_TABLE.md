# Производительность и слияние PR #54, #59, #60

Общая таблица задач МГ/МГЛ: [ZADACHI.md](../../ZADACHI.md). Этот файл — детализация метрик, поскольку формат ZADACHI.md обслуживается сторожем и не содержит метрик.

| задача | PR | статус | p95 моб. | draw calls | ссылка (SHA / PR / Actions) | дата |
|---|---|---|---|---|---|---|
| Veil Terraces: frustum, instancing, packed vertices, perf | [#54](https://github.com/mpaykin1/meta6-lab/pull/54) | в работе | На текущем HEAD нет замера (исторический: 33.4 мс) | На текущем HEAD нет замера (исторический: 12) | [HEAD 88edfce](https://github.com/mpaykin1/meta6-lab/commit/88edfce08400a3df0fb669e5c0f83bb7beacc3b6), [новый benchmark queued](https://github.com/mpaykin1/meta6-lab/actions/runs/42766689636), [прошлый красный](https://github.com/mpaykin1/meta6-lab/actions/runs/42357173122) | 2026-11-10 |
| Veil Terraces shared: instancing | [#59](https://github.com/mpaykin1/meta6-lab/pull/59) | конфликт (закрыт без слияния) | На текущем HEAD нет замера (исторический: 16.8 мс) | На текущем HEAD нет замера (исторический: 12) | [PR #59 закрыт](https://github.com/mpaykin1/meta6-lab/pull/59#issuecomment-6760459440); [удаление исходной игры](https://github.com/mpaykin1/meta6-lab/commit/0d30d5bd2d0db3380a6fab63f9e8899579b098ae) | 2026-11-10 |
| Broken City: adaptive DPR and WebGL perf | [#60](https://github.com/mpaykin1/meta6-lab/pull/60) | в работе | Нет нового замера | Нет нового замера | [синхронизация 6e9c204](https://github.com/mpaykin1/meta6-lab/commit/6e9c2049a4a10f3b80dd200d9cc86cb06581edbf), [HEAD 6615404](https://github.com/mpaykin1/meta6-lab/commit/6615404d626661bad4504d018f280a7ec72c6154), [новый benchmark queued](https://github.com/mpaykin1/meta6-lab/actions/runs/42767321334) | 2026-11-10 |

Никакой PR не считается готовым без всех зелёных проверок, мобильного p95 ≤ 20 мс и draw calls ≤ 40 в сопоставимой сцене. Счётчик двух новых попыток — в [журнале](PR54_59_60.md).
