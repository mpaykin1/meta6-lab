# Общая база правил агентов META GAMES LAB
Перед работой прочитай этот файл, затем только относящиеся к задаче первоисточники. Оригиналы имеют приоритет; этот указатель их не заменяет.
- [AGENTS.md](../AGENTS.md) — полномочия, REUSE, перечень объектов, перенос миров, неприкосновенные эталоны.
- [STATUS.md](../STATUS.md) — короткий статус; ссылки на последние ошибки и незакрытые пункты.
- [FINISH.md](09-platforma/FINISH.md) и [FINISH_2.md](09-platforma/FINISH_2.md) — единственные критерии готовности; статусы меняет только Claude.
- [ZANYATO.md](09-platforma/ZANYATO.md) — перед началом проверь, что пункт не занят.
- [КОНТУР БЕЗ ОШИБОК К1–К11](06-rabota-ii-s-kodom/KONTUR_BEZ_OSHIBOK.md) — сроки, две попытки, запрет обмана, обязательные ловушки, проверка PR.
- [OSHIBKI.md](../OSHIBKI.md) — журнал ошибок; новая ошибка = новая строка и постоянная автоматическая ловушка.
- [VIDY_OSHIBOK.md](06-rabota-ii-s-kodom/VIDY_OSHIBOK.md) — виды ошибок, если файл существует.
- [ПЕСОЧНИЦА](06-rabota-ii-s-kodom/PESOCHNITSA_GPT.md) — изменять только mpaykin1/meta6-lab, отдельная lab/ветка, не сливать в main (сливает Claude).
- [REUSE](06-rabota-ii-s-kodom/REUSE.md), [SOURCE ALLOWLIST](06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md), [НЕ МЕНЯТЬ НЕЗАПРОШЕННОЕ](06-rabota-ii-s-kodom/NE_MENYAT_NEZAPROSHENNOE.md).
- [Правила улучшения игр](01-stil-i-grafika/GRAF_KRATKO.md) и [полный GRAF](01-stil-i-grafika/graf.md) — только если задача затрагивает игры.
- [PLAYGAMA_RETENTION](07-publikaciya-playgama/PLAYGAMA_RETENTION.md) — R1–R11 для Playgama.
- [ЗВУК](03-muzyka-i-zvuk/ZVUK.md) — музыка, эффекты и баланс громкости.
- [ЧИСТЫЙ ЭКРАН](01-stil-i-grafika/CHISTYY_EKRAN.md) — текст и служебные элементы в меню.
- [БЕЗ ПОВТОРОВ](02-igrovye-mekhaniki/BEZ_POVTOROV.md) — неповторяемая проходимая раскладка.
- [ПОСТЕПЕННО](02-igrovye-mekhaniki/POSTEPENNO.md) — открытие мира по мере прогресса.
- [ПОНЯТНАЯ ПОЛЬЗА](02-igrovye-mekhaniki/PONYATNAYA_POLZA.md) — предметы дают понятный эффект.
- [ВИДИМО И ЭКОНОМНО](05-proizvoditelnost-i-razvitie/VIDIMO_I_EKONOMNO.md) — видимый результат, экономия ресурсов.
- [RULES_CHECKLIST](09-platforma/RULES_CHECKLIST.md) — автоматическая проверка правил.
- [Автозадачи](../automation/prompts/MG_PYAT_AVTOZADACH.md) и [общие инструкции](../automation/prompts/chatgpt-autotask.md) — порядок работы и приоритеты.
- [Краткие итоги проверок](../reports/LAST_RUN.md) — только последние результаты; полные логи остаются в Actions.

## Обязательный конец каждой работы
1. Исправь обнаруженную ошибку и добавь постоянную ловушку по К3–К5; максимум две попытки.
2. Обнови в STATUS.md поля broken и left (до пяти пунктов в каждом), с ссылками. Не изменяй вручную last_change, last_sha, checks — их заполняет Action.
3. Коммить только в свою ветку; PR в main; не изменяй игры, если задача не об играх.
4. Утверждения о готовности подтверждай ссылкой на SHA или Actions; владельцу сообщай только оставшееся.
