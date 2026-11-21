# Единственный режим Hero Animator для игры с 3D-физикой и рисованной графикой

## Цель

Визуально: **тот же утверждённый рисунок**, живые нарисованные позы, плёночная фактура, плащи, волосы, руины, туман. Технически: **отдельная невидимая 3D-структура** для перемещения, физики, столкновений и взаимодействий. Художественные кадры не участвуют в расчётах физики напрямую.

**Это не волшебное преобразование GIF в объёмную модель.** 3D-коллайдеры решают задачу обнаружения столкновений независимо от внешнего вида, но для согласования визуала с физикой требуется выдерживать pivot, анимационные события и форму хитбокса. Для поворота персонажа в свободной 3D-камере необходимо нарисовать 4–8 направлений анимации (или перейти к настоящей 3D-модели с авторской UV-текстурой).

## Архитектура

```
ActorRoot (THREE.Group, 3D world transform)
├─ Hidden3DRig (pelvis, chest, head, hands, feet, attach points)
├─ BodyCollider (THREE.BoxGeometry, invisible)
├─ AttackCollider (THREE.BoxGeometry, invisible, time-window or frame metadata)
└─ IllustratedSkin (textured plane / optional body-part cutouts)
    └─ SpriteFrame (RGBA artwork from author-approved atlas)

World:
- Actual geometry/colliders/physics: Three.js + Rapier or Cannon as needed.
- Hand-painted landscape layers: textured meshes at different depths.
- Background smoke, dust, fire: optional WebM video loops (not gameplay hit objects).
- GPU glow/haze/sway: GLSL post FX or tiny controlled visual motion ON TOP of art.
```

## Правило «одна активная архитектура»

Выполняй задачу в **том же плагине Hero Animator**. Не создавай `Hero Animator 3D`, `Hero Animator HD`, `Hero Animator Hybrid` как отдельные плагины или копии. Не заваливай пользователя выбором конкурирующих версий. Для 2D-игры по умолчанию достаточно atlas+JSON; если есть 3D-хитбоксы, столкновения, камера или 3D-платформы — выбери режим **3D RIG + 2D ART** внутри Hero Animator. Старый видеоконвейер сохраняется как импортёр, не как отдельный плагин.

## Художественный pipeline

1. Утверждённый эскиз: зафиксируй очертания, кисть, палитру, лицо/одежду, свет, угол камеры.
2. Создай реальные PNG RGBA для idle/walk/run/jump/attack/hit/death. Не рисуй «чёрную заглушку» вместо персонажа. GIF/WebM — только предпросмотр и источник кадров; не нужно проигрывать анимированный GIF напрямую как WebGL-текстуру.
3. Все кадры одной анимации должны иметь одинаковый прозрачный canvas и одну точку опоры (ступни/пятки). У разных направлений тоже должны совпадать масштаб и опора.
4. Упакуй `scripts/images2atlas.py` → `hero.json`, `hero_idle.png`, `hero_walk.png` и т.д. Можно импортировать видео через прежний `video2sheet.py`.
5. Создай `loadHybridActor` из `runtime/hero-hybrid.mjs`: 3D root, невидимые коллайдеры, 2D художественная текстура.
6. Код игры двигает `actor.root.position` и `actor.root.rotation`, а не сам спрайт для расчёта столкновений. Рисунок воспроизводится `setAction` и `update(dt,camera)`.
7. Для 3D-ориентации добавляй `.png` action folders с суффиксами: `walk_front`, `walk_back`, `walk_left`, `walk_right`. Для 8 направлений — дополнительно диагональные состояния и расширение классификатора угла; сам по себе billboard не дорисовывает заднюю часть персонажа.
8. Проверь на игровом кадре: объём игрока соответствует нарисованному силуэту настолько, насколько нужно геймплею; ступни попадают на землю; атака попадает тогда, когда оружие визуально пересекает цель.

## Формат контроллера и событий

`runtime/hero-hybrid.mjs` читает **уже существующие** `<id>.json` (`anims.<name>.sheet`, `frames[i]=[sx,sy,w,h,ox,oy]`, `fps`, `loop`, `loopFrom`, `hold`, `release`). Дополнительно у действия допускаются поля:

