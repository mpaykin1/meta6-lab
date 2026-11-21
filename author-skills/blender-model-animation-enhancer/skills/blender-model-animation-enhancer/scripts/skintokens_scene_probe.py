#!/usr/bin/env python3
"""Blender-side inspection of a model; no geometry modification is performed."""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path


def read_args():
    tokens = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument('--input', required=True)
    p.add_argument('--output', required=True)
    return p.parse_args(tokens)


def load_asset(bpy, source):
    suffix=source.suffix.lower()
    if suffix == '.blend':
        bpy.ops.wm.open_mainfile(filepath=str(source),load_ui=False)
        return
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    if suffix in {'.glb', '.gltf'}:
        bpy.ops.import_scene.gltf(filepath=str(source))
    elif suffix == '.fbx':
        bpy.ops.import_scene.fbx(filepath=str(source))
    elif suffix == '.obj':
        bpy.ops.wm.obj_import(filepath=str(source))
    else:
        raise ValueError('Unsupported format: '+suffix)


def summarize(bpy):
    from mathutils import Vector
    mesh_objs=[o for o in bpy.data.objects if o.type=='MESH']
    rigs=[o for o in bpy.data.objects if o.type=='ARMATURE']
    min_xyz=[float('inf')]*3
    max_xyz=[float('-inf')]*3
    animated=[]
    meshes=[]
    for obj in bpy.data.objects:
        ad=obj.animation_data
        if ad is not None and (ad.action is not None or any(track.strips for track in ad.nla_tracks)):
            animated.append(obj.name)
    # Actions orphaned by import can still be meaningful animation data.
    for obj in mesh_objs:
        md=obj.data
        if md.shape_keys and md.shape_keys.animation_data and md.shape_keys.animation_data.action:
            animated.append(obj.name+':shape-key-action')
        for corner in obj.bound_box:
            loc=obj.matrix_world @ Vector(corner)
            for axis in range(3):
                val=float(loc[axis])
                if not math.isfinite(val):
                    raise ValueError('Non-finite world coordinate')
                min_xyz[axis]=min(min_xyz[axis],val)
                max_xyz[axis]=max(max_xyz[axis],val)
        weighted=any(bool(vertex.groups) for vertex in md.vertices)
        skin=bool(any(mod.type=='ARMATURE' for mod in obj.modifiers) or (obj.parent and obj.parent.type=='ARMATURE'))
        material_count=sum(1 for slot in obj.material_slots if slot.material is not None)
        meshes.append({
            'name':obj.name,'vertices':len(md.vertices),'polygons':len(md.polygons),
            'materials':material_count,'uv_layers':len(md.uv_layers),
            'shape_keys':bool(md.shape_keys),'vertex_groups':len(obj.vertex_groups),
            'weighted_vertices':weighted,'skin':skin,
            'mesh_animation':bool(obj.animation_data and obj.animation_data.action),
        })
    if not mesh_objs:
        raise ValueError('No meshes found')
    return {
        'mesh_count':len(mesh_objs), 'rig_count':len(rigs), 'rig_names':[r.name for r in rigs],
        'animation_names':sorted(set(animated)), 'action_count':len(bpy.data.actions),
        'meshes':meshes, 'vertices':sum(m['vertices'] for m in meshes),
        'polygons':sum(m['polygons'] for m in meshes),
        'material_slots':sum(m['materials'] for m in meshes),
        'uv_meshes':sum(bool(m['uv_layers']) for m in meshes),
        'weighted_meshes':sum(bool(m['weighted_vertices']) for m in meshes),
        'skinned_meshes':sum(bool(m['skin']) for m in meshes),
        'bounds':{'min':min_xyz,'max':max_xyz},
    }


def main():
    import bpy
    args=read_args()
    source=Path(args.input).expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(source)
    load_asset(bpy, source)
    info=summarize(bpy)
    Path(args.output).write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf-8')


if __name__=='__main__':
    main()
