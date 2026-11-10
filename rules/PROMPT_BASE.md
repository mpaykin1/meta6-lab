# Постоянные правила агентов META GAMES LAB

**Начало каждого запуска: «прочитай rules/PROMPT_BASE.md».** Затем открой `STATUS.md` и только исходники по выбранному пункту. Этот файл — указатель, оригиналы имеют приоритет и не заменяются.

- [AGENTS.md](../AGENTS.md) — полномочия, ограничения, REUSE, эталоны, перенос миров.
- [STATUS.md](../STATUS.md) — краткий статус, сломанное и ближайшие незавершённые пункты.
- [FINISH.md](09-platforma/FINISH.md) — единственные 18 критериев готовности; готовность отмечает только Claude со ссылкой на успешный Actions.
- [FINISH_2.md](09-platforma/FINISH_2.md) — этап после 18/18.
- [ZANYATO.md](09-platforma/ZANYATO.md) — чужую занятую задачу не перехватывать.
- [КОНТУР БЕЗ ОШИБОК (К1–К11)](06-rabota-ii-s-kodom/KONTUR_BEZ_OSHIBOK.md) — две попытки, 3–5 мутаций к новой проверке, одна «обман», независимая проверка Claude.
- [OSHIBKI.md](../OSHIBKI.md) — каждая новая ошибка требует исправления и вечной ловушки.
- [VIDY_OSHIBOK.md](06-rabota-ii-s-kodom/VIDY_OSHIBOK.md) — классификация ошибок, если есть.
- [ПЕСОЧНИЦА](06-rabota-ii-s-kodom/PESOCHNITSA_GPT.md) — менять только `mpaykin1/meta6-lab`, своя ветка; только Claude сливает в main.
- [REUSE](06-rabota-ii-s-kodom/REUSE.md), [ALLOWLIST](06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md), [НЕ МЕНЯТЬ НЕЗАПРОШЕННОЕ](06-rabota-ii-s-kodom/NE_MENYAT_NEZAPROSHENNOE.md).
- [КАТАЛОГ ПРАВИЛ УЛУЧШЕНИЯ](09-platforma/RULES_CHECKLIST.md) и [GRAF](01-stil-i-grafika/graf.md) — только для задач с играми.
- [PLAYGAMA_RETENTION](07-publikaciya-playgama/PLAYGAMA_RETENTION.md) — R1–R11.
- [ЗВУК](03-muzyka-i-zvuk/ZVUK.md) — музыка, звуковые эффекты, баланс.
- [ЧИСТЫЙ ЭКРАН](01-stil-i-grafika/CHISTYY_EKRAN.md) — чистый игровой экран.
- [БЕЗ ПОВТОРОВ](02-igrovye-mekhaniki/BEZ_POVTOROV.md) — уникальная проходимая раскладка.
- [ПОСТЕПЕННО](02-igrovye-mekhaniki/POSTEPENNO.md) — механики открываются по мере игры.
- [ПОНЯТНАЯ ПОЛЬЗА](02-igrovye-mekhaniki/PONYATNAYA_POLZA.md) — реальное действие предметов.
- [ВИДИМО И ЭКОНОМНО](05-proizvoditelnost-i-razvitie/VIDIMO_I_EKONOMNO.md) — видимый результат, производительность.
- [MG_PYAT_AVTOZADACH.md](../automation/prompts/MG_PYAT_AVTOZADACH.md) и [chatgpt-autotask.md](../automation/prompts/chatgpt-autotask.md) — распределение ролей и приоритеты.
- [LAST_RUN.md](../reports/LAST_RUN.md) — последняя компактная сводка; логи только в Actions.

## Порядок работы
1. Проверь `STATUS.md`, `FINISH.md`, `ZANYATO.md`; выбери только незанятый пункт. Не редактируй игры по инфраструктурной задаче.
2. Сначала исправь найденную ошибку; добавь в [OSHIBKI.md](../OSHIBKI.md) строку и автоматическую ловушку. Не ослабляй проверки.
3. Не более **двух попыток**. Если блокировка не устранена — помести точную ссылку на ошибку в `STATUS.md` → `broken` и остановись.
4. **В конце КАЖДОЙ работы** обнови `STATUS.md`: `broken` и `left`, не более пяти пунктов со ссылками в каждом. `last_change`, `last_sha`, `finish` и `checks` формирует только Action.
5. Ветка и PR в `main`; ничего самостоятельно не сливай. Каждое заявление о готовности подкрепляй SHA и реальным прогоном.
6. Владельцу сообщай **только, что осталось**; без отчётных файлов, кроме прямо разрешённых `STATUS.md` и `reports/LAST_RUN.md`.
