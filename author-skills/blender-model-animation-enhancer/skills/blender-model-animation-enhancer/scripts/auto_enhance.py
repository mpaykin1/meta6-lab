#!/usr/bin/env python3
"""Non-destructive 3D asset processing, executed by Blender's bundled Python.

Requires a separate Blender installation (bpy). No generic AI upscaling,
autorigging, character replacement, or invented animation is performed.
"""
from __future__ import annotations

import argparse
import os
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def parse_args():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser(description="Blender scene to game-ready GLB")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--repair-static", action="store_true")
    parser.add_argument("--smooth-static", action="store_true")
    parser.add_argument("--polish-motion", action="store_true")
    parser.add_argument("--pymeshlab-analyze", action="store_true", help="Analyze geometry with PyMeshLab, without changing meshes")
    parser.add_argument("--pymeshlab-clean-static", action="store_true", help="Clean only static meshes with no vulnerable attributes")
    parser.add_argument("--pymeshlab-python", default=None, help="Separate Python with installed PyMeshLab")
    parser.add_argument("--instant-retopo-static", action="store_true", help="Opt-in Instant Meshes field-aligned retopology, unrigged geometry-only objects")
    parser.add_argument("--instant-meshes-bin", default=None, help="Native Instant Meshes executable")
    parser.add_argument("--instant-faces", type=int, default=0, help="Desired face count; 0=auto half input triangles (min 100)")
    parser.add_argument("--merge-distance", type=float, default=0.00001)
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args(args)


def import_asset(bpy, source: Path):
    suffix = source.suffix.lower()
    if suffix == ".blend":
        bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False)
        return
    # An isolated factory scene means imported content is the only exported content.
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    if suffix in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=str(source))
    elif suffix == ".fbx":
        bpy.ops.import_scene.fbx(filepath=str(source))
    elif suffix == ".obj":
        bpy.ops.wm.obj_import(filepath=str(source))
    else:
        raise ValueError("Unsupported input format: " + suffix)


def is_protected_mesh(obj):
    """Do not alter mesh topology on anything that may have deformation data."""
    if obj.type != "MESH":
        return True
    mesh = obj.data
    if (mesh.shape_keys is not None or len(obj.vertex_groups) > 0
            or obj.parent and obj.parent.type == "ARMATURE"):
        return True
    if mesh.library is not None or mesh.users > 1:
        return True
    return any(mod.type in {"ARMATURE", "MESH_DEFORM", "SURFACE_DEFORM"}
               for mod in obj.modifiers)



def is_pymeshlab_safe_to_replace(obj):
    """Only geometry-only single-user meshes; all other meshes are inspect-only."""
    if is_protected_mesh(obj) or len(obj.modifiers):
        return False
    mesh = obj.data
    if (len(obj.material_slots) or len(mesh.uv_layers) or
            len(mesh.color_attributes) or
            mesh.shape_keys is not None or len(obj.vertex_groups)):
        return False
    # Generic mesh attributes such as sharp_edge, crease_edge, sculpt masks,
    # custom normals, and arbitrary authored data are not roundtrippable.
    intrinsic = {"position", ".edge_verts", ".corner_vert", ".corner_edge", "material_index"}
    if any(attr.name not in intrinsic for attr in mesh.attributes):
        return False
    if hasattr(mesh, "has_custom_normals") and mesh.has_custom_normals:
        return False
    smooth_flags = {poly.use_smooth for poly in mesh.polygons}
    return len(smooth_flags) <= 1


def run_pymeshlab(bpy, obj, python_executable, clean=False):
    """Mesh → JSON geometry → standalone PyMeshLab → validated Blender mesh.

    Blender and PyMeshLab use independent Python environments, avoiding bpy
    module / Qt / binary wheels conflicts. Local coordinates are preserved.
    """
    mesh = obj.data
    if mesh is None or not len(mesh.polygons):
        return
    mesh.calc_loop_triangles()
    vertices = [list(v.co) for v in mesh.vertices]
    triangles = [list(tri.vertices) for tri in mesh.loop_triangles]
    if not triangles:
        return
    safe = is_pymeshlab_safe_to_replace(obj)
    apply_clean = bool(clean and safe)
    if clean and not safe:
        print(f"[pymeshlab] inspect-only (protected materials/UVs/rig/attributes): {obj.name}")
    with tempfile.TemporaryDirectory(prefix="blender-pml-") as temp:
        source, target = Path(temp)/"input.json", Path(temp)/"output.json"
        source.write_text(json.dumps({"vertices": vertices, "faces": triangles}), encoding="utf-8")
        worker = Path(__file__).with_name("pymeshlab_worker.py")
        command = [python_executable, str(worker), "--input", str(source), "--output", str(target)]
        if apply_clean:
            command.append("--clean")
        proc = subprocess.run(command, capture_output=True, text=True, timeout=240, check=False)
        if proc.returncode != 0 or not target.is_file():
            raise RuntimeError(f"PyMeshLab subprocess failed for {obj.name}: {proc.stderr[-1200:]}")
        result = json.loads(target.read_text(encoding="utf-8"))
    print(f"[pymeshlab] {obj.name}: {result['original']} -> {result['cleaned']} applied={apply_clean}")
    if not apply_clean:
        return
    new_verts = result["vertices"]
    new_faces = result["faces"]
    if not new_faces or not new_verts or len(new_faces) > len(triangles):
        raise RuntimeError("PyMeshLab returned invalid or expanded topology")
    # Only replace when there is a measurable cleanup benefit. Otherwise
    # keep the original Blender mesh untouched, including normals/shading.
    if len(new_verts) == len(vertices) and len(new_faces) == len(triangles):
        return
    new_mesh = bpy.data.meshes.new(mesh.name + "_cleaned")
    try:
        new_mesh.from_pydata(new_verts, [], new_faces)
        new_mesh.validate(verbose=False)
        new_mesh.update()
        smooth = bool(len(mesh.polygons) and mesh.polygons[0].use_smooth)
        for poly in new_mesh.polygons:
            poly.use_smooth = smooth
        old_name = mesh.name
        obj.data = new_mesh
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
        new_mesh.name = old_name
    except Exception:
        if new_mesh.users == 0:
            bpy.data.meshes.remove(new_mesh)
        raise



