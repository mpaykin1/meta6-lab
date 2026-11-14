# КАРТА СИЛ — PROGRESS

| Шаг | Статус | Доказательство | UTC |
|---|---|---|---|
| 1. Экзамены | реализация в PR | [#186](https://github.com/mpaykin1/meta6-lab/pull/186), [#197](https://github.com/mpaykin1/meta6-lab/pull/197), [#194](https://github.com/mpaykin1/meta6-lab/pull/194), [#192](https://github.com/mpaykin1/meta6-lab/pull/192), [#193](https://github.com/mpaykin1/meta6-lab/pull/193) | 2026-11-13 19:07 |
| 2. Бот и ловушки | код в ветке, ждёт Actions | [ветка](https://github.com/mpaykin1/meta6-lab/tree/lab/karta-sil) | 2026-11-13 19:07 |
| 3. Диспетчер | код в ветке, ждёт Actions | [ветка](https://github.com/mpaykin1/meta6-lab/tree/lab/karta-sil) | 2026-11-13 19:07 |
| 4. Промпт пяти задач | код в ветке, ждёт Actions | [ветка](https://github.com/mpaykin1/meta6-lab/tree/lab/karta-sil) | 2026-11-13 19:07 |
| 5. Развитие | не готово: нужен свежий срез GitHub после запуска | [Actions](https://github.com/mpaykin1/meta6-lab/actions/workflows/karta-sil.yml) | 2026-11-13 19:07 |

Обработано до: main 5fb9af2898fbc2b132a8700cda9be8fc80fc546d.

- CI #43489853650 и #43489853404 выявили несовместимость статического импорта с существующими мутациями; #43489853390 отверг `process.env` (#К4). Исправление — динамический импорт и GitHub CLI, красная карта не считается пустой; [прогоны](https://github.com/mpaykin1/meta6-lab/actions/runs/43489853650).

- Развитие №1110 → №1114: диспетчер не опрашивает по одному закрытые исторические PR, запросы ограничены актуальными открытыми PR; [повторное API 403](https://github.com/mpaykin1/meta6-lab/actions/runs/43491373753).

## Продолжение 14.11.2026

| Шаг | Статус | Доказательство | UTC |
|---|---|---|---|
| 1. Тест №16 и пагинация | локально 29/29, 6 испорченных копий отвергнуты; main влит merge без rebase | [PR #301](https://github.com/mpaykin1/meta6-lab/pull/301), `scripts/karta-sil/mutate-karta-sil.mjs`; main f37471f7 (второй родитель публикации); сохранён параллельный b751badf | 2026-11-14 03:19 |
| 2. Старые PR quota | проверены актуальные состояния: все пять открыты; нужен разбор diff, нельзя закрывать нужные исходники ради квоты | [#3](https://github.com/mpaykin1/meta6-lab/pull/3), [#72](https://github.com/mpaykin1/meta6-lab/pull/72), [#87](https://github.com/mpaykin1/meta6-lab/pull/87), [#133](https://github.com/mpaykin1/meta6-lab/pull/133), [#134](https://github.com/mpaykin1/meta6-lab/pull/134) | 2026-11-14 03:19 |

ПРОВЕРКА ИЗМЕНЕНА: №16 извлекает параметр page через URLSearchParams; прежние сценарии сохранены, окончание выборки проверяется пустой страницей (прямое задание владельца).

| Развитие UTC | Новых правил | Новых ловушек | Мутантов-беглецов закрыто | Повторов | Ждущих Claude |
|---|---:|---:|---:|---:|---:|
| 2026-11-14 | 1 | 2 | 6 | 1 | 0 |

| 5. Причины M6/К7 | проверены комментарии, Actions текущих SHA и main OSHIBKI; строки карты уточнены без ложной атрибуции | [M6](https://github.com/mpaykin1/meta6-lab/pull/192#issuecomment-6752412627), [К7 приёмка](https://github.com/mpaykin1/meta6-lab/pull/193#issuecomment-6747014451) | 2026-11-14 03:19 |
| 6. Приоритет Claude | исправлен ранний auto перед проверкой двух неудач; 3 мутации пойманы | `scripts/karta-sil/mutate-karta-sil.mjs`, `route.mjs`; main ещё без карты | 2026-11-14 03:19 |

Старые PR: #134 закрыт как заменённый #195 после сверки Git blob HTML и 4 PNG; #72 main влит merge dc663fbc6980a4aaa8bafa7221b25e24eb67d0c8, CI проверяется; STOROZHA reference #43490840808 перезапущен один раз. #133 нужен: оригинальный blob 1aa09aee6c5db53c9af0a723fb0400df6972f7b9 отсутствует в main; STOROZHA reference #43239240778 перезапущен один раз, но предыдущий лог — «Новый эталон: PR должен только добавлять файлы»: вместе с эталоном добавлены OSHIBKI и ловушка К3, нужен разнос без удаления ловушки. #3 нужен: META BOT и changed-games красные (уровень 1 застрял), #87 нужен разбор защищённой истории и замороженного Earn. Нужные работы не закрывались ради квоты.

| 2026-11-14 03:19 | 1 | 1 | 3 | 0 | 2 |

Осталось: шаг 2 (старые PR), затем 3–4 (полностью зелёный #301 и расчёт на main), main-проверка шага 6 и отдельный PR шага 7 по частотам из полной карты. Самоэкзамен этого запуска уже усилил эскалацию, но без полной карты нельзя честно выбрать самый частый красный тип.

- Уточнение #72: main влит, reference теперь SUCCESS [43551023284](https://github.com/mpaykin1/meta6-lab/actions/runs/43551023284), но [META GAMES guard](https://github.com/mpaykin1/meta6-lab/actions/runs/43551023196/job/132313248053) нашёл защищённую историю ec3fc33a / 9cc6958b / 1bf1b4dc / 17faa1da без подписи Claude. Переписывание истории/ослабление guard не выполнялось; адресовано в DLYA_CLAUDE.md.

- Развитие: устранена ложная атрибуция исполнителя по теме PR и совпадению префикса ветки. Приоритет — точная строка ZANYATO и явный маркер исполнителя; неоднозначное авторство = неизвестно. 30/30 локальных сценариев и 12 настоящих мутантов отвергнуты. Сохранение чужой работы проверяется сравнением с актуальным main перед публикацией.

- Шаг 6: жёлтая маршрутизация теперь использует актуальное changed_files из GET PR, а не только старую карту; некорректный ответ API отклоняется. 31/31 локальных сценариев; 15 настоящих мутантов отвергнуты.
- Последний подтверждённый Actions до следующей публикации: d7aba87d — [Karta Sil SUCCESS](https://github.com/mpaykin1/meta6-lab/actions/runs/43551263917), [Dispatcher SUCCESS](https://github.com/mpaykin1/meta6-lab/actions/runs/43551263899), [KONTUR SUCCESS](https://github.com/mpaykin1/meta6-lab/actions/runs/43551291832), [quota FAILURE](https://github.com/mpaykin1/meta6-lab/actions/runs/43551291773). Эти результаты нельзя переносить на следующий SHA.

| Развитие UTC | Новых правил | Новых проверок | Настоящих мутантов поймано | Повторов | Блокеры ядра |
|---|---:|---:|---:|---:|---:|
| 2026-11-14 03:29 | 4 | 5 | 15 | 1 | 2 |

Проверено локально: 31 сценарий PASS и KONTUR checkDiff PASS на полном diff; это не полный Actions. Следующая точка продолжения — шаг 2, #72/#87 защищённая история и #133 разнос source-only/К3; #3 реальное застревание. Новый PR развития по частотам красных типов остаётся заблокирован отсутствием полной карты на main.

| 4. Влить main (#309) | подготовлен двухродительский merge, 3 общих файла сведены без потери строк; новый CI требуется | [PR #301](https://github.com/mpaykin1/meta6-lab/pull/301), [#309](https://github.com/mpaykin1/meta6-lab/pull/309), чистые кандидаты [#312](https://github.com/mpaykin1/meta6-lab/pull/312), [#313](https://github.com/mpaykin1/meta6-lab/pull/313), [#314](https://github.com/mpaykin1/meta6-lab/pull/314) | 2026-11-14T04:08:30Z |
| Развитие draft #309 | исправлено смешение «отложено»/«брошено»; добавлена метрика deferred, 4 мутационных сценария; ожидание Actions на новом SHA | [#301](https://github.com/mpaykin1/meta6-lab/pull/301), [#309](https://github.com/mpaykin1/meta6-lab/pull/309), [красная API 403](https://github.com/mpaykin1/meta6-lab/actions/runs/43555180869); source-only [#312](https://github.com/mpaykin1/meta6-lab/pull/312), [#313](https://github.com/mpaykin1/meta6-lab/pull/313), [#314](https://github.com/mpaykin1/meta6-lab/pull/314) | 2026-11-14T04:18:31Z |

| 2. Синхронизация с main после бюджета API | merge-кандидат: сохранены GraphQL openPulls, обработка 403/429 и маршрутизация красных типов без отключения проверок; новый Actions HEAD требуется | [#301](https://github.com/mpaykin1/meta6-lab/pull/301), [#316](https://github.com/mpaykin1/meta6-lab/pull/316), [#317](https://github.com/mpaykin1/meta6-lab/pull/317) | 2026-11-14T06:04:42.332Z |
| 2. Исправление проверки GraphQL маршрутизации | подготовлено: индекс GraphQL openNumbers/openPrs и 4 мутации против closed/duplicates/truncation/hardcode; требуются Actions нового SHA | [FAIL MG Dispatcher](https://github.com/mpaykin1/meta6-lab/actions/runs/43564622036), [#301](https://github.com/mpaykin1/meta6-lab/pull/301) | 2026-11-14T06:09:04.428Z |
