#!/usr/bin/env python3
"""Opt-in PBR map application inside installed Blender; preserves all rig/animation data."""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import sys


def get_args():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--maps-dir", required=True)
    p.add_argument("--material-object", required=True)
    p.add_argument("--material-slot", type=int, default=0)
    p.add_argument("--material-name", default="MaterialMaker_PBR")
    p.add_argument("--overwrite", action="store_true")
    tail = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
    return p.parse_args(tail)


SUFFIX_TO_ROLE = {
    "albedo": "albedo", "basecolor": "albedo", "base_color": "albedo", "diffuse": "albedo", "color": "albedo",
    "orm": "orm", "occlusionroughnessmetallic": "orm",
    "normal": "normal", "normalgl": "normal", "normal_opengl": "normal",
    "rough": "roughness", "roughness": "roughness",
    "metal": "metallic", "metallic": "metallic", "metalness": "metallic",
    "occlusion": "occlusion", "ao": "occlusion",
    "emissive": "emission", "emission": "emission",
}


def find_maps(folder: Path):
    """Reject duplicate channels to avoid applying maps from a different asset."""
    result = {}
    for path in sorted(folder.iterdir()):
        if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".exr", ".webp"}:
            continue
        name = path.stem.lower().replace("-", "_")
        # Longest first is important: 'base_color' before 'color'.
        candidates = sorted(SUFFIX_TO_ROLE, key=len, reverse=True)
        role = next((SUFFIX_TO_ROLE[s] for s in candidates
                     if name == s or name.endswith("_"+s)), None)
        if role is None:
            continue
        if role in result:
            raise ValueError(f"Two files map to {role}: {result[role]} / {path}")
        result[role] = path
    if not result:
        raise ValueError("No recognizable PBR textures (albedo, orm, normal, roughness, metallic, emission)")
    if "orm" in result and ("metallic" in result or "roughness" in result or "occlusion" in result):
        raise ValueError("Both packed ORM and separate maps present; choose one set")
    return result


def object_snapshot(bpy):
    # These must be identical before and after opt-in material assignment.
    objects = sorted((o.name, o.type, len(o.data.vertices) if o.type == 'MESH' else -1,
                      len(o.data.polygons) if o.type == 'MESH' else -1,
                      tuple(b.name for b in o.data.bones) if o.type == 'ARMATURE' else (),
                      tuple(g.name for g in o.vertex_groups) if o.type == 'MESH' else (),
                      tuple(k.name for k in o.data.shape_keys.key_blocks)
                      if o.type == 'MESH' and o.data.shape_keys else ())
                     for o in bpy.data.objects)
    actions = sorted((a.name, tuple(float(v) for v in a.frame_range)) for a in bpy.data.actions)
    return objects, actions


def add_image(nodes, links, path, role):
    import bpy
    img = bpy.data.images.load(str(path), check_existing=False)
    img.name = "MM_"+role
    # Pack to keep saved BLEND self-contained; GLB export embeds PBR maps.
    try:
        img.pack()
    except Exception as exc:
        raise RuntimeError(f"Could not pack image {path}: {exc}") from exc
    if role != "albedo" and role != "emission":
        img.colorspace_settings.name = 'Non-Color'
    node = nodes.new("ShaderNodeTexImage")
    node.image = img
    node.label = role
    return node


