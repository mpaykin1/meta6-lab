#!/usr/bin/env python3
"""Voxel Atmosphere Engine Blender headless pipeline. Run ONLY inside Blender via bpy.

GPL Blender and its stock glTF exporter remain independent tools; this script
is original integration code, not copied Blender source.
"""
import argparse
from pathlib import Path
import sys
import math


def parse_cli():
    argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    ap=argparse.ArgumentParser()
    ap.add_argument('--input',required=True)
    ap.add_argument('--output',required=True)
    ap.add_argument('--blend',required=True)
    ap.add_argument('--motion',choices=['hover','breathe','static'],default='hover')
    ap.add_argument('--optimize-static',action='store_true')
    return ap.parse_args(argv)


def main():
    import bpy
    args=parse_cli()
    input_path=Path(args.input).expanduser().resolve()
    output_path=Path(args.output).expanduser().resolve()
    blend_path=Path(args.blend).expanduser().resolve()
    if not input_path.is_file():raise FileNotFoundError(input_path)
    if input_path==output_path: raise ValueError('Use a new output path')
    output_path.parent.mkdir(parents=True,exist_ok=True)
    blend_path.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(input_path))
    imported=[o for o in bpy.context.scene.objects if o.type in {'MESH','EMPTY','ARMATURE'}]
    if not imported: raise RuntimeError('No 3D objects in source GLB')
    scene=bpy.context.scene
    scene.render.fps=24
    scene.frame_start=1;scene.frame_end=97

    # Optional draw-call reduction only for static assets. Voxel silhouettes
    # and material assignments are preserved; animated and rigged assets are excluded.
    if args.motion=='static' and args.optimize_static:
        mesh_objs=[o for o in scene.objects if o.type=='MESH' and o.parent is None]
        if len(mesh_objs)>1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in mesh_objs:o.select_set(True)
            bpy.context.view_layer.objects.active=mesh_objs[0]
            bpy.ops.object.join()

    pivot=bpy.data.objects.new('VAE_ArtRoot',None)
    scene.collection.objects.link(pivot)
    pivot.empty_display_type='SPHERE';pivot.empty_display_size=.33
    roots=[o for o in scene.objects if o!=pivot and o.parent is None and o.type in {'MESH','EMPTY','ARMATURE'}]
    for obj in roots:
        existing=obj.matrix_world.copy()
        obj.parent=pivot
        obj.matrix_world=existing

    if args.motion!='static':
        is_hover=(args.motion=='hover')
        # Scene-space scale and translation remain separate from game placement.
        for i in range(0,97,6):
            theta=2*math.pi*i/96
            pivot.location=(0., (.19*(.5-.5*math.cos(theta)) if is_hover else .018*math.sin(theta)),0.)
            pivot.rotation_euler=(0.,(.07 if is_hover else .012)*math.sin(theta),0.)
            scale=1+(.035 if is_hover else .024)*math.sin(theta)
            pivot.scale=(scale,scale,scale)
            f=1+i
            pivot.keyframe_insert(data_path='location',frame=f,group='Atmosphere')
            pivot.keyframe_insert(data_path='rotation_euler',frame=f,group='Atmosphere')
            pivot.keyframe_insert(data_path='scale',frame=f,group='Atmosphere')
        for action in bpy.data.actions:
            # Legacy F-curves and Blender 4.4+ slotted actions both remain supported
            # by exporter. Avoid modifying Blender internal action storage here.
            pass
    scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    # Stock Blender glTF exporter preserves named nodes, materials, vertex colors,
    # geometry and keyed motion as Three.js-compatible glTF2 animation clips.
    bpy.ops.export_scene.gltf(filepath=str(output_path),export_format='GLB',
                              export_animations=args.motion!='static',
                              export_frame_range=True,export_extras=True,
                              export_cameras=False,export_lights=False,
                              export_apply=False)
    print('VAE_BLEND_SOURCE='+str(blend_path))
    print('VAE_ANIMATED_GLB='+str(output_path))

if __name__=='__main__':main()
