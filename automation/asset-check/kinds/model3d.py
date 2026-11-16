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
        _check_mesh_quality(g, path, binc, root, rel, r)
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


def _accessor_array(g, accessor_id, path, binc, root):
    """Read a glTF 2 accessor, honoring bufferView strides and offsets.

    Sparse accessors intentionally remain unsupported: a partial read would
    misdiagnose legitimate geometry. No file outside the asset pack is opened.
    """
    import numpy as np

    types = {
        5120: "i1", 5121: "u1", 5122: "<i2",
        5123: "<u2", 5125: "<u4", 5126: "<f4",
    }
    try:
        a = g["accessors"][accessor_id]
        if "sparse" in a or "bufferView" not in a:
            return None
        count = a["count"]
        if not 0 <= count <= 300_000:
            return None
        view = g["bufferViews"][a["bufferView"]]
        b = g["buffers"][view.get("buffer", 0)]
        uri = b.get("uri")
        if uri and not uri.startswith("data:"):
            target = (path.parent / uri).resolve()
            if not target.is_relative_to(root.resolve()):
                return None
            if target.stat().st_size > 32_000_000:
                return None
        dtype = np.dtype(types[a["componentType"]])
        components = NCOMP[a["type"]]
        stride = view.get("byteStride", dtype.itemsize * components)
        offset = view.get("byteOffset", 0) + a.get("byteOffset", 0)
        if stride < components * dtype.itemsize or count * stride > 40_000_000:
            return None
        buf = buffer_bytes(g, view.get("buffer", 0), path, binc)
        if buf is None or count == 0:
            return None
        if offset < 0 or offset + (count - 1) * stride + components * dtype.itemsize > len(buf):
            return None
        return np.ndarray((count, components), dtype=dtype, buffer=buf,
                          offset=offset, strides=(stride, dtype.itemsize)).copy()
    except (KeyError, IndexError, ValueError, TypeError, OSError):
        return None


