"""Вид пака: images — картинки без манифеста (запасной вид, если другие не подошли). Проверки I1–I4."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

NAME = "images"
ORDER = 99
FALLBACK = True
EXT = (".png", ".webp", ".jpg", ".jpeg", ".gif")


def detect(root: Path) -> bool:
    return any(p.suffix.lower() in EXT for p in root.rglob("*") if p.is_file())


def check(root: Path, r) -> set:
    covered = set()
    r.add("A1", "HARD", "/", "картинки без манифеста — игра не знает кадры, якоря, назначение",
          "Добавь atlas.json по SPEC.md §1 (вид sprite2d) — тогда бот проверит всё полностью")
    for p in sorted(x for x in root.rglob("*") if x.is_file() and x.suffix.lower() in EXT):
        rel = p.relative_to(root).as_posix()
        covered.add(rel)
        try:
            im = Image.open(p)
            im.load()
        except Exception as e:  # noqa
            r.add("I2", "HARD", rel, f"не читается: {e}", "Пересохрани PNG")
            continue
        w, h = im.size
        if max(w, h) > 2048:
            r.add("I3", "HARD", rel, f"{w}x{h} > 2048", "Уменьши или разрежь")
        a = np.asarray(im.convert("RGBA"))
        if not (a[..., 3] > 0).any():
            r.add("I4", "HARD", rel, "картинка полностью прозрачная", "Нарисуй содержимое")
        if p.suffix.lower() in (".jpg", ".jpeg") and "background" not in rel and "bg" not in rel:
            r.add("I3", "SOFT", rel, "JPG без прозрачности для спрайта", "Спрайты — PNG с альфой")
    return covered
