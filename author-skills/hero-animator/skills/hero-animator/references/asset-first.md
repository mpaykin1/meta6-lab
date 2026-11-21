# Asset-first: графическая анимация из утверждённого арта без Google Flow

## Визуальный контракт

Используй оригинальный эскиз как style + character + composition reference при каждой генерации. Генерируй отдельные прозрачные кадры, а не инструкцию нарисовать героя геометрией. Проверяй лицо, голову, форму плаща, аксессуары, оружие, золотой декор и освещение. Арт может быть одновременно живописным и анимируемым.

### Запрос для генерации кадров (адаптируй буквально к пользователю)

> Animate the EXACT approved illustrated character from the supplied reference. Preserve identity, silhouette, face/head, exact costume construction, proportions, linework, brush strokes, colors, ornate glowing cracks and all recognisable details. Create a coherent side-view sequence for [ACTION] with [N] distinct poses. Every pose must be a full-body illustration of the SAME character, identical scale and camera angle, feet aligned to a constant ground anchor, no camera movement. Transparent RGBA background, no cast shadows, no props not in the reference, no other characters, no labels, generous padding, individually separable frames. Do NOT simplify or redesign this character, do not turn the painterly art into vector art, flat shapes, stick figures, black silhouettes, generic low-poly models or placeholders.

Слова «exact» и «identical» — требования к проверке, не гарантия работы генератора. Если модель меняет внешность, исправляй кадры (image-to-image с тем же эталоном, инпейнт или ручная правка).

## Разделение окружения

Создай четыре уровня из исходного иллюстрированного мира. Дальний — панорама и атмосферное небо. Средний — архитектура, деревья, камни и обломки. Ближний — детализация земли и трава. Экранный — туман, тепло, искры, glow. Фоны и предметы должны быть реальными художественными текстурами. Параллакс, движение камеры, рассеивание тумана и подсветка допускаются кодом. Искажения не должны стирать фактуру.

## Количество кадров

- idle: 6–8 ключевых различимых кадров при наличии дыхания/движения ткани; при высококачественном cutout-puppet движении допускаются независимые элементы.
- walk: 8–12 ключевых кадров при среднем/полном цикле; стопы должны касаться земли по очереди, туловище двигаться с массой.
- run: 8–12 кадров с фазой полёта.
- jump: anticipation, takeoff, airborne, landing, recovery (5+ фаз).
- attack: anticipation, swing, impact, recovery (6+ кадров).
- hit / death: читаемая реакция, потеря равновесия, контакт с землёй, удержание конца.

Числа — ориентир, не имитация готовности дублями одинаковой картинки. Частота воспроизведения обычно 8–16 уникальных рисунков в секунду с повтором кадров на 24/30 fps; регулируй художественную постановку.

## PNG → игровой JSON

Сложи каждый набор кадров по папкам: `hero/idle/000.png`, `hero/idle/001.png`, `hero/walk/000.png` и т.д. У кадров должны быть общий размер холста и одна точка опоры. Применяй `scripts/images2atlas.py` для упаковки; выход читается существующим просмотрщиком `viewer/viewer.html` и имеет формат `references/engine.md`.

Примеры CLI:

```bash
python scripts/images2atlas.py art/hero game/assets/hero --id hero
python scripts/images2atlas.py art/tree game/assets/tree --id tree --fps 12
```

Важно: этот инструмент ПАКУЕТ уже нарисованные кадры, **не умеет создавать художественную анимацию из одного изображения**. Единственная фотография/концепт не превращается в 12 настоящих поз автоматически с помощью кода упаковки. Сначала нужны сами рисунки кадров или достоверный художественный риг.

## Показ результата

Выводи код `index.html`, который реально загружает игровые ассеты из соседней папки, использует правильные pivot/anchor и имена из JSON и запускает анимации. Загрузи сцену в браузере и посмотри на кадры перед тем, как дать URL или ZIP. Для пользователя важна работающая художественная анимация, а не набор текстовых обещаний.
