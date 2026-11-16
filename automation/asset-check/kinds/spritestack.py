"""Sprite stacking / pixel slice strips: isolated geometry, silhouette and palette checks.
No rendering technique is banned: reject only broken or primitive assets against
the 13-slice jet, 8-slice cloud, 4-6 tier island accepted in Nebesny Pilot.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from PIL import Image

NAME = "spritestack"
ORDER = 4
REFERENCE = {
    "vehicle": 13, "creature": 8, "cloud": 8, "island": 4,
    "landmark": 6, "prop": 4, "effect": 4, "pickup": 6,
}
ROLES = set(REFERENCE)


def detect(root: Path) -> bool:
    return (root / "stack.json").is_file()


def check(root: Path, r) -> set[str]:
    covered = {"stack.json"}
    try:
        m = json.loads((root / "stack.json").read_text("utf-8"))
    except (ValueError, OSError) as e:
        r.add("SS1", "HARD", "stack.json", str(e), "Исправь JSON")
        return covered
    if m.get("format") != "mg-spritestack/1" or not isinstance(m.get("assets"), dict):
        r.add("SS1", "HARD", "stack.json", "неверный формат или нет assets",
              "format=mg-spritestack/1; assets={id: metadata}")
        return covered
    assets = m["assets"]
    r.asset_ids.update(assets)
    r.stats["spritestack_assets"] = len(assets)
    page = root / "index.html"
    page_src = page.read_text("utf-8", errors="replace") if page.is_file() else ""
    if page.is_file():
        covered.add("index.html")
    if not page_src or "window.__STACK_PROBE__" not in page_src:
        r.add("SS8", "HARD", "index.html", "нет отдельной сцены и изоляции ассетов",
              "Сохрани оригинальный полёт; подключи __STACK_PROBE__ (setHidden и IDs)")
    for token in re.findall(r"https?://[^\s\"'<>]+", page_src):
        r.add("SS9", "HARD", "index.html", f"внешняя сеть: {token[:80]}",
              "Используй локальные файлы пака")
    if re.search(r"\beval\s*\(|new\s+Function\s*\(", page_src):
        r.add("SS9", "HARD", "index.html", "динамический код в игре",
              "Удали eval/Function")
    for asset_id, meta in assets.items():
        if not isinstance(meta, dict):
            r.add("SS1", "HARD", asset_id, "нет метаданных",
                  "Укажи file/slice/count/role")
            continue
        pth = meta.get("file", "")
        role = meta.get("role")
        if role not in ROLES or not isinstance(pth, str) or not pth.startswith("stacks/"):
            r.add("SS1", "HARD", asset_id, "неверный role или путь PNG",
                  "role из SPRITE-STACK; file=stacks/<id>.png")
            continue
        img = root / pth
        if not img.resolve().is_relative_to(root.resolve()) or not img.is_file():
            r.add("SS2", "HARD", asset_id, f"нет PNG {pth}",
                  "Нарисуй ленту срезов PNG внутри stacks/")
            continue
        covered.add(img.relative_to(root).as_posix())
        try:
            im = Image.open(img).convert("RGBA")
            data = np.asarray(im, dtype=np.uint8)
        except (OSError, ValueError) as e:
            r.add("SS2", "HARD", asset_id, f"не читается PNG: {e}", "Пересохрани PNG")
            continue
        count = meta.get("count")
        sl = meta.get("slice")
        if (not isinstance(count, int) or count < 1 or
                not isinstance(sl, list) or len(sl) != 2 or
                not all(isinstance(v, int) and 4 <= v <= 512 for v in sl)):
            r.add("SS1", "HARD", asset_id, "некорректные slice/count",
                  "slice=[width,height], count>0")
            continue
        w, h = sl
        if (im.width, im.height) != (w * count, h):
            r.add("SS2", "HARD", asset_id, f"лента {im.size} вместо {(w * count, h)}",
                  "Срезы друг за другом горизонтально, снизу вверх")
            continue
        planes = data.reshape(h, count, w, 4).transpose(1, 0, 2, 3)
        alpha = planes[..., 3]
        if np.any((alpha > 0) & (alpha < 255)):
            r.add("SS3", "HARD", asset_id, "полупрозрачность размывает пиксельный край",
                  "Для пиксельного спрайта альфа 0/255; свечение рисуй отдельно")
        masks = alpha > 0
        if any(not mask.any() for mask in masks):
            r.add("SS4", "HARD", asset_id, "есть полностью пустые срезы",
                  "Каждый слой несёт объём")
            continue
        min_slices = REFERENCE[role]
        if count < min_slices:
            r.add("SS5", "HARD", asset_id, f"{count} срезов, эталон роли >= {min_slices}",
                  "Объём стопкой не проще принятого JET / CLOUDS / TIERS")
        changing = sum(not np.array_equal(masks[i], masks[i + 1])
                       or not np.array_equal(planes[i], planes[i + 1])
                       for i in range(count - 1))
        if changing < max(2, int((count - 1) * .35)):
            r.add("SS6", "HARD", asset_id, f"различаются лишь {changing}/{count-1} соседних срезов",
                  "Измени высоту, массу, цвет, крышу/кабину/части; не копируй слои")
        union = np.any(masks, axis=0)
        area = int(union.sum())
        yy, xx = np.where(union)
        width = int(xx.max() - xx.min() + 1)
        height = int(yy.max() - yy.min() + 1)
        if width < 5 or height < 5 or area < 28:
            r.add("SS7", "HARD", asset_id, "слишком маленький читаемый силуэт",
                  "Силуэт не меньше самых малых принятых объектов")
        # Quality measured on the sprite pixels, never on sea/cloud background.
        # A solid circle, perfect ring or slab with cosmetic slice shifts is not a model.
        inner = union[1:-1, 1:-1]
        top = union[:-2, 1:-1]
        bottom = union[2:, 1:-1]
        left = union[1:-1, :-2]
        right = union[1:-1, 2:]
        edges = int(np.sum(inner & (~top | ~bottom | ~left | ~right)))
        perimeter_ratio = edges / max(1, area)
        # Interior palette is measured over all visible sprite pixels.
        colors = np.unique(planes[masks][:, :3], axis=0)
        if (len(colors) < (5 if role in {"vehicle", "creature", "landmark"} else 3)
                or (perimeter_ratio < .08 and width > 12 and height > 12)):
            r.add("SS7", "HARD", asset_id,
                  f"примитивный силуэт/фактура: {len(colors)} цветов, кромка {perimeter_ratio:.3f}",
                  "Добавь реальную конструкцию, вложенные детали, неровную форму")
        if count >= 4 and np.array_equal(masks[0], masks[-1]):
            r.add("SS6", "SOFT", asset_id, "верх и низ имеют одинаковый силуэт",
                  "Меняй форму с высотой")
        if page_src and asset_id not in page_src:
            r.add("SS8", "HARD", asset_id, "id не подключён в копии игры",
                  "Включи ассет в отрисовку мира, проверь появление в полёте")
        if role == "pickup" and not meta.get("benefit"):
            r.add("SS1", "HARD", asset_id, "бонус не имеет видимой пользы",
                  "Добавь benefit и действие в игре")
        r.stats.setdefault("sprite_metrics", {})[asset_id] = {
            "slices": count, "changed_neighbors": changing,
            "silhouette_area": area, "edge_ratio": round(perimeter_ratio, 4),
            "colors": len(colors),
        }
    return covered
