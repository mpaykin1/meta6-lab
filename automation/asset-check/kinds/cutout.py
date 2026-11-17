"""Cutout 2.5D: validate source-art masks, hierarchy and asynchronous joint motion.

The author originals remain under reference/ and are never modified.
No technique is banned: geometry is judged on actual colored source pixels.
"""
from __future__ import annotations

import json
from pathlib import Path, PurePosixPath

from PIL import Image, ImageDraw, ImageStat

NAME = "cutout"
ORDER = 5
REPO = Path(__file__).resolve().parents[3]


def detect(root: Path) -> bool:
    return (root / "cutout.json").is_file()


def source_path(root: Path, source: str) -> Path | None:
    if not isinstance(source, str) or not source or "\\" in source:
        return None
    parts = PurePosixPath(source).parts
    if any(p in ("", ".", "..") for p in parts):
        return None
    if source.startswith("reference/"):
        if not source.startswith("reference/vorona-v-tumane/"):
            return None
        candidate, base = REPO / source, REPO
    else:
        candidate, base = root / source, root
    if not candidate.resolve().is_relative_to(base.resolve()):
        return None
    return candidate


def polygon_area(poly: list) -> float:
    return abs(sum(a[0] * b[1] - b[0] * a[1]
                   for a, b in zip(poly, poly[1:] + poly[:1]))) / 2


