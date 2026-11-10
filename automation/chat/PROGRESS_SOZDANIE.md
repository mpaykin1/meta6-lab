# Создание рабочего чата МГ/МГЛ — прогресс

Правило: каждый запуск проверяет состояние GitHub. Готовые шаги с SHA не повторять.
Ветки: `lab/chat-rabota` (эта задача), `lab/dispetcher` (обязательная зависимость).
Файлы `scripts/zadachi/`, `.github/workflows/zadachi-watch.yml`, `FINISH.md` не изменять.

| Шаг | Состояние | Доказательство | Дальше |
|---|---|---|---|
| 0. Прочитать правила и зарегистрировать работу | Готово: запись уже есть в main; подготовлен прогресс SHA `520d7285ac4d49a5e690ef816785de11ea4e8ce7` | [ZADACHI.md](https://github.com/mpaykin1/meta6-lab/blob/main/ZADACHI.md) | Не дублировать строку |
| 1. Диспетчер в main и актуальный main в ветке | Готово: #227 и #230 слиты; main влит в рабочую ветку без потери файлов | [#227](https://github.com/mpaykin1/meta6-lab/pull/227), [#230](https://github.com/mpaykin1/meta6-lab/pull/230), [merge f9ed1e9](https://github.com/mpaykin1/meta6-lab/commit/f9ed1e935aa4027fbe713b507be6473d7795df18) | Новые изменения — только после проверки HEAD |
| 2. Инструкция CHAT_RABOTA.md | Подготовлена в ветке, не слита | [59a835e](https://github.com/mpaykin1/meta6-lab/commit/59a835e5ec454ef67ff7e00e0212401d1777aa57) | Проверить CI и слить с разрешением после диспетчера |
| 3. SMENA.md, имя чата и проверка захвата | SMENA.md и имя подготовлены; захват ожидает реальную очередь | [f8920e0](https://github.com/mpaykin1/meta6-lab/commit/f8920e02d3056c623c9005cdbc06f31adc1c9d98) | После запуска DISPETCHER.md проверить реальный захват, не дублировать тест PR #227 |
| 4. PR и безопасное слияние | Открыт PR #229, слияние не выполнено | [PR #229](https://github.com/mpaykin1/meta6-lab/pull/229), [строка в ZADACHI](https://github.com/mpaykin1/meta6-lab/commit/cc889ee583e819427472eab9b57c95ff215fcfe3) | Дождаться обязательных CI актуального head, перекрёстной проверки и разрешённой очередности |
| 5. Исполнить две карточки | Не начато | — | Только после слияния инструкции и запуска диспетчера |

СЕЙЧАС ДЕЛАЮ: довести [PR #229](https://github.com/mpaykin1/meta6-lab/pull/229) до чистого CI на SHA после f9ed1e9; провести независимую перекрёстную проверку, затем допустимое слияние; потом захватить две карточки.
Сделано / дальше: [f9ed1e9](https://github.com/mpaykin1/meta6-lab/commit/f9ed1e935aa4027fbe713b507be6473d7795df18) — ветка обновлена; следующее действие — CI #229.
