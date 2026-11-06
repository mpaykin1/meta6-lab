# Sunken City — сборка для Playgama (2026-10-31)

- Игра в Playgama: **Sunken City**, applicationId `cmvw3cbqr0htyjm0hfg1p2l7h` (форма уже заполнена).
- Архив: `sunken-city-1.0.0.zip` (Bridge 2.4.0 первым в head, playgama-bridge-config.json, всё локально, сохранения только через bridge.storage, EN/RU по platform.language, пауза/звук/реклама через Bridge).
- Обложки: `cover_square.png` 800×800, `cover_portrait.png` 1080×1920, `cover_landscape.png` 1920×1080.
- Исходник: артефакт https://claude.ai/code/artifact/2beff885-ec7e-4547-8c5a-f570b797da3e (встроенный счётчик СОСТАВ: `await window.__INV()`).

Что осталось сделать агенту без привязки к компьютеру (сеть к S3 Playgama открыта):
1. start_archive_upload → curl PUT zip → confirm_archive_upload → ждать get_archive_status PASSED.
2. start_cover_upload ×3 → PUT → confirm_cover_upload.
3. publish_sandbox и вернуть ссылку песочницы.

Известный риск модерации: звуки синтезированы кодом (пункт 3.3.2) — решение владельца.
