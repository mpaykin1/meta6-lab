#!/usr/bin/env python3
"""Restore original binary assets from author-owned plugin export archives.

Only explicitly listed original paths from original-assets.manifest.json are
written. Never synthesizes, redraws or substitutes an asset.

Example:
  python3 author-skills/import_original_assets.py \
    --archive voxel-atmosphere-engine=/tmp/voxel-atmosphere-engine.tar.gz \
    --archive casual-game-studio=/tmp/casual-game-studio.tar.gz \
    --archive voxel-game-creator=/tmp/voxel-game-creator.tar.gz
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import tarfile
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "original-assets.manifest.json"


def safe_member_name(raw: str) -> str | None:
    # Matching is based on exact relative suffix, not on extraction locations.
    norm = raw.replace("\\", "/").lstrip("./")
    path = PurePosixPath(norm)
    if not norm or norm.startswith("/") or ".." in path.parts:
        return None
    return str(path)


def get_archive_bytes(archive: Path, wanted: list[dict]) -> dict[str, bytes]:
    contents: dict[str, bytes] = {}
    if tarfile.is_tarfile(archive):
        with tarfile.open(archive, mode="r:*") as tf:
            members = [(safe_member_name(m.name), m) for m in tf.getmembers() if m.isfile() and not m.issym()]
            for entry in wanted:
                rel = entry["path"]
                matches = [(name, member) for name, member in members if name == rel or (name is not None and name.endswith("/" + rel))]
                if len(matches) != 1:
                    raise RuntimeError(f"{archive.name}: expected exactly 1 source for {rel}, found {len(matches)}")
                member = matches[0][1]
                if member.size != entry["size_bytes"]:
                    raise RuntimeError(f"{rel}: expected size {entry['size_bytes']}, archive has {member.size}")
                stream = tf.extractfile(member)
                if stream is None:
                    raise RuntimeError(f"Cannot open {rel} in {archive.name}")
                contents[rel] = stream.read()
    elif zipfile.is_zipfile(archive):
        with zipfile.ZipFile(archive) as zf:
            members = [(safe_member_name(info.filename), info) for info in zf.infolist() if not info.is_dir()]
            for entry in wanted:
                rel = entry["path"]
                matches = [(name, member) for name, member in members if name == rel or (name is not None and name.endswith("/" + rel))]
                if len(matches) != 1:
                    raise RuntimeError(f"{archive.name}: expected exactly 1 source for {rel}, found {len(matches)}")
                member = matches[0][1]
                if member.file_size != entry["size_bytes"]:
                    raise RuntimeError(f"{rel}: expected size {entry['size_bytes']}, archive has {member.file_size}")
                contents[rel] = zf.read(member)
    else:
        raise RuntimeError(f"{archive}: not a tar/zip archive")
    return contents


def verify_signature(path: str, content: bytes) -> None:
    ext = PurePosixPath(path).suffix.lower()
    magic = {
        ".png": (b"\x89PNG\r\n\x1a\n",),
        ".glb": (b"glTF",),
        ".vrm": (b"glTF",),
        ".vox": (b"VOX ",),
        ".webp": (b"RIFF",),
        ".jpg": (b"\xff\xd8",),
        ".jpeg": (b"\xff\xd8",),
        ".gif": (b"GIF87a", b"GIF89a"),
    }
    choices = magic.get(ext)
    if choices and not any(content.startswith(x) for x in choices):
        raise RuntimeError(f"Invalid file signature for original asset {path}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Restore exact original plugin binary assets")
    parser.add_argument("--archive", action="append", default=[], metavar="SKILL=PATH",
                        help="Original plugin archive, repeat for each skill with binary assets")
    parser.add_argument("--check", action="store_true", help="Only show missing original assets")
    args = parser.parse_args()
    spec = json.loads(MANIFEST.read_text(encoding="utf-8"))["skills"]
    expected = [(name, a) for name, data in spec.items() for a in data["assets"]]
    if args.check:
        missing = [(name, a["path"]) for name, a in expected
                   if not (ROOT / name / a["path"]).is_file()
                   or (ROOT / name / a["path"]).stat().st_size != a["size_bytes"]]
        print(f"Original binary assets: {len(expected) - len(missing)}/{len(expected)} present")
        for name, path in missing:
            print(f"MISSING {name}/{path}")
        return 0 if not missing else 1

    archives: dict[str, Path] = {}
    for arg in args.archive:
        if "=" not in arg:
            parser.error("Use --archive SKILL=/absolute/path/to/current.tar.gz")
        name, path = arg.split("=", 1)
        if name not in spec:
            parser.error(f"Unknown skill: {name}")
        if name in archives:
            parser.error(f"Archive specified twice: {name}")
        archives[name] = Path(path).expanduser().resolve()
    required = {name for name, data in spec.items() if data["assets"]}
    missing_names = required - archives.keys()
    if missing_names:
        parser.error("Missing original archives: " + ", ".join(sorted(missing_names)))

    pending: list[tuple[Path, bytes, str]] = []
    for name in sorted(required):
        archive = archives[name]
        if not archive.is_file():
            raise FileNotFoundError(archive)
        data = get_archive_bytes(archive, spec[name]["assets"])
        for item in spec[name]["assets"]:
            rel = item["path"]
            raw = data[rel]
            if len(raw) != item["size_bytes"]:
                raise RuntimeError(f"Size mismatch: {name}/{rel}")
            verify_signature(rel, raw)
            target = (ROOT / name / rel).resolve()
            if not target.is_relative_to((ROOT / name).resolve()):
                raise RuntimeError(f"Unsafe target path: {rel}")
            pending.append((target, raw, hashlib.sha256(raw).hexdigest()))

    for target, raw, digest in pending:
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.is_file() and target.read_bytes() == raw:
            continue
        with tempfile.NamedTemporaryFile(dir=target.parent, prefix=".import-", delete=False) as tmp:
            tmp.write(raw)
            tmp_name = tmp.name
        os.replace(tmp_name, target)
    total = sum(len(raw) for _, raw, _ in pending)
    print(f"Restored {len(pending)} original binary assets ({total} bytes).")
    print("Review changed files, then commit them to the existing PR branch.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
