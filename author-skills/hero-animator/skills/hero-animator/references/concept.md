# Концепт и выбор образа

## 3-4 разных прочтения

Разбери имя по словам: каждое должно быть видно в каждом варианте. У "Астральной Чародейки" астральность читается в природе существа, чародейство в образе и оружии. Не своди имя к случайному предмету или шутке, которая теряет роль героя.

Для каждого варианта придумай силуэт и тело, голову и лицо, одежду, оружие, характер. Варианты должны отличаться хотя бы по трём из этих пяти признаков. Четыре перекраски одного великана не подходят. Если имя позволяет, рассматривай духа, зверя, существо-стихию, не только человека в костюме.

Сохрани единый чистый мультяшный стиль своей игры: читаемые крупные формы, выразительная голова, тёмный контур, простая заливка, внутренняя детализация без визуальной грязи. Картинки собственных одобренных героев помогают держать общий стиль. Не копируй их лица и силуэты.

## Шаблон запроса

Запрос пиши по-английски, это проверенный шаблон. К нему прикладывается картинка стиля игры человека: его готовые герои или любой арт игры. Своё подставь в `<>`:

```text
Image 1 is a lineup of my approved game heroes (style reference only, do not copy them). Draw ONE NEW hero who clearly belongs to this same cast: the same thick dark outline, the same cel shading with inner line details and small texture strokes (cloth folds, stitches, scratches) like these heroes, the same clean saturated colors (but use mainly the colors named in the idea), the same chunky cartoon proportions and the same calm upright idle stance in three-quarter view facing RIGHT.
The hero is "<Name>, <title>": <who this is by the words of the name, in one phrase> - <a joke or a detail from the lore>.
My rough idea, only as a starting point: <5-8 big features separated by commas: body, face, weapon, what the other hand does>.
USE YOUR OWN IMAGINATION AND CREATIVITY: reinterpret the idea freely, change or drop any of my details and invent your own - silhouette, body, face and pose of the character. Surprise me with something memorable, unique and full of character, not a generic fantasy creature. Only keep the essence: <2-3 things without which this is not the same hero: nature by the name, role, weapon>. Unique face, not the default cute face, no big glossy anime eyes with eyelashes.
Still the same bright, readable cartoon - NOT horror, NOT gritty realism, no gore. Keep it VERY SIMPLE, this character will be animated: at most 3-4 big items on the whole figure, each readable from far away. NO belts with buckles, NO pouches, NO scrolls, NO tassels, NO medallions, NO emblems or patterns on cloth, NO extra straps or jewelry, NO cape unless the idea names it. Big simple shapes, no glossy highlights, no sparkles, no glow, no floating objects. Natural relaxed idle stance. Full body, centered, about 80% of the canvas height with empty margins on every side, square image, plain flat pure white background, no ground shadow, no text.
```

Не превращай запрос в длинный перечень обязательных мелочей: подробный чек-лист из носа, глаз и пяти предметов даёт одинаковых героев во всех вариантах. Идея образа здесь стартовая точка, жёстко держатся только стиль и техника. Настроение задаёт имя и игра человека, а не прежний герой.

Слова в идее тоже рисуются. "Scorched, burnt, ragged, scarred, tattered, old" дают грязь, копоть и морщины: в идее называй цвета и крупные формы, а не износ. У природного героя (кора, камень, колючки) назови яркий цвет прямо, иначе он выйдет бурым целиком. Если герой не человек (дух, зверь, вещь), добавь в "who this is": `NOT a human and NOT a person in a costume`.

С фантазией модель любит свечение и мелочь (шар в руке, зверёк на голове, подвески). Что всё же пролезло, лучше убрать сейчас: повтори этот образ или поправь картинку. Каждая мелочь концепта потом стоит артефактов во всех анимациях.

В Google Flow прочитай текущий интерфейс: режим изображения, квадрат, Nano Banana Pro или доступная подходящая модель, один результат. Скачай каждый вариант обычной загрузкой браузера.

Необязательная альтернатива - `concept_codex.py`. Нужны установленный Codex CLI, вход с подпиской ChatGPT и доступный встроенный инструмент изображений. Скрипт не задаёт модель по умолчанию. Пример `jobs.json`:

```json
{"jobs":[{"hero":"mage","n":1,"prompt":"Полный запрос первого образа"},{"hero":"mage","n":2,"prompt":"Полный запрос другого образа"},{"hero":"mage","n":3,"prompt":"Полный запрос третьего образа"}]}
```

```sh
python scripts/concept_codex.py mage/jobs.json --out-dir mage/concepts --style mage/style.png
```

`--codex` задаёт путь к CLI, `--model` выбирает модель явно, `--only mage_2` ограничивает задания. Полученные картинки не перезаписываются. Если инструмент недоступен, используй Flow; не обещай успешную генерацию до проверки.

## Подготовка и самопроверка

```sh
python scripts/concept_sheet.py mage/choices.png mage/concepts/mage_1.png mage/concepts/mage_2.png mage/concepts/mage_3.png --name "Маг"
```

До показа открой лист. Проверь каждый образ: все слова имени читаются, стиль одинаковый, лица и силуэты разные, весь герой в кадре, хват оружия естественный, другая рука занята осмысленно. Мелочь, отдельные парящие украшения и чрезмерно сложная одежда будут меняться в видео.

**Покажи номера и дождись выбора человека.** После выбора сними белый фон только по цвету:

```sh
python scripts/cut_white.py mage/concepts/mage_2.png mage/concept.png --check mage/cut_check.jpg
```

Для белого героя добавь `--no-holes`: белые участки внутри силуэта сохранятся. Открой проверку на двух фонах. Белый предмет, соединённый с белым фоном, может потеряться даже с этим ключом: исправь фон/край изображения до видео. `--flip` отражает героя, если он смотрит влево.

```sh
python scripts/frame.py mage/concept.png mage/base.png --size 1920x1080 --x 0.42 --foot 0.90 --h 0.46
```

Фон выбирается по цветовому расстоянию от героя; скрипт печатает RGB. Он не убирает непрозрачный фон концепта сам. Проверь кадр глазами: около 46% высоты, место для оружия, прыжка и эффектов. Этот кадр общий для всех клипов.
