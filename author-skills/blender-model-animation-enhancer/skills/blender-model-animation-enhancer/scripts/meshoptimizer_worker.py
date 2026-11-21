#!/usr/bin/env python3
"""Safe, optional gltfpack integration (official zeux/meshoptimizer executable).

The source is never overwritten. A processed GLB is accepted only when the
protected identity, skeleton, animation and material signatures still match.
If gltfpack changes unrecognized scene data, processing fails closed.
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from gltf_transform_worker import read_glb, describe_asset

MODES = ("safe", "compressed", "webp", "ktx2", "simplify")
# No codec dependencies in the default profile; extra codecs are opt-in.
ALLOWED_NEW_EXTENSIONS = {
    "safe": set(),
    "compressed": {"EXT_meshopt_compression", "KHR_mesh_quantization", "KHR_texture_transform"},
    "webp": {"EXT_texture_webp", "KHR_mesh_quantization", "KHR_texture_transform"},
    "ktx2": {"KHR_texture_basisu", "KHR_mesh_quantization", "KHR_texture_transform"},
    "simplify": set(),
}
SUPPORTED_ORIGINAL = {
    "KHR_lights_punctual", "KHR_materials_anisotropy", "KHR_materials_clearcoat",
    "KHR_materials_diffuse_transmission", "KHR_materials_dispersion",
    "KHR_materials_emissive_strength", "KHR_materials_ior",
    "KHR_materials_iridescence", "KHR_materials_pbrSpecularGlossiness",
    "KHR_materials_sheen", "KHR_materials_specular",
    "KHR_materials_transmission", "KHR_materials_unlit", "KHR_materials_variants",
    "KHR_materials_volume", "KHR_mesh_quantization", "KHR_meshopt_compression",
    "KHR_texture_basisu", "KHR_texture_transform", "EXT_mesh_gpu_instancing",
    "EXT_meshopt_compression", "EXT_texture_webp",
}


def find_gltfpack(requested: str | None) -> str:
    path = requested or os.environ.get("GLTFPACK_BIN") or shutil.which("gltfpack")
    if not path:
        raise FileNotFoundError("Official gltfpack missing; download from https://github.com/zeux/meshoptimizer/releases")
    if shutil.which(path):
        return str(shutil.which(path))
    exe = Path(path).expanduser().resolve()
    if not exe.is_file():
        raise FileNotFoundError(f"gltfpack binary does not exist: {path}")
    return str(exe)


def label(nodes: list[dict], index: int) -> str:
    name = nodes[index].get("name")
    return name if name else f"@unnamed:{index}"


def protected_signature(doc: dict) -> dict:
    """Semantic identity information that gltfpack must not silently change."""
    nodes, meshes = doc.get("nodes", []), doc.get("meshes", [])
    materials = doc.get("materials", [])
    skins = doc.get("skins", [])
    parents = {}
    for i, node in enumerate(nodes):
        for c in node.get("children", []):
            parents[label(nodes, c)] = label(nodes, i)

    bone_links = []
    for skin in skins:
        joints = [label(nodes, i) for i in skin.get("joints", [])]
        # Detect collisions of named bones, which would make comparisons unsafe.
        if len(joints) != len(set(joints)):
            raise ValueError("Duplicate joint names or ambiguous joint indexes")
        bone_links.append(tuple(sorted((j, parents.get(j, "")) for j in joints)))

    mesh_materials = []
    for i, node in enumerate(nodes):
        if "mesh" not in node:
            continue
        mesh = meshes[node["mesh"]]
        primitives = []
        for prim in mesh.get("primitives", []):
            mat_idx = prim.get("material")
            mat_name = materials[mat_idx].get("name", f"@mat:{mat_idx}") if mat_idx is not None else "@none"
            attrs = prim.get("attributes", {})
            # Shape-key count and all skin-influence set names remain stable.
            weights = tuple(sorted(k for k in attrs if k.startswith("WEIGHTS_") or k.startswith("JOINTS_")))
            morph = tuple(tuple(sorted(t)) for t in prim.get("targets", []))
            primitives.append((mat_name, weights, morph, prim.get("mode", 4)))
        # Preserve material assignments per named object. Non-rigged scenes may
        # be merged, but any change to their identity fails closed as well.
        mesh_materials.append((label(nodes, i), "skin" in node, tuple(primitives)))

    material_contracts = []
    for index, mat in enumerate(materials):
        name = mat.get("name", f"@mat:{index}")
        pbr = mat.get("pbrMetallicRoughness", {})
        channels = tuple(key for key, source in (
            ("baseColor", pbr), ("metallicRoughness", pbr),
            ("normal", mat), ("occlusion", mat), ("emissive", mat),
        ) if key + "Texture" in source)
        material_contracts.append((name, channels, mat.get("alphaMode", "OPAQUE"),
                                   bool(mat.get("doubleSided", False)),
                                   tuple(sorted(k for k in mat.get("extensions", {})))))
    return {
        "identity": describe_asset(doc),
        "bones": sorted(bone_links),
        "mesh_materials": sorted(mesh_materials),
        "materials": sorted(material_contracts),
    }


def build_command(exe: str, source: Path, target: Path, args: argparse.Namespace) -> list[str]:
    # Preserving named nodes/materials and extras prevents gltfpack's usual
    # scene-flattening optimization from breaking game object references.
    cmd = [exe, "-i", str(source), "-o", str(target), "-kn", "-km", "-ke"]
    if args.mode == "safe":
        cmd += ["-noq"]
    elif args.mode == "compressed":
        cmd += ["-c"]
    elif args.mode == "webp":
        cmd += ["-tw"]
    elif args.mode == "ktx2":
        cmd += ["-tc"]
    elif args.mode == "simplify":
        cmd += ["-si", str(args.ratio), "-noq"]
    return cmd


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Safe gltfpack postpass for Three.js assets")
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--mode", choices=MODES, default="safe")
    p.add_argument("--ratio", type=float, default=0.8, help="Static mesh simplification ratio, 0.1..0.99")
    p.add_argument("--gltfpack-bin", default=None)
    p.add_argument("--timeout", type=int, default=600)
    p.add_argument("--overwrite", action="store_true")
    args = p.parse_args(argv)
    source = Path(args.input).expanduser().resolve()
    target = Path(args.output).expanduser().resolve()
    if not source.is_file() or source.suffix.lower() != ".glb":
        p.error("Input must be an existing .glb file")
    if target == source or target.suffix.lower() != ".glb":
        p.error("Output must be a different .glb file")
    if target.exists() and not args.overwrite:
        p.error("Output exists; pass --overwrite")
    if args.timeout < 10 or args.timeout > 7200:
        p.error("Timeout must be 10..7200 seconds")
    if args.mode == "simplify" and not (0.1 <= args.ratio <= 0.99):
        p.error("Simplification ratio must be 0.1..0.99")
    try:
        doc = read_glb(source)
        unknown = (set(doc.get("extensionsUsed", [])) | set(doc.get("extensionsRequired", []))) - SUPPORTED_ORIGINAL
        if unknown:
            raise ValueError("Unsupported original GLB extensions (unsafe to modify): " + ", ".join(sorted(unknown)))
        if args.mode == "simplify" and (doc.get("skins") or doc.get("animations") or any(
                p.get("targets") for mesh in doc.get("meshes", []) for p in mesh.get("primitives", []))):
            raise ValueError("Mesh simplification is restricted to static, unskinned, non-morph assets")
        before = protected_signature(doc)
        exe = find_gltfpack(args.gltfpack_bin)
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix="gltfpack-", dir=target.parent) as td:
            candidate = Path(td) / "optimized.glb"
            cmd = build_command(exe, source, candidate, args)
            completed = subprocess.run(cmd, capture_output=True, text=True, timeout=args.timeout, check=False)
            if completed.returncode != 0:
                raise RuntimeError(f"gltfpack failed ({completed.returncode}): {completed.stderr[-900:]}")
            if not candidate.is_file() or candidate.stat().st_size < 28:
                raise RuntimeError("gltfpack produced no valid GLB")
            opt_doc = read_glb(candidate)
            after = protected_signature(opt_doc)
            if before != after:
                keys = [k for k in before if before[k] != after[k]]
                raise RuntimeError("Optimized GLB changed protected scene data: " + ", ".join(keys))
            orig_ext = set(doc.get("extensionsUsed", [])) | set(doc.get("extensionsRequired", []))
            new_ext = set(opt_doc.get("extensionsUsed", [])) | set(opt_doc.get("extensionsRequired", []))
            lost = orig_ext - new_ext
            if lost:
                raise RuntimeError("Optimized GLB removed source extensions: " + ", ".join(sorted(lost)))
            added = new_ext - orig_ext
            if not added <= ALLOWED_NEW_EXTENSIONS[args.mode]:
                raise RuntimeError("Unexpected runtime extensions: " + ", ".join(sorted(added)))
            # A compression mode may shrink original textures; preserving appearance
            # must be confirmed visually. Never silently swap a user's character.
            selected = source if args.mode == "safe" and candidate.stat().st_size >= source.stat().st_size else candidate
            with tempfile.NamedTemporaryFile(prefix="gltfpack-verified-", suffix=".glb", dir=target.parent, delete=False) as f:
                atomic_file = Path(f.name)
            try:
                shutil.copyfile(selected, atomic_file)
                if target.exists() and not args.overwrite:
                    raise RuntimeError("Output appeared while processing; refusing overwrite")
                os.replace(atomic_file, target)
            finally:
                atomic_file.unlink(missing_ok=True)
        a, b = source.stat().st_size, target.stat().st_size
        print(f"[meshoptimizer] {args.mode}: {a} -> {b} bytes, {(1-b/a)*100:.1f}% smaller; protected GLB structure preserved")
        if args.mode == "compressed":
            print("[Three.js] Use GLTFLoader.setMeshoptDecoder(MeshoptDecoder).")
        elif args.mode == "webp":
            print("[Three.js] Model uses EXT_texture_webp; ensure browser WebP support.")
        elif args.mode == "ktx2":
            print("[Three.js] Use GLTFLoader.setKTX2Loader(KTX2Loader) with detectSupport(renderer).")
        return 0
    except (OSError, RuntimeError, ValueError, TypeError, IndexError, KeyError, subprocess.TimeoutExpired) as e:
        print("[meshoptimizer] ERROR:", e, file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
