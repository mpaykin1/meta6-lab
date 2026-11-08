# МАСТЕР-ПРОМПТ — META GAMES ASSET LIBRARY

## Превращение эталонной игры «Под и над» в универсальную библиотеку ассетов, анимаций, шейдеров и игрового кода

## 0.1. ЖЁСТКОЕ ПРАВИЛО ВЛАДЕЛЬЦА — ТОЛЬКО ОРИГИНАЛЬНАЯ ГРАФИКА ЭТАЛОНОВ (08.11.2026)

**Приоритет над любыми разрешениями создавать новые визуальные компоненты в этом промпте и во всех задачах META GAMES.**

1. **Запрещено самостоятельно придумывать, рисовать, генерировать или моделировать игровую графику.** Нельзя заменять эталонные ассеты примитивами Three.js (BoxGeometry, SphereGeometry, CylinderGeometry, PlaneGeometry), нарисованными кругами/сетками Canvas, произвольными цветами, процедурными текстурами, случайной геометрией, синтетическими героями, врагами, руинами, фонами, частицами, шейдерами или освещением.
2. **Единственный источник визуала — реально существующие, извлечённые из утверждённых эталонов графические ресурсы и оригинальные визуальные алгоритмы.** Их можно технически адаптировать и оптимизировать, сохраняя вид, палитру, пропорции, силуэты, текстуры, анимации, параметры освещения и шейдеров. Не создавать альтернативный стиль.
3. **Перед созданием любой визуальной сцены:** проверить машинный каталог → выбрать оригинальные ID → проверить происхождение, файлы, зависимости и статус → подключить готовые ассеты без перерисовки. Нельзя выдавать новые придуманные визуальные объекты за эталонные.
4. **Если нужного эталонного ресурса нет:** пометить `MISSING_SOURCE` или `NOT_READY` и продолжить извлечение из оригинала. Не подменять заглушкой, процедурным аналогом или «похожей» графикой. Механика может существовать отдельно без фальшивого графического preview.
5. **Новые системы и код допускаются только для извлечения, конвертации, индексирования, загрузки, воспроизведения, композиции и оптимизации существующих эталонных компонентов.** Новые оригинальные художественные ассеты — только по отдельному прямому разрешению владельца.
6. **Публичный preview обязан показывать реальные эталонные ассеты.** Если такой preview ещё не готов, показать исходный эталон или фактический статус; не публиковать самодельную сцену как результат.
7. Для каждого визуального компонента обязательно указать `source_reference`, `source_symbol`/диапазон, `asset_path`, `sha256` (если файл извлечён), `status`, `dependencies`, `visual_origin: "approved-reference"`. Без проверяемого происхождения компонент нельзя объявлять `READY` как эталонную графику.
8. **Приоритет — создание библиотеки, а не демонстрационной игры.** Сначала физически извлечь все текстуры, спрайты, GLSL, анимации, модели и их метаданные; затем подключить их через существующие `shared/index.json`, `shared/loader.js`, поиск и MCP. Не тратить время на самостоятельный художественный рендер.
9. Запрет распространяется на всех ИИ, пять автозадач, будущие игровые сцены, prefab и визуальные предпросмотры. Любая задача, противоречащая этому правилу, должна быть изменена в пользу эталонного источника.
10. Оригинальные файлы эталонов не менять. Никаких отчётов, новых тестовых файлов, handoff или evidence.

**Неприемлемый пример:** сцена с сеткой на полу, кружками вместо врагов и геометрическими примитивами вместо оригинальных моделей — даже если урон и физика работают.

**Приемлемый результат:** извлечённый из эталона PNG/GLSL/GLB/спрайт с оригинальными материалами и анимацией, стабильным ID, зависимостями, реальным preview и доступом через библиотеку.

---

### 0. Твоя роль и конечная задача

Ты — команда из ведущих инженеров Three.js, WebGL2, GLSL, разработчиков игровых движков, технических художников, специалистов по 2D/2.5D/3D-анимации, архитекторов библиотек и инженеров оптимизации LLM-контекста.

**Твоя задача — не переписать игру, а превратить её оригинальные компоненты в удобную, доступную другим ИИ библиотеку META GAMES.**

Каждая модель, текстура, анимация, шейдер, алгоритм, игровая механика и визуальная система должны стать отдельным адресуемым ресурсом либо частью правильно выделенного переиспользуемого модуля.

Конечная цель:

Другой ИИ получает запрос:

> Создай затонувший город с подводным туманом, анимированными медузами, плавающими рыбами, руинами и динамическим освещением.

Вместо чтения всей игры ИИ должен:

1. Найти подходящие компоненты по каталогу.
2. Получить их точные идентификаторы.
3. Получить готовые файлы, зависимости и инструкции использования.
4. Подключить компоненты без переписывания.
5. Сохранить оригинальный художественный стиль.
6. Получить рабочую сцену с минимальным расходом токенов.

**Ни один ИИ не должен повторно создавать компонент, который уже существует в библиотеке и подходит к задаче.**

---

## 1. Исходный эталон

Репозиторий:

`https://github.com/mpaykin1/meta6-lab`

Оригинал:

`reference/sumerek-golden/pod-i-nad-68b2ecd3.html`

Прямая ссылка:

`https://raw.githubusercontent.com/mpaykin1/meta6-lab/main/reference/sumerek-golden/pod-i-nad-68b2ecd3.html`

Исходный загруженный файл:

`underup(1).html`

Проверочные характеристики оригинала:

- Размер: 447238 байт.
- SHA-256: `91642018b3e589173171340298f72320f747d3b401021a939030f6f922ede5e5`
- Git Blob SHA: `a2c0b18293fd870b1437d9efeee9a207711c1897`
- Движок: Three.js 0.160.0.
- Формат: HTML с встроенным JavaScript, GLSL и PNG.
- 5 контент-паков: `base`, `frost`, `deep`, `keeper`, `sunken`.

**Оригинальный эталон запрещено изменять.**

Не оптимизируй, не форматируй и не переписывай его.

Все преобразования производи в новых файлах библиотеки.

Перед любым извлечением проверь SHA-256. Если он отличается, не подменяй оригинал другой версией.

### Ограничения репозиториев

- `mpaykin1/meta6-lab` — рабочая песочница.
- `mpaykin1/meta6` — только чтение.
- Не менять 5 действующих автоматических задач.
- Не менять Netlify.
- Не публиковать игру на Playgama.
- Не изменять существующие игры.
- Не заменять уже утверждённые эталоны.
- Не добавлять рекламу.

