"""Вид пака: model3d — 3D-модели .glb / .gltf (GRAF: GLB/glTF фабрика). Проверки M1–M11.

Только стандартная библиотека + numpy/Pillow: GLB разбирается вручную (заголовок, JSON-чанк, BIN-чанк).
"""
from __future__ import annotations

import io
import json
import struct
from pathlib import Path

from PIL import Image

NAME = "model3d"
ORDER = 30
EXT = (".glb", ".gltf")
TRI_SOFT, TRI_HARD = 20_000, 100_000       # треугольников на модель для телефона
MB_SOFT, MB_HARD = 5.0, 20.0
COMP = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def detect(root: Path) -> bool:
    return any(p.suffix.lower() in EXT for p in root.rglob("*") if p.is_file())


def parse(path: Path):
    """→ (gltf_json, bin_bytes|None, ошибка|None)."""
    data = path.read_bytes()
    if path.suffix.lower() == ".gltf":
        try:
            return json.loads(data.decode("utf-8")), None, None
        except Exception as e:  # noqa
            return None, None, f"JSON не читается: {e}"
    if len(data) < 20 or data[:4] != b"glTF":
        return None, None, "нет подписи glTF — файл битый или не GLB"
    ver, length = struct.unpack_from("<II", data, 4)
    if ver != 2:
        return None, None, f"версия glTF {ver}, нужна 2"
    if length != len(data):
        return None, None, f"длина в заголовке {length} ≠ размер файла {len(data)} (обрезан)"
    off, js, binc = 12, None, None
    while off + 8 <= len(data):
        clen, ctype = struct.unpack_from("<II", data, off)
        chunk = data[off + 8: off + 8 + clen]
        if ctype == 0x4E4F534A:
            try:
                js = json.loads(chunk.decode("utf-8"))
            except Exception as e:  # noqa
                return None, None, f"JSON-чанк не читается: {e}"
        elif ctype == 0x004E4942:
            binc = chunk
        off += 8 + clen
    if js is None:
        return None, None, "нет JSON-чанка"
    return js, binc, None


def buffer_bytes(g, i, path: Path, binc):
    b = g.get("buffers", [])[i]
    uri = b.get("uri")
    if uri is None:
        return binc
    if uri.startswith("data:"):
        import base64
        return base64.b64decode(uri.split(",", 1)[1])
    p = path.parent / uri
    return p.read_bytes() if p.exists() else None


def view_bytes(g, vi, path, binc):
    v = g["bufferViews"][vi]
    buf = buffer_bytes(g, v.get("buffer", 0), path, binc)
    if buf is None:
        return None
    o = v.get("byteOffset", 0)
    return buf[o:o + v["byteLength"]]


