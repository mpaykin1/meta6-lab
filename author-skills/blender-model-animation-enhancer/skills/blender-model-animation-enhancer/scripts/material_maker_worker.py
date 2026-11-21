#!/usr/bin/env python3
"""Use official Material Maker for PBR texture export; Blender only applies maps.

Material Maker is an external native/Godot executable; no generator is emulated.
All stages are opt-in; original model is never overwritten.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


def blender_binary(explicit: str | None) -> str:
    if explicit:
        p = Path(explicit).expanduser().resolve()
        if not p.is_file():
            raise FileNotFoundError(f"Blender missing: {p}")
        return str(p)
    # Run enhancer's standard platform-aware Blender locator.
    from run_enhancer import find_blender
    path = find_blender()
    if not path:
        raise FileNotFoundError("Blender missing; set BLENDER_BIN")
    return path


def mm_binary(explicit: str | None) -> str:
    candidate = explicit or os.environ.get("MATERIAL_MAKER_BIN")
    if candidate:
        p = Path(candidate).expanduser().resolve()
        if not p.is_file():
            raise FileNotFoundError(f"Material Maker executable missing: {p}")
        return str(p)
    for name in ("material_maker", "material-maker", "MaterialMaker", "Material Maker"):
        p = shutil.which(name)
        if p:
            return p
    raise FileNotFoundError("Material Maker missing; install official application or set MATERIAL_MAKER_BIN")


def run_material_maker(executable: str, ptex: Path, dest: Path, size: int, timeout: int) -> None:
    # Official project documentation: material_maker --export-material --target <engine> -o <path> <input>
    # GLTF/Plane profile yields packed ORM texture (R=AO, G=roughness, B=metallic),
    # which Blender can reuse for an actual target object without exporting the demo plane.
    command = [executable, "--export-material", "--target", "GLTF/Plane",
               "--output-dir", str(dest), "--output-file", "mm_pbr",
               "--size", str(size), str(ptex)]
    result = subprocess.run(command, timeout=timeout, capture_output=True, text=True,
                            check=False, cwd=str(dest))
    if result.returncode:
        raise RuntimeError(f"Material Maker exited with {result.returncode}: {result.stderr[-1100:]}\n{result.stdout[-1100:]}")
    if not any(dest.glob("*.png")) and not any(dest.glob("*.exr")):
        raise RuntimeError("Material Maker finished without PBR maps; check .ptex material export profiles")
    print("[material-maker] texture export completed:", [p.name for p in dest.iterdir() if p.is_file()])


def main() -> int:
    p = argparse.ArgumentParser(description="Material Maker -> Blender PBR -> GLB/BLEND")
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    choice = p.add_mutually_exclusive_group(required=True)
    choice.add_argument("--material-ptex", help="Material Maker .ptex source")
    choice.add_argument("--material-textures-dir", help="Existing exported PBR textures")
    p.add_argument("--material-object", required=True, help="Exact mesh object name to receive new material")
    p.add_argument("--material-slot", type=int, default=0)
    p.add_argument("--material-size", type=int, default=1024)
    p.add_argument("--material-maker-bin", help="Official Material Maker executable")
    p.add_argument("--blender-bin", help="Installed Blender executable")
    p.add_argument("--material-name", default="MaterialMaker_PBR")
    p.add_argument("--mm-timeout", type=int, default=600)
    p.add_argument("--overwrite", action="store_true")
    args = p.parse_args()
    src, dst = Path(args.input).expanduser().resolve(), Path(args.output).expanduser().resolve()
    if not src.is_file():
        p.error("Input model missing")
    if src.suffix.lower() not in {".blend", ".glb", ".gltf", ".fbx", ".obj"}:
        p.error("Unsupported input format")
    if dst.suffix.lower() not in {".blend", ".glb"}:
        p.error("Output must be .blend or .glb")
    if src == dst or (dst.exists() and not args.overwrite):
        p.error("Never overwrite input; --overwrite required for existing output")
    if not args.material_object.strip():
        p.error("--material-object must identify the exact object")
    if args.material_slot < 0 or args.material_slot > 64:
        p.error("Invalid --material-slot")
    if args.material_size not in (256, 512, 1024, 2048, 4096):
        p.error("Material map size must be 256/512/1024/2048/4096")
    if args.mm_timeout < 30 or args.mm_timeout > 3600:
        p.error("--mm-timeout must be 30..3600")
    blender = blender_binary(args.blender_bin)
    dst.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="material-maker-pbr-") as td:
        if args.material_ptex:
            ptex = Path(args.material_ptex).expanduser().resolve()
            if ptex.suffix.lower() != ".ptex" or not ptex.is_file():
                p.error("--material-ptex must be an existing .ptex file")
            maps_dir = Path(td) / "maps"
            maps_dir.mkdir()
            run_material_maker(mm_binary(args.material_maker_bin), ptex, maps_dir,
                               args.material_size, args.mm_timeout)
        else:
            maps_dir = Path(args.material_textures_dir).expanduser().resolve()
            if not maps_dir.is_dir():
                p.error("--material-textures-dir must be an existing directory")
        script = Path(__file__).with_name("material_maker_blender.py")
        cmd = [blender, "--background", "--factory-startup", "--python-exit-code", "3",
               "--python", str(script), "--", "--input", str(src), "--output", str(dst),
               "--maps-dir", str(maps_dir), "--material-object", args.material_object,
               "--material-slot", str(args.material_slot), "--material-name", args.material_name]
        if args.overwrite:
            cmd.append("--overwrite")
        ret = subprocess.run(cmd, check=False).returncode
        if ret:
            return ret
    if not dst.is_file() or dst.stat().st_size < 128:
        raise RuntimeError("Expected Blender GLB/BLEND output missing")
    print("[material-maker] finished:", dst)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.TimeoutExpired) as exc:
        print(f"[material-maker] ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
