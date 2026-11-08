#!/usr/bin/env python3
"""Extract exact original PNG bytes and sprites from the approved Pod i Nad reference.

Run from repository root: python3 scripts/asset-library/extract-pod-i-nad.py
Requires Pillow only for atlas crops: python3 -m pip install Pillow
Never edits the original HTML. Fails closed on source checksum changes.
"""
from __future__ import annotations
import base64
import hashlib
import io
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "reference/sumerek-golden/pod-i-nad-68b2ecd3.html"
OUT = ROOT / "shared/components/pod-i-nad"
EXPECTED = "91642018b3e589173171340298f72320f747d3b401021a939030f6f922ede5e5"
PREFIX = "data:image/png;base64,"

def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()

def safe_id(value: str) -> str:
    if not re.fullmatch(r"[A-Za-z0-9_-]+", str(value)):
        raise ValueError("Unsafe asset ID: " + str(value))
    return str(value)

def main() -> None:
    raw = SOURCE.read_bytes()
    if digest(raw) != EXPECTED:
        raise RuntimeError("Original reference SHA-256 mismatch; extraction aborted")
    text = raw.decode("utf-8")
    match = re.search(r"^const ASSETS = (\{.*\});\s*$", text, re.MULTILINE)
    if not match:
        raise RuntimeError("Original ASSETS JSON declaration not found")
    assets = json.loads(match.group(1))
    from PIL import Image
    records = []
    hashes = {}
    files = {}
    def write_png(asset_id: str, uri: str, rel: str) -> None:
        if not isinstance(uri, str) or not uri.startswith(PREFIX):
            raise ValueError("Expected original embedded PNG for " + asset_id)
        blob = base64.b64decode(uri[len(PREFIX):], validate=True)
        if blob[:8] != b"\x89PNG\r\n\x1a\n":
            raise ValueError("Invalid PNG: " + asset_id)
        sha = digest(blob)
        with Image.open(io.BytesIO(blob)) as im:
            im.verify()
        if sha in hashes:
            records.append({"id": asset_id, "alias_of": hashes[sha], "sha256": sha,
                            "visual_origin": "approved-reference"})
            return
        target = OUT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(blob)
        hashes[sha] = asset_id
        files[asset_id] = target
        records.append({"id": asset_id, "path": rel, "format": "png",
                        "bytes": len(blob), "sha256": sha,
                        "visual_origin": "approved-reference", "status": "READY"})
    for key, rel in {
        "atlas": "textures/atlas.png", "weapons": "textures/weapons.png",
        "water": "textures/water.png", "coin": "sprites/ui/coin.png",
        "hearts": "sprites/ui/hearts.png", "hero": "sprites/heroes/hero.png"
    }.items():
        write_png(key, assets[key], rel)
    for name, uri in assets["heroes"].items():
        write_png("hero_" + safe_id(name), uri,
                  "sprites/heroes/" + safe_id(name) + ".png")
    def crop(source_id: str, box: tuple[int, int, int, int], rel: str,
             record_id: str) -> None:
        with Image.open(files[source_id]) as source:
            source = source.convert("RGBA")
            x0, y0, x1, y1 = box
            if not (0 <= x0 < x1 <= source.width and 0 <= y0 < y1 <= source.height):
                raise ValueError("Crop outside original atlas: " + record_id)
            tile = source.crop(box)
            target = OUT / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            tile.save(target, format="PNG")
            payload = target.read_bytes()
            records.append({"id": record_id, "path": rel, "format": "png",
                            "width": tile.width, "height": tile.height,
                            "sha256": digest(payload), "status": "READY",
                            "visual_origin": "approved-reference",
                            "derived_from": source_id, "source_rect": list(box)})
    with Image.open(files["atlas"]) as im:
        grid_x, grid_y = assets["atlasGrid"]
        if im.width % grid_x or im.height % grid_y:
            raise ValueError("Atlas grid is not integral")
        w, h = im.width // grid_x, im.height // grid_y
        for i, name in enumerate(assets["atlasNames"]):
            if i >= grid_x * grid_y:
                raise ValueError("Atlas names exceed cells")
            name = safe_id(name)
            x, y = i % grid_x * w, i // grid_x * h
            crop("atlas", (x, y, x + w, y + h),
                 "textures/tiles/" + name + ".png", "tile/" + name)
    weapon_meta = assets["wmeta"]["weapons"]
    for name, item in weapon_meta.items():
        name = safe_id(name)
        x, y, w, h = item["cell"]
        crop("weapons", (x, y, x + w, y + h),
             "sprites/weapons/" + name + ".png", "weapon/" + name)
    metadata = {
        "schema_version": 1, "source_reference": str(SOURCE.relative_to(ROOT)),
        "source_sha256": EXPECTED, "visual_origin": "approved-reference",
        "atlas_grid": assets["atlasGrid"], "atlas_names": assets["atlasNames"],
        "weapon_metadata": assets["wmeta"], "assets": records
    }
    (OUT / "sprites.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    print("Extracted original PNG resources and crops:", len(records))

if __name__ == "__main__":
    main()