Работай в отдельной ветке:

`lab/pod-i-nad-asset-library`

Прочитай `AGENTS.md`, правила песочницы и `META_GAMES_SOURCE_ALLOWLIST.md`.

---

## 2. Главный архитектурный принцип

Создай библиотеку из пяти уровней.

### Уровень A — Original Source

Неизменный оригинал со всеми встроенными данными.

Это источник истины.

### Уровень B — Raw Assets

Ассеты, извлечённые без потери информации:

- PNG-текстуры;
- спрайт-листы;
- отдельные спрайты;
- оригинальные GLSL-программы;
- оригинальные данные оружия;
- конфигурации биомов;
- определения врагов;
- определения анимаций;
- исходные GLB, если они действительно доступны.

### Уровень C — Reusable Components

Самостоятельные модули, которые можно подключать в других играх:

- анимированный герой;
- подводный туман;
- система воды;
- GPU-частицы;
- подводные существа;
- камера;
- освещение;
- система погоды;
- постобработка;
- генератор острова;
- анимационный контроллер;
- взаимодействие с предметами.

Каждый модуль должен иметь явные входы, выходы, зависимости, `update()` и `dispose()` там, где это необходимо.

### Уровень D — Prefabs

Готовые композиции нескольких компонентов.

Например:

`underwater-city`

Содержит:

- подводное освещение;
- геометрию города;
- водную дымку;
- анимированных рыб;
- частицы;
- движение камеры;
- атмосферные эффекты.

Prefab — это не картинка. Это конфигурация реально работающей 3D-сцены.

### Уровень E — AI Interface

Машинный каталог и инструменты поиска.

ИИ должен получать только необходимую информацию, а не весь исходный код.

---

## 3. Требуемая структура библиотеки

Создай следующую структуру, адаптируя её к уже существующим `shared/index.json` и `shared/loader.js`. Не создавай параллельную несовместимую систему.

```text
shared/
├── index.json
├── loader.js
│
├── components/
│   └── pod-i-nad/
│       │
│       ├── catalog.json
│       ├── dependencies.json
│       ├── sprites.json
│       ├── animations.json
│       ├── shaders.json
│       ├── prefabs.json
│       │
│       ├── textures/
│       │   ├── atlas.png
│       │   ├── weapons.png
│       │   ├── water.png
│       │   └── tiles/
│       │
│       ├── sprites/
│       │   ├── heroes/
│       │   ├── enemies/
│       │   ├── weapons/
│       │   └── ui/
│       │
│       ├── models/
│       │   ├── creatures/
│       │   ├── architecture/
│       │   ├── plants/
│       │   └── props/
│       │
│       ├── animations/
│       │   ├── sprite/
│       │   ├── skeletal/
│       │   ├── procedural/
│       │   └── timelines/
│       │
│       ├── shaders/
│       │   ├── water/
│       │   ├── atmosphere/
│       │   ├── particles/
│       │   ├── lighting/
│       │   └── postprocessing/
│       │
│       ├── systems/
│       │   ├── renderer/
│       │   ├── camera/
│       │   ├── weather/
│       │   ├── particles/
│       │   ├── terrain/
│       │   ├── physics/
│       │   ├── combat/
│       │   ├── enemies/
│       │   ├── audio/
│       │   └── world-transition/
│       │
│       ├── prefabs/
│       │   ├── twilight-island/
│       │   ├── frozen-island/
│       │   ├── underwater-city/
│       │   ├── lighthouse/
│       │   └── underwater-creatures/
│       │
│       ├── recipes/
│       └── previews/
│
└── approved/
    ├── search.mjs
    └── mcp.mjs

scripts/
└── asset-library/
    ├── extract-pod-i-nad.py
    ├── extract-shaders.mjs
    ├── index-components.mjs
    └── search-assets.mjs

meta-games/
└── library/
    └── pod-i-nad/
        └── index.html
```

Не создавать пустые заглушки. Директория или файл появляется только при наличии реального содержимого.

Старый оригинал остаётся в `reference/sumerek-golden/`.

---

# ЧАСТЬ I. ИЗВЛЕЧЕНИЕ ГРАФИКИ

## 4. Найди все встроенные PNG

В исходном HTML есть объект:

`const ASSETS = {...}`

Он содержит:

- `atlas` — атлас блоков 128×48;
- `weapons` — атлас оружия 256×128;
- `heroes` — набор спрайт-листов персонажей;
- `hero` — отдельный ключ совместимости;
- `coin` — анимированные монеты;
- `hearts` — интерфейс здоровья;
- `water` — водная текстура;
- `atlasNames`, `atlasGrid`, `wmeta` — метаданные атласов.

Важно: ключ `hero` может дублировать данные героя из `heroes`. Не создавай лишнюю физическую копию идентичных байтов. Сохрани оба логических идентификатора, направленных к одному оригинальному ресурсу.

### Код извлечения PNG

Создай `scripts/asset-library/extract-pod-i-nad.py`.

```python
from pathlib import Path
import base64
import hashlib
import json
import re

SOURCE = Path(
    "reference/sumerek-golden/"
    "pod-i-nad-68b2ecd3.html"
)

OUT = Path(
    "shared/components/pod-i-nad"
)

EXPECTED_SHA256 = (
    "91642018b3e589173171340298f72320"
    "f747d3b401021a939030f6f922ede5e5"
)

raw = SOURCE.read_bytes()

assert hashlib.sha256(raw).hexdigest() == EXPECTED_SHA256

html = raw.decode("utf-8")

match = re.search(
    r"^const ASSETS = (\{.*\});\s*$",
    html,
    flags=re.MULTILINE
)

if not match:
    raise RuntimeError("ASSETS not found")

assets = json.loads(match.group(1))

files = {}
records = []
by_hash = {}

def extract(asset_id, uri, relative_path):

    if not uri.startswith("data:image/png;base64,"):
        raise ValueError(asset_id)

    payload = base64.b64decode(
        uri.split(",", 1)[1],
        validate=True
    )

    digest = hashlib.sha256(payload).hexdigest()

    if digest in by_hash:
        records.append({
            "id": asset_id,
            "alias_of": by_hash[digest],
            "sha256": digest
        })
        return

    target = OUT / relative_path

    target.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    target.write_bytes(payload)

    by_hash[digest] = asset_id

    records.append({
        "id": asset_id,
        "path": relative_path,
        "format": "png",
        "bytes": len(payload),
        "sha256": digest
    })

for key, path in {
    "atlas": "textures/atlas.png",
    "weapons": "textures/weapons.png",
    "water": "textures/water.png",
    "coin": "sprites/ui/coin.png",
    "hearts": "sprites/ui/hearts.png",
    "hero": "sprites/heroes/hero.png"
}.items():

    extract(key, assets[key], path)

for name, uri in assets["heroes"].items():

    extract(
        "hero_" + name,
        uri,
        f"sprites/heroes/{name}.png"
    )

meta = {
    "source_sha256": EXPECTED_SHA256,
    "atlas_grid": assets["atlasGrid"],
    "atlas_names": assets["atlasNames"],
    "weapon_metadata": assets["wmeta"],
    "assets": records
}

(OUT / "sprites.json").write_text(
    json.dumps(
        meta,
        ensure_ascii=False,
        indent=2
    ),
    encoding="utf-8"
)

print("Extracted:", len(records))
```