def run_instant_retopology(bpy, obj, binary, face_target=0):
    """PyMeshLab-cleaned static geometry -> field-aligned mesh -> same Blender object.

    Refuse rigs, UVs, materials, special attributes and animated objects.
    Mesh is replaced only after worker validates geometry and bounds.
    """
    if not is_pymeshlab_safe_to_replace(obj) or obj.animation_data is not None or len(obj.constraints):
        print(f"[instant-meshes] protected; skipped: {obj.name}")
        return
    mesh = obj.data
    if not mesh or not len(mesh.polygons):
        return
    mesh.calc_loop_triangles()
    vertices = [list(v.co) for v in mesh.vertices]
    triangles = [list(tri.vertices) for tri in mesh.loop_triangles]
    if len(triangles) < 100:
        print(f"[instant-meshes] small (<100 triangles); skipped: {obj.name}")
        return
    with tempfile.TemporaryDirectory(prefix="blender-instant-") as folder:
        source, target = Path(folder)/"mesh.json", Path(folder)/"result.json"
        source.write_text(json.dumps({"vertices": vertices, "faces": triangles}), encoding="utf-8")
        worker = Path(__file__).with_name("instant_meshes_worker.py")
        command = [sys.executable, str(worker), "--input", str(source),
                   "--output", str(target), "--binary", binary,
                   "--target-faces", str(face_target)]
        completed = subprocess.run(command, capture_output=True, text=True,
                                   timeout=300, check=False)
        if completed.returncode != 0 or not target.is_file():
            raise RuntimeError(f"Instant Meshes failed for {obj.name}: {completed.stderr[-1400:]}")
        result = json.loads(target.read_text(encoding="utf-8"))
    # Preserve the exact object (its name, parent, transform and animation refs).
    # Intentionally excludes skinning/UV/material meshes: those require a separate
    # projection + re-rigging stage, never a silent topology substitution.
    new_mesh = bpy.data.meshes.new(mesh.name + "_instant_retopo")
    try:
        new_mesh.from_pydata(result["vertices"], [], result["faces"])
        if new_mesh.validate(verbose=False):
            raise RuntimeError("Blender reported invalid retopology geometry")
        new_mesh.update()
        old_name = mesh.name
        obj.data = new_mesh
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
        new_mesh.name = old_name
        print(f"[instant-meshes] {obj.name}: {result['source']} -> {result['result']}")
    except Exception:
        if obj.data == new_mesh:
            obj.data = mesh
        if new_mesh.users == 0:
            bpy.data.meshes.remove(new_mesh)
        raise


def repair_static_mesh(bpy, obj, merge_distance):
    import bmesh
    mesh = obj.data
    bm = bmesh.new()
    try:
        bm.from_mesh(mesh)
        before = len(bm.verts)
        # Uses UV-aware BMesh representation. Never performed on rigged meshes.
        bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=merge_distance)
        if bm.faces:
            bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
        bm.to_mesh(mesh)
        mesh.update()
        print(f"[enhancer] static mesh {obj.name}: verts {before} -> {len(mesh.vertices)}")
    finally:
        bm.free()


def iter_fcurves(action):
    """Support legacy action fcurves and Blender 4.4+ layered action strips."""
    yielded = set()
    try:
        for curve in action.fcurves:
            ptr = curve.as_pointer()
            if ptr not in yielded:
                yielded.add(ptr)
                yield curve
    except (AttributeError, RuntimeError):
        pass
    try:
        for layer in action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for curve in bag.fcurves:
                        ptr = curve.as_pointer()
                        if ptr not in yielded:
                            yielded.add(ptr)
                            yield curve
    except (AttributeError, RuntimeError):
        pass


