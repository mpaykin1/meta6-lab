# weather — GRAF Weather Lab (owner PASS, 2026-10-17)

Короткая команда для нового чата, Claude, Codex и других агентов: **`weather mpaykin1/meta6`**.

**Принятая владельцем версия — Compact Weather V3 (OWNER PASS, 2026-10-17): автономный 3D HTML с 11 режимами погоды, без крупного меню.**
- Играть в браузере: https://mpaykin1.github.io/meta6/weather-showcase-graf-20261017/
- Полный HTML исходник: [weather-showcase-graf-20261017/index.html](../../weather-showcase-graf-20261017/index.html)
- Скачать HTML без сети: https://raw.githubusercontent.com/mpaykin1/meta6/main/weather-showcase-graf-20261017/index.html
- Графический канон: [graf.md](graf.md), «GRAF WEATHER — Weather Lab»
- Owner-PASS и уроки: [docs/SUCCESS_WEATHER_LAB_2026-10-17.md](../../docs/SUCCESS_WEATHER_LAB_2026-10-17.md)

**Что внутри:** объёмный 3D-остров WebGL + программный 3D fallback, 2.5D погодные FX-атласы, **одна небольшая кнопка-пиктограмма 47×47 px на телефоне / 50×50 px на ПК** справа сверху, листья, белые/красные/чёрные/розовые/разноцветные лепестки, снег, светлячки, гроза, туман и магические режимы.

**Статус:** OWNER_PASS для автономной погодной демосцены. Не означает интеграцию погоды в Observer World V7 или полную игру; V7 сохранять неизменной. Аппаратный FPS iPhone 11 — UNKNOWN. Каждый новый модуль тестировать отдельно, успешность не назначать без владельца.

**Контроль точной принятой версии:** исходник `Ostrov_Sumerek_3D_Weather_Compact_V3_OFFLINE.html`, SHA-256 `d0cb220f3f1e2b2fe44e6e5322b5b9e3ef676138a0281a281692182fe03c49a7`, Git blob SHA `cbea04b78accded2a9bedfdbcd87919037b5a8c3`.

**Правило для любого нового чата:** референсом является именно V3 на постоянном пути выше. Старый `Wather2.html` — входной пример, а не принятый конечный результат. При переносе эффекты встроить в штатную Three.js-сцену, не добавляя второй глобальный loop; соблюдать [graf.md §27.1](graf.md). Экран не должен скроллиться, все режимы обязаны визуально отличаться. Результаты видимости эффекта V3 в тестовой браузерной среде: минимум 91/100 mobile и 86/100 desktop, аппаратный iPhone 11 — UNKNOWN. Предыдущая версия получила OWNER FAIL, принята V3 — OWNER PASS.

## Candidate V4 — Weather + Wind (owner verdict pending)

**Новая автономная 3D-демоверсия с двумя маленькими кнопками**, не заменяет принятый V3:
- [V4 HTML для запуска/скачивания](../../weather-wind-graf-20261017/index.html)
- [V4 исходники, 18 режимов ветра и тесты](../../weather-wind-graf-20261017/README.md)
- Команда для Claude/ChatGPT/Codex: `weather-wind mpaykin1/meta6`.

Ветер меняет траектории частиц 2D/2.5D и 3D; кнопка погоды сохраняет 11 режимов. На симулированном телефоне 390×844 достигнуто не менее 91/100 зон видимости FX, на desktop FX-test 1200×730 — 97/100. Проверка физического iPhone 11 и GPU WebGL — UNKNOWN. **V4 не является OWNER PASS** до отдельного вердикта владельца; принятый V3 неизменён.