Этот скрипт — начальный экстрактор PNG и метаданных, а не вся библиотека.

Не применяй аналогичное регулярное выражение к произвольному JavaScript с вложенными выражениями. Для извлечения функций, классов и сложных объектов используй AST.

---

## 5. Раздели текстурные атласы на адресуемые элементы

Не ограничивайся сохранением больших PNG.

Каждая отдельная текстура и каждый спрайт должны стать доступными по ID.

Исходный атлас блоков:

- Размер: 128×48.
- Сетка: 8×3.
- Ячейка: 16×16.
- Список названий: `ASSETS.atlasNames`.

Используй исходный порядок элементов, не переставляй их.

Создай отдельные PNG для каждого реально именованного блока.

### Пример разделения

```python
from PIL import Image

atlas = Image.open(
    OUT / "textures/atlas.png"
).convert("RGBA")

names = assets["atlasNames"]

grid_x, grid_y = assets["atlasGrid"]

cell_w = atlas.width // grid_x
cell_h = atlas.height // grid_y

folder = OUT / "textures/tiles"
folder.mkdir(parents=True, exist_ok=True)

for i, name in enumerate(names):

    x = (i % grid_x) * cell_w
    y = (i // grid_x) * cell_h

    tile = atlas.crop((
        x,
        y,
        x + cell_w,
        y + cell_h
    ))

    tile.save(folder / f"{name}.png")
```

Оригинальный атлас тоже сохранить.

Это позволит ИИ использовать либо весь атлас с одним материалом, либо отдельную текстуру.

Не менять цветовую палитру, пиксели или альфа-канал.

---

## 6. Раздели оружие

В `ASSETS.wmeta.weapons` содержатся данные о графических ячейках оружия.

Для каждой записи извлеки:

- ID;
- координаты ячейки;
- размеры;
- точку хвата `grip`;
- точку окончания оружия `tip`;
- угол `base`;
- оригинальный PNG;
- описание в `REG.weapons`;
- атаку;
- дальность;
- способ анимации;
- звуковую конфигурацию;
- зависимые эффекты.

Не смешивай количество графических ячеек с количеством игровых видов оружия.

В атласе есть дополнительные состояния, например `bow_drawn`.

### Пример

```python
weapon_atlas = Image.open(
    OUT / "textures/weapons.png"
).convert("RGBA")

weapon_dir = OUT / "sprites/weapons"
weapon_dir.mkdir(parents=True, exist_ok=True)

for weapon_id, data in (
    assets["wmeta"]["weapons"].items()
):

    x, y, w, h = data["cell"]

    sprite = weapon_atlas.crop((
        x, y, x + w, y + h
    ))

    sprite.save(
        weapon_dir / f"{weapon_id}.png"
    )
```

Точки `grip` и `tip` обязательно сохранить.

Они необходимы для правильного положения оружия в руке и воспроизведения боевой анимации.

---

# ЧАСТЬ II. АНИМАЦИИ

## 7. Найди все способы анимации

В этой игре анимация существует не только в виде спрайтов.

Раздели её на следующие категории.

### A. Sprite animation

Кадровые анимации:

- персонажи;
- оружие;
- монеты;
- интерфейсные эффекты.

### B. Procedural animation

Анимация, вычисляемая JavaScript:

- движения героя;
- покачивание;
- колебания;
- движение камеры;
- отдача оружия;
- движение щупалец;
- перемещение врагов;
- траектории снарядов;
- колебания растительности.

### C. GLSL animation

Анимация внутри видеокарты:

- вода;
- туман;
- частицы;
- светящиеся эффекты;
- огонь;
- погодные явления;
- энергетические лучи;
- постобработка.

### D. Skeletal animation

Анимационные клипы внутри GLB/GLTF:

- плавание существ;
- движение подводных моделей;
- циклические анимации объектов.

### E. Timeline animation

Комбинации нескольких событий:

- появление противника;
- атака босса;
- гибель;
- переход между мирами;
- атмосферное событие.

Для каждой анимации создай отдельную машинную запись.

---

## 8. Формат animation metadata

Пример структуры:

```json
{
  "id": "pod-i-nad/hero/wanderer/walk",
  "type": "sprite",
  "source": "sprites/heroes/wanderer.png",
  "frame_width": 16,
  "frame_height": 24,
  "sheet_width": 96,
  "sheet_height": 24,
  "frames": [0, 1, 2, 3, 4, 5],
  "fps": null,
  "loop": true,
  "flip_x": true,
  "rendering": "nearest",
  "verified": false
}
```

Это только пример формата.

**Нельзя считать все 6 кадров циклом ходьбы без анализа `setHeroFrame()` и `updateHeroMesh()`.**

Фактическую последовательность кадров, состояния и частоту воспроизведения восстанови из логики оригинальной игры.

Если последовательность не установлена, оставь `frames` пустым или отметь её как неопределённую.

Не придумывай скорость анимации.

---

## 9. Создай многоразовый анимированный billboard

В исходнике герой отображается 2D-спрайтом в 3D-сцене.

Сохрани этот принцип.

Пример самостоятельного модуля:

```javascript
export function createHeroBillboard(
  THREE,
  sourceTexture,
  options = {}
) {
  const texture = sourceTexture.clone();

  texture.needsUpdate = true;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const frameCount = options.frameCount ?? 6;

  const geometry = new THREE.PlaneGeometry(
    options.width ?? 1,
    options.height ?? 1.5
  );

  geometry.translate(
    0,
    (options.height ?? 1.5) / 2,
    0
  );

  const material = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(
    geometry,
    material
  );

  mesh.rotation.order = "YXZ";

  function setFrame(frame, facing = 1) {
    const i = Math.max(
      0,
      Math.min(frameCount - 1, frame | 0)
    );

    const width = 1 / frameCount;
    const epsilon = width * 0.002;

    if (facing >= 0) {
      texture.repeat.x = width - 2 * epsilon;
      texture.offset.x = i * width + epsilon;
    } else {
      texture.repeat.x = -(width - 2 * epsilon);
      texture.offset.x =
        (i + 1) * width - epsilon;
    }
  }

  function faceCamera(camera) {
    mesh.rotation.y = Math.atan2(
      camera.position.x - mesh.position.x,
      camera.position.z - mesh.position.z
    );
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  }

  setFrame(0);

  return {
    mesh,
    setFrame,
    faceCamera,
    dispose
  };
}
```

Важное требование: разные экземпляры персонажей не должны изменять UV одного общего объекта `Texture`.

Поэтому модуль создаёт собственный экземпляр текстуры.

При большом количестве одинаковых персонажей предусмотри более экономичную реализацию через instancing и индивидуальные UV-атрибуты.

---

# ЧАСТЬ III. GLSL И ВИЗУАЛЬНЫЕ ЭФФЕКТЫ

## 10. Выдели все шейдеры

Оригинал содержит GLSL-константы, в том числе:

```text
WATER_VERT
WATER_FRAG

SKY_VERT
SKY_FRAG

MIST_VERT
MIST_FRAG

PICK_VERT
PICK_FRAG

HALO_FRAG
BEAM_FRAG

SHADE_VERT
SHADE_FRAG

AURA_FRAG

PART_VERT
PART_FRAG

FLY_VERT
FLY_FRAG

FLAME_VERT
FLAME_FRAG

RING_VERT
RING_FRAG

LBEAM_VERT
LBEAM_FRAG

SHADOW_FRAG

SPRITE_VERT
SPRITE_FRAG

RIB_VERT
RIB_FRAG

NPC_VERT
NPC_FRAG

PRECIP_VERT
PRECIP_FRAG
```

Также отдельно существуют `DOFShader`, `FinalShader` и вспомогательные GLSL-фрагменты.

Извлеки все 33 найденные GLSL-константы, не ограничиваясь перечислением выше.

Для каждой создай запись с информацией:

- точный исходный текст;
- тип: vertex, fragment, helper или shader object;
- используемые uniforms;
- attributes;
- varyings;
- директивы `#include`;
- необходимые текстуры;
- требования к Three.js;
- порядок рендеринга;
- blending;
- depthTest;
- depthWrite;
- прозрачность;
- внешние функции и константы;
- зависимости от других шейдеров;
- условия использования.

### Критически важно

В некоторых GLSL-строках используются JavaScript-вставки вроде:

`${GLSL_HASH}`

Нельзя сохранить такую строку как независимый GLSL и объявить её работающей.

Нужно либо:

1. Сохранить оригинальную композицию в JS-модуле.
2. Либо разрешить зависимости и сформировать полный итоговый GLSL.

Оба варианта желательно сохранить.

Для анализа JavaScript используй AST, например Acorn.

Не извлекай вложенные функции простым разрезанием исходника между фигурными скобками.

---

## 11. Каждому эффекту — готовый модуль

Например, для воды создать:

```text
shaders/water/
├── water.vert.glsl
├── water.frag.glsl
├── water-material.js
├── manifest.json
└── preview.png
```

Для тумана:

```text
shaders/atmosphere/
├── mist.vert.glsl
├── mist.frag.glsl
├── mist-material.js
└── manifest.json
```

Для постобработки:

```text
shaders/postprocessing/
├── depth-of-field.js
├── final-color.js
├── bloom-pipeline.js
└── composition.js
```

Не выдавай файл `.glsl` за завершённый эффект.

Если визуальный результат требует mesh, uniforms, textures, update loop или постобработки, они должны входить в модуль или явно передаваться снаружи.

---

## 12. Воспроизведи исходный порядок постобработки

В исходнике используется:

```text
RenderPass
    ↓
UnrealBloomPass
    ↓
DOF horizontal
    ↓
DOF vertical
    ↓
OutputPass
    ↓
FinalShader
```

Последний шейдер выполняет цветокоррекцию и экранные эффекты, включая:

- хроматическую аберрацию;
- зерно;
- виньетирование;
- glitch;
- вспышки;
- затемнение;
- изменение насыщенности.

Сохрани точный порядок оригинальной цепочки.

Создай функцию уровня библиотеки:

```javascript
createCinematicPipeline({
  THREE,
  renderer,
  scene,
  camera,
  quality
});
```

Возвращаемый интерфейс:

```javascript
{
  render(delta),
  resize(width, height),
  setQuality(level),
  setGlitch(value),
  setFlash(value),
  setDanger(value),
  dispose()
}
```

Не меняй художественные значения по умолчанию без необходимости.

Если создаёшь ускоренную мобильную конфигурацию, она должна быть отдельным профилем.

---

# ЧАСТЬ IV. 3D-МОДЕЛИ И GLB

## 13. Найди настоящие 3D-модели

Особенно важен подводный мир.

В оригинальном коде используются:

```javascript
fetch("glb/" + name + ".json")
```

JSON содержит поле `glb` с Base64-данными бинарной модели.

Шесть явно предзагружаемых моделей существ:

```text
eel
jellyfish_teal
jellyfish_violet
scout_drone
angler
kraken_tentacle
```

Помимо них код ссылается на архитектуру, растения, реквизит, затонувшие корабли, рыб и другие 3D-объекты.

**Наличие имени модели в коде не доказывает наличие самой модели в полученном HTML.**

Поэтому:

1. Извлеки все ссылки на модели из кода.
2. Проверь реальные файлы в разрешённых исходных каталогах.
3. Найди соответствующие `glb/*.json`.
4. Проверь, что поле `glb` действительно содержит бинарную модель.
5. Восстанови настоящий `.glb`.
6. Проверь, что файл читается GLTFLoader.
7. Не подставляй вместо отсутствующих моделей случайные объекты.

Если модель отсутствует, оставь запись в каталоге:

```json
{
  "id": "pod-i-nad/model/kraken_tentacle",
  "source_reference": "glb/kraken_tentacle.json",
  "status": "missing",
  "asset_path": null,
  "usable": false
}
```

Не маркируй такую модель как доступную.

---

## 14. Восстановление GLB из JSON

Пример конвертера:

```python
import json
import base64
import struct
from pathlib import Path

source = Path("glb/kraken_tentacle.json")

data = json.loads(
    source.read_text(encoding="utf-8")
)

binary = base64.b64decode(
    data["glb"],
    validate=True
)

if len(binary) < 12:
    raise ValueError("Invalid GLB size")

magic, version, length = struct.unpack_from(
    "<III",
    binary,
    0
)

if magic != 0x46546C67:
    raise ValueError("Invalid GLB magic")

if version != 2:
    raise ValueError("Unsupported GLB version")

if length != len(binary):
    raise ValueError("Invalid GLB length")

target = Path(
    "shared/components/pod-i-nad/"
    "models/creatures/kraken_tentacle.glb"
)

target.parent.mkdir(
    parents=True,
    exist_ok=True
)

target.write_bytes(binary)
```

Это пример для одного существующего файла.

Реальный конвейер должен автоматически обрабатывать все подтверждённые модели.

---

## 15. Сохрани анимации GLB

Для каждой модели исследуй:

```javascript
gltf.scene
gltf.animations
```

Сохрани:

- имена клипов;
- продолжительность;
- количество треков;
- имена анимируемых узлов;
- применяемые transform-свойства;
- наличие скелета;
- структуру костей;
- исходный масштаб;
- исходную ориентацию;
- материалы;
- emissive-текстуры;
- особенности прозрачности.

Не применяй деструктивное объединение геометрии к анимированным моделям.

Для skinned-моделей при необходимости используй корректное клонирование скелета, например `SkeletonUtils.clone`.

Предусмотри создание нового `AnimationMixer` для каждого независимого персонажа.

Для каждого экземпляра должен быть доступен:

```javascript
const creature = await library.create(
  "pod-i-nad/model/jellyfish_teal",
  {
    scene,
    scale: 1,
    animation: "auto"
  }
);

creature.play();
creature.update(delta);
creature.pause();
creature.dispose();
```

Реализуй интерфейс, а не оставляй его только в документации.

---

# ЧАСТЬ V. ИЗВЛЕЧЕНИЕ КОДА И МЕХАНИК

## 16. Используй существующий Registry

Оригинальная игра уже содержит систему регистрации контента:

```javascript
defineBlock()
defineBiome()
defineFlora()

defineWeapon()
defineAnim()
defineFire()
defineRicochet()
defineProjectile()

defineEnemy()
defineBody()
defineBrain()

defineCharacter()
defineRelic()
defineNPC()

defineEvent()
defineSound()
defineFx()
defineWeather()
```

**Не создавай вторую игровую систему с нуля, если существующую можно безопасно извлечь и адаптировать.**

Проанализируй:

```javascript
const REG = {
  blocks: new Map(),
  biomes: new Map(),
  flora: new Map(),
  weapons: new Map(),
  anims: new Map(),
  fires: new Map(),
  ricochets: new Map(),
  projectiles: new Map(),
  enemies: new Map(),
  bodies: new Map(),
  brains: new Map(),
  characters: new Map(),
  relics: new Map(),
  npcs: new Map(),
  events: new Map(),
  sounds: new Map(),
  fx: new Map(),
  weather: new Map()
};
```

Определи возможность повторного использования этих реестров вне оригинальной игры.

---

## 17. Введи три статуса компонентов

Каждый найденный фрагмент относится к одной из категорий:

**READY**

Компонент автономен, его зависимости разрешены, он работает независимо от оригинальной игры.

**ADAPTER_REQUIRED**

Код обнаружен, но зависит от глобальных переменных, оригинального игрового цикла или других внутренних систем.

**SOURCE_ONLY**

Фрагмент пока нельзя безопасно применять отдельно. Он доступен для изучения, но не объявляется готовым модулем.

Нельзя автоматически переводить `SOURCE_ONLY` в `READY` лишь потому, что файл успешно записан на GitHub.

---

## 18. Раздели системы на самостоятельные модули

Приоритеты извлечения:

### Графика и рендеринг

- renderer;
- система материалов;
- освещение;
- динамическое небо;
- туман;
- вода;
- bloom;
- DOF;
- камера;
- GPU-частицы;
- instanced sprites.

### Генерация миров

- seeded random;
- noise;
- voxel terrain;
- блоки;
- биомы;
- декорации;
- города;
- растительность;
- размещение объектов.

### Анимация

- анимации героя;
- движение объектов;
- процедурная анимация;
- поведение водных существ;
- движения оружия;
- визуальные эффекты атак.

### Игровая механика

- движение;
- столкновения;
- прыжки;
- плавание;
- смена биома;
- снаряды;
- попадания;
- враги;
- AI;
- события;
- подбор предметов.

### Звук

- музыкальные и звуковые конфигурации;
- генерация сигналов;
- звуки погоды;
- звуки воды;
- удары;
- эффекты окружающей среды.

Для каждого модуля выпиши реальные зависимости.

Если модуль использует `G`, `U`, `REG`, `world`, `player`, `scene` или другие глобальные переменные, не оставляй скрытые обращения.

Передавай зависимости явно либо создай совместимый адаптер.

---

# ЧАСТЬ VI. МАШИННЫЙ КАТАЛОГ

## 19. Единая запись каждого компонента

Создай `catalog.json`.

Пример записи для шейдера воды:

```json
{
  "id": "pod-i-nad/shader/water",
  "name": "Twilight Water",
  "kind": "shader",
  "category": "water",
  "source_game": "pod-i-nad",
  "source_symbol": "WATER_FRAG",
  "source_path": "reference/sumerek-golden/pod-i-nad-68b2ecd3.html",
  "source_sha256": "91642018b3e589173171340298f72320f747d3b401021a939030f6f922ede5e5",
  "description": "Анимированная водная поверхность с глубиной, пеной и кругами",
  "tags": [
    "water",
    "ocean",
    "ripples",
    "fog",
    "glsl",
    "underwater",
    "2.5d",
    "threejs"
  ],
  "requires": [
    "three@0.160.0",
    "height-texture",
    "water-texture",
    "scene-fog"
  ],
  "files": [
    "shaders/water/water-material.js"
  ],
  "api": {
    "factory": "createWaterMaterial",
    "update": "update",
    "dispose": "dispose"
  },
  "status": "adapter_required",
  "preview": null,
  "rights": {
    "origin": "owner-provided-reference",
    "third_party_review_required": false
  }
}
```

Значение `status` в примере — начальное. После реального выделения и проверки его можно изменить.

Поля `files` и `api` должны указывать на реально существующие файлы и экспортируемые функции.

Не создавать фиктивные ссылки на preview.

---

## 20. Обязательные поля каталога

Каждая запись должна содержать:

```text
id
name
kind
category
description

source_game
source_path
source_symbol
source_sha256

files
requires
tags

status
rights
```