def check(root: Path, report) -> set[str]:
    covered = {"cutout.json", "index.html", "scene.js", "pack.json"}
    try:
        doc = json.loads((root / "cutout.json").read_text("utf-8"))
    except (OSError, ValueError) as exc:
        report.add("CJ1", "HARD", "cutout.json", f"broken rig manifest: {exc}",
                   "Restore valid JSON with format mg-cutout/1")
        return covered
    if doc.get("format") != "mg-cutout/1" or not isinstance(doc.get("characters"), list):
        report.add("CJ1", "HARD", "cutout.json", "wrong format or characters",
                   "Set format=mg-cutout/1 and a characters list")
        return covered
    for character in doc["characters"]:
        name = str(character.get("id", "")).strip()
        if not name:
            report.add("CJ1", "HARD", "cutout.json", "character without id", "Add id")
            continue
        report.asset_ids.add(name)
        dim = character.get("dimensions", [])
        if (not isinstance(dim, list) or len(dim) != 2
                or any(type(n) is not int or n <= 0 or n > 4096 for n in dim)):
            report.add("CJ1", "HARD", name, "invalid image dimensions",
                       "Give positive [width, height] no larger than 4096")
            continue
        file = source_path(root, character.get("source", ""))
        if file is None or not file.is_file():
            report.add("CJ5", "HARD", name, "missing or unsafe owner-art source",
                       "Point at a real file inside the pack or the immutable owner reference")
            continue
        if file.is_relative_to(root):
            covered.add(file.relative_to(root).as_posix())
        try:
            with Image.open(file) as im:
                image_dimensions = im.size
                alpha = im.convert("RGBA").getchannel("A")
        except (OSError, ValueError) as exc:
            report.add("CJ5", "HARD", name, f"source not readable: {exc}",
                       "Use a valid PNG or GIF with transparent pixels")
            continue
        if image_dimensions != tuple(dim):
            report.add("CJ5", "HARD", name, "source dimensions do not match manifest",
                       "Use actual width and height, do not stretch the reference")
        parts = character.get("parts", [])
        if not isinstance(parts, list) or len(parts) < 6:
            report.add("CJ2", "HARD", name, "fewer than six independently hinged parts",
                       "Body, head and moving wing/limb sections must be separate")
            continue
        names = [p.get("id") for p in parts if isinstance(p, dict)]
        if len(set(names)) != len(parts) or not all(isinstance(x, str) and x for x in names):
            report.add("CJ2", "HARD", name, "duplicate/empty joint ids",
                       "Give every joint a unique name")
            continue
        by_name = {p["id"]: p for p in parts}
        phases = set()
        for part in parts:
            key = f"{name}/{part['id']}"
            parent = part.get("parent")
            if parent is not None and (parent not in by_name or parent == part["id"]):
                report.add("CJ3", "HARD", key, "joint has missing or self parent",
                           "Set a valid parent joint id; body root has null parent")
            ancestors, current = set(), part["id"]
            while current and current in by_name:
                if current in ancestors:
                    report.add("CJ3", "HARD", key, "cyclic joint hierarchy",
                               "Use an acyclic bone tree")
                    break
                ancestors.add(current)
                current = by_name[current].get("parent")
            polygon, pivot = part.get("poly", []), part.get("pivot", [])
            if (not isinstance(polygon, list) or len(polygon) < 3
                    or not isinstance(pivot, list) or len(pivot) != 2
                    or any(not isinstance(pt, list) or len(pt) != 2 for pt in polygon)
                    or any(not isinstance(n, (float, int)) for pt in polygon for n in pt)
                    or any(not isinstance(n, (float, int)) for n in pivot)):
                report.add("CJ2", "HARD", key, "missing mask polygon or pivot",
                           "Record three or more finite points and one valid pivot")
                continue
            if (polygon_area(polygon) < 30 or
                    any(not (0 <= x < dim[0] and 0 <= y < dim[1]) for x, y in polygon)
                    or not (0 <= pivot[0] < dim[0] and 0 <= pivot[1] < dim[1])):
                report.add("CJ2", "HARD", key, "degenerate or out-of-bounds cutout",
                           "Keep a meaningful polygon and pivot inside the original image")
                continue
            mask = Image.new("L", image_dimensions, 0)
            ImageDraw.Draw(mask).polygon([tuple(pt) for pt in polygon], fill=255)
            fill = ImageStat.Stat(alpha, mask=mask).mean[0] / 255
            if fill < 0.06:
                report.add("CJ6", "HARD", key, "mask contains almost no original-art pixels",
                           "Align the mask to the real painted silhouette")
            motion = part.get("motion", {})
            amplitude = motion.get("amplitude", 0)
            lag = motion.get("lag", 0)
            if not (isinstance(amplitude, (int, float)) and amplitude > 0
                    and isinstance(lag, (int, float)) and lag >= 0):
                report.add("CJ4", "HARD", key, "no joint movement or invalid phase",
                           "Use nonzero smooth joint motion and a nonnegative phase lag")
            phases.add(lag)
        if len(phases) <= 1:
            report.add("CJ4", "HARD", name, "every limb has identical phase",
                       "Offset the phase of child joints to make a traveling movement")
    # A registered asset is not delivered merely by naming it in ZAKAZ/pack.json.
    # Check that the declared visual or audio module contains an implementation hook.
    manifest = root / "pack.json"
    if manifest.is_file():
        try:
            assets = json.loads(manifest.read_text("utf-8")).get("assets", {})
        except (OSError, ValueError):
            assets = {}
        if isinstance(assets, dict):
            scene = (root / "scene.js").read_text("utf-8") if (root / "scene.js").is_file() else ""
            for asset_id, meta in assets.items():
                if not isinstance(meta, dict):
                    report.add("CJ8", "HARD", asset_id, "invalid asset metadata",
                               "Describe source, role and label")
                    continue
                source_name = str(meta.get("source", ""))
                if source_name.startswith("asset-packs/incoming/vorona-v-tumane/"):
                    source_name = source_name.rsplit("/", 1)[-1]
                if source_name.startswith("reference/vorona-v-tumane/"):
                    source_name = "scene.js"
                if source_name not in ("scene.js", "creatures.js", "audio.js", "cutout.json"):
                    report.add("CJ8", "HARD", asset_id, "asset source outside allowed implementation",
                               "Link the actual scene, cutout, creature or audio implementation")
                    continue
                path = root / source_name
                if not path.is_file():
                    report.add("CJ8", "HARD", asset_id, "asset implementation missing",
                               "Create the declared module")
                    continue
                implementation = path.read_text("utf-8", errors="replace")
                visual_hook = (
                    f"objects.{asset_id}" in implementation or
                    f"id:'{asset_id}'" in implementation or
                    f"spectral('{asset_id}'" in implementation or
                    f"'{asset_id}'" in implementation and "createCreatures" in implementation
                )
                rig_hook = source_name == "cutout.json" and asset_id in ("crow_wings", "crow_tail", "stalker_limbs") and (
                    "buildCrowCutout" in scene and "buildCutoutRig" in scene
                )
                audio_hook = source_name == "audio.js" and (
                    "createSoundscape" in implementation and f"id==='{asset_id}'" in scene
                )
                if not (visual_hook or rig_hook or audio_hook):
                    report.add("CJ8", "HARD", asset_id, "asset listed but no drawing or sound hook",
                               "Implement the declared effect in the actual referenced module")
                else:
                    report.asset_ids.add(asset_id)
    return covered
