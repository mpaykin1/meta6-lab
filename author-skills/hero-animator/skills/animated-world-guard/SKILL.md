---
name: animated-world-guard
description: Mandatory living-scene motion quality gate for every playable game output. Trigger alongside game generation, animation, moving NPCs, scene creation and mobile viewport adaptation.
---

# ANIMATED WORLD GUARD — ABSOLUTE REQUIREMENT

Every time this plugin creates or modifies a PLAYABLE GAME (not a static illustration), enforce the following contract BEFORE delivering. Do not substitute decorative fog/light or stationary sprite bobbing for animation of all characters.

# Живой мир — обязательное правило

1. КАЖДЫЙ персонаж, присутствующий на экране, должен иметь циклическую анимацию дыхания, изменения позы, действий или ходьбы. Статическая фигура, запечённая на фоне, считается ошибкой.
2. Никакие статические изображения, покачивание глобального спрайта на ±1px или мигание одной лампы не считаются полной анимацией мира. Нужны независимые покадровые деформации тела и убедительные действия, циклы продолжительностью не менее 1–8 секунд, разная фаза для каждого жителя.
3. В каждом жилом помещении в кадре должны происходить отдельные осмысленные события: персонажи общаются, готовят, читают, ходят; предметы реагируют, свет изменяется, частицы и погодные эффекты существуют. Действия героя — строго по команде пользователя.
4. Источник графики и личность героев неприкосновенны: один герой во всех ракурсах, без замены персонажей Canvas-фигурами; анимационные кадры готовы заранее и соответствуют авторской палитре.
5. Вертикальный телефонный экран полностью заполняется игрой (100dvh, safe-area), без чёрных полей и крохоткого горизонтального окна. Поворот сразу перестраивает вид и управление в горизонтальную композицию; обзор пальцем, камера с сопровождением, кнопки доступного размера.
6. Перед выпуском игры запускайте браузер, наблюдайте несколько секунд и сравнивайте отдельные кадры внутри каждой комнаты: движения персонажей должны быть реально видны. Проверять портретную 390×844 и альбомную 844×390 ориентации. При отсутствии подтверждённых анимаций — блокировать релиз, не выдавать статический макет за живую игру.
7. HTML без внешних fetch/import/CDN при требовании автономной работы; запуск из file://. Нельзя заявлять о деплое без реального URL.


## Release gate

- Include a game in the ZIP only when **every on-screen character** has a visible looping action animation (or deliberate player-input-only state if the player character is standing still). NPCs: independent walk, idle, gesture, interaction clips; environment: lights, steam, wind/rain, details, reactions.
- For all static inhabitants in a provided reference picture, use cutouts/inpaint or recreate **approved** sprites preserving identity; NEVER leave characters frozen inside a flattened background.
- Confirm the animation loop is running before user action and continues during dialogue/idle; visible movement across repeated frames must be perceptible.
- Layout fills `100dvw × 100dvh` (respect CSS safe areas) in phone portrait; landscape adapts on rotation and stays playable. Camera crop must be navigable by touch pan or overview controls. Controls must remain reachable and keyboard must still work.
- When browser verification is available, verify UI in portrait `390×844` and landscape `844×390`, observe movement across multiple animation frames and no JS errors. If unverified, mark preview honestly, never PASS.
- No artist asset substitutes or self-triggered hero actions. Preserve preceding code, source, physics, identity and modules.
