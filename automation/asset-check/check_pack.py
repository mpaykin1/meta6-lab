#!/usr/bin/env python3
"""Бот-проверщик ассет-паков для игр МГ / МГЛ.

Запуск:
    python3 -I automation/asset-check/check_pack.py <папка_или_zip> [--out report_dir] [--strict]

Проверяет пак по спецификации automation/asset-check/SPEC.md:
манифест, размеры листов, кадры, якоря, прозрачность, «мёртвую» анимацию,
бесшовность тайлов и фонов, полноту состояний персонажей, локали, бюджет.
Каждая проверка имеет id (A*, P*, G*, L*, B*). Каждая найденная ошибка
сопровождается готовой инструкцией «как исправить» для ChatGPT.

Код выхода: 0 — HARD-ошибок нет; 1 — есть HARD; 2 — пак не прочитан.
Ловушки (тесты, которые доказывают, что бот ловит ошибки): test_check_pack.py.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import tempfile
import zipfile
from collections import defaultdict
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
except ImportError:  # pragma: no cover
    print("Нужны pillow и numpy: pip install pillow numpy", file=sys.stderr)
    sys.exit(2)

BOT_VERSION = "1.0.0"

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


class Report:
    def __init__(self, root: Path):
        self.root = root
        self.items: list[dict] = []
        self.stats: dict = {}

    def add(self, cid, sev, where, msg, fix):
        self.items.append({"id": cid, "severity": sev, "where": where, "problem": msg, "fix": fix})

    def hard(self):
        return [i for i in self.items if i["severity"] == "HARD"]

    def score(self):
        h = len(self.hard())
        s = len([i for i in self.items if i["severity"] == "SOFT"])
        return max(0, 100 - 10 * h - min(40, s))


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


def check(root: Path) -> Report:
    r = Report(root)
    mf = None
    for name in ("atlas.json", "manifest.json", "pack.json"):
        if (root / name).exists():
            mf = root / name
            break
    if not mf:
        r.add("A1", "HARD", "/", "Нет манифеста (atlas.json / manifest.json)",
              "Положи в корень пака atlas.json по automation/asset-check/SPEC.md")
        return r
    try:
        man = json.loads(mf.read_text("utf-8"))
    except Exception as e:  # noqa
        r.add("A1", "HARD", mf.name, f"Манифест не читается как JSON: {e}", "Исправь синтаксис JSON")
        return r

    assets = man.get("assets", {})
    for key in ("format", "version", "assets", "tile_size"):
        if key not in man:
            r.add("A1", "HARD", mf.name, f"В манифесте нет поля {key}", f"Добавь поле {key} (см. SPEC.md §1)")
    if not man.get("animation_fps") and not any(
            f.get("duration_ms") for a in assets.values() for f in a.get("frames", [])):
        r.add("A5", "SOFT", mf.name, "Нет темпа анимации", "Заполни duration_ms у кадров")
    miss_lp = [k for k in ("license", "provenance") if k not in man]
    if miss_lp:
        if True:
            r.add("A6", "HARD", mf.name, f"Нет полей {miss_lp} — происхождение и права не указаны",
                  'Добавь "license": {"type":"…","author":"ChatGPT image gen / автор","commercial":true} и '
                  '"provenance": {"tool":"…","prompt_sha256":"…","date":"YYYY-MM-DD"} (правило META_GAMES_SOURCE_ALLOWLIST)')
    if "content_flags" not in man:
        r.add("A7", "HARD", mf.name, "Нет content_flags — не указано, есть ли реальные люди, бренды, политика",
              'Добавь "content_flags": {"real_persons": [...], "brands": [...], "political": true|false}. '
              'Реальные узнаваемые люди/политика = отдельная версия пака без них для МГ, Google Play, Steam, Playgama')

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
        max_side = max(max_side, w, h)
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
    if not anims:
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

    # B бюджет
    total = sum(p.stat().st_size for p in root.rglob("*") if p.is_file())
    nfiles = len(on_disk)
    mb = total / 1e6
    if max_side > BUDGET["max_texture_side"]:
        r.add("B1", "HARD", "/", f"текстура {max_side}px > {BUDGET['max_texture_side']}", "Режь или уменьшай")
    if mb > BUDGET["pack_mb_hard"]:
        r.add("B2", "HARD", "/", f"пак {mb:.1f} МБ — тяжело для телефона", "Сожми (pngquant/oxipng)")
    elif mb > BUDGET["pack_mb_soft"]:
        r.add("B2", "SOFT", "/", f"пак {mb:.1f} МБ", "Сожми PNG")
    if nfiles > BUDGET["files_soft"]:
        r.add("B3", "SOFT", "/", f"{nfiles} отдельных PNG = {nfiles} загрузок на телефоне (правило ВИДИМО И ЭКОНОМНО)",
              "Добавь упакованные атласы packed/<группа>.png + координаты в манифест; исходники оставь")
    r.stats = {"files": nfiles, "megabytes": round(mb, 2), "assets": len(assets), "entities": len(anims),
               "max_texture_side": max_side, "bot_version": BOT_VERSION}
    return r


def to_markdown(r: Report) -> str:
    hard, soft = r.hard(), [i for i in r.items if i["severity"] == "SOFT"]
    out = [f"# Проверка ассет-пака — оценка {r.score()}/100",
           f"HARD: **{len(hard)}** · SOFT: **{len(soft)}** · бот v{BOT_VERSION}",
           f"Статистика: {json.dumps(r.stats, ensure_ascii=False)}", ""]
    by = defaultdict(list)
    for i in r.items:
        by[(i["severity"], i["id"], i["problem"].split(" ")[0])].append(i)
    for sev in ("HARD", "SOFT"):
        out.append(f"## {sev}")
        groups = defaultdict(list)
        for i in r.items:
            if i["severity"] == sev:
                groups[(i["id"], i["fix"])].append(i)
        for (cid, fix), lst in sorted(groups.items()):
            out.append(f"- **{cid}** ×{len(lst)} — {lst[0]['problem']}  ")
            out.append(f"  где: {', '.join(x['where'] for x in lst[:6])}{' …' if len(lst) > 6 else ''}  ")
            out.append(f"  исправить: {fix}")
        out.append("")
    return "\n".join(out)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("pack")
    ap.add_argument("--out", default=None)
    ap.add_argument("--strict", action="store_true", help="SOFT тоже валит проверку")
    a = ap.parse_args(argv)
    src = Path(a.pack)
    tmp = None
    if src.suffix == ".zip":
        tmp = tempfile.mkdtemp()
        with zipfile.ZipFile(src) as z:
            for n in z.namelist():
                if n.startswith("/") or ".." in Path(n).parts:
                    print("Опасный путь в ZIP:", n, file=sys.stderr)
                    return 2
            z.extractall(tmp)
        src = Path(tmp)
        subs = [p for p in src.iterdir() if p.is_dir()]
        if not any((src / n).exists() for n in ("atlas.json", "manifest.json", "pack.json")) and len(subs) == 1:
            src = subs[0]
    if not src.is_dir():
        print("Нет папки пака:", src, file=sys.stderr)
        return 2
    r = check(src)
    md = to_markdown(r)
    js = {"score": r.score(), "hard": len(r.hard()), "items": r.items, "stats": r.stats}
    if a.out:
        o = Path(a.out)
        o.mkdir(parents=True, exist_ok=True)
        (o / "REPORT.md").write_text(md, "utf-8")
        (o / "report.json").write_text(json.dumps(js, ensure_ascii=False, indent=1), "utf-8")
    print(md)
    if r.hard() or (a.strict and r.items):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