def add_material(bpy, obj, maps, material_name, slot_index):
    if obj.type != 'MESH':
        raise ValueError("--material-object must be a MESH object")
    if len(obj.data.uv_layers) == 0:
        raise ValueError("Object has no UV map; cannot safely project 2D PBR textures")
    if slot_index > len(obj.material_slots):
        raise ValueError("No such material slot; append at exactly len(material_slots) or choose existing slot")
    if slot_index == len(obj.material_slots):
        if obj.data.users > 1:
            raise ValueError("Mesh data is shared; cannot safely append material slot without affecting siblings")
        obj.data.materials.append(None)
    old = obj.material_slots[slot_index].material
    new_name = material_name or "MaterialMaker_PBR"
    material = bpy.data.materials.new(name=new_name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (700, 130)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (400, 150)
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    bsdf.inputs['Roughness'].default_value = 0.8
    bsdf.inputs['Metallic'].default_value = 0.0
    for role, path in maps.items():
        tex = add_image(nodes, links, path, role)
        tex.location = (-760, 340 - (len(nodes)-2)*180)
        if role == 'albedo':
            links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
        elif role == 'emission':
            if 'Emission Color' in bsdf.inputs:
                links.new(tex.outputs['Color'], bsdf.inputs['Emission Color'])
                bsdf.inputs['Emission Strength'].default_value = 1.0
        elif role == 'normal':
            n = nodes.new('ShaderNodeNormalMap')
            n.location = (-140, -200)
            links.new(tex.outputs['Color'], n.inputs['Color'])
            links.new(n.outputs['Normal'], bsdf.inputs['Normal'])
        elif role == 'orm':
            # glTF core packed convention: O=R, roughness=G, metallic=B.
            sep = nodes.new('ShaderNodeSeparateColor')
            sep.location = (-380, -240)
            links.new(tex.outputs['Color'], sep.inputs['Color'])
            links.new(sep.outputs['Green'], bsdf.inputs['Roughness'])
            links.new(sep.outputs['Blue'], bsdf.inputs['Metallic'])
            # Blender's glTF export recognizes the special occlusion group.
            # If exporter version ignores it, AO cannot be guaranteed in GLB.
            group = bpy.data.node_groups.get('glTF Material Output')
            if group is None or group.bl_idname != 'ShaderNodeTree':
                group = bpy.data.node_groups.new('glTF Material Output', 'ShaderNodeTree')
                try:
                    group.interface.new_socket(name='Occlusion', in_out='INPUT', socket_type='NodeSocketFloat')
                except AttributeError:
                    group.inputs.new('NodeSocketFloat', 'Occlusion')
            node = nodes.new('ShaderNodeGroup')
            node.node_tree = group
            node.location = (100, -470)
            if 'Occlusion' in node.inputs:
                links.new(sep.outputs['Red'], node.inputs['Occlusion'])
        elif role in ('roughness', 'metallic'):
            socket = 'Roughness' if role == 'roughness' else 'Metallic'
            links.new(tex.outputs['Color'], bsdf.inputs[socket])
        # Individual AO may be used by glTF exporter only through special group.
        elif role == 'occlusion':
            group = bpy.data.node_groups.get('glTF Material Output')
            if group is None or group.bl_idname != 'ShaderNodeTree':
                group = bpy.data.node_groups.new('glTF Material Output', 'ShaderNodeTree')
                try:
                    group.interface.new_socket(name='Occlusion', in_out='INPUT', socket_type='NodeSocketFloat')
                except AttributeError:
                    group.inputs.new('NodeSocketFloat', 'Occlusion')
            node = nodes.new('ShaderNodeGroup')
            node.node_tree = group
            if 'Occlusion' in node.inputs:
                links.new(tex.outputs['Color'], node.inputs['Occlusion'])
    if old is not None:
        old.use_fake_user = True   # retain original, even if no longer referenced
    obj.material_slots[slot_index].link = 'OBJECT' # never modify other instances sharing mesh data
    obj.material_slots[slot_index].material = material
    return material


def main():
    import bpy
    from auto_enhance import import_asset
    a = get_args()
    src, out = Path(a.input).resolve(), Path(a.output).resolve()
    if src == out:
        raise ValueError("Refusing to overwrite original asset")
    if out.exists() and not a.overwrite:
        raise FileExistsError(str(out))
    maps = find_maps(Path(a.maps_dir))
    import_asset(bpy, src)
    target = bpy.data.objects.get(a.material_object)
    if target is None:
        raise ValueError(f"Exact mesh object not found: {a.material_object}; available: {list(bpy.data.objects.keys())[:25]}")
    before = object_snapshot(bpy)
    original_actions = {x.name for x in bpy.data.actions}
    added = add_material(bpy, target, maps, a.material_name, a.material_slot)
    if before != object_snapshot(bpy):
        raise RuntimeError("Material stage unexpectedly changed geometry/rig/actions")
    if original_actions != {x.name for x in bpy.data.actions}:
        raise RuntimeError("Original animation actions changed")
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.suffix.lower() == '.blend':
        bpy.ops.wm.save_as_mainfile(filepath=str(out), check_existing=False)
    else:
        bpy.ops.export_scene.gltf(filepath=str(out), export_format='GLB',
                                  export_animations=True, export_skins=True,
                                  export_morph=True, export_apply=False, export_yup=True)
    if not out.is_file() or out.stat().st_size < 128:
        raise RuntimeError("No output generated")
    print(f"[material-maker] assigned '{added.name}' to '{target.name}' -> {out}")


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f"[material-maker] ERROR: {type(exc).__name__}: {exc}", file=sys.stderr)
        raise
