# Конвейер полной автоматизации «три мира» (Claude ↔ ChatGPT)

Всё, что нужно, чтобы запустить, восстановить или повторить автоматическую разработку. Владелец вставляет промпты один раз и уходит. Правила процесса: [docs/THREE_WORLDS_MERGE_RU.md](../docs/THREE_WORLDS_MERGE_RU.md) разделы 14–18. Входной пароль для ИИ: [three-worlds.md](../three-worlds.md).

## Схема
```
Владелец (один раз вставил промпт)
   |
   +-- ChatGPT (разработчик): автозадачи на аккаунте + чат «Продолжение этапов проекта»
   |      пишет код этапов 0-6 в ветках ai/chatgpt/stage-N, открывает PR, правит замечания, сливает после REVIEW: OK
   |
   +-- Claude (контролёр), облако, каждый час: проверяет PR, пишет REVIEW OK/CHANGES с готовым исправлением,
   |      обновляет handoff/PROGRESS.md и шлёт владельцу пуш «Этап N из 6 ...»
   |
   +-- Claude (сторож), на компьютере владельца, каждые 2 часа: если ChatGPT молчит больше 2 часов,
          через Chrome пишет ему в чат (или открывает новый)

Канал связи: ветка `handoff` репозитория mpaykin1/meta6 (handoff/to-claude/, handoff/to-chatgpt/, STATUS-*.md, PROGRESS.md, RESULT.md)
```

## Компоненты
| Компонент | Где живёт | Расписание | Текст |
|---|---|---|---|
| Claude-контролёр | запланированная задача Claude, id `trig_01D1hx6RUzyniQeBSLHsCEVm` | каждый час (:07 UTC) | [prompts/claude-controller.md](prompts/claude-controller.md) |
| Claude-сторож | запланированная задача на компьютере, id `trig_016tJNvfcaGA55pvSs2hugVZ` | каждые 2 часа (:23 UTC) | [prompts/claude-computer-watchdog.md](prompts/claude-computer-watchdog.md) |
| ChatGPT-разработчик | 5 автозадач ChatGPT + чат «Продолжение этапов проекта» | по его расписанию, каждый час | [prompts/chatgpt-developer.md](prompts/chatgpt-developer.md) |
| Независимый аудитор | новый чат ChatGPT раз в ~6 часов, запускает сторож | по условиям в watchdog | [prompts/chatgpt-auditor.md](prompts/chatgpt-auditor.md) |
| Канал связи | ветка `handoff` | постоянно | раздел 18.3 документа |
| Ассеты референса | `reference/graf-offline/` | только чтение | [NOTES](../reference/graf-offline/NOTES.md) |

## Запуск с нуля (если что-то пропало)
1. В чат ChatGPT вставить промпт 2 из [prompts/chatgpt-developer.md](prompts/chatgpt-developer.md) (обновить автозадачи), затем промпт 1 (запустить непрерывную разработку).
2. Создать две запланированные задачи Claude по текстам из `prompts/` (cron и привязку к компьютеру см. таблицу). Контролёр без компьютера, сторож с компьютером.
3. Для сторожа: на компьютере открыт Chrome с расширением «Claude in Chrome» (https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn), вход в аккаунт Claude и в ChatGPT выполнены владельцем. Firefox не поддерживается.
4. Ветка `handoff` должна существовать (в ней `handoff/README.md`, `STATUS-*.md`, `to-claude/`, `to-chatgpt/`).

## Что видит владелец
- Пуш от задачи контролёра каждый час: «Этап N из 6 (название) · слито X/7 · блокер · ссылка».
- `handoff/PROGRESS.md` в ветке `handoff`: таблица этапов.
- В конце: `handoff/RESULT.md` и запись в `three-worlds.md` со ссылкой играть: https://mpaykin1.github.io/meta6/three-worlds-game/ . PASS/FAIL ставит только владелец.

## Границы и риски
- Пароли и вход в аккаунты вводит только владелец; ИИ их не вводят.
- Нужны: включённый компьютер и Chrome (для сторожа), лимиты GitHub, лимиты моделей. При блокировке цепочка пишет ALERT и ждёт следующего круга, лимиты не обходятся.
- GPU и телефон ChatGPT проверить не может (нет видеодрайвера в песочнице); финальную проверку на телефоне делает владелец.
- Принятые игры (`underwater-world/`, V5–V7) заморожены; работа идёт только в `three-worlds-game/`.
- Остановка всей цепочки: владелец пишет «стоп» в чат Claude; затем отключить обе запланированные задачи Claude и автозадачи ChatGPT.
