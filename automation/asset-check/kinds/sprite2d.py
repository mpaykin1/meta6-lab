"""Вид пака: sprite2d — 2D-спрайты, тайлы, фоны, UI (atlas.json). Проверки A1–A5, A8–A9, P1–P9, G1–G9, L1–L3."""
from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image

NAME = "sprite2d"
ORDER = 10


def detect(root: Path) -> bool:
    for n in ("atlas.json", "manifest.json", "pack.json"):
        p = root / n
        if p.exists():
            try:
                m = json.loads(p.read_text("utf-8"))
            except Exception:  # noqa
                return n == "atlas.json"
            if isinstance(m, dict) and isinstance(m.get("assets"), dict) and m.get("format") != "ink-pack/1":
                return True
    return False


# --- Требования, которые растут: правило «каждая найденная ошибка = новая проверка» ---
REQUIRED_STATES = {
    # роль -> обязательные состояния (синонимы через |)
    "hero": ["idle", "run|movement|walk", "jump", "fall", "attack|shoot", "take_damage|damage|hurt", "defeat|death"],
    "enemy": ["idle", "movement|run|walk", "attack", "damage|take_damage|hurt", "defeat|death"],
    "boss": ["idle", "movement|run|walk", "attack", "damage|take_damage|hurt", "defeat|death"],
}
MIN_FRAMES = {"idle": 4, "run": 6, "movement": 4, "walk": 6, "attack": 4, "shoot": 3, "defeat": 4, "death": 4}
TILESET_CORE = ["ground_top", "ground_fill", "platform_left", "platform_center", "platform_right", "wall"]
BUDGET = {"max_texture_side": 2048, "pack_mb_soft": 8.0, "pack_mb_hard": 25.0, "files_soft": 120}
SEMI_ALPHA_SOFT = 0.03      # доля полупрозрачных пикселей в пиксель-арте
SEAM_SOFT = 0.12            # средняя разница краёв (0..1) для бесшовности
SPRITE_TYPES = {"animation", "prop", "ui_icon", "portrait", "effect", "sprite"}


def load_rgba(path: Path):
    im = Image.open(path)
    mode = im.mode
    return np.asarray(im.convert("RGBA")), mode


def frame_slice(arr, f):
    return arr[f["y"]:f["y"] + f["h"], f["x"]:f["x"] + f["w"]]


def edge_diff(a, b):
    a = a.astype(np.float32) / 255.0
    b = b.astype(np.float32) / 255.0
    return float(np.abs(a - b).mean())


def is_shift_of(base, other, max_shift=3):
    """Кадр — просто сдвиг первого кадра (фальшивая анимация)?"""
    if base.shape != other.shape:
        return False
    for dy in range(-max_shift, max_shift + 1):
        for dx in range(-max_shift, max_shift + 1):
            if dx == 0 and dy == 0:
                continue
            sh = np.roll(np.roll(base, dy, axis=0), dx, axis=1)
            if np.array_equal(sh[..., 3] > 0, other[..., 3] > 0) and np.abs(
                    sh.astype(int) - other.astype(int)).max() <= 8:
                return True
    return False


def motion_energy(base, other, max_shift=3):
    """Доля реально изменившихся пикселей после лучшего совмещения сдвигом (0..1).
    Маленькое значение = кадр это тот же рисунок, просто сдвинутый/с искрой."""
    best = 1.0
    ob = other[..., 3] > 0
    for dy in range(-max_shift, max_shift + 1):
        for dx in range(-max_shift, max_shift + 1):
            sh = np.roll(np.roll(base, dy, axis=0), dx, axis=1)
            sb = sh[..., 3] > 0
            union = sb | ob
            n = int(union.sum())
            if not n:
                continue
            diff = (np.abs(sh.astype(int) - other.astype(int)).sum(-1) > 24) & union
            best = min(best, float(diff.sum()) / n)
    return best


def role_of(path: str) -> str:
    top = path.split("/")[0]
    return {"characters": "hero", "enemies": "enemy", "bosses": "boss"}.get(top, "other")


