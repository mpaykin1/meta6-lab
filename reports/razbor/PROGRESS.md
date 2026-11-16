# РАЗБОР ЗАВАЛОВ — прогресс

Обработано до: main 990c2a75a2e742418bd00c503b672cca20705d50; GitHub PR snapshot: 48 открытых (15.11.2026 08:42 UTC).
Повторный запуск: сверить GitHub и пропустить решения по таблице, не считать 403/429/null пустой очередью.

| PR или задача | Решение | Доказательство | UTC |
|---|---|---|---|
| DISPETCHER PR #248, #277 | Замена отсутствующего GraphQL title на название из ZADACHI; добавлена защита от undefined и 3 мутации (без правки ядра) | scripts/dispetcher/build.mjs; scripts/dispetcher/test/mutate-claude-title.test.mjs; локально 4 сценария и 3 мутации PASS, CI проверит после PR | 2026-11-15 08:44 |
| #248 | CLAUDE: да/нет? защищённый pr-autofinish; draft | https://github.com/mpaykin1/meta6-lab/pull/248 | 2026-11-15 09:03 UTC |
| #277 | CLAUDE: да/нет? ядро STOROZHA; draft | https://github.com/mpaykin1/meta6-lab/pull/277 | 2026-11-15 09:03 UTC |
| #245 | CLAUDE: да/нет? принятая игра Veil Terraces; draft | https://github.com/mpaykin1/meta6-lab/pull/245 | 2026-11-15 09:03 UTC |
| #235 | CLAUDE: да/нет? принят оригинал Underwater World; draft | https://github.com/mpaykin1/meta6-lab/pull/235 | 2026-11-15 09:03 UTC |
| #270 | draft: merge main устранён, STOROZHA quota PASS, Library Machine FAIL source-only; нужна корректная библиотечная интеграция | https://github.com/mpaykin1/meta6-lab/actions/runs/43696794550 | 2026-11-15 09:03 UTC |
| #191 | draft: ЖДЁТ чистой замены #314, игра пока не пройдена ботом | https://github.com/mpaykin1/meta6-lab/pull/314 | 2026-11-15 09:03 UTC |
| #3 | draft: ЖДЁТ чистого переноса и зелёного META BOT | https://github.com/mpaykin1/meta6-lab/actions/runs/43240450734 | 2026-11-15 09:03 UTC |
| #220 | draft: ЖДЁТ merge main, устранения конфликтов и CI | https://github.com/mpaykin1/meta6-lab/pull/220 | 2026-11-15 09:03 UTC |
| #218 | draft: ЖДЁТ merge main и Library Machine | https://github.com/mpaykin1/meta6-lab/pull/218 | 2026-11-15 09:03 UTC |
| #261 | draft: STOROZHA FAIL, обновить main; Claude не нужен для обычной библиотеки | https://github.com/mpaykin1/meta6-lab/actions/runs/43413645942 | 2026-11-15 09:03 UTC |
| #260 | draft: STOROZHA FAIL и конфликт; Claude не нужен для uluchshatel | https://github.com/mpaykin1/meta6-lab/actions/runs/43413817361 | 2026-11-15 09:03 UTC |
| #255 | draft: Archer META BOT FAIL и конфликт | https://github.com/mpaykin1/meta6-lab/actions/runs/43409726967 | 2026-11-15 09:03 UTC |
| #272 | draft: ЖДЁТ свежих проверок принятого HTML и META BOT | https://github.com/mpaykin1/meta6-lab/pull/272 | 2026-11-15 09:03 UTC |
| #311 | draft: ЖДЁТ конфликт и красную STOROZHA; сохранено | https://github.com/mpaykin1/meta6-lab/actions/runs/43554135089 | 2026-11-15 09:03 UTC |
| #321 | live: INK Raven checks PASS, внешний Vercel build-rate-limit; сливает другой исполнитель | https://github.com/mpaykin1/meta6-lab/pull/321 | 2026-11-15 09:03 UTC |
| #331 | draft: исправление и ловушка опубликованы, MG Dispatcher PASS, остальной CI и внешний Vercel отдельно | https://github.com/mpaykin1/meta6-lab/actions/runs/43696007445 | 2026-11-15 09:03 UTC |

