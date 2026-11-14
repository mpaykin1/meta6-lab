"""PixelFX asset pack: verify MIT permissions, pinned originals and visible animations.

The pack only describes library files; original sources stay in shared/components.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

NAME = "pixelfx"
ORDER = 2
FORMAT = "pixelfx-pack/1"
HERE = Path(__file__).resolve().parent
REPO = Path(os.environ.get("ASSET_CHECK_REPO") or HERE.parents[2]).resolve()


def detect(root: Path) -> bool:
    f = root / "pack.json"
    if not f.exists():
        return False
    try:
        return json.loads(f.read_text("utf-8")).get("format") == FORMAT
    except (OSError, ValueError, AttributeError):
        return False


def check(root: Path, report) -> set:
    p = json.loads((root / "pack.json").read_text("utf-8"))
    covered = {"pack.json"}
    registry = json.loads((REPO / "integration/patch/REGISTRY.json").read_text("utf-8"))
    candidates = [
        x for x in registry.get("candidates", [])
        if x.get("id") == p.get("id") and x.get("decision") == "ALLOW"
    ]
    if len(candidates) != 1:
        report.add("PX1", "HARD", "pack.json", "Нет разрешённого источника",
                   "Добавь проверенную MIT запись в integration/patch/REGISTRY.json")
        return covered
    approved = candidates[0]
    c = REPO / approved["destination"]
    manifest = json.loads((c / "component.json").read_text("utf-8"))

    if p.get("license", {}).get("type") != "MIT" or not p.get("license", {}).get("commercial"):
        report.add("PX2", "HARD", "pack.json", "Коммерческая MIT лицензия не подтверждена",
                   "Используй оригинальную MIT лицензию и подтверждённое право коммерческого использования")

    if p.get("provenance", {}).get("commit") != manifest["source"]["commit"] or (
        p.get("provenance", {}).get("repository") != manifest["source"]["repository"]
    ):
        report.add("PX3", "HARD", "pack.json", "SHA или репозиторий не совпадают с исходником",
                   "Привяжи пакет к реальной версии upstream")

    registered_files = [x["path"] for x in approved["files"]]
    if sorted(p.get("files", [])) != sorted(registered_files):
        report.add("PX4", "HARD", "pack.json", "Опись файлов не совпадает с реестром",
                   "Сверь 20 оригинальных файлов по лицензированному реестру")

    if p.get("component") != approved["destination"].rstrip("/"):
        report.add("PX5", "HARD", "pack.json", "Компонент подменён или путь небезопасен",
                   "Укажи компонент из проверенного реестра")

    if any(item["severity"] == "HARD" and item["id"].startswith("PX") for item in report.items):
        return covered

    # Reuse the index's byte-hash, license and import-closure verification.
    node = shutil.which("node")
    if not node:
        report.add("PX6", "HARD", "/", "Невозможно проверить JS без Node.js",
                   "Запусти стандартную проверку в окружении Node.js")
        return covered
    for script in ["scripts/shared/build-index.mjs", "scripts/shared/verify-patch-pixelfx.mjs"]:
        args = [node, str(REPO / script)]
        if script.endswith("build-index.mjs"):
            args.append("--check")
        try:
            run = subprocess.run(args, cwd=REPO, capture_output=True, text=True, timeout=45)
            failed = run.returncode != 0
        except (OSError, subprocess.TimeoutExpired):
            failed = True
        if failed:
            report.add("PX7", "HARD", script, "Хеши, лицензии или анимации не проходят проверку",
                       "Исправь оригиналы, проверь реестр и повтори автоматическую проверку")
    report.stats["pixelfx_effects"] = len(manifest.get("effects", []))
    report.stats["pixelfx_import_files"] = len(registered_files)
    return covered
