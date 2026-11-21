---
name: animated-world-guard
description: Required animated living-scene quality gate for game creation and mobile responsive gameplay. Trigger together with any playable HTML5 game, sprite/NPC motion, environment animation, or screen rotation request.
---

# ANIMATED WORLD GUARD — MANDATORY FOR GAMES

Every time this plugin creates or modifies a PLAYABLE GAME, apply this contract. If character animation assets are missing, mark the game an incomplete preview, never silently ship a static scene. Preserve all source files and character identities.

# Живой мир — обязательное правило

1. КАЖДЫЙ персонаж, присутствующий на экране, должен иметь циклическую анимацию дыхания, изменения позы, действий или ходьбы. Статическая фигура, запечённая на фоне, считается ошибкой.
2. Никакие статические изображения, покачивание глобального спрайта на ±1px или мигание одной лампы не считаются полной анимацией мира. Нужны независимые покадровые деформации тела и убедительные действия, циклы продолжительностью не менее 1–8 секунд, разная фаза для каждого жителя.
3. В каждом жилом помещении в кадре должны происходить отдельные осмысленные события: персонажи общаются, готовят, читают, ходят; предметы реагируют, свет изменяется, частицы и погодные эффекты существуют. Действия героя — строго по команде пользователя.
4. Источник графики и личность героев неприкосновенны: один герой во всех ракурсах, без замены персонажей Canvas-фигурами; анимационные кадры готовы заранее и соответствуют авторской палитре.
5. Вертикальный телефонный экран полностью заполняется игрой (100dvh, safe-area), без чёрных полей и крохоткого горизонтального окна. Поворот сразу перестраивает вид и управление в горизонтальную композицию; обзор пальцем, камера с сопровождением, кнопки доступного размера.
6. Перед выпуском игры запускайте браузер, наблюдайте несколько секунд и сравнивайте отдельные кадры внутри каждой комнаты: движения персонажей должны быть реально видны. Проверять портретную 390×844 и альбомную 844×390 ориентации. При отсутствии подтверждённых анимаций — блокировать релиз, не выдавать статический макет за живую игру.
7. HTML без внешних fetch/import/CDN при требовании автономной работы; запуск из file://. Нельзя заявлять о деплое без реального URL.


## Release gate
- All non-player characters are visibly active continuously: animated breathing, head, hands, interactions or looping physical motion. Moving an entire still image by one pixel is not enough.
- For source artwork, cut out each frozen person from the flattened original and rig/animate the same pixel identity, or use user-approved direction/action sprites. Never replace approved people with random new characters.
- Every occupied room has independent activity from multiple categories: interactions, object reactions, particle motion, lighting variation and environmental simulation.
- Do not drive hero actions without user input. Do not alter the hero on attack, standing, jump or turning.
- Mobile: full-screen portrait 100dvh with safe-area; real rotation adaptation to landscape; no dark margins; camera touch-pan and usable controls.
- Verify changes are *visible in the actual rendered frames* in portrait 390x844 and landscape 844x390, before delivering. If browser access fails, do not claim a visual PASS.
- Offline HTML must embed all engine, graphics and audio bytes when user demands autonomous HTML. Do not claim a public URL without deployment.
