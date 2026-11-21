# Клипы в Google Flow через Claude in Chrome

## Настройка

Открой `https://flow.google.com/` через расширение Claude in Chrome. Прочитай страницу, выбери или создай проект героя. Найди настройки по смыслу, не по координатам: интерфейс может измениться.

Нужны: видео, ручной режим (агентский режим Flow выключен), "Кадры", 16:9, Omni 1.1 Flash, 720p, один результат. Загрузить стартовый PNG следует обычным выбором файла. Укажи его первым и последним кадром; у смерти только первым. Закрой панель настроек обычной клавишей Escape и проверь видимые миниатюры перед отправкой каждого запроса. Слоты могут сбрасываться.

Отправляй запрос обычным нажатием в интерфейсе. Убедись, что появилась новая задача, а не открылся старый клип. Не отправляй второй раз из-за одной задержки страницы: сначала проверь очередь и результат.

Один дубль на клип. Переделка x1 нужна только если проверка нашла проблему. Veo 3.1 - запасной вариант; доступные параметры и цену проверь на странице. Не смешивай его старые настройки с настройками Omni.

## Набор: 12 клипов

| Имя | Что происходит | Клип |
|---|---|---|
| `idle` | Почти неподвижная стойка: тихое дыхание и одно короткое моргание | 4 с |
| `attack` | Короткий замах, быстрый удар или выпуск снаряда, фиксация, возврат | 4 с |
| `cast` | Ульта: заметно крупнее и ярче атаки (прыжок, вращение оружия, свечение) | 6 с |
| `hit` | Получает удар, отдача и быстрое восстановление | 4 с |
| `stun` | Качается от оглушения на месте, потом приходит в себя | 6 с |
| `victory` | Радуется победе и возвращается в исходную стойку | 6 с |
| `death` | Обычная смерть: падает, оружие рядом, лежит неподвижно | 6 с, только первый кадр |
| `death`, второй вариант | Комичная смерть: мультяшный чёрный юмор по характеру героя, без крови | 6 с, только первый кадр |
| `idle_happy` | Отдельная радость на месте, потом спокойная стойка | 6 с |
| `fidget_*`, три штуки | Три разных бытовых действия стойки по характеру героя | 6 с каждое |

Итого 12 клипов. Из двух смертей человек выбирает одну, вторая остаётся запасной. Листов на выходе тоже 12: добавляется `cheer`, это победа целиком от стойки до стойки из того же клипа `victory`, отдельная генерация для неё не нужна. Названия `fidget_*` замени на действия своего героя (у мага `fidget_staff`, `fidget_beard`, `fidget_star`). `idle_happy` всегда снимается отдельным клипом, а не вырезается из победы: её чаще всего забывают.

## Запрос: по-английски, главное в первой фразе

Запросы пиши по-английски, одним абзацем: действие, потом общий хвост. Первая фраза КАПСОМ про главный риск этого героя. Что ставить первым, видно по первым клипам:

- Камера наезжает, герой растёт: `IMPORTANT: the camera never moves closer and never zooms in; he stays small in the picture: from the very first frame to the very last one he takes up less than half of the picture height, his feet stay on the same line, and the large empty background area above him and on both sides stays empty.`
- Оружие перескакивает в другую руку: `IMPORTANT: he holds the <weapon> only with the arm on the left side of the image and never changes hands; his other arm stays bent with the fist pressed against his hip and does not move at all.`
- Оружие в дальней руке, а ближняя рука лезет в удар: `IMPORTANT, HIS TWO ARMS: the arm holding the <weapon> is the one on the right side of the image, and it is the only arm that moves in this clip. The other arm hangs down exactly like in the first frame: it does not move at all, it never lifts, it never stretches forward and it never throws anything.`

Хвост для каждого запроса, своё подставь в `<>`:

```text
Static locked camera, no zoom, no pan; the whole character and the whole <weapon> always stay fully inside the frame with empty space around <him/her>. Exactly the same character design, size and colors in every frame, same flat 2D cel-shaded style with thick dark outlines, nothing added or removed (<what the model likes to add to this hero, for example: no bell on the hat>). The <weapon> stays in the <left/right> hand the whole time. Perfectly clean flat solid <background color from frame.py> background, one uniform color in every frame: no dust, no specks, no particles, no noise, no texture. No effects, no glow, no sparkles, no shadows, no text.
```

Ниже рабочие запросы мага. Для своего героя замени оружие, мягкие части (борода, волосы, хвост, листья, плащ) и характер: тяжёлый воин бьёт с упором, ловкач коротко и быстро. Структуру сохрани: короткий замах, быстрый удар, фиксация, возврат в стойку.