Дополнительные поля по типу ресурса:

```text
resolution
frames
fps
duration
clips

uniforms
textures
materials

bounding_box
orientation
scale

polycount
draw_calls
texture_memory

update_cost
cpu_cost
gpu_cost

preview
example
used_by
```

Измерения производительности указывай только после реального измерения.

Не подставляй выдуманные значения FPS, draw calls и памяти.

Для отсутствующих данных используй `null`.

---

# ЧАСТЬ VII. ГОТОВЫЕ PREFABS

## 21. Создавай не только отдельные ресурсы, но и композиции

Например:

**Prefab: Underwater Atmosphere**

Включает:

```text
Sky
 └── underwater palette

Lighting
 ├── hemisphere light
 ├── directional light
 └── emissive lighting

Atmosphere
 ├── underwater fog
 ├── particles
 └── floating motes

Geometry
 └── seabed

Postprocessing
 ├── bloom
 ├── depth of field
 └── color grading
```

Все элементы должны быть реальными компонентами библиотеки.

---

## 22. Формат prefab

```json
{
  "id": "pod-i-nad/prefab/underwater-atmosphere",
  "kind": "prefab",
  "environment": "underwater",
  "components": [
    "pod-i-nad/shader/water",
    "pod-i-nad/shader/mist",
    "pod-i-nad/system/lighting",
    "pod-i-nad/system/particles",
    "pod-i-nad/system/postprocessing"
  ],
  "factory": "createUnderwaterAtmosphere",
  "parameters": {
    "quality": "medium",
    "fogDensity": null,
    "particleCount": null
  },
  "status": "adapter_required"
}
```

Параметры, равные `null`, необходимо восстановить из исходника или сделать явно настраиваемыми.

Нельзя утверждать, что prefab готов, пока его фабрика не реализована.

---

## 23. Правильная архитектура prefab

Каждый готовый prefab должен возвращать объект:

```javascript
{
  root,
  update(delta),
  setQuality(level),
  setVisible(visible),
  dispose()
}
```

Правила:

- `root` — корневая группа Three.js;
- `update()` — вызывается из игрового цикла;
- `setQuality()` — меняет стоимость эффекта;
- `setVisible()` — управляет видимостью;
- `dispose()` — освобождает принадлежащие экземпляру ресурсы.

Раздели общие и индивидуальные ресурсы.

Нельзя уничтожать общий материал или текстуру при удалении одного экземпляра prefab.

---

# ЧАСТЬ VIII. ЭКОНОМИЯ ТОКЕНОВ

## 24. Главное правило для других ИИ

Другой ИИ не должен читать 447 КБ исходного HTML, чтобы найти один эффект.

Создай трёхступенчатую систему получения информации.

### Ступень 1 — Search

Возвращает только:

```json
{
  "id": "pod-i-nad/shader/water",
  "name": "Twilight Water",
  "description": "Анимированная вода",
  "status": "ready",
  "requires": 3
}
```

### Ступень 2 — Inspect

Возвращает:

- публичный API;
- параметры;
- зависимости;
- ссылку на модуль;
- короткий пример подключения.

### Ступень 3 — Source

Полный исходный код только запрошенного компонента.

**Не передавай полный HTML, все 33 шейдера или весь JSON-каталог, если запрошен один ресурс.**

---

## 25. Создай компактные карточки для ИИ

Для каждого готового компонента:

```text
ID: pod-i-nad/shader/water
TYPE: shader
PURPOSE: Animated water surface
ENGINE: Three.js r160
NEEDS: height texture, water texture, scene fog
API: createWaterMaterial()
UPDATE: required
DISPOSE: required
STATUS: READY
SOURCE: exact library path
```

Одна карточка должна содержать минимум текста, необходимый для подключения.

Подробное описание доступно по отдельному запросу.

---

## 26. Создай машинный поисковик

Пример команды:

```bash
node scripts/asset-library/search-assets.mjs \
  --query "underwater glowing jellyfish" \
  --kind model \
  --limit 5
```

Результат:

```json
{
  "query": "underwater glowing jellyfish",
  "results": [
    {
      "id": "pod-i-nad/model/jellyfish_teal",
      "status": "ready",
      "path": "shared/components/pod-i-nad/models/creatures/jellyfish_teal.glb"
    }
  ]
}
```

Это иллюстрация формата ответа, не утверждение о существовании модели.

Поисковик должен брать записи из реального каталога.

Не возвращай несуществующие ассеты как готовые.

---

## 27. Пример реализации лёгкого поиска

```javascript
import fs from "node:fs";

const catalog = JSON.parse(
  fs.readFileSync(
    "shared/components/pod-i-nad/catalog.json",
    "utf8"
  )
);

function searchAssets(query, options = {}) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return catalog.assets
    .filter(asset => {
      if (
        options.kind &&
        asset.kind !== options.kind
      ) return false;

      if (
        options.readyOnly &&
        asset.status !== "ready"
      ) return false;

      return true;
    })
    .map(asset => {
      const haystack = [
        asset.id,
        asset.name,
        asset.description,
        ...(asset.tags || [])
      ].join(" ").toLowerCase();

      const score = words.reduce(
        (n, word) =>
          n + (haystack.includes(word) ? 1 : 0),
        0
      );

      return { asset, score };
    })
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit ?? 5)
    .map(({ asset }) => ({
      id: asset.id,
      name: asset.name,
      kind: asset.kind,
      status: asset.status,
      files: asset.files
    }));
}

export { searchAssets };
```

Это стартовый поисковый модуль.

Затем расширь его точным поиском ID, категориями, русско-английскими синонимами, фильтрацией по зависимостям и индексированием тегов.

Для каждого нового файла библиотеки обновляй поисковый индекс автоматически.

---

# ЧАСТЬ IX. ПОДКЛЮЧЕНИЕ К META GAMES И MCP

## 28. Подключи библиотеку к существующему складу

В репозитории уже существуют:

```text
shared/index.json
shared/loader.js
shared/approved/search.mjs
shared/approved/mcp.mjs
```

Перед изменениями прочитай их реальные интерфейсы.

Не создавай несовместимый второй загрузчик.

Новая библиотека должна использовать существующие соглашения, если они применимы.

Обязательно:

- уникальные ID;
- обратная совместимость;
- явные версии;
- отсутствие циклических зависимостей;
- отсутствие скрытых глобальных переменных;
- безопасная загрузка ресурсов;
- отсутствие дублирования бинарных файлов;
- проверка путей перед выдачей другим ИИ.

---

## 29. Интерфейс для ИИ

Целевой набор операций:

```text
search_assets(query, filters)

get_asset(id)

get_asset_source(id)

get_animation(id)

get_shader(id)

get_prefab(id)

get_recipe(id)

list_dependencies(id)
```

Используй существующий публичный MCP META GAMES, если его контракт позволяет безопасно добавить эти операции.

Не выдумывай имена действующих MCP-инструментов.

Сначала получи реальную схему сервера, затем адаптируй интерфейс.

Если обновление публичного MCP сейчас невозможно, создай совместимый каталог и модуль поиска в песочнице, пригодные для последующего подключения.

---

## 30. Пример запроса от другого ИИ

Запрос:

```json
{
  "query": "pixel art underwater atmosphere",
  "kinds": [
    "shader",
    "particle-system",
    "prefab"
  ],
  "ready_only": true,
  "limit": 5
}
```

Ожидаемое поведение:

1. Поиск готовых компонентов.
2. Возврат короткого списка.
3. По запросу конкретного ID — точных зависимостей.
4. Возврат готового JS-модуля.
5. Подключение без повторной генерации эффекта.

По умолчанию запрещено возвращать всё содержимое библиотеки.

---

# ЧАСТЬ X. ВИЗУАЛЬНЫЙ ПРОСМОТР

## 31. Создай страницу библиотеки

Путь:

`meta-games/library/pod-i-nad/`

Целевой публичный адрес песочницы:

`https://mpaykin1.github.io/meta6-lab/meta-games/library/pod-i-nad/`

Страница должна показывать реальные ресурсы.

Категории:

```text
Sprites
Textures
Weapons
Characters
3D Models
Animations
Shaders
Particles
Weather
Lighting
Camera
Prefabs
```

При выборе компонента показывай:

- графический предпросмотр;
- анимацию, если она есть;
- ID;
- доступность;
- параметры;
- зависимости;
- прямую ссылку на исходник;
- кнопку копирования ID.

Для 3D-моделей нужен живой WebGL-просмотр.

Для шейдеров — сцена с применённым эффектом.

Для анимаций — воспроизведение с реальным временем и паузой.

Не подменяй эти просмотры статическими изображениями.

Если компонент не готов, показывай его статус, а не искусственную заглушку.

---

# ЧАСТЬ XI. ПРОИЗВОДИТЕЛЬНОСТЬ

## 32. Оптимизируй библиотеку без изменения оригинала

Для каждого компонента определить возможные оптимизации.

### Текстуры

- удаление идентичных копий;
- сохранение оригинальных пикселей;
- NEAREST для пиксель-арта;
- правильная цветовая схема;
- atlasing;
- повторное использование GPU-текстур.

### 3D

- статическая геометрия;
- instancing;
- повторное использование материалов;
- frustum culling;
- LOD, если это визуально допустимо;
- освобождение GPU-памяти;
- оптимизация анимационных обновлений.

### Шейдеры

- общие uniforms;
- снижение числа material variants;
- адаптивное качество;
- уменьшение overdraw;
- сокращение ненужных проходов.

### Частицы

- буферы;
- пулы;
- GPU-анимация;
- ограничение количества частиц;
- отсутствие выделения новых массивов на каждом кадре.

### GLB

- сохранить оригинал;
- предложить оптимизированную копию;
- не удалять анимационные треки;
- не уничтожать прозрачность;
- не менять силуэты;
- не заменять материалы без проверки внешнего вида.

Нельзя заявлять об улучшении FPS без измерения.

---

## 33. Несколько уровней качества

Библиотека должна поддерживать:

```text
LOW
MEDIUM
HIGH
ULTRA
```

Оригинальные художественные настройки — основа HIGH или другого явно обозначенного профиля, если измерения покажут, что он соответствует ему.

LOW:

- меньше частиц;
- ниже разрешение постобработки;
- экономная загрузка объектов;
- ограниченные дополнительные источники света.

HIGH:

- сохранённая исходная композиция;
- полный набор визуальных эффектов.

ULTRA:

- только доказуемо полезные улучшения сверх исходника;
- не изменять художественный стиль.

Профили должны быть параметрами, а не отдельными копиями всей библиотеки.

---

# ЧАСТЬ XII. АВТОНОМНОСТЬ

## 34. Убери внешние зависимости из автономной сборки

Оригинальная игра использует CDN для Three.js и Google Fonts.

Это значит, что исходный файл нельзя автоматически считать полностью автономным.

Создай отдельную автономную сборку, не изменяя оригинал.

Требования:

- Three.js должен входить в сборку;
- необходимые addons должны входить в сборку;
- текстуры должны быть локальными или встроенными;
- GLB должны быть локальными или встроенными;
- шрифты — локальными либо с предусмотренным fallback;
- не должно быть обязательного сетевого запроса.

Для автономного HTML, предназначенного для запуска через `file://`, не полагайся на `fetch()` локальных файлов.

Встроенные данные и предварительная сборка JavaScript должны позволять запуск без локального HTTP-сервера.

Поддержи два формата:

**Модульная библиотека**

Для GitHub Pages, MCP и других игр.

**Автономный bundle**

Для запуска двойным нажатием, включая мобильный браузер, где такой способ открытия поддерживается.

Не смешивай эти форматы.

Не дублируй все файлы внутри основного `shared/` только ради автономной сборки.

---

# ЧАСТЬ XIII. КАТАЛОГ РЕЦЕПТОВ ДЛЯ ИИ

## 35. Создай короткие рецепты сборки сцен

Каждый рецепт должен описывать конкретное действие.

Например:

### Recipe: Underwater Scene

```json
{
  "id": "recipe/underwater-scene",
  "description": "Сборка подводной сцены",
  "required": [
    "pod-i-nad/prefab/underwater-atmosphere"
  ],
  "optional": [
    "pod-i-nad/model/jellyfish_teal",
    "pod-i-nad/model/angler"
  ],
  "steps": [
    "Create scene",
    "Load atmosphere prefab",
    "Add available creature models",
    "Connect update loop",
    "Connect resize handler"
  ]
}
```

Рецепт готов только после реализации всех обязательных компонентов.

Для опциональных ресурсов проверяй статус.

Если GLB отсутствует, рецепт не должен зависеть от него как от обязательного ресурса.

---

## 36. Правило экономии токенов при создании игр

Каждый ИИ, использующий META GAMES, обязан следовать алгоритму:

```text
USER REQUEST
     ↓
SEARCH LIBRARY
     ↓
MATCH COMPONENTS
     ↓
CHECK STATUS
     ↓
RESOLVE DEPENDENCIES
     ↓
GET RECIPE / API
     ↓
LOAD ONLY REQUIRED FILES
     ↓
COMPOSE SCENE
     ↓
ADD ONLY MISSING LOGIC
     ↓
RUN GAME
```

Не выполнять:

```text
READ ALL GAMES
     ↓
COPY ALL SOURCE
     ↓
REWRITE EVERYTHING
     ↓
RECREATE ASSETS
```

Для каждого готового компонента сначала используй API библиотеки.

Только если подходящего готового компонента нет, допускается новая реализация.

Если создан новый оригинальный компонент, добавь его в библиотеку с указанием происхождения и доступности.

---

# ЧАСТЬ XIV. ПОРЯДОК ВЫПОЛНЕНИЯ

## 37. Работай последовательно, но не останавливайся на документации

### Этап 1. Инвентаризация

Прочитай исходный HTML и все встроенные конфигурации.

Обнаружь:

- PNG;
- спрайт-листы;
- шейдеры;
- модели;
- анимации;
- функции;
- системы;
- биомы;
- звуки;
- связи между компонентами.

Составь машинный каталог из фактического кода.

### Этап 2. Физическое извлечение

Создай реальные файлы.

Не ограничивайся перечислением символов.

PNG должны стать PNG-файлами.

GLSL — исходными GLSL или JS-модулями.

Модели — настоящими GLB, если доступны.

Настройки и конфигурации — структурированными данными.

### Этап 3. Обособление компонентов

Выдели независимые модули с правильными интерфейсами.

Сохрани исходную функциональность.

Не дублируй общие зависимости.

### Этап 4. Анимации

Восстанови последовательности, скорости, состояния и зависимости.

Создай контроллеры воспроизведения.

Не выдавай статические текстуры за анимации.

### Этап 5. Prefabs

Собери готовые визуальные композиции.

Каждый prefab должен быть реальным объектом или сценой, которые можно обновлять во времени.

### Этап 6. Каталог и поиск

Создай ID, категории, теги, зависимости, короткие карточки и машинный поиск.

### Этап 7. Preview

Сделай визуальную страницу, где компоненты можно увидеть в действии.

### Этап 8. Интеграция

Подключи библиотеку к существующему META GAMES `shared/`.

Подготовь или реализуй безопасную интеграцию с публичным MCP.

### Этап 9. Проверка

Проверь в браузере:

- изображения отображаются;
- UV-координаты правильные;
- sprite-анимации воспроизводятся;
- GLSL компилируются;
- prefab обновляются;
- GLB-анимации работают;
- ресурсы освобождаются;
- ссылки ведут к существующим файлам;
- оригинальный HTML не изменился.

Не создавай отдельные отчёты, новые тестовые файлы, handoff или evidence.

Исправляй найденные ошибки непосредственно в коде библиотеки.

### Этап 10. GitHub

Создай изменения в:

`mpaykin1/meta6-lab`

Ветка:

`lab/pod-i-nad-asset-library`

Сделай commit и PR в `main` песочницы.

Не изменяй основной `mpaykin1/meta6`.

При отсутствии прав на публикацию не объявляй библиотеку опубликованной.

---

# ЧАСТЬ XV. КРИТЕРИИ ЗАВЕРШЕНИЯ

## 38. Библиотека считается завершённой только если

1. Все встроенные PNG обнаружены и доступны как файлы или проверенные алиасы.
2. Все именованные элементы текстурных атласов имеют ID.
3. Все обнаруженные GLSL-константы каталогизированы.
4. Для каждого шейдера определены реальные зависимости.
5. Все определения Registry индексированы.
6. Все анимации описаны на основании исходного кода.
7. Все внешние GLB-ссылки зарегистрированы.
8. Доступные GLB конвертированы без повреждения, отсутствующие отмечены.
9. Все готовые модули имеют рабочий API.
10. Все готовые prefabs можно создать, обновить и удалить.
11. Поиск возвращает только существующие записи.
12. Для отдельного ассета не требуется читать весь исходный HTML.
13. Все пути в каталоге разрешаются.
14. Художественное качество исходных материалов не ухудшилось.
15. Существующий склад META GAMES продолжает работать.
16. Оригинал побайтово сохранён.
17. Другой ИИ способен подключить готовый компонент по его ID.
18. Визуальная страница показывает реальные ассеты и анимации.

Если часть компонентов не удалось подготовить, зафиксируй их реальный статус в каталоге. Не обозначай библиотеку полностью завершённой.

---

# ЧАСТЬ XVI. ВЫСШИЙ ПРИОРИТЕТ

Главная задача — **сократить количество кода, который будущим ИИ придётся заново читать, анализировать и генерировать**.

Для этого:

- Большой исходник хранится один раз.
- Бинарные ассеты хранятся один раз.
- Каждый компонент получает стабильный ID.
- Зависимости находятся автоматически.
- Полный код загружается только по необходимости.
- Готовые визуальные системы подключаются одной фабрикой.
- Метаданные предоставляются в компактном JSON.
- Оригинальная графика не пересоздаётся.
- ИИ работает с готовыми компонентами, а не с копиями всей игры.
- Новые игры используют общий склад.
- Исправление общего компонента должно улучшать все игры, которые используют его совместимую версию, без непреднамеренного изменения эталонов.

**Идеальный результат: для создания нового мира другой ИИ получает 5–15 готовых компонентов из META GAMES и пишет только недостающую игровую логику.**

Не трать работу на дополнительные отчёты и презентации.

Работа должна завершаться реально созданными файлами библиотеки, рабочими визуальными компонентами и ссылками на GitHub и страницу просмотра.

## КОНЕЧНАЯ КОМАНДА

ПРОАНАЛИЗИРУЙ ОРИГИНАЛ. ИЗВЛЕКИ ВСЁ ПРИГОДНОЕ ДЛЯ ПОВТОРНОГО ИСПОЛЬЗОВАНИЯ. СОХРАНИ ГРАФИКУ И АНИМАЦИИ. СОЗДАЙ РАБОЧУЮ БИБЛИОТЕКУ. ПОДКЛЮЧИ ЕЁ К META GAMES. ОБЕСПЕЧЬ МАКСИМАЛЬНО БЫСТРЫЙ ДОСТУП ДЛЯ ДРУГИХ ИИ С МИНИМАЛЬНЫМ РАСХОДОМ ТОКЕНОВ.

Не останавливайся на анализе, структуре папок или описании. Создай настоящие переиспользуемые компоненты.
