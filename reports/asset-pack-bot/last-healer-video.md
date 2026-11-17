# The Last Healer — INK 24 / 24

Игра: https://mpaykin1.github.io/meta6-lab/games/ostrov-aptekarya/
Стенд новой партии: `asset-packs/incoming/last-healer-video/index.html` в `lab/assets-last-healer-video-20261117-gpt6`.

Все 24 позиции `ZAKAZ.json` реализованы генераторами `makers.js`; Web Audio в `sounds.js` (запуск только после действия игрока). Процедурные формы 3D, анимации, GLSL-постэффект и мобильная камера. Эталонный INK не менялся.

Входящий пакет `incoming`, не `ready`: по новой версии ещё обязательны CI `ASSET CHECK`, браузерный визуальный просмотр, `_check/compare.png`, HTTP 200 на игровую ссылку. Предыдущая CI-проверка **4/24** — 4 готовы, остальные ещё отсутствовали в предыдущем коммите: https://github.com/mpaykin1/meta6-lab/actions/runs/44084867968.

Проверка геометрии исходников всех 24 генераторов на настоящем `three.module.js`: **0 HARD, 0 SOFT** по проверенным параметрам: `same_seed_same`, `other_seed_differs` для VARY, `tick_moves` для ALIVE, габариты, привязка к поверхности, численность мешей и треугольников. Это не заменяет полного CI и визуального сравнения.

PR: https://github.com/mpaykin1/meta6-lab/pull/393
