"""Вид пака: ink — процедурные 3D-ассеты для акварельных миров INK (формат ink-pack/1).

Пак = pack.json + makers.js. makers.js пишется как файл рядом с эталоном INK (reference/ink-fallen-guardian):
импортирует 'three' и при желании готовые генераторы эталона (./shared/…, ./ink-objects.js …) — REUSE без копирования.
Бот прогоняет каждый maker в Node (ink_harness.mjs) и проверяет IK1–IK14. Спецификация: SPEC.md §INK.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from pathlib import Path

NAME = "ink"
ORDER = 4
HERE = Path(__file__).resolve().parent
REPO = Path(os.environ.get("ASSET_CHECK_REPO") or HERE.parents[2])  # мутант-прогон копирует бота во временную папку
HARNESS = HERE / "ink_harness.mjs"
DEFAULT_BASE = "reference/ink-fallen-guardian"
ROLES = {"tree", "plant", "rock", "prop", "building", "landmark", "creature", "character", "vehicle",
         "pickup", "interactive", "effect", "ground"}
VARY = {"tree", "plant", "rock", "ground"}             # БЕЗ ПОВТОРОВ: каждый seed — своя форма
ALIVE = {"creature", "character", "effect", "pickup", "interactive"}   # обязаны двигаться (userData.tick)
SWAY = {"tree", "plant"}                               # живой мир: колышутся (SOFT)
TRI = {"landmark": (20000, 40000), "building": (6000, 15000)}
TRI_DEFAULT = (4000, 8000)
SIZE_MAX = {"landmark": 14.0, "building": 9.0}
OK_MATERIALS = {"MeshStandardMaterial", "MeshBasicMaterial", "MeshLambertMaterial", "LineBasicMaterial",
                "LineDashedMaterial", "PointsMaterial", "SpriteMaterial"}
FORBIDDEN = [(r"\bfetch\s*\(", "fetch"), (r"XMLHttpRequest", "XMLHttpRequest"), (r"\beval\s*\(", "eval"),
             (r"new\s+Function\s*\(", "new Function"), (r"\bimport\s*\(", "динамический import()"),
             (r"localStorage|sessionStorage|indexedDB", "хранилище браузера"),
             (r"TextureLoader|GLTFLoader|ImageLoader|FileLoader", "загрузка файлов"),
             (r"https?://", "внешняя ссылка"), (r"\bwindow\s*\.|\blocation\s*\.", "window/location"),
             (r"ShaderMaterial|RawShaderMaterial", "свой шейдер вместо акварели эталона")]
INK_PALETTE = ["#272c30", "#303c38", "#607e74", "#789180", "#91a18b", "#736b59", "#d5d3bb", "#c5ac69", "#bd7c69",
               "#587879", "#9c9b8e", "#918872", "#a89a80", "#b6bea3", "#a89e83", "#ccbc97", "#78a5a4", "#efece2",
               "#839487", "#e7e5d6"]


def detect(root: Path) -> bool:
    p = root / "pack.json"
    if not p.exists():
        return False
    try:
        return json.loads(p.read_text("utf-8")).get("format") == "ink-pack/1"
    except Exception:  # noqa
        return False


def hexrgb(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def run_harness(base: Path, makers: Path):
    node = shutil.which("node")
    if not node:
        return None, "нет node — бот не может прогнать ассеты INK"
    p = subprocess.run([node, str(HARNESS), str(base), str(makers)], capture_output=True, text=True, timeout=300)
    try:
        return json.loads(p.stdout), None
    except Exception:  # noqa
        return None, (p.stderr or p.stdout)[:400]


def reference_names(base: Path):
    names = set()
    for f in ("ink-objects.js", "ink-extras.js", "ink-settlement.js", "ink-forest.js"):
        p = base / f
        if p.exists():
            names |= set(re.findall(r"export function (\w+)", p.read_text("utf-8")))
            names |= set(re.findall(r"^\s{2}(\w+): '", p.read_text("utf-8"), re.M))
    return names | {"robot"}


def check(root: Path, r) -> set:
    pj = json.loads((root / "pack.json").read_text("utf-8"))
    covered = {"pack.json", "makers.js", "README.md"}
    base = (REPO / pj.get("base", DEFAULT_BASE)).resolve()
    if not (base / "three.module.js").exists():
        r.add("IK1", "HARD", "pack.json", f"эталон INK не найден: {pj.get('base', DEFAULT_BASE)}",
              f'"base": "{DEFAULT_BASE}" — папка эталона в meta6-lab')
        return covered
    mk = root / "makers.js"
    if not mk.exists():
        r.add("IK1", "HARD", "makers.js", "нет makers.js", "Положи makers.js с export const makers = {имя: seed => Group}")
        return covered
    src = mk.read_text("utf-8")
    for pat, what in FORBIDDEN:
        if re.search(pat, src):
            r.add("IK2", "HARD", "makers.js", f"запрещено: {what}",
                  "Ассет INK — только процедурная геометрия Three.js и генераторы эталона, без сети, файлов и своих шейдеров")
    for imp in re.findall(r"""from\s+['"]([^'"]+)['"]""", src):
        if imp != "three" and not (imp.startswith("./") and (base / imp).exists()):
            r.add("IK2", "HARD", "makers.js", f"импорт {imp!r} не из эталона",
                  "Можно импортировать только 'three' и файлы эталона INK (./shared/…, ./ink-objects.js …)")
    meta = pj.get("assets") or {}
    if not meta:
        r.add("IK3", "HARD", "pack.json", "нет assets (описание каждого ассета)",
              '"assets": {"имя": {"label_ru": "…", "role": "tree|…", "zone": "…", "footprint": 0.5}}')
    data, err = run_harness(base, mk)
    if data is None or not data.get("ok"):
        r.add("IK1", "HARD", "makers.js", f"makers.js не запускается: {err or data.get('error')}",
              "Исправь ошибку загрузки — бот показывает текст ошибки")
        return covered
    made = data["makers"]
    taken = reference_names(base)
    for name in made:
        if name in taken:
            r.add("IK4", "HARD", name, "имя совпадает с ассетом эталона — подмена принятого ассета",
                  "Дай новое имя (НЕ МЕНЯТЬ НЕЗАПРОШЕННОЕ: эталон только дополняется)")
        if name not in meta:
            r.add("IK3", "HARD", name, "ассет есть в makers.js, но не описан в pack.json", "Добавь описание в assets")
    for name in meta:
        if name not in made:
            r.add("IK3", "HARD", name, "описан в pack.json, но нет в makers.js", "Добавь maker или убери описание")
    ink_rgb = [hexrgb(c) for c in INK_PALETTE]
    for name, m in made.items():
        d = meta.get(name, {})
        role = d.get("role")
        if name in meta:
            if role not in ROLES:
                r.add("IK3", "HARD", name, f"role={role!r}", f"role одна из: {', '.join(sorted(ROLES))}")
            if not d.get("label_ru"):
                r.add("IK3", "HARD", name, "нет label_ru", "Русское название для меню ☰")
            if not d.get("zone"):
                r.add("IK3", "HARD", name, "нет zone", "Зона мира: city, woodland, lakeside, meadow, guardian, any или new:<id>")
        if m.get("error"):
            r.add("IK1", "HARD", name, f"maker падает: {m['error']}", "Исправь maker")
            continue
        if not m.get("same_seed_same"):
            r.add("IK5", "HARD", name, "один и тот же seed даёт разную форму — мир будет мигать при перезагрузке",
                  "Только детерминированный шум от seed (без Math.random)")
        if role in VARY and not m.get("other_seed_differs"):
            r.add("IK6", "HARD", name, "разные seed дают одинаковую форму — все копии в лесу одинаковые (БЕЗ ПОВТОРОВ)",
                  "Меняй от seed высоту, наклон, число веток/листьев, оттенок")
        lo, hi = TRI.get(role, TRI_DEFAULT)
        if m["tris"] > hi:
            r.add("IK7", "HARD", name, f"{m['tris']} треугольников > {hi} для {role}", "Упрости геометрию (меньше сегментов)")
        elif m["tris"] > lo:
            r.add("IK7", "SOFT", name, f"{m['tris']} треугольников > {lo}", "Упрости или сделай вариант для дальнего плана")
        if m["meshes"] > 200:
            r.add("IK7", "HARD", name, f"{m['meshes']} отдельных мешей — тормоза на телефоне", "Объедини меши (batchInk эталона)")
        elif m["meshes"] > 80:
            r.add("IK7", "SOFT", name, f"{m['meshes']} мешей", "Объедини мелкие детали")
        if m["ms"] > 300:
            r.add("IK8", "HARD", name, f"создание {m['ms']} мс", "Ассет строится ≤ 50 мс")
        elif m["ms"] > 50:
            r.add("IK8", "SOFT", name, f"создание {m['ms']} мс", "Ассет строится ≤ 50 мс")
        if m["min"] is None:
            r.add("IK9", "HARD", name, "пустой объект — нет геометрии", "Построй геометрию")
            continue
        size = [m["max"][i] - m["min"][i] for i in range(3)]
        top = max(size)
        if top > SIZE_MAX.get(role, 7.0):
            r.add("IK9", "HARD", name, f"размер {top:.1f} м — несоразмерно (путник 1.6 м)", "Единица = метр; путник ≈ 1.6 м")
        if top < 0.12:
            r.add("IK9", "HARD", name, f"размер {top:.2f} м — не видно", "Сделай крупнее (путник ≈ 1.6 м)")
        if m["min"][1] > 0.25 and role not in ("effect", "creature"):
            r.add("IK10", "HARD", name, f"низ на высоте {m['min'][1]:.2f} м — висит в воздухе", "Основание на y = 0")
        elif m["min"][1] < -1.0:
            r.add("IK10", "SOFT", name, f"утоплен на {-m['min'][1]:.2f} м", "Основание около y = 0")
        bad = [t for t in m["material_types"] if t not in OK_MATERIALS]
        if bad:
            r.add("IK11", "HARD", name, f"материалы {bad} — акварель эталона их не рисует",
                  "MeshStandardMaterial (roughness 1) с цветом, как в ink-objects.js")
        if m["meshes"] and m["outline_set"] < m["meshes"] * 0.5:
            r.add("IK11", "SOFT", name, "у большинства мешей не задан watercolorOutline", "userData.watercolorOutline = true/false для каждой части")
        if m["colors"]:
            far = sum(1 for c in m["colors"] if min(sum(abs(a - b) for a, b in zip(hexrgb(c), p)) for p in ink_rgb) > 110)
            if far / len(m["colors"]) > 0.4:
                r.add("IK12", "SOFT", name, f"{far} из {len(m['colors'])} цветов чужие для акварели INK",
                      "Приглушённые цвета эталона (зелёно-серые, охра, терракота, бумага)")
        if role in ALIVE and not m.get("tick_moves"):
            r.add("IK13", "HARD", name, "не двигается: нет userData.tick(t, dt) или он ничего не меняет",
                  "userData.tick — дыхание, шаг, хвост, мерцание; гармоничное движение sin/cos от t, с задержкой по частям")
        elif role in SWAY and not m.get("tick_moves"):
            r.add("IK13", "SOFT", name, "не колышется", "userData.tick: лёгкое покачивание веток/стеблей от ветра")
        if m.get("footprint") is None and role not in ("effect", "plant", "ground"):
            r.add("IK14", "HARD", name, "нет userData.footprint — герой пройдёт сквозь объект",
                  "userData.footprint = радиус в метрах, который нельзя проходить (0 — можно)")
        if role in ("pickup", "interactive"):
            it = m.get("interact") or {}
            if not (it.get("radius") and it.get("effect") and it.get("label_ru")):
                r.add("IK14", "HARD", name, "нет понятной пользы: userData.interact {radius, effect, label_ru}",
                      "Опиши, что получает герой (ПОНЯТНАЯ ПОЛЬЗА) — effect из списка SPEC.md §INK")
    r.stats["ink_assets"] = len(made)
    return covered
