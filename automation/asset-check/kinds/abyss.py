"""Вид пака: abyss — ассеты ABYSS GLOW (abyss.md). REUSE: вызывает готовый automation/asset-quality/validate.py
без переписывания и переводит его замечания в формат бота (ID AB:<правило>)."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

NAME = "abyss"
ORDER = 6
VALIDATOR = Path(__file__).resolve().parents[2] / "asset-quality" / "validate.py"


def detect(root: Path) -> bool:
    p = root / "manifest.json"
    if not p.exists():
        return False
    try:
        d = json.loads(p.read_text("utf-8"))
    except Exception:  # noqa
        return False
    return isinstance(d, dict) and isinstance(d.get("sprites"), list)


def check(root: Path, r) -> set:
    if not VALIDATOR.exists():
        r.add("AB0", "HARD", "manifest.json", "нет automation/asset-quality/validate.py", "Верни валидатор ABYSS из main")
        return {"manifest.json"}
    spec = importlib.util.spec_from_file_location("abyss_validate", VALIDATOR)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    res = m.inspect(str(root), str(root / "manifest.json"))
    for it in res.get("issues", []):
        rule = it.get("rule", "?")
        r.add(f"AB:{rule}", "HARD", it.get("id", "manifest.json"), it.get("detail", rule),
              "Исправь по abyss.md (правило " + rule + ")")
    data = json.loads((root / "manifest.json").read_text("utf-8"))
    r.stats["abyss_sprites"] = res.get("checked", 0)
    return {"manifest.json"} | {e.get("file") for e in data.get("sprites", []) if isinstance(e, dict) and e.get("file")}