- `attack` (4 с): `A snappy staff attack like in a mobile fighting game: quickly swings the staff back behind his head (short anticipation, holds a split second), whips it forward in one very fast motion and thrusts it toward an enemy on the right, shouting, holds the strike for a moment, returns to the calm standing pose.`
- `cast` (6 с): `Crouches gathering power, leaps up and spins the staff in a full circle high above his head while the star blazes with bright golden light, lands with feet wide apart and thrusts the staff forward, the star flashing brightly as he releases the spell, holds the heroic pose, returns to standing.` В хвосте вместо `No effects, no glow` напиши `The only light effect is the glow of the star on the staff; no explosions, no particles`.
- `hit` (4 с): `At about 0.4 s a strong blow hits him from the right, recoils backward with eyes squeezed shut and a pained grimace, body squashes, hat and beard jolt, quickly recovers.`
- `stun` (6 с): `Right away wobbles and sways in small circles in place with dizzy spiral eyes and tongue out, knees wobbly, leaning on the staff, then shakes the head and returns.`
- `victory` (6 с): `Jumps up happily two times raising the staff high, laughing with eyes closed, a little happy dance, returns (the hat stays on his head).`
- `death` (6 с, только первый кадр). Удар в смерти Omni любит рисовать влетающим чужим оружием со вспышкой, поэтому надёжнее смерть без удара: `There is no blow and nothing hits him: he staggers backward, exhausted, his knees buckle, the staff slips out of his hand and drops straight down next to his feet, he falls flat on his back and lies still with X-shaped eyes. The staff stays lying close to him, it does not fly away. Nothing flies in: no arrow, no spear, no projectile, no enemy weapon, no impact flash. No ground, no floor, no dust.`
- Комичная смерть: тот же хвост и мультяшная нелепая гибель по характеру героя без крови. Например, свой же топор падает ему на голову или герой валится плашмя, как бревно.
- `idle` (4 с): `The old wizard stands still in a relaxed idle pose and is almost motionless: only very subtle, slow, calm breathing, his shoulders rise and fall by just a few pixels, the beard and the tip of the hat barely move, and he makes one quick natural blink that lasts a fraction of a second. The staff stays upright and still in his hand. No gestures, no change of facial expression, no bending. Seamless loop, the last frame is exactly like the first frame.`
- `idle_happy` (6 с): `The old wizard is happy and delighted: standing in place he laughs with his eyes closed and nods; he keeps laughing happily like this for most of the clip, then calms down and returns to the calm standing pose exactly like in the first frame. His feet stay planted on exactly the same spot the whole time; he does not walk, does not jump and does not take any steps.` В хвост добавь `no hearts`.
- `fidget_*` (6 с, три разных): `The old wizard stands in a relaxed idle pose. Both of his feet stay planted on exactly the same spot the whole time and never lift off the ground; he does not walk and does not take any steps. After a calm moment he <taps the staff on the ground / strokes his beard / polishes the star with his sleeve>, and returns to the calm standing pose exactly like in the first frame, and stays still. Small, natural, everyday movement, smooth and unhurried.` Без фразы про ноги Omni вместо "переступить" делает пару шагов вперёд.

**Бросок вместо удара.** Если в игре герой бросает оружие (топор, нож, копьё), в клипе оно должно по-настоящему улететь из руки. Потом герой берёт новое из видимого запаса (пояс, колчан, за спиной) или ловит вернувшееся. Не проси, чтобы оружие просто появилось в пустой руке: это сразу бросается в глаза. Пример для берсерка с двумя топорами:

```text
A fast axe throw like in a mobile fighting game: the berserker quickly pulls the axe in his right hand back behind his head (short anticipation, holds a split second), then hurls it forward in one very fast powerful overhand throw toward an enemy on the right; the axe leaves his hand and flies quickly out of the frame to the right. His left hand keeps holding its own axe the whole time. Right after the throw he grabs a new axe from his belt with his right hand and returns to the calm standing pose holding two axes, exactly like in the first frame.
```

Улетающее оружие потом закрывается маской справа: летящий снаряд рисует сам движок.

**Эффекты решаются до ролика.** Дым, искры и пыль при приземлении можно оставлять: пыль нарисована поверх ступней, и её чистка съедает ноги. Убирать стоит вспышки удара и чужое оружие. После одобрения ролика согласованные дуги, дым, искры, пыль и звёзды не трогают.

## Кредиты и скачивание

Цены Omni 720p на ноябрь 2026: 4 с = 7 кредитов, 6 с = 10, 8 с = 12. Набор из 12 клипов стоит около 110 кредитов, с переделками у автора скилла выходило 130-210 на героя. Цена видна на плашке настроек перед отправкой: сверяй её и остаток. Если кредитов не хватает, скажи человеку и сохрани сделанное.

Скачивай готовый MP4 штатной загрузкой браузера. Если не видна кнопка, открой просмотр клипа или доступное меню загрузки; пакетную загрузку используй только если она действительно есть. Дождись исчезновения незавершённого файла загрузки и проверь, что клип читается. Если получился ZIP, распакуй его в папку героя перед сбором MP4.

```sh
python scripts/flow_collect.py mage/clips --downloads downloads --match Mage --since 30m --names attack,ult,hit --dry-run
```

После проверки повтори без `--dry-run`. Имена назначаются по времени скачивания от старого к новому; порядок сверь по кадрам. Количество имён должно точно совпасть с числом найденных файлов. Без `--downloads` используется `~/Downloads`. Оригинальные загрузки сохраняются, существующие разные клипы не перезаписываются.
