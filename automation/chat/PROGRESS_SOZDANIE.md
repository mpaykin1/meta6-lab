# Создание рабочего чата МГ/МГЛ — прогресс

Правило: каждый запуск проверяет состояние GitHub. Готовые шаги с SHA не повторять.
Ветки: `lab/chat-rabota` (эта задача), `lab/dispetcher` (обязательная зависимость).
Файлы `scripts/zadachi/`, `.github/workflows/zadachi-watch.yml`, `FINISH.md` не изменять.

| Шаг | Состояние | Доказательство | Дальше |
|---|---|---|---|
| 0. Прочитать правила и зарегистрировать работу | Готово: запись уже есть в main; подготовлен прогресс SHA `520d7285ac4d49a5e690ef816785de11ea4e8ce7` | [ZADACHI.md](https://github.com/mpaykin1/meta6-lab/blob/main/ZADACHI.md) | Не дублировать строку |
| 1. Диспетчер в main и актуальный main в ветке | Готово: #227 и #230 слиты; main влит в рабочую ветку без потери файлов | [#227](https://github.com/mpaykin1/meta6-lab/pull/227), [#230](https://github.com/mpaykin1/meta6-lab/pull/230), [merge f9ed1e9](https://github.com/mpaykin1/meta6-lab/commit/f9ed1e935aa4027fbe713b507be6473d7795df18) | Новые изменения — только после проверки HEAD |
| 2. Инструкция CHAT_RABOTA.md | Подготовлена в ветке, не слита | [59a835e](https://github.com/mpaykin1/meta6-lab/commit/59a835e5ec454ef67ff7e00e0212401d1777aa57) | Проверить CI и слить с разрешением после диспетчера |
| 3. SMENA.md, имя чата и проверка захвата | Готово в рабочей ветке: реальные захваты #191 и #208 без перехвата занятых #132 и #200 | [#191: 1b95ae3](https://github.com/mpaykin1/meta6-lab/commit/1b95ae31a55a7700e61ee60c209f39a5bd23bc92), [#208: 7ecb6eb](https://github.com/mpaykin1/meta6-lab/commit/7ecb6ebb13090462ddf7d2fc223246c3d5a12904) | Завершить карточки после CI / решения Claude |
| 4. PR и безопасное слияние | Открыт PR #229, слияние не выполнено | [PR #229](https://github.com/mpaykin1/meta6-lab/pull/229), [строка в ZADACHI](https://github.com/mpaykin1/meta6-lab/commit/cc889ee583e819427472eab9b57c95ff215fcfe3) | Дождаться обязательных CI актуального head, перекрёстной проверки и разрешённой очередности |
| 5. Исполнить две карточки | #191: read-only bot и игровая стратегия в PR, исправлено потенциальное удаление 16 shared при синхронизации main; #208: неизменяемый оригинал с LEGACY_LIGHTS требует Claude, PR не сливать | [#191: коммит 27537b0](https://github.com/mpaykin1/meta6-lab/commit/27537b0c086b567f6f546b066088ccf8ee44f2bd), [#208](https://github.com/mpaykin1/meta6-lab/pull/208) | #191: проверить и довести настоящий mobile+desktop bot; #208: решение Claude по разрешению эталона |
| 6. Дефект mergeable=null | Код готов, 12/12 unit + четыре мутанта; повторный dispatch прошёл после API 403, все текущие проверки PR #231 зелёные; слияния нет | [#231](https://github.com/mpaykin1/meta6-lab/pull/231), [dispatch PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/42796467252/job/129770732630) | Перекрёстный контроль не-автором и разрешённое слияние |

СЕЙЧАС ДЕЛАЮ: #229 и #231 ожидают независимую перекрёстную проверку и слияние при зелёном CI нового HEAD; #191 ожидает честный META BOT PASS на ПК и телефоне; #208 НУЖЕН CLAUDE — неизменяемый исходный HTML имеет запрещённый LEGACY_LIGHTS.
Сделано / дальше: [две карточки захвачены](https://github.com/mpaykin1/meta6-lab/commit/7ecb6ebb13090462ddf7d2fc223246c3d5a12904); [PR #191](https://github.com/mpaykin1/meta6-lab/pull/191), [PR #208](https://github.com/mpaykin1/meta6-lab/pull/208), [PR #229](https://github.com/mpaykin1/meta6-lab/pull/229), [PR #231](https://github.com/mpaykin1/meta6-lab/pull/231). Не объявлять неслитое слитым.

## Автодоводчик 11.11.2026
- Шаг 1: предложен безопасный workflow `MG PR autofinish` в ветке `lab/pr-autofinish-1111`. Защищённые файлы не сливаются автоматически; новый workflow требует решения Claude перед слиянием.
- Далее: бесконфликтные журналы; приоритет зависших; охранник отчёта; пробный PR.

- Шаг 3 (11.11.2026): общий промпт пяти автозадач изменён: древнейшие ЗАВИС/ЗАБРОШЕНО первые, новые задачи запрещены. Порог 60 минут задан на уровне исполнителей; protected watch требует отдельного решения Claude.

- Шаг 4 (11.11.2026): CI-охранник новых строк отчётов и SMENA.md; негативные мутации без ссылки, с простой ссылкой на PR и с отвлекающей URL. Включение workflow после разрешения Claude.

- Шаг 2 (11.11.2026): без потерь перенесены действующие записи в `journal/entries/**`; `scripts/journal/build.mjs` формирует общие представления `journal/compiled/**`. Исходные файлы до переключения защищённых writers/guard оставлены без изменений. Новый workflow требует Claude.

- Шаг 5 (11.11.2026): пробный PR с намеренно отставшей веткой [#239](https://github.com/mpaykin1/meta6-lab/pull/239), исходный main SHA `e178381dcb446958f7ddc3afa800e397bf73c880`, фикстура [5240beb](https://github.com/mpaykin1/meta6-lab/commit/5240bebee277f57819922917174595a97606cc75). Проверку автосинхронизации/самослияния нельзя считать выполненной до включения workflow в main и независимой проверки.
- Исправлено распознавание русских слов в охраннике: [c14208e](https://github.com/mpaykin1/meta6-lab/commit/c14208e4550f13ab8bbf14f14611982414aee552). Следующее: проверка нового CI на HEAD PR #238 и требуемое разрешение Claude.

- Исправление (11.11.2026): охранник распознаёт кириллическое «слить» без ошибочного ASCII word boundary; approve `action_required` ограничен доверенными PR после независимой проверки; обход PR ограничен 20 за цикл с ротацией.