| #3 | закрыт сторожем как заброшенный, ветка сохранена; чистый перенос не подтверждён | https://github.com/mpaykin1/meta6-lab/pull/3#issuecomment-6898806224 | 2026-11-15 18:40 UTC |
| #191 | закрыт сторожем как заброшенный, ветка сохранена; source-only замена #314 пока draft | https://github.com/mpaykin1/meta6-lab/pull/191#issuecomment-6898806918 | 2026-11-15 18:40 UTC |
| #235 | закрыт сторожем как заброшенный, ветка сохранена; исправление не слито | https://github.com/mpaykin1/meta6-lab/pull/235#issuecomment-6898807686 | 2026-11-15 18:40 UTC |
| #272 | закрыт сторожем как заброшенный, ветка сохранена; проверка META BOT не завершена | https://github.com/mpaykin1/meta6-lab/pull/272#issuecomment-6898808356 | 2026-11-15 18:40 UTC |
| Dispatcher: ложный «НУЖЕН CLAUDE» | исправить историческую эскалацию #218/#220/#255/#260/#261/#270, защищённые запросы оставить; 8 сценариев/3 мутации | https://github.com/mpaykin1/meta6-lab/pull/331 | 2026-11-15 18:40 UTC |

Текущая очередь: 45 открытых PR по GitHub поиску (срез до 2026-11-15 09:03 UTC), из них 1 non-draft (#321), 44 draft. Не рассмотренные детально PR остаются draft, статус «зелёный» не заявлен.

| Диспетчер: исправление GraphQL body / routeFor | REST-классификация после проверенного HEAD, свежая первая строка в КАРТЕ СИЛ, 6 отрицательных мутаций | https://github.com/mpaykin1/meta6-lab/pull/331 | 2026-11-15 19:03 UTC |

| #331 · mergeable=null | Исправить несовместимость старого интервала 5 c с быстрым режимом диспетчера 2 c; сохранены старые тесты, 4 мутации; PR оставлен draft до свежего CI | https://github.com/mpaykin1/meta6-lab/actions/runs/43804218336 ; https://github.com/mpaykin1/meta6-lab/pull/331 | 2026-11-16T10:20 UTC |
| #218 | закрыт без слияния, ветка сохранена; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/218), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| #220 | закрыт без слияния, ветка сохранена; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/220), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| #234 | закрыт без слияния, ветка сохранена; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/234), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| #255 | закрыт без слияния, ветка сохранена; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/255), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| #260 | закрыт без слияния, ветка сохранена; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/260), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| #261 | закрыт без слияния, ветка сохранена; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/261), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| #277 | закрыт без слияния, ветка сохранена; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/277), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| #278 | закрыт без слияния, ветка сохранена; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/278), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| #321 | слит в feature-ветку, не main; решение синхронизировано в SLIYANIE.md | [GitHub PR](https://github.com/mpaykin1/meta6-lab/pull/321), [таблица e3b13ab](https://github.com/mpaykin1/meta6-lab/commit/e3b13abad0d568ace4dbf2fe549533706222f702) | 2026-11-16 12:48 UTC |
| PR #319 | draft: ЖДЁТ разрешения конфликта K3 / source-only gate; точный блокер записан в тело PR | [Library Machine FAIL](https://github.com/mpaykin1/meta6-lab/actions/runs/43748316417), [PR #319](https://github.com/mpaykin1/meta6-lab/pull/319) | 2026-11-16 12:48 UTC |
| #331 | Двухродительский merge main в PR без изменения защищённого ядра; три конфликтующие таблицы взяты из main, 13 файлов исправления сохранены, diff верифицирован | [merge 5944bc3bd2](https://github.com/mpaykin1/meta6-lab/commit/5944bc3bd28091a638c62ece158e626ea96ffb25), [PR #331](https://github.com/mpaykin1/meta6-lab/pull/331) | 2026-11-16 12:48 UTC |
| #242 | ЖДЁТ: исходный #234 закрыт, каталога `claude-games/index.html` нет в main; PR оставлен draft, связь исправлена в теле | [PR #242](https://github.com/mpaykin1/meta6-lab/pull/242), [закрытый #234](https://github.com/mpaykin1/meta6-lab/pull/234) | 2026-11-16 12:50 UTC |
