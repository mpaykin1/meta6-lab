# Урок: этап 7 A+B+C — коммит без единого запуска (2026-10-18)

| Что сломалось | Как нашли | Правило | Чем ловить |
|---|---|---|---|
| В `three-worlds-game/underwater-runtime.js` (cf49269) `update()` вызывает `immersion`, `bubbleBudget`, `emitBubble`, `updateBubbles`, `bubbleActive`, которые нигде не объявлены: ReferenceError каждый кадр, игра встаёт | Контролёр: `git grep` по ветке, 0 объявлений | Нельзя пушить код этапа, ни разу не запустив его в браузере; ветка без PR тоже проверяется | Тест `pageerror`/`console.error` в живом прогоне Chromium: падает на дефекте, проходит после правки; eslint `no-undef` до пуша |