def _check_mesh_quality(g, path, binc, root, rel, report):
    """Professional geometry and material audit, on decoded triangles.

    Soft findings cover potentially intentional modelling choices. Hard
    findings are reserved for broken data or objectively unusable geometry.
    """
    import numpy as np

    stats = report.stats.setdefault("model3d_master", {
        "triangles_scanned": 0, "degenerate": 0, "nonmanifold_edges": 0,
        "inverted_normals": 0, "collapsed_uv": 0
    })
    material_list = g.get("materials", [])
    pack = root / "pack.json"
    role = ""
    if pack.is_file():
        try:
            meta = json.loads(pack.read_text("utf-8"))
            role = meta.get("model3d", {}).get("role", "")
        except (ValueError, AttributeError):
            pass
    for material_id, material in enumerate(material_list):
        pbr = material.get("pbrMetallicRoughness", {})
        for field in ("metallicFactor", "roughnessFactor"):
            value = pbr.get(field, 1)
            if not isinstance(value, (int, float)) or not 0 <= value <= 1:
                report.add("M20", "HARD", f"{rel}:material[{material_id}]",
                           f"{field} вне диапазона 0–1", "Исправь физически некорректный PBR-параметр")

    bounds = []
    for mesh_id, mesh in enumerate(g.get("meshes", [])):
        for prim_id, primitive in enumerate(mesh.get("primitives", [])):
            if primitive.get("mode", 4) != 4:
                continue
            where = f"{rel}:mesh[{mesh_id}]:primitive[{prim_id}]"
            attr = primitive.get("attributes", {})
            if "POSITION" not in attr:
                continue
            pos = _accessor_array(g, attr["POSITION"], path, binc, root)
            if pos is None or pos.shape[1] != 3:
                # External dependencies, compressed or sparse accessors are
                # not proof of faulty topology; existing M1/M2 still apply.
                continue
            if not np.isfinite(pos).all():
                report.add("M12", "HARD", where, "NaN/Infinity в координатах вершин",
                           "Исправить геометрию до экспорта")
                continue
            bounds.append((pos.min(axis=0), pos.max(axis=0)))
            if "indices" in primitive:
                ix = _accessor_array(g, primitive["indices"], path, binc, root)
                if ix is None:
                    continue
                indices = ix.ravel().astype(np.int64)
            else:
                indices = np.arange(pos.shape[0], dtype=np.int64)
            if indices.size % 3:
                report.add("M12", "HARD", where, "Количество индексов не кратно трём",
                           "Исправить список треугольников")
                continue
            if indices.size > 900_000:
                continue
            if indices.size and (indices.min() < 0 or indices.max() >= len(pos)):
                report.add("M12", "HARD", where, "Индекс вершины вне диапазона",
                           "Проверить индексы меша при экспорте")
                continue
            tris = indices.reshape((-1, 3))
            if len(tris) == 0:
                continue
            v0, v1, v2 = pos[tris[:, 0]], pos[tris[:, 1]], pos[tris[:, 2]]
            ab, ac, bc = v1 - v0, v2 - v0, v2 - v1
            normal = np.cross(ab, ac)
            area = np.linalg.norm(normal, axis=1)
            diagonal = float(np.linalg.norm(pos.max(axis=0) - pos.min(axis=0)))
            degenerate = area < max(diagonal * diagonal * 1e-10, 1e-14)
            deg_count = int(degenerate.sum())
            stats["triangles_scanned"] += len(tris)
            stats["degenerate"] += deg_count
            if deg_count > max(2, len(tris) * .01):
                severity = "HARD" if deg_count > max(10, len(tris) * .10) else "SOFT"
                report.add("M13", severity, where, f"{deg_count} вырожденных граней",
                           "Убрать нулевые треугольники и пересобрать сетку")
            if "NORMAL" in attr:
                normals = _accessor_array(g, attr["NORMAL"], path, binc, root)
                if normals is not None and normals.shape == pos.shape:
                    averaged = normals[tris].mean(axis=1)
                    dot = (normal * averaged).sum(axis=1)
                    normal_length = np.linalg.norm(averaged, axis=1)
                    opposite = (~degenerate) & (dot < -.25 * area * normal_length)
                    wrong = int(opposite.sum())
                    stats["inverted_normals"] += wrong
                    if wrong > max(3, len(tris) * .03):
                        report.add("M14", "SOFT", where, f"{wrong} граней с обратным шейдингом",
                                   "Проверить winding, hard edges и нормали после модификаторов")
            if "TEXCOORD_0" in attr:
                uv = _accessor_array(g, attr["TEXCOORD_0"], path, binc, root)
                if uv is not None and uv.shape == (len(pos), 2):
                    uv0, uv1, uv2 = uv[tris[:, 0]], uv[tris[:, 1]], uv[tris[:, 2]]
                    cross_uv = ((uv1[:, 0] - uv0[:, 0]) * (uv2[:, 1] - uv0[:, 1]) -
                                (uv1[:, 1] - uv0[:, 1]) * (uv2[:, 0] - uv0[:, 0]))
                    collapsed = (~degenerate) & (np.abs(cross_uv) < 1e-10)
                    bad_uv = int(collapsed.sum())
                    stats["collapsed_uv"] += bad_uv
                    if bad_uv > max(3, len(tris) * .02):
                        report.add("M15", "SOFT", where, f"{bad_uv} UV-граней без площади",
                                   "Развернуть UV-острова и удалить растяжение текстуры")
            mat_idx = primitive.get("material")
            if isinstance(mat_idx, int) and 0 <= mat_idx < len(material_list):
                mat = material_list[mat_idx]
                pbr = mat.get("pbrMetallicRoughness", {})
                used_maps = [
                    pbr.get("baseColorTexture"), pbr.get("metallicRoughnessTexture"),
                    mat.get("normalTexture"), mat.get("occlusionTexture"),
                    mat.get("emissiveTexture")
                ]
                for texture in filter(None, used_maps):
                    uv_index = texture.get("texCoord", 0)
                    if "TEXCOORD_" + str(uv_index) not in attr:
                        report.add("M16", "HARD", where, "Текстура используется без UV-канала",
                                   f"Добавить TEXCOORD_{uv_index} или отключить текстуру")
                        break
            # Position welding ignores deliberate duplicated UV seam vertices.
            # Non-manifold is diagnostic, not a blanket ban on open surfaces.
            if len(tris) <= 80_000:
                tolerance = max(diagonal * 1e-6, 1e-8)
                welded = np.round(pos / tolerance).astype(np.int64)
                _, vertex_ids = np.unique(welded, axis=0, return_inverse=True)
                weld_tris = vertex_ids[tris]
                edges = np.concatenate((weld_tris[:, [0, 1]],
                                        weld_tris[:, [1, 2]],
                                        weld_tris[:, [2, 0]]))
                edges.sort(axis=1)
                _, count = np.unique(edges, axis=0, return_counts=True)
                nonmanifold = int((count > 2).sum())
                stats["nonmanifold_edges"] += nonmanifold
                if nonmanifold:
                    report.add("M17", "SOFT", where, f"{nonmanifold} рёбер имеют более двух граней",
                               "Проверить наложения, дубли поверхностей и соединения оболочек")
            lengths = np.stack(((ab * ab).sum(axis=1), (ac * ac).sum(axis=1),
                                (bc * bc).sum(axis=1)), axis=1)
            smallest = np.maximum(lengths.min(axis=1), 1e-20)
            skinny = int(((lengths.max(axis=1) / smallest > 1000) & ~degenerate).sum())
            if skinny > max(10, len(tris) * .12):
                report.add("M18", "SOFT", where, "Много сильно вытянутых треугольников",
                           "Перераспределить плотность сетки у суставов и силуэтных границ")
            if "WEIGHTS_0" in attr:
                weights = _accessor_array(g, attr["WEIGHTS_0"], path, binc, root)
                if weights is not None and weights.shape[0] == len(pos):
                    weights = weights.astype(np.float64)
                    wa = g["accessors"][attr["WEIGHTS_0"]]
                    if wa.get("normalized") and wa["componentType"] != 5126:
                        weights /= 255 if wa["componentType"] == 5121 else 65535
                    if int((np.abs(weights.sum(axis=1) - 1) > .08).sum()) > len(pos) * .02:
                        report.add("M19", "SOFT", where, "Веса костей не нормализованы",
                                   "Нормализовать skin weights и проверить деформации")
    if bounds and role in ("character", "creature"):
        minimum = np.min([b[0] for b in bounds], axis=0)
        maximum = np.max([b[1] for b in bounds], axis=0)
        size = maximum - minimum
        if size[0] > 0 and size[2] / size[0] < .065:
            report.add("M21", "HARD", rel, "Персонаж почти плоский в боковом ракурсе",
                       "Добавить толщину корпусу, голове и суставам")
