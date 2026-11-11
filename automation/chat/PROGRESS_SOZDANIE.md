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

## Очередь PR 11.11.2026 — продолжение рабочего чата
- PR #229 уже слит ранее: [merge 40dfc50](https://github.com/mpaykin1/meta6-lab/commit/40dfc505c5427f8d0b17b679d2f5df74352bc7c1), не повторять.
- PR #231: [повтор неуспешных jobs](https://github.com/mpaykin1/meta6-lab/actions/runs/42963587611) инициирован через Actions API 11.11; ответ `success=true`. Проверить результат повторного прогона перед слиянием.
- PR #126: в ветку влит актуальный `main@34eef6c` безопасным двухродительским [коммитом c153bd9](https://github.com/mpaykin1/meta6-lab/commit/c153bd90b530ed30aea5f1b1cf152432637b99a6); документ сохранён byte-for-byte, SHA blob `93a8682d5cdac625c990c667bf02f987a288f57d`. Дальше проверить CI на c153bd9.
- PR #225: конфликт со свежим main ещё требует бережного объединения OSHIBKI.md и docs/progress/PR54_59_60.md; не менять защищённый workflow.

### PR #225 — согласование с main 11.11.2026
- [Двухродительский merge dfe311e](https://github.com/mpaykin1/meta6-lab/commit/dfe311e5bbfff7db31c329229ff7154ed692be98): branch head `95f3736` + актуальный main `e818b2f`. Из OSHIBKI.md сохранены все записи обеих сторон; добавлена новая #32, устранены коллизии существовавших #18→#33 и #17→#34 без удаления текста. В docs/progress/PR54_59_60.md все строки ветки уже были в main, сохранён полный вариант main. Защищённые workflow не изменялись вручную. `shared/library/index.json` сохранён из свежего main.
- Дальше: проверки нового HEAD и независимая проверка кода; при красном CI код не сливать. Публикацию Broken City проверять только после разрешённого слияния.

### PR #126 и #231 — 11.11.2026
- PR #126: [слит squash 7f56165](https://github.com/mpaykin1/meta6-lab/commit/7f5616591ca5baa37186d86621299d32c77230b1), same HEAD `c153bd9`, четыре зелёных: [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/42968765796), [KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/42968765740), [META guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42968765788), [library guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42968765785). Проверить main после слияния.
- PR #231: повторный [MG Dispatcher 42963587611](https://github.com/mpaykin1/meta6-lab/actions/runs/42963587611) завершился SUCCESS (попытка 2). После конфликта с быстро меняющимся main синхронизирована ветка: [merge 90dd097](https://github.com/mpaykin1/meta6-lab/commit/90dd0973baced380bcda4dad402bb4287520419c), `main@39063f7`, весь журнал ошибок сохранён, коллизии номеров 18→32, 17→33, 31→34 устранены. Дальше CI нового HEAD, без зелёных не сливать.
- #225: другой процесс обновил HEAD до `d3e2cb1dccfafcda5d1686d5dafa7ebf3ade5590`; не перезаписывать. На предыдущем HEAD красные `KONTUR Guard` и `Library Machine` — читать точные логи и чинить на фактическом HEAD.