```json
{
  "release": 0.16,
  "hitStart": 0.13,
  "hitEnd": 0.25,
  "hitboxes": [
    null,
    null,
    [0.62, 1.12, 0.0, 0.70, 0.45, 0.48],
    [0.77, 1.03, 0.0, 0.82, 0.52, 0.52],
    null
  ]
}
```

`hitboxes[i]` — `[localX,localY,localZ,width,height,depth]` в **метрах 3D-мира**, не в пикселях арта. В документации примеры условные: конкретные значения измеряются по герою и масштабу игры, а не копируются механически. `null` означает отсутствие активной ударной области на этом кадре. Событие `release` выдаётся один раз при пересечении времени анимации; обработчик запускает игровой снаряд из 3D-позиции руки/оружия.

`actor.getBodyAABB()`, `actor.getAttackAABB()` предоставляют ограничивающие AABB для **приближённой быстрой проверки**. Для точных 3D-столкновений, физической устойчивости, slopes, moving platforms используй реальный physics engine — Rapier или Cannon с явным сопоставлением collider transform к `actor.root`/bone anchors. Не заявляй, что простая AABB точна для повёрнутого меча или сложной геометрии.

## Пример использования внутри Three.js проекта

```js
import * as THREE from 'three';
import { loadHybridActor } from './hero-hybrid.mjs';

const hero = await loadHybridActor({
  THREE,
  atlasUrl: './assets/hero/hero.json',
  worldHeight: 1.8,
  body: { width: 0.55, height: 1.65, depth: 0.4 },
  billboard: true,
  multiAngle: true,
  onEvent: e => {
    if (e.type === 'release') fireProjectileFrom3DAnchor(hero.bones.rightHand);
  }
});
scene.add(hero.root);
hero.setAction('idle');

function render(dt) {
  updatePhysicsAndApplyRootTransform(hero.root, dt); // game physics/controller
  hero.update(dt, camera);
  if (hero.hitActive && hero.intersectsAttack(enemyWorldAABB)) {
    registerHitOncePerSwing();
  }
  renderer.render(scene, camera);
}
```

Функции `fireProjectileFrom3DAnchor`, `updatePhysicsAndApplyRootTransform`, `registerHitOncePerSwing` — интеграционные точки **существующего игрового проекта**, а не функции, которые даёт скилл. При сборке новой игры создай их реальные реализации, не оставляй заглушки в финале.

## Три варианта наложения в зависимости от ракурса

**2.5D / вид сбоку / изометрия:** цельная рисованная фигура на 3D-каркасе как textured plane. Быстро, качество рисунка максимальное. Камера контролируемая.

**3D с вращением камеры:** directional sprites (4/8 направлений) + 3D-коллайдеры, либо художественные texture decals на настоящей 3D-модели. Одна рисованная GIF-последовательность здесь недостаточна.

**Кукольная анимация / cloth:** отдельные PNG-части фигуры на плоскостях, привязанных к костям (`head`, `chest`, `leftHand`, `rightHand`, ...). Используй это только если исходный арт правильно разделён художником, суставы закрыты и нет визуальных разрывов. Несогласованные порезанные фрагменты могут выглядеть хуже цельной рисованной анимации.

## GLSL и атмосферные слои

- `runtime/hero-hybrid.mjs` включает едва заметное волнообразное смещение вершины иллюстрации во время idle; НЕ заменяет рисованные позы и не используется при атаках.
- Дополнительный glow/heat distortion следует делать поверх рисованного RGB artwork, сохраняя авторскую структуру рисунка.
- Видео/эффекты находятся на отдельных глубинных слоях, не используются как хитбоксы.

## Запреты

- Никаких новых «вариантов Hero Animator» в каталоге плагинов.
- Никаких геометрических человечков вместо PNG-арта в финальной игре.
- Нельзя утверждать, что модель с рисунком автоматически обеспечивает правильные хитбоксы: согласование pivot, размеров и таймингов обязательно.
- Не обещай, что GIF работает как 3D-текстура с проигрыванием всех кадров в Three.js: для настоящего real-time нужны декодированные кадры/атлас либо video texture.