def check(root: Path, r) -> set:
    """2D-спрайты: atlas.json (MG.AssetPack/1, MLGA.PixelAtlas.v1). Возвращает проверенные файлы."""
    mf = None
    for name in ("atlas.json", "manifest.json", "pack.json"):
        if (root / name).exists():
            mf = root / name
            break
    if not mf:
        r.add("A1", "HARD", "/", "Нет манифеста (atlas.json / manifest.json)",
              "Положи в корень пака atlas.json по automation/asset-check/SPEC.md")
        return set()
    try:
        man = json.loads(mf.read_text("utf-8"))
    except Exception as e:  # noqa
        r.add("A1", "HARD", mf.name, f"Манифест не читается как JSON: {e}", "Исправь синтаксис JSON")
        return set()

    assets = man.get("assets", {})
    for key in ("format", "version", "assets", "tile_size"):
        if key not in man:
            r.add("A1", "HARD", mf.name, f"В манифесте нет поля {key}", f"Добавь поле {key} (см. SPEC.md §1)")
    if not man.get("animation_fps") and not any(
            f.get("duration_ms") for a in assets.values() for f in a.get("frames", [])):
        r.add("A5", "SOFT", mf.name, "Нет темпа анимации", "Заполни duration_ms у кадров")
    # A2: файлы
    listed = {a.get("file", k) for k, a in assets.items()}
    on_disk = {p.relative_to(root).as_posix() for p in root.rglob("*.png")}
    for f in sorted(listed - on_disk):
        r.add("A2", "HARD", f, "Файл указан в манифесте, но его нет", "Добавь файл или убери запись")
    for f in sorted(on_disk - listed - {"preview.png"}):
        r.add("A2", "SOFT", f, "Файл есть, но не описан в манифесте", "Опиши его в assets или удали")
    if "preview.png" not in on_disk:
        r.add("G8", "SOFT", "/", "Нет preview.png", "Сделай превью-лист всего пака")

    palette = [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in man.get("palette", {}).values()
               if isinstance(c, str) and c.startswith("#") and len(c) == 7]
    max_side = 0
    sha = {}
    for key, a in sorted(assets.items()):
        rel = a.get("file", key)
        p = root / rel
        if not p.exists():
            continue
        arr, mode = load_rgba(p)
        h, w = arr.shape[:2]
        max_side = max(max_side, w, h)  # noqa
        sha.setdefault(hashlib.sha256(p.read_bytes()).hexdigest(), []).append(rel)
        typ = a.get("type", "?")
        ss = a.get("sheet_size")
        if ss and list(ss) != [w, h]:
            r.add("A3", "HARD", rel, f"sheet_size {ss} ≠ реальный {[w, h]}", "Перезапиши sheet_size реальным размером")
        frames = a.get("frames", [])
        if a.get("count") is not None and a["count"] != len(frames):
            r.add("A3", "HARD", rel, f"count={a['count']}, а кадров {len(frames)}", "Выровняй count и frames")
        fw, fh = a.get("frame_size", [w, h])
        if typ == "animation" and (w % fw or h % fh):
            r.add("A3", "HARD", rel, f"Лист {w}x{h} не делится на кадр {fw}x{fh}", "Кадры строго по сетке")
        for i, f in enumerate(frames):
            if f["x"] + f["w"] > w or f["y"] + f["h"] > h or f["x"] < 0 or f["y"] < 0:
                r.add("A3", "HARD", rel, f"кадр {i} выходит за лист", "Исправь x/y/w/h кадра")
            an = f.get("anchor")
            if an and not (0 <= an["x"] <= f["w"] and 0 <= an["y"] <= f["h"]):
                r.add("A4", "HARD", rel, f"якорь кадра {i} вне кадра", "Якорь внутри кадра (ноги персонажа)")
            if f.get("duration_ms", 1) <= 0:
                r.add("A5", "HARD", rel, f"кадр {i}: duration_ms ≤ 0", "duration_ms > 0")

        if typ in SPRITE_TYPES:
            if mode not in ("RGBA", "LA", "P"):
                r.add("P1", "HARD", rel, f"Нет альфа-канала (mode={mode})", "Сохрани PNG с прозрачностью RGBA")
            alpha = arr[..., 3]
            semi = float(((alpha > 0) & (alpha < 255)).sum()) / max(1, (alpha > 0).sum())
            if man.get("default_filter") == "nearest" and semi > SEMI_ALPHA_SOFT:
                r.add("P2", "SOFT", rel, f"{semi:.0%} полупрозрачных пикселей — размытый край в пиксель-арте",
                      "Альфа только 0 или 255 (без сглаживания), иначе ореол при nearest-фильтре")
            if palette and (alpha > 0).any():
                rgb = arr[alpha > 0][:, :3].astype(int)
                pal = np.array(palette)
                d = np.abs(rgb[:, None, :] - pal[None, :, :]).sum(-1).min(1)
                off = float((d > 120).mean())
                if off > 0.35:
                    r.add("P7", "SOFT", rel, f"{off:.0%} пикселей далеко от палитры пака",
                          "Приведи цвета к палитре пака (единый стиль)")

        if typ == "animation" and frames:
            fr = [frame_slice(arr, f) for f in frames]
            empty = [i for i, x in enumerate(fr) if not (x[..., 3] > 0).any()]
            if empty:
                r.add("P3", "HARD", rel, f"пустые кадры {empty}", "Нарисуй кадры или убери их")
            uniq = {x.tobytes() for x in fr}
            if len(fr) > 1 and len(uniq) == 1:
                r.add("P4", "HARD", rel, "все кадры одинаковые — анимации нет", "Нарисуй разные фазы движения")
            elif len(fr) > 2:
                dup = sum(1 for i in range(len(fr)) if fr[i].tobytes() == fr[(i + 1) % len(fr)].tobytes())
                if dup:
                    r.add("P4", "SOFT", rel, f"{dup} повторов соседних кадров", "Замени повтор новой фазой или увеличь duration_ms")
            if len(fr) >= 2 and len(uniq) > 1 and not rel.startswith("effects/"):
                en = sorted(motion_energy(fr[0], x) for x in fr[1:])
                med = en[len(en) // 2]
                soft_state = Path(rel).stem.endswith(("_fall", "_jump"))
                if med < 0.06:
                    r.add("P5", "SOFT" if soft_state else "HARD", rel, f"тело не двигается: меняется лишь {med:.0%} пикселей (сдвиг/искры)",
                          "Нарисуй настоящие фазы: руки, ноги, корпус, голова меняются; волна по телу с задержкой")
                elif med < 0.12:
                    r.add("P5", "SOFT", rel, f"слабое движение: {med:.0%} пикселей меняется",
                          "Добавь вторичное движение (одежда, волосы, свет, хвост догоняет)")
            clipped = [i for i, x in enumerate(fr) if (x[0, :, 3] > 0).any() or (x[:, 0, 3] > 0).any()
                       or (x[:, -1, 3] > 0).any()]
            if len(clipped) > len(fr) // 2:
                r.add("P6", "SOFT", rel, f"спрайт упирается в край кадра в {len(clipped)} кадрах — может быть обрезан",
                      "Оставь 1–2 px прозрачного поля внутри кадра")
            bottoms = [int(np.nonzero((x[..., 3] > 0).any(1))[0].max()) for x in fr if (x[..., 3] > 0).any()]
            state = Path(rel).stem.split("_")[-1]
            if bottoms and state in ("idle", "run", "movement", "walk") and max(bottoms) - min(bottoms) > 3:
                r.add("P8", "SOFT", rel, f"низ спрайта прыгает на {max(bottoms)-min(bottoms)} px — дрожание ног",
                      "Ноги на одной линии якоря во всех кадрах цикла")
            # минимум кадров
            for k2, mn in MIN_FRAMES.items():
                if rel.endswith(f"_{k2}.png") and len(fr) < mn:
                    r.add("P9", "SOFT", rel, f"{len(fr)} кадров для {k2}, мало для плавности (мин {mn})",
                          f"Сделай не меньше {mn} кадров")

        if typ == "tile":
            ts = man.get("tile_size", [32, 32])
            if [w, h] != list(ts):
                r.add("G3", "HARD", rel, f"тайл {w}x{h} ≠ tile_size {ts}", "Все тайлы строго tile_size")
            tags = a.get("tags", {})
            name = Path(rel).stem
            lr = edge_diff(arr[:, :1], arr[:, -1:])
            tb = edge_diff(arr[:1], arr[-1:])
            if tags.get("seamless") and (lr > SEAM_SOFT or tb > SEAM_SOFT):
                r.add("G2", "HARD", rel, f"помечен seamless, но края не совпадают (Δ={max(lr, tb):.2f})",
                      "Левый край = правый, верх = низ (сделай через offset/wrap)")
            if name in ("ground_top", "platform_center") and lr > SEAM_SOFT:
                r.add("G2", "HARD", rel, f"повторяемый по X тайл, но шов слева/справа Δ={lr:.2f}",
                      "Этот тайл кладут рядами — левый край должен совпадать с правым")
            if name in ("ground_top", "platform_center") and not tags.get("seamless_x"):
                r.add("G2", "SOFT", rel, "нет тега seamless_x", 'Добавь "seamless_x": true для тайлов, которые кладут рядом')
            if not tags.get("collision"):
                r.add("G3", "HARD", rel, "нет collision", "Укажи collision из collision_types")

        if typ == "parallax":
            tags = a.get("tags", {})
            if tags.get("recommended_wrap_x"):
                lr = edge_diff(arr[:, :2], arr[:, -2:])
                if lr > SEAM_SOFT:
                    r.add("G4", "HARD", rel, f"фон должен повторяться по X, но шов Δ={lr:.2f}",
                          "Левый край фона = правый (бесшовный по горизонтали)")
            if not Path(rel).stem == "far" and (arr[..., 3] == 255).all():
                r.add("G4", "HARD", rel, "средний/ближний слой параллакса без прозрачности — закроет дальний",
                      "mid и near — с прозрачным небом, видно слой позади")

    # дубли файлов
    for h_, files in sha.items():
        if len(files) > 1:
            r.add("A8", "SOFT", " = ".join(files[:3]), f"{len(files)} одинаковых файлов (тайл один на все миры)", "Оставь один, остальные — ссылкой")

    # G1 полнота состояний
    anims = man.get("animations", {})
    if not anims and any(a.get("type") == "animation" for a in assets.values()):
        r.add("G1", "HARD", mf.name, "Нет раздела animations (персонаж → состояние → файл)", "Добавь animations")
    for ent, states in anims.items():
        files = list(states.values())
        role = role_of(files[0]) if files else "other"
        for need in REQUIRED_STATES.get(role, []):
            if not any(s in states for s in need.split("|")):
                r.add("G1", "HARD", ent, f"нет состояния {need.split('|')[0]}", f"Нарисуй {ent}_{need.split('|')[0]}.png")
        for s, f in states.items():
            if f not in listed:
                r.add("G1", "HARD", f"{ent}.{s}", f"ссылка на несуществующий ассет {f}", "Исправь путь")
    # A9 / G7 — переходы между состояниями
    for ent, states in anims.items():
        sizes, anchors = set(), set()
        for st, f in states.items():
            a = assets.get(f)
            if not a:
                continue
            sizes.add(tuple(a.get("frame_size", [])))
            if a.get("frames") and a["frames"][0].get("anchor"):
                an = a["frames"][0]["anchor"]
                anchors.add((an["x"], an["y"]))
            if st in ("defeat", "death", "attack", "shoot", "take_damage", "damage", "jump") and a.get("loop") is True:
                r.add("A9", "SOFT", f, f"{st} помечен loop=true — зациклится", f"loop=false для {st} (+ событие конца)")
        hb = [assets.get(f, {}).get("hitbox") for f in states.values()]
        if not any(hb) and not (man.get("hitboxes") or {}).get(ent):
            r.add("G9", "HARD", ent, "нет hitbox — игра не знает, где тело для попаданий",
                  'Добавь "hitboxes": {"<персонаж>": {"x":..,"y":..,"w":..,"h":..}} (в пикселях кадра)')
        for st in ("attack", "shoot"):
            a = assets.get(states.get(st, ""), {})
            if a and not a.get("events") and not any(f.get("event") for f in a.get("frames", [])):
                r.add("G9", "HARD", states[st], f"{st}: нет события удара (на каком кадре урон/выстрел)",
                      'Добавь "events": [{"frame": N, "type": "hit"|"spawn_projectile", "x":.., "y":..}]')
        if len(sizes) > 1 or len(anchors) > 1:
            r.add("G7", "HARD", ent, f"разные frame_size {sorted(sizes)} / якоря {sorted(anchors)} между состояниями — персонаж прыгает при смене анимации",
                  "Один frame_size и один якорь (ноги) для всех состояний персонажа")

    # G5 тайлсеты по мирам
    worlds = defaultdict(set)
    for a in assets.values():
        if a.get("type") == "tile":
            parts = a["file"].split("/")
            worlds[parts[1] if len(parts) > 2 else "_"].add(Path(a["file"]).stem)
    for wname, names in worlds.items():
        miss = [t for t in TILESET_CORE if t not in names]
        if miss:
            r.add("G5", "HARD", f"tiles/{wname}", f"нет тайлов {miss}", "Дорисуй базовый набор тайлов")
        has_corner = any("corner" in n or "edge_left" in n or "slope" in n for n in names)
        if not has_corner:
            r.add("G5", "SOFT", f"tiles/{wname}", "нет углов/склонов/краёв земли — уровни будут прямоугольными",
                  "Добавь ground_left, ground_right, corner_in, corner_out, slope_up, slope_down (БЕЗ ПОВТОРОВ)")
    # G6 масштаб героя vs врагов
    if anims:
        hero_h = [a["frame_size"][1] for k, a in assets.items() if k.startswith("characters/") and "frame_size" in a]
        if hero_h and min(hero_h) < 32:
            r.add("G6", "SOFT", "characters", f"герой {min(hero_h)} px — мелко для телефона", "Герой ≥ 32 px по высоте")

    # L локали
    locs = man.get("locales", [])
    data = {}
    for lc in locs:
        p = root / "locales" / f"{lc}.json"
        if not p.exists():
            r.add("L1", "HARD", f"locales/{lc}.json", "файла локали нет", "Добавь файл")
            continue
        try:
            data[lc] = json.loads(p.read_text("utf-8"))
        except Exception as e:  # noqa
            r.add("L1", "HARD", p.name, f"битый JSON: {e}", "Исправь JSON")
    if len(data) > 1:
        keys = [set(d) for d in data.values()]
        allk = set().union(*keys)
        for lc, d in data.items():
            miss = sorted(allk - set(d))
            if miss:
                r.add("L2", "HARD", f"locales/{lc}.json", f"нет ключей {miss[:8]}{'…' if len(miss) > 8 else ''}",
                      "Все языки — одинаковые ключи")
            empty = [k for k, v in d.items() if isinstance(v, str) and not v.strip()]
            if empty:
                r.add("L2", "HARD", f"locales/{lc}.json", f"пустые строки {empty[:8]}", "Заполни перевод")
    for b in (man.get("backgrounds") or {}).values():
        k = b.get("world_name_key")
        for lc, d in data.items():
            if k and k not in d:
                r.add("L3", "HARD", f"locales/{lc}.json", f"нет ключа {k}", "Добавь название мира")

    r.stats.update({"assets": len(assets), "entities": len(anims)})
    return {f for f in listed} | {"preview.png"} | {p.relative_to(root).as_posix() for p in (root / "locales").glob("*.json")} | {mf.name}

