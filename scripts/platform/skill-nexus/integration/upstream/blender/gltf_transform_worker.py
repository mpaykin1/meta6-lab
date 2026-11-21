#!/usr/bin/env python3
"""Opt-in glTF Transform postpass. Calls the official CLI; never modifies source GLB.

No glTF parsing dependencies: reads the JSON chunk of GLB 2.0 to protect
animation channels, bone mappings, skinned meshes and morph targets.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

MAGIC = b"glTF"
JSON_CHUNK = 0x4E4F534A
GEOMETRY_EXTENSIONS = {"KHR_draco_mesh_compression", "EXT_meshopt_compression"}


def read_glb(path: Path) -> dict:
    if path.suffix.lower() != ".glb":
        raise ValueError("Only binary .glb input is supported")
    with path.open("rb") as f:
        header = f.read(12)
        if len(header) != 12:
            raise ValueError("Truncated GLB header")
        magic, version, declared = struct.unpack("<4sII", header)
        if magic != MAGIC or version != 2 or declared != path.stat().st_size:
            raise ValueError("Invalid GLB v2 header or size")
        chunk_header = f.read(8)
        if len(chunk_header) != 8:
            raise ValueError("Missing JSON chunk")
        json_length, chunk_type = struct.unpack("<II", chunk_header)
        if chunk_type != JSON_CHUNK or json_length < 2 or json_length > declared - 20:
            raise ValueError("Invalid GLB JSON chunk")
        payload = f.read(json_length)
        if len(payload) != json_length:
            raise ValueError("Truncated GLB JSON chunk")
    return json.loads(payload.decode("utf-8").rstrip(" \t\r\n\0"))


def describe_asset(doc: dict) -> dict:
    """Semantic comparisons don't rely on mutable glTF index numbering."""
    nodes = doc.get("nodes", [])
    skins = doc.get("skins", [])
    meshes = doc.get("meshes", [])
    animations = doc.get("animations", [])

    def node_label(index: int) -> str:
        node = nodes[index]
        # Empty names are supported. Transform is conservative: renumbering an
        # unnamed animated bone must cause rejection rather than silent drift.
        return node.get("name") or f"@node{index}"

    skin_roots = []
    for skin in skins:
        joints = skin.get("joints", [])
        skin_roots.append(tuple(sorted(node_label(i) for i in joints)))

    mesh_links = []
    for i, node in enumerate(nodes):
        if "mesh" not in node:
            continue
        mesh = meshes[node["mesh"]]
        morph_counts = tuple(len(p.get("targets", [])) for p in mesh.get("primitives", []))
        mesh_links.append((node_label(i), "skin" in node, morph_counts))

    clip_data = []
    for idx, animation in enumerate(animations):
        samplers = animation.get("samplers", [])
        channels = []
        for channel in animation.get("channels", []):
            t = channel.get("target", {})
            target_node = t.get("node")
            name = node_label(target_node) if target_node is not None else "@extension"
            sampler_index = channel.get("sampler")
            interp = samplers[sampler_index].get("interpolation", "LINEAR") if sampler_index is not None else ""
            channels.append((name, t.get("path", ""), interp))
        clip_data.append((animation.get("name", f"@clip{idx}"), tuple(sorted(channels))))
    clip_data.sort()

    # glTF Transform may de-duplicate material/mesh records but should not
    # replace skinned nodes, remove morph targets or remap animations.
    return {
        "skin_bones": sorted(skin_roots),
        "mesh_links": sorted(mesh_links),
        "animations": clip_data,
        "scene_count": len(doc.get("scenes", [])),
        "default_scene": doc.get("scene"),
    }


def resolve_cli(requested: str | None) -> str:
    if requested:
        executable = Path(requested).expanduser().resolve()
        if not executable.is_file():
            raise FileNotFoundError(f"glTF Transform executable not found: {executable}")
        return str(executable)
    env = os.environ.get("GLTF_TRANSFORM_BIN")
    if env:
        return resolve_cli(env)
    executable = shutil.which("gltf-transform")
    if not executable:
        raise FileNotFoundError("glTF Transform not installed. Run: npm install -g @gltf-transform/cli@4.5.1")
    return executable


