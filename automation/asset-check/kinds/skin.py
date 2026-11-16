"""Вид пака: skin — анимированные скины meta6-skin/1 (rules/01-stil-i-grafika/SKINY.md, S1–S12).

ID проверок совпадают с SKINY.md, с приставкой K: KS1…KS12.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

NAME = "skin"
ORDER = 5
REQ_KINDS = ["plate", "gear", "cable", "arc", "slit", "core", "lens", "orb", "bolt", "panel", "piston"]
BONES = ["body", "head", "armL", "armR", "legL", "legR"]


def detect(root: Path) -> bool:
    return (root / "skin.json").exists()


def hexrgb(c):
    return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))


def check(root: Path, r) -> set:
    try:
        s = json.loads((root / "skin.json").read_text("utf-8"))
    except Exception as e:  # noqa
        r.add("KS1", "HARD", "skin.json", f"не читается: {e}", "Исправь JSON")
        return {"skin.json"}
    covered = {"skin.json", "README.md"}
    if s.get("format") != "meta6-skin/1":
        r.add("KS1", "HARD", "skin.json", f"format={s.get('format')!r}", 'format = "meta6-skin/1"')
    if s.get("name") != root.name and root.name not in ("x", "tmp"):
        r.add("KS1", "SOFT", "skin.json", f"name={s.get('name')!r} ≠ папке {root.name}", "name = имя папки")
    for f in ("reference.png", "preview.png"):
        if not (root / f).exists():
            r.add("KS2", "HARD", f, "нет файла", f"Положи {f} (SKINY §1)")
        covered.add(f)
    parts = s.get("parts", [])
    files = [t.get("file") for t in s.get("textures", [])] + [t.get("emit") for t in s.get("textures", [])] + \
            [p.get("file") for p in parts]
    files = [f for f in files if f]
    for f in files:
        if not (root / f).exists():
            r.add("KS2", "HARD", f, "указан в skin.json, но файла нет", "Добавь файл или убери ссылку")
        covered.add(f)
    imgs = [p for p in root.rglob("*.png")]
    for p in imgs:
        rel = p.relative_to(root).as_posix()
        if rel not in covered:
            r.add("KS2", "HARD", rel, "лишняя картинка, не описана в skin.json", "Удали или опиши")
            covered.add(rel)
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() not in (".png", ".json", ".md"):
            r.add("KS2", "HARD", p.relative_to(root).as_posix(), "запрещённый тип файла в скине", "Только png/json/md")
    total = sum(p.stat().st_size for p in root.rglob("*") if p.is_file())
    if total > 3e6 or len(imgs) > 60:
        r.add("KS2", "HARD", "/", f"{total / 1e6:.1f} МБ, {len(imgs)} картинок", "Пакет ≤ 3 МБ, картинок ≤ 60")
    pal = [hexrgb(c) for c in s.get("palette", []) if isinstance(c, str) and len(c) == 7]
    if not 6 <= len(pal) <= 16:
        r.add("KS5", "HARD", "skin.json", f"палитра {len(pal)} цветов", "6–16 цветов, снятых с эскиза")
    additive = {k for k, m in s.get("materials", {}).items() if m.get("blend") == "additive"}
    for f in files:
        p = root / f
        if not p.exists():
            continue
        im = Image.open(p)
        w, h = im.size
        if im.mode not in ("RGBA", "P", "LA"):
            r.add("KS3", "HARD", f, f"нет альфа-канала ({im.mode})", "PNG RGBA")
        if f.startswith("textures/") and (w & (w - 1) or h & (h - 1) or max(w, h) > 256):
            r.add("KS3", "HARD", f, f"{w}x{h}: не степень двойки или > 256", "64/128/256")
        a = np.asarray(im.convert("RGBA"))
        if f.startswith(("parts/", "sheets/")) and any(a[y, x, 3] for y, x in ((0, 0), (0, -1), (-1, 0), (-1, -1))):
            r.add("KS3", "HARD", f, "углы непрозрачные", "Фон детали прозрачный")
        op = a[a[..., 3] > 0]
        if len(op):
            if len({tuple(c) for c in op[:, :3]}) > 48:
                r.add("KS4", "HARD", f, "больше 48 цветов — не пиксель-арт", "≤ 48 цветов")
            mat = next((pp.get("material") for pp in parts if pp.get("file") == f), None)
            if mat not in additive:
                semi = float(((a[..., 3] > 0) & (a[..., 3] < 255)).sum()) / len(op)
                if semi > 0.05:
                    r.add("KS4", "HARD", f, f"{semi:.0%} полупрозрачных пикселей", "≤ 5 % (кроме additive)")
                if pal:
                    d = np.abs(op[:, None, :3].astype(int) - np.array(pal)[None]).max(-1).min(1)
                    if float((d <= 28).mean()) < 0.9:
                        r.add("KS5", "HARD", f, f"{float((d > 28).mean()):.0%} пикселей вне палитры", "≥ 90 % в пределах 28 от палитры")
    kinds = Counter(p.get("kind") for p in parts)
    layers = Counter(p.get("layer") for p in parts)
    animated = [p for p in parts if p.get("anim")]
    if len(parts) < 30 or len(animated) < 24 or len(kinds) < 8:
        r.add("KS6", "HARD", "parts", f"деталей {len(parts)}, анимированных {len(animated)}, видов {len(kinds)}",
              "≥ 30 деталей, ≥ 24 анимированных, ≥ 8 разных kind")
    for lay, mn in (("3d", 6), ("2.5d", 8), ("2d", 6)):
        if layers[lay] < mn:
            r.add("KS6", "HARD", "parts", f"слой {lay}: {layers[lay]} < {mn}", f"Добавь деталей слоя {lay}")
    miss = [k for k in REQ_KINDS if k not in kinds]
    if miss:
        r.add("KS7", "HARD", "parts", f"нет обязательных kind: {miss}", "Нарисуй их по эскизу")
    bones = Counter(p.get("bone") for p in parts)
    weak = [b for b in BONES if bones[b] < 2]
    if weak:
        r.add("KS8", "HARD", "parts", f"кости с < 2 деталями: {weak}", "Каждой кости ≥ 2 детали")
    back = sum(1 for p in parts if (p.get("offset") or [0, 0, 0])[2] > 0)
    if back < 4:
        r.add("KS8", "HARD", "parts", f"сзади {back} деталей", "Сзади ≥ 4 — герой красив со спины")
    anims = [a for p in parts for a in p.get("anim", [])]
    ty = Counter(a.get("type") for a in anims)
    need = {"rotate": 3, "chain": 2, "flipbook": 3}
    for t, mn in need.items():
        if ty[t] < mn:
            r.add("KS9", "HARD", "anim", f"{t}: {ty[t]} < {mn}", f"Добавь анимаций {t}")
    sl = sum(1 for a in anims if (a.get("speedLink") or 0) > 0)
    pl = sum(1 for a in anims if (a.get("pulseLink") or 0) > 0)
    add = sum(1 for p in parts if p.get("material") in additive)
    if sl < 4 or pl < 3 or add < 5:
        r.add("KS9", "HARD", "anim", f"speedLink {sl}/4, pulseLink {pl}/3, additive {add}/5", "Добавь реакцию на бег, вспышку и свечение")
    pairs = [(a.get("freq"), a.get("phase")) for a in anims]
    if pairs and len(set(pairs)) / len(pairs) < 0.9:
        r.add("KS10", "HARD", "anim", "детали двигаются синхронно (одинаковые freq+phase)", "Сдвинь фазы: волна по телу, не всё разом")
    for b in s.get("hideBase", []):
        if not any(p.get("bone") == b and p.get("layer") == "3d" for p in parts):
            r.add("KS11", "HARD", b, "скрытая кость без 3D-детали — дыра в теле", "Дай ей ≥ 1 деталь layer 3d")
    for p in parts:
        for a in p.get("anim", []):
            if a.get("type") != "flipbook" or not p.get("file") or not (root / p["file"]).exists():
                continue
            fr = int(a.get("frames", 0))
            arr = np.asarray(Image.open(root / p["file"]).convert("RGBA"))
            if fr < 6 or arr.shape[1] % fr:
                r.add("KS12", "HARD", p["file"], f"флипбук: frames={fr}, ширина {arr.shape[1]}", "≥ 6 кадров, ширина = frames × кадр")
                continue
            fw = arr.shape[1] // fr
            frs = [arr[:, i * fw:(i + 1) * fw].tobytes() for i in range(fr)]
            if any(frs[i] == frs[i + 1] for i in range(fr - 1)):
                r.add("KS12", "HARD", p["file"], "одинаковые кадры подряд", "Каждый кадр разный")
    r.stats["skin_parts"] = len(parts)
    return covered
