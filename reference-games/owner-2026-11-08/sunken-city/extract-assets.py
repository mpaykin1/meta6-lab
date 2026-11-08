#!/usr/bin/env python3
"""Restore original GLB and PNG atlas assets from the owner's embedded HTML.
No dependencies. All binary data comes from the immutable source HTML parts.
"""
from __future__ import annotations
import base64, gzip, hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHOWCASE = ROOT / "sunken-city-showcase"
DEST = ROOT / "sunken-city"
EXPECTED_SOURCE_SHA256 = "431841ee19b61280f6d92d761f566abc30e6862af22c7a1672fbc983b2078116"
PARTS = [SHOWCASE / "parts" / f"{i:02d}.htmlpart" for i in range(1, 11)]


def main() -> None:
    source = b"\n".join(p.read_bytes() for p in PARTS)
    digest = hashlib.sha256(source).hexdigest()
    if digest != EXPECTED_SOURCE_SHA256:
        raise ValueError(f"Original HTML differs: {digest}")
    html = source.decode("utf-8")
    entries = []
    patterns = re.finditer(
        r'<script type="text/plain" id="pack:([^"]+)">([\s\S]*?)</script>',
        html,
    )
    for match in patterns:
        key, packed = match.groups()
        group, name = key.split("/", 1)
        if group in ("glb", "blocks"):
            data = gzip.decompress(base64.b64decode(packed))
            if data[:4] != b"glTF":
                raise ValueError(f"Not a GLB: {key}")
            subfolder = "3d/glb" if group == "glb" else "3d/blocks"
            target = DEST / subfolder / name.removesuffix(".json")
            target = target.with_suffix(".glb")
        elif group == "atlas":
            prefix = "data:image/png;base64,"
            if not packed.startswith(prefix):
                raise ValueError(f"Not a PNG data URI: {key}")
            data = base64.b64decode(packed[len(prefix):])
            if not data.startswith(b"\x89PNG\r\n\x1a\n"):
                raise ValueError(f"Invalid PNG: {key}")
            target = DEST / "atlases" / name
        else:
            raise ValueError(f"Unknown pack group: {group}")
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.read_bytes() != data:
            target.write_bytes(data)
        entries.append({
            "source": key,
            "path": target.relative_to(ROOT).as_posix(),
            "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
        })

    if sum(x["source"].startswith(("glb/", "blocks/")) for x in entries) != 114:
        raise ValueError("Expected 114 GLB files")
    if sum(x["source"].startswith("atlas/") for x in entries) != 12:
        raise ValueError("Expected 12 PNG atlas files")

    show = re.search(r'<script type="application/json" id="pack-show">([\s\S]*?)</script>', html)
    if show is None:
        raise ValueError("Missing original pack manifest")
    manifest = json.loads(show.group(1))
    (DEST / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    inventory = {
        "schema_version": 1,
        "original_html_sha256": digest,
        "source": "sunken-city-showcase/parts/01-10.htmlpart",
        "assets": entries,
        "total_glb": 114,
        "total_atlases": 12,
        "note": "Original extracted bytes. Full 1405-file ZIP contains additional standalone PNG, VOX, OBJ, MTL and scripts.",
    }
    (DEST / "pack-artifacts.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted {len(entries)} original assets")


if __name__ == "__main__":
    main()