def pipeline(mode: str) -> list[tuple[str, list[str]]]:
    steps = [("dedup", []), ("prune", [])]
    if mode in {"webp", "webp-meshopt"}:
        steps.append(("webp", ["--slots", "baseColor"]))
    if mode in {"meshopt", "webp-meshopt"}:
        steps.append(("meshopt", ["--level", "medium"]))
    if mode == "draco":
        steps.append(("draco", ["--method", "edgebreaker"]))
    return steps


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Safe glTF Transform post-processing for game GLB")
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--mode", choices=["safe", "webp", "meshopt", "draco", "webp-meshopt"], default="safe")
    p.add_argument("--gltf-transform-bin", default=None)
    p.add_argument("--timeout", type=int, default=600)
    p.add_argument("--overwrite", action="store_true")
    args = p.parse_args(argv)
    source = Path(args.input).expanduser().resolve()
    output = Path(args.output).expanduser().resolve()
    if not source.is_file() or source.suffix.lower() != ".glb":
        p.error("Input must be an existing .glb file")
    if output.suffix.lower() != ".glb" or source == output:
        p.error("Output must be a different .glb file")
    if output.exists() and not args.overwrite:
        p.error("Output already exists. Specify --overwrite.")
    if not 10 <= args.timeout <= 7200:
        p.error("--timeout must be 10..7200 seconds")

    try:
        executable = resolve_cli(args.gltf_transform_bin)
        original = read_glb(source)
        signature = describe_asset(original)
        with tempfile.TemporaryDirectory(prefix="gltf-transform-", dir=str(output.parent) if output.parent.is_dir() else None) as workdir:
            current = source
            for i, (operation, options) in enumerate(pipeline(args.mode), start=1):
                candidate = Path(workdir) / f"phase-{i}.glb"
                cmd = [executable, operation, str(current), str(candidate), *options]
                done = subprocess.run(cmd, text=True, capture_output=True, timeout=args.timeout, check=False)
                if done.returncode != 0:
                    raise RuntimeError(f"glTF Transform '{operation}' failed ({done.returncode}): {done.stderr[-900:]}")
                if not candidate.is_file() or candidate.stat().st_size < 20:
                    raise RuntimeError(f"glTF Transform '{operation}' produced no valid GLB")
                current = candidate

            final = read_glb(current)
            final_signature = describe_asset(final)
            if signature != final_signature:
                differences = [k for k in signature if signature[k] != final_signature[k]]
                raise RuntimeError("Protected GLB structure changed: " + ", ".join(differences))

            original_ext = set(original.get("extensionsUsed", []))
            final_ext = set(final.get("extensionsUsed", []))
            newly_compressed = (final_ext - original_ext) & GEOMETRY_EXTENSIONS
            allowed = {"meshopt": {"EXT_meshopt_compression"}, "draco": {"KHR_draco_mesh_compression"},
                       "webp-meshopt": {"EXT_meshopt_compression"}}.get(args.mode, set())
            if not newly_compressed <= allowed:
                raise RuntimeError("Unexpected geometry compression extension: " + str(sorted(newly_compressed)))
            if args.mode == "safe" and "EXT_texture_webp" in (final_ext - original_ext):
                raise RuntimeError("Unexpected WebP texture conversion in safe mode")

            selected = current
            if args.mode == "safe" and current.stat().st_size >= source.stat().st_size:
                # Avoid a bigger download for a no-op safe optimization.
                selected = source
            output.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(prefix="gltf-write-",suffix=".glb",dir=output.parent,delete=False) as staging:
                staging_path = Path(staging.name)
            try:
                shutil.copyfile(selected, staging_path)
                if not output.exists() or args.overwrite:
                    os.replace(staging_path, output)
                else:
                    raise RuntimeError("Output appeared during processing. Refusing overwrite.")
            finally:
                staging_path.unlink(missing_ok=True)
        before = source.stat().st_size
        after = output.stat().st_size
        print(f"[glTF Transform] {args.mode}: {before} -> {after} bytes; "
              f"{(1-after/before)*100:.1f}% smaller; skins/animations/morphs preserved")
        if args.mode in {"meshopt", "webp-meshopt"}:
            print("[Three.js] EXT_meshopt_compression requires GLTFLoader.setMeshoptDecoder(MeshoptDecoder).")
        elif args.mode == "draco":
            print("[Three.js] KHR_draco_mesh_compression requires DRACOLoader.")
        return 0
    except (OSError, ValueError, RuntimeError, IndexError, KeyError, TypeError, subprocess.TimeoutExpired) as exc:
        print("[glTF Transform] ERROR:", str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