def polish_motion(bpy):
    # Only clamp *existing* Bezier interpolation for translation/scale curves.
    # Never modify rotations (esp. quaternion), stepped/linear keyframes or timing.
    changed = 0
    for action in bpy.data.actions:
        for curve in iter_fcurves(action):
            dp = getattr(curve, "data_path", "")
            if not (dp.endswith("location") or dp.endswith("scale")):
                continue
            for key in curve.keyframe_points:
                if key.interpolation == "BEZIER":
                    key.handle_left_type = "AUTO_CLAMPED"
                    key.handle_right_type = "AUTO_CLAMPED"
                    changed += 1
            curve.update()
    print(f"[enhancer] adjusted Bezier handles: {changed} (no poses/keyframes created)")


def signature(bpy):
    objects = sorted((obj.name, obj.type,
                      tuple(slot.material.name if slot.material else "" for slot in obj.material_slots))
                     for obj in bpy.data.objects)
    actions = sorted(action.name for action in bpy.data.actions)
    return objects, actions


def check_textures(bpy):
    for image in bpy.data.images:
        if image.source != "FILE" or image.packed_file is not None:
            continue
        filepath = bpy.path.abspath(image.filepath)
        if image.filepath and not os.path.exists(filepath):
            print(f"[enhancer] WARNING missing external texture: {image.name} => {filepath}")


def run():
    import bpy
    args = parse_args()
    src, dst = Path(args.input).expanduser().resolve(), Path(args.output).expanduser().resolve()
    if not src.is_file():
        raise FileNotFoundError(str(src))
    if src == dst:
        raise ValueError("Output must differ from source; refusing overwrite of approved input")
    if dst.exists() and not args.overwrite:
        raise FileExistsError("Output exists; use --overwrite explicitly: " + str(dst))
    if dst.suffix.lower() not in (".glb", ".blend"):
        raise ValueError("Output must be a .glb or .blend file")
    if args.instant_retopo_static:
        if not args.instant_meshes_bin or not Path(args.instant_meshes_bin).is_file():
            raise FileNotFoundError("Instant Meshes binary missing; install upstream build or use --instant-meshes-bin")
        if not 0 <= args.instant_faces <= 2000000:
            raise ValueError("--instant-faces must be 0..2,000,000")
    if not 0.0 < args.merge_distance <= 0.01:
        raise ValueError("--merge-distance must be in (0, 0.01] meters")
    dst.parent.mkdir(parents=True, exist_ok=True)
    import_asset(bpy, src)
    if not bpy.data.objects:
        raise ValueError("No objects imported from source")
    initial_objects, initial_actions = signature(bpy)
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    if not meshes:
        print("[enhancer] WARNING: scene contains no mesh")
    if args.pymeshlab_analyze or args.pymeshlab_clean_static:
        interpreter = args.pymeshlab_python or os.environ.get("PYMESHLAB_PYTHON") or sys.executable
        for obj in meshes:
            run_pymeshlab(bpy, obj, interpreter, clean=args.pymeshlab_clean_static)
    if args.instant_retopo_static:
        # PyMeshLab first eliminates exact geometry defects, Instant Meshes then
        # rebuilds field-aligned topology, Blender keeps object identity.
        for obj in meshes:
            run_instant_retopology(bpy, obj, args.instant_meshes_bin, args.instant_faces)
    for obj in meshes:
        protected = is_protected_mesh(obj)
        if (args.repair_static or args.smooth_static) and protected:
            print(f"[enhancer] protected deforming/shared mesh: {obj.name}; topology/shading unchanged")
            continue
        if args.repair_static:
            repair_static_mesh(bpy, obj, args.merge_distance)
        if args.smooth_static:
            for poly in obj.data.polygons:
                poly.use_smooth = True
            obj.data.update()
            print(f"[enhancer] opted-in smooth shading: {obj.name}")
    if args.polish_motion:
        polish_motion(bpy)
    check_textures(bpy)
    after_objects, after_actions = signature(bpy)
    if initial_objects != after_objects or initial_actions != after_actions:
        raise RuntimeError("Asset identity changed during processing; refusing output")
    if dst.suffix.lower() == ".blend":
        bpy.ops.wm.save_as_mainfile(filepath=str(dst), check_existing=False)
    else:
        bpy.ops.export_scene.gltf(
            filepath=str(dst), export_format="GLB",
            export_animations=True, export_skins=True,
            export_morph=True, export_apply=False,
            export_yup=True,
        )
    if not dst.is_file() or dst.stat().st_size < 128:
        raise RuntimeError("No valid output produced")
    print(f"[enhancer] SUCCESS: {dst} ({dst.stat().st_size} bytes)")


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        print(f"[enhancer] ERROR: {type(exc).__name__}: {exc}", file=sys.stderr)
        raise
