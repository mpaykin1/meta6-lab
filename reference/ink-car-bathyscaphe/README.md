# INK · Машина → Батискаф — эталон 3D (OWNER PASS, 17.11.2026)

Решение владельца 17.11.2026: «Добавь это в эталон на МГЛ», затем «Доделай эталон на гит хаб в МГ и МГЛ».

## Открыть
- МГ: https://mpaykin1.github.io/meta6/reference/ink-car-bathyscaphe/
- МГЛ: https://mpaykin1.github.io/meta6-lab/reference/ink-car-bathyscaphe/
- Исходник: `reference/ink-car-bathyscaphe/ink-car-bathyscaphe.js`
- Экран просмотра: `reference/ink-car-bathyscaphe/index.html`

## Принятая модель
- Объёмная машина исходного серо-зелёного low-poly силуэта с четырьмя настоящими колёсами, фарами и цельным кузовом.
- Плавное изменение `userData.setMorph(value, seconds)`, где `0` — машина, `1` — батискаф.
- Герметичный объёмный корпус, иллюминаторы с латунной окантовкой, крышка люка, маяк, стабилизаторы и два вращающихся винтовых движителя.
- Камера автоматически обходит 360°, ручной обзор мышью/пальцем, масштаб колесом/двумя пальцами, ползунок трансформации, автоцикл и кнопки.
- Переиспользуется утверждённый движок `../ink-fallen-guardian/shared/living-watercolor-3d.js` без изменений, версия без повторяющихся паттернов.
- Без внешнего CDN, звука и дополнительных скопированных библиотек Three.js.

## Повторное использование
```js
import { createInkCarBathyscaphe }
  from './reference/ink-car-bathyscaphe/ink-car-bathyscaphe.js';

const object = createInkCarBathyscaphe(20261117);
scene.add(object);
object.userData.setMorph(0.5, elapsedSeconds);
```
Для вызова требуется `THREE` через import map из соседнего защищённого эталона; папка `reference/ink-fallen-guardian` должна сохраняться рядом.

Эта папка — отдельный утверждённый графический эталон, **не игра**. Исходники `reference/ink-fallen-guardian/` не изменялись. Последующие эксперименты — только в новых ветках/папках. Перенесён в МГ Claude 17.11.2026 (код без изменений).