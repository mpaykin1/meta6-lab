"""Sprite-stack atlas checks: strip geometry, independent volume/detail, alpha and source safety."""
from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from PIL import Image

NAME = "spritestack"
ORDER = 12
ALLOWED_ROLES = {"landmark", "vehicle", "creature", "prop", "island", "cloud",
                 "effect", "pickup", "background"}
MIN_SLICES = {"landmark": 13, "vehicle": 13, "creature": 8,
              "prop": 4, "island": 4, "cloud": 8, "effect": 2, "pickup": 2}


def detect(root: Path) -> bool:
    return (root / "stack.json").is_file()


def check(root: Path, report) -> set[str]:
    covered = {"stack.json"}
    try:
        m = json.loads((root / "stack.json").read_text("utf-8"))
    except (OSError, ValueError) as err:
        report.add("SS1", "HARD", "stack.json", f"Манифест не читается: {err}",
                   "Исправь JSON")
        return covered
    if m.get("format") != "mg-spritestack/1" or not isinstance(m.get("assets"), dict):
        report.add("SS1", "HARD", "stack.json", "Неверный формат/нет assets",
                   "Нужен mg-spritestack/1 + объект assets")
        return covered
    for aid, a in m["assets"].items():
        where = str(aid)
        if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_-]*", where) or not isinstance(a, dict):
            report.add("SS2", "HARD", where, "Некорректный id или запись",
                       "id должен быть безопасным именем; запись — объект")
            continue
        role = a.get("role")
        if role not in ALLOWED_ROLES:
            report.add("SS2", "HARD", where, "Неверная роль",
                       "Укажи landmark/vehicle/creature/prop/island/cloud/effect/pickup/background")
        size = a.get("slice")
        n = a.get("count")
        if (not isinstance(size, list) or len(size) != 2
                or any(type(x) is not int or x < 4 or x > 512 for x in size)
                or type(n) is not int or n < 1 or n > 256):
            report.add("SS2", "HARD", where, "Неверные slice или count",
                       "slice=[ширина,высота], count=число срезов")
            continue
        sw, sh = size
        floor = MIN_SLICES.get(role, 1)
        if n < floor:
            report.add("SS3", "HARD", where, f"Срезов {n}, эталон требует ≥ {floor}",
                       "Добавь геометрически различные срезы")
        if where == "gothicCathedral" and n < 80 or where == "spireTower" and n < 60:
            report.add("SS3", "HARD", where, "Башня/собор ниже детализации заказа",
                       "Собор ≥ 80, шпиль ≥ 60 срезов")
        file_name = a.get("file", "")
        p = root / str(file_name)
        if (not isinstance(file_name, str) or not file_name.startswith("stacks/")
                or not file_name.endswith(".png") or any(x in file_name for x in ("..", "\\", ":"))
                or not p.resolve().is_relative_to(root.resolve()) or p.is_symlink()):
            report.add("SS4", "HARD", where, "Небезопасный путь к PNG-ленте",
                       "Файл должен быть в stacks/ без выхода из папки")
            continue
        if not p.is_file():
            report.add("SS4", "HARD", where, f"Нет PNG: {file_name}",
                       "Добавь реальную ленту, не строку с путём")
            continue
        covered.add(file_name)
        try:
            with Image.open(p) as im:
                if im.format != "PNG":
                    raise ValueError("not PNG")
                if im.size != (sw * n, sh):
                    raise ValueError(f"ожидалось {sw*n}×{sh}, получено {im.size}")
                rgba = np.asarray(im.convert("RGBA"))
        except (ValueError, OSError, SyntaxError) as err:
            report.add("SS5", "HARD", where, f"Повреждённый/не того размера PNG: {err}",
                       "Собери валидную PNG-ленту размером slice.width × count")
            continue
        alpha = rgba[:, :, 3]
        if np.any((alpha != 0) & (alpha != 255)):
            report.add("SS6", "HARD", where, "Полупрозрачные пиксели размывают пиксель-арт",
                       "Альфа строго 0/255 для sprite-stack")
        if role == "background":
            report.asset_ids.add(where)
            continue
        masks = []
        signatures = set()
        colors = set()
        for i in range(n):
            sl = rgba[:, i*sw:(i+1)*sw]
            opaque = sl[:, :, 3] == 255
            if opaque.sum() < max(6, sw*sh//250):
                report.add("SS7", "HARD", where, f"Срез {i} пустой",
                           "Каждый срез несёт объём")
                break
            masks.append(opaque)
            signatures.add(sl.tobytes())
            unique = np.unique(sl[opaque, :3].reshape(-1, 3), axis=0)
            for color in unique[:128]:
                colors.add(tuple(int(x) for x in color))
        if len(masks) != n:
            continue
        # A static duplicated image drawn N times is a flat card, not a voxel volume.
        unique = len(signatures)
        if unique < max(3, int(n * .20)):
            report.add("SS8", "HARD", where,
                       f"Только {unique}/{n} разных срезов — плоский повтор",
                       "Добавь смену силуэта и фактуры по высоте")
        # SS12: color noise cannot disguise a wall made of repeated,
        # identically rectangular cross-sections. Measure ALPHA geometry,
        # not unique RGB pixel strings (the latter are easy to fake).
        if role == "landmark" and n >= 20:
            silhouettes = []
            for mask in masks:
                ys, xs = np.nonzero(mask)
                if not len(xs):
                    continue
                # Geometry signature: relative footprint, contour in 8 bands,
                # x/y centroids. Ignore small one-pixel masonry texture.
                row = []
                for band in np.array_split(mask, 8, axis=0):
                    yy, xx = np.nonzero(band)
                    row.extend((round(float(xx.min())/sw, 1), round(float(xx.max())/sw, 1))
                               if len(xx) else (-1.0, -1.0))
                silhouettes.append((round(len(xs)/(sw*sh), 1), *row))
            shape_diversity = len(set(silhouettes))
            if shape_diversity < min(5, max(3, n // 16)):
                report.add("SS12", "HARD", where,
                           f"Только {shape_diversity} форм у {n} срезов — фасад из полос",
                           "Ступенчатые крыши, контрфорсы, сужения и шпили должны менять контур срезов")
        first, last = masks[0], masks[-1]
        overlap = np.count_nonzero(first ^ last)
        if overlap < max(4, int(sw * sh * .01)):
            report.add("SS9", "HARD", where, "Низ и верх имеют одинаковый силуэт",
                       "Меняй массу, карнизы и верх по высоте")
        if len(colors) < 4:
            report.add("SS10", "HARD", where, "Меньше 4 видимых цветов — нет фактуры",
                       "Камень, тень, блики и окна должны читаться отдельно")
        report.asset_ids.add(where)
    # SS13: a city must replace the sea/island terrain beneath its buildings.
    # Checking just a 'shadow' flag is insufficient: floating buildings still pass.
    is_city = m.get("game") == "nebesny-pilot" and "cliffBase" in m["assets"]
    if is_city:
        game_source = (root / "gothic-city.js").read_text("utf-8") if (root / "gothic-city.js").is_file() else ""
        index_source = (root / "index.html").read_text("utf-8") if (root / "index.html").is_file() else ""
        if ("function drawGround(" not in game_source
                or "GothicCity.drawGround()" not in index_source
                or "GothicCity.isCity(" not in index_source
                or "cliffBase" not in game_source):
            report.add("SS13", "HARD", "gothic-city.js",
                       "Здания без сплошного основания: море или острова просвечивают под городом",
                       "Сделай drawGround() из cliffBase и мостовой; исключи острова внутри города")
    # Stand must actually load the strip textures.
    stand = root / "index.html"
    if not stand.is_file():
        report.add("SS11", "HARD", "index.html", "Нет игровой копии эталона",
                   "Сделай index.html со спрайт-стакингом в игре")
    else:
        covered.add("index.html")
        body = stand.read_text("utf-8")
        if "gothic-city.js" not in body:
            report.add("SS11", "HARD", "index.html", "Атласы не подключены к игре",
                       "Подключи визуальный рендер sprite-stack")
        script = root / "gothic-city.js"
        if script.is_file():
            covered.add("gothic-city.js")
            script_source = script.read_text("utf-8")
            if "__ISOLATE__" not in script_source:
                report.add("SS11", "HARD", "gothic-city.js", "Нет управляемой изоляции ассета",
                           "Добавь window.__ISOLATE__(id, on), чтобы сравнивать пиксели ассета отдельно")
    return covered