def check(root: Path, r) -> set:
    covered = set()
    for path in sorted(p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in EXT):
        rel = path.relative_to(root).as_posix()
        covered.add(rel)
        mb = path.stat().st_size / 1e6
        g, binc, err = parse(path)
        if err:
            r.add("M1", "HARD", rel, err, "Экспортируй заново в glTF 2.0 binary (.glb)")
            continue
        if mb > MB_HARD:
            r.add("M8", "HARD", rel, f"{mb:.1f} МБ — тяжело для телефона", "Сожми: meshopt/draco, текстуры ≤1024, webp/ktx2")
        elif mb > MB_SOFT:
            r.add("M8", "SOFT", rel, f"{mb:.1f} МБ", "Сожми геометрию и текстуры")
        # внешние файлы
        for kind in ("buffers", "images"):
            for it in g.get(kind, []):
                uri = it.get("uri")
                if uri and not uri.startswith("data:"):
                    ext = path.parent / uri
                    if not ext.exists():
                        r.add("M1", "HARD", rel, f"нет внешнего файла {uri}", "Положи файл рядом или встрои в .glb")
                    elif not ext.resolve().is_relative_to(root.resolve()):
                        r.add("M1", "HARD", rel, f"путь {uri} выходит за пределы пака", "Только файлы внутри пака")
                    else:
                        covered.add(ext.relative_to(root).as_posix())
        meshes = g.get("meshes", [])
        if not meshes or not g.get("nodes"):
            r.add("M2", "HARD", rel, "нет мешей или узлов — модель пустая", "Экспортируй с геометрией")
            continue
        if not g.get("scenes"):
            r.add("M2", "SOFT", rel, "нет scenes — некоторые загрузчики ничего не покажут", "Добавь scene по умолчанию")
        acc = g.get("accessors", [])
        tris, no_norm, mins, maxs = 0, 0, [], []
        for m in meshes:
            for pr in m.get("primitives", []):
                att = pr.get("attributes", {})
                mode = pr.get("mode", 4)
                if "indices" in pr:
                    n = acc[pr["indices"]]["count"]
                elif "POSITION" in att:
                    n = acc[att["POSITION"]]["count"]
                else:
                    n = 0
                if mode == 4:
                    tris += n // 3
                if "NORMAL" not in att and "KHR_materials_unlit" not in json.dumps(g.get("materials", [])):
                    no_norm += 1
                if "POSITION" in att:
                    a = acc[att["POSITION"]]
                    if "min" in a and "max" in a:
                        mins.append(a["min"])
                        maxs.append(a["max"])
                    else:
                        r.add("M5", "SOFT", rel, "у POSITION нет min/max (рамка модели)", "Экспортёр должен писать min/max")
        if tris > TRI_HARD:
            r.add("M3", "HARD", rel, f"{tris} треугольников — слишком много для телефона", f"Упрости до ≤{TRI_SOFT} или сделай LOD")
        elif tris > TRI_SOFT:
            r.add("M3", "SOFT", rel, f"{tris} треугольников", f"Сделай LOD или упрости до ≤{TRI_SOFT}")
        if tris == 0:
            r.add("M3", "HARD", rel, "0 треугольников", "Нужна треугольная геометрия (mode 4)")
        if no_norm:
            r.add("M9", "SOFT", rel, f"{no_norm} частей без нормалей — свет ляжет плоско", "Экспортируй с нормалями")
        if mins:
            lo = [min(m[i] for m in mins) for i in range(3)]
            hi = [max(m[i] for m in maxs) for i in range(3)]
            size = [hi[i] - lo[i] for i in range(3)]
            if max(size) <= 0:
                r.add("M5", "HARD", rel, "размер модели 0", "Проверь геометрию")
            elif max(size) > 1000:
                r.add("M5", "HARD", rel, f"модель {max(size):.0f} единиц — масштаб перепутан (см вместо м?)",
                      "Единица = метр; персонаж ≈ 1–3, здание ≈ 3–30")
            elif max(size) < 0.01:
                r.add("M5", "HARD", rel, f"модель {max(size):.4f} единиц — микроскопическая", "Единица = метр")
            if size[1] > 0 and abs(lo[1]) > 0.1 * size[1] and not g.get("skins"):
                r.add("M10", "SOFT", rel, f"низ модели на y={lo[1]:.2f}, а не на 0 — будет висеть или тонуть",
                      "Опорная точка (pivot) — у основания, y=0")
        # текстуры
        for i, im in enumerate(g.get("images", [])):
            raw = None
            try:
                if "bufferView" in im:
                    raw = view_bytes(g, im["bufferView"], path, binc)
                elif im.get("uri", "").startswith("data:"):
                    import base64
                    raw = base64.b64decode(im["uri"].split(",", 1)[1])
                elif im.get("uri") and (path.parent / im["uri"]).exists():
                    raw = (path.parent / im["uri"]).read_bytes()
                if raw is None:
                    continue
                w, h = Image.open(io.BytesIO(raw)).size
            except Exception as e:  # noqa
                r.add("M4", "HARD", rel, f"текстура {i} не читается: {e}", "Пересохрани текстуру PNG/JPG/WebP")
                continue
            if max(w, h) > 2048:
                r.add("M4", "HARD", rel, f"текстура {i} {w}x{h} > 2048", "≤2048, для телефона лучше ≤1024")
            if w & (w - 1) or h & (h - 1):
                r.add("M4", "SOFT", rel, f"текстура {i} {w}x{h} не степень двойки", "Стороны 64/128/256/512/1024")
        mats = g.get("materials", [])
        if len(mats) > 8:
            r.add("M7", "SOFT", rel, f"{len(mats)} материалов = {len(mats)}+ вызовов отрисовки", "Объедини материалы в атлас (≤8)")
        # анимации
        anims = g.get("animations", [])
        if g.get("skins") and not anims:
            r.add("M6", "HARD", rel, "есть скелет, но нет ни одной анимации", "Добавь idle, движение, атаку, урон, гибель")
        for a in anims:
            if not a.get("channels"):
                r.add("M6", "HARD", rel, f"анимация «{a.get('name', '?')}» пустая", "Запеки ключи в анимацию")
                continue
            dur = 0.0
            for s in a.get("samplers", []):
                inp = acc[s["input"]] if s.get("input") is not None and s["input"] < len(acc) else {}
                if inp.get("max"):
                    dur = max(dur, float(inp["max"][0]))
            if dur <= 0:
                r.add("M6", "HARD", rel, f"анимация «{a.get('name', '?')}» длиной 0 с", "Ключи на разных временах")
        names = [a.get("name", "").lower() for a in anims]
        if g.get("skins") and anims and not any("idle" in n or "breath" in n for n in names):
            r.add("M11", "SOFT", rel, "нет анимации покоя (idle) — персонаж замрёт как статуя", "Добавь idle с дыханием")
    r.stats["models3d"] = len([c for c in covered if c.endswith(EXT)])
    return covered
