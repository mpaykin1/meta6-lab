# Очередь META BOT — 06.11.2026

Один уровень = один реальный игровой уровень, внутренние цели острова не выдавать за отдельные уровни. После полного прохождения на телефоне (390×844), ПК и во втором независимом запуске можно сливать игру и переключать карточку каталога. Ядро, workflow, сторож и принятые оригиналы не изменять. Инвентаризация перед каждым переносом: было N, осталось N, потеряно 0. Обязательны универсальные правила, R1–R11, U1–U6, ЗВУК 18–21, реальные ввод/прохождение, `skipChecks=[]`.

| № | Игра | Источник и исправляемая копия | Статус, PR и META BOT | Уровней / пройдено |
|---:|---|---|---|---|
| 1 | Veil Terraces | `meta-games-worlds/veil-terraces/` → `games/veil-terraces/` | [PR #301](https://github.com/mpaykin1/meta6/pull/301) слит [e12263c](https://github.com/mpaykin1/meta6/commit/e12263c6b82177f27b9a5e12d6de368162da8640); [бот 42182804390](https://github.com/mpaykin1/meta6/actions/runs/42182804390) зелёный; мобильный, ПК и полный 2-й заход | **6 / 6+6+6** |
| 2 | Twilight Island | `observer-world-en-v7/` → `games/twilight-island/` | [PR #291](https://github.com/mpaykin1/meta6/pull/291) открыт, [бот](https://github.com/mpaykin1/meta6/actions/runs/42185128729) выполняется; не переносить карточку до полного зелёного | **1 остров, 22 внутренние цели / 0 полных островов** |
| 3 | Ashen Path | `ashen-sumerek/` → `games/ashen-path/` | очередь | UNKNOWN / 0 |
| 4 | Underwater World | `underwater-world/` → `games/underwater-world/` | очередь; оригинал не менять | UNKNOWN / 0 |
| 5 | Three Worlds | `three-worlds-game/` → `games/three-worlds/` | очередь | UNKNOWN / 0 |
| 6 | ABYSS GLOW | `abyss-glow/play/` → `games/abyss-glow/` | очередь; `stand/` не менять | UNKNOWN / 0 |
| 7 | Archer in the Fog | `games/archer-in-the-fog/` | очередь; [README](../games/archer-in-the-fog/README.md) | UNKNOWN / 0 |
| 8 | Twilight Isle Classic | `games/twilight-isle-classic/` | очередь; [README](../games/twilight-isle-classic/README.md) | UNKNOWN / 0 |
| 9 | Twilight Isles 2 | `games/twilight-isles/` | [PR #290](https://github.com/mpaykin1/meta6/pull/290) открыт, [бот](https://github.com/mpaykin1/meta6/actions/runs/42184975250) выполняется; карточка уже указывает на `games/twilight-isles/`, но новое исправление не опубликовано | 1 остров / 0 завершённых |
| 10 | Underwater Sumerek | `underwater-sumerek/` | очередь | UNKNOWN / 0 |
| 11 | Island Sumerek Biomes | `island-sumerek-biomes/` | очередь, не эталон-донор | UNKNOWN / 0 |
| 12 | Сумерки и пепел II | `games/sumerki-i-pepel-2/` | очередь | UNKNOWN / 0 |
| 13 | Broken City | `games/broken-city/` | очередь: 9 уровней, [README](../games/broken-city/README.md); встроенная `window.__G.BOT` не должна играть за тестового бота | 9 / 0 |

Для Veil Terraces [полный бот до исправления](https://github.com/mpaykin1/meta6/actions/runs/42180345407) выявил автоматический перескок третьего воспоминания; PR #301 разнёс реальные цели на >4,5 единицы и потребовал физического ухода от предыдущей. После слияния необходимы повторные независимые зелёные прогоны по `main` для проверки стабильности. Для Twilight Island ядро уже получило независимую полную повторную попытку и счётчик настоящего прогресса. Принятые игровые оригиналы сохраняются без изменений.

Игры, доступные только в артефактах Claude, пока не переносить без отдельного разрешения. Наличие частичной сборки не равно наличию полного исходника.
