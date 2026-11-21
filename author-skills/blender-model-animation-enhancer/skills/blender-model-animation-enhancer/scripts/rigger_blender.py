"""Run the actual upstream Rigger retarget/Quick Rig/export API inside Blender.

Only explicit modes mutate scene copies; identity, materials, skinned geometry
and original animation actions are protected and export checked.
"""
import argparse
import json
import re
import struct
import sys
from pathlib import Path


def parse_args():
    p=argparse.ArgumentParser()
    for name in ('mode','input','output','rigger-dir','source','source-action','source-rig-name','rig-name','clip','bone-map'):
        p.add_argument('--'+name,required=name in ('mode','input','output','rigger-dir'))
    p.add_argument('--in-place',action='store_true')
    return p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])


def glb_json(path):
    if Path(path).suffix.lower()!='.glb':return None
    with open(path,'rb') as f:
        magic,version,total=struct.unpack('<III',f.read(12))
        if magic!=0x46546C67 or version!=2 or total!=Path(path).stat().st_size:
            raise ValueError('Invalid GLB header')
        size,typ=struct.unpack('<II',f.read(8))
        if typ!=0x4E4F534A or size>50000000:raise ValueError('Invalid GLB JSON chunk')
        return json.loads(f.read(size))


def animation_names(path):
    obj=glb_json(path)
    return {a.get('name') for a in obj.get('animations',[]) if a.get('name')} if obj else set()


def signature(mesh):
    return (mesh.name,len(mesh.data.vertices),len(mesh.data.polygons),
            tuple(m.name for m in mesh.data.materials if m),
            tuple(g.name for g in mesh.vertex_groups),
            tuple(k.name for k in (mesh.data.shape_keys.key_blocks if mesh.data.shape_keys else [])))


def main():
    import bpy
    a=parse_args()
    if tuple(bpy.app.version[:2])<(4,2):raise RuntimeError('Rigger requires Blender 4.2+')
    repo=Path(a.rigger_dir).resolve()
    sys.path.insert(0,str(repo))
    from auto_enhance import import_asset
    target_path=Path(a.input).resolve(); output=Path(a.output).resolve()
    old_clips=animation_names(target_path)
    import_asset(bpy,target_path)
    # Register after loading .blend (registers Rigger scene property groups).
    import rigger
    if getattr(rigger,'bl_info',{}).get('name')!='Rigger':raise ValueError('Unrecognized Rigger add-on')
    rigger.register()
    rigs=[o for o in bpy.data.objects if o.type=='ARMATURE' and (a.rig_name is None or o.name==a.rig_name)]
    if a.mode=='export':
        from rigger import utils,export
        rigs=[o for o in rigs if utils.is_rig(o)]
        if len(rigs)!=1:raise ValueError('Select a single Rigger control rig with --rigger-rig-name')
        rig=rigs[0]
        for obj in bpy.context.selected_objects:obj.select_set(False)
        rig.select_set(True);bpy.context.view_layer.objects.active=rig
        settings=bpy.context.scene.rigger_export
        settings.file_format='GLB';settings.engine='GENERIC';settings.naming='RIGGER'
        settings.custom_script='';settings.bake_actions=True;settings.only_active=False
        settings.anim_type='ACTIONS';settings.one_file_per='NONE';settings.include_meshes=True
        export.export_rig(bpy.context,rig,str(output),settings,run_script=False)
        data=glb_json(output)
        if not data or not data.get('skins') or not data.get('meshes'):
            output.unlink(missing_ok=True)
            raise RuntimeError('Rigger game export missing skins or meshes')
        print('Rigger game GLB complete');return
    if len(rigs)!=1:raise ValueError('Expected one target rig, specify --rigger-rig-name')
    rig=rigs[0]
    skinned=[o for o in bpy.data.objects if o.type=='MESH' and
             (any(m.type=='ARMATURE' and m.object==rig for m in o.modifiers)
              or o.parent==rig) and o.vertex_groups]
    if not skinned:raise ValueError('No rigged character mesh attached to selected armature')
    original_signatures=sorted(signature(o) for o in skinned)
    original_bones=tuple(b.name for b in rig.data.bones)
    target_actions=set(bpy.data.actions)
    if a.mode=='controls':
        from rigger import quick_rig
        s=bpy.context.scene.rigger_quick
        s.armature=rig;s.mode='PRESERVE';s.delete_source=False;s.hide_base=False
        s.bake=bool(rig.animation_data and rig.animation_data.action)
        s.twist=0;s.secondary=False
        if quick_rig.fill_limbs(s)<1:
            raise ValueError('Cannot infer a safe rig; use Rigger editor to map bones manually')
        generated=quick_rig.quick_rig(bpy.context,s)
        if not isinstance(generated,tuple) or len(generated)!=2 or generated[0] is None:
            raise RuntimeError('Quick Rig did not return a control rig')
        if tuple(b.name for b in rig.data.bones)!=original_bones:
            raise RuntimeError('Quick Rig changed original skeleton')
        if sorted(signature(o) for o in skinned)!=original_signatures:
            raise RuntimeError('Quick Rig changed original character geometry or weights')
        bpy.ops.wm.save_as_mainfile(filepath=str(output))
        print('Rigger control rig stored in BLEND');return
    if a.mode!='retarget':raise ValueError('Unknown Rigger mode')
    if a.clip in old_clips or a.clip in bpy.data.actions:
        raise ValueError('Clip name already exists; cannot replace: '+a.clip)
    # Import animated source without replacing target or deleting target objects.
    before_objects=set(bpy.data.objects)
    before_actions=set(bpy.data.actions)
    source_path=Path(a.source).resolve()
    if source_path.suffix.lower()=='.glb':bpy.ops.import_scene.gltf(filepath=str(source_path))
    elif source_path.suffix.lower()=='.fbx':bpy.ops.import_scene.fbx(filepath=str(source_path))
    else:raise ValueError('Rigger animation source must be GLB/FBX')
    imported=set(bpy.data.objects)-before_objects
    source_rigs=[o for o in imported if o.type=='ARMATURE' and
                 (a.source_rig_name is None or o.name==a.source_rig_name)]
    if len(source_rigs)!=1:raise ValueError('Animated source must contain one armature; use --rigger-source-rig-name')
    source=source_rigs[0]
    source_actions=list(set(bpy.data.actions)-before_actions)
    if a.source_action:
        action=bpy.data.actions.get(a.source_action)
        if action is None or (action not in source_actions and action is not (source.animation_data.action if source.animation_data else None)):
            raise ValueError('Animation action not found: '+a.source_action)
    elif len(source_actions)==1:
        action=source_actions[0]
    elif source.animation_data and source.animation_data.action and len(source_actions)==0:
        action=source.animation_data.action
    else:
        raise ValueError('Select one of multiple source animations using --rigger-source-action')
    if not action:raise ValueError('Source contains no animation')
    source.animation_data_create()
    source.animation_data.action=action
    from rigger import retarget
    settings=bpy.context.scene.rigger_remap
    settings.source=source;settings.target=rig
    settings.multiple=False;settings.action_name=a.clip
    settings.in_place=a.in_place
    settings.legs_ik=False;settings.arms_ik=False
    settings.root_motion=False
    if a.bone_map:
        mapping=json.loads(Path(a.bone_map).read_text(encoding='utf8'))
        if not isinstance(mapping,dict) or len(mapping)<3:raise ValueError('Explicit mapping requires >=3 source-to-target bone pairs')
        settings.items.clear()
        for src,dst in mapping.items():
            if src not in source.pose.bones or dst not in rig.pose.bones:
                raise ValueError('Invalid bone mapping: '+str(src)+' -> '+str(dst))
            m=settings.items.add();m.source=src;m.target=dst
            m.location=bool(re.search('hip|pelvis|root',dst,re.I))
    else:
        if retarget.auto_map(settings)<3:
            raise ValueError('Rigger could not safely map >=3 bones; provide --rigger-bone-map')
    new_action=retarget.retarget(bpy.context,settings)
    if not new_action or new_action.name!=a.clip:raise RuntimeError('Retarget failed to produce named action')
    # Source is a temporary motion provider, never a second game character.
    for ob in imported:bpy.data.objects.remove(ob,do_unlink=True)
    for ac in source_actions:
        if ac!=new_action and ac.users==0:bpy.data.actions.remove(ac)
    if tuple(b.name for b in rig.data.bones)!=original_bones:
        raise RuntimeError('Retarget modified character skeleton')
    if sorted(signature(o) for o in skinned)!=original_signatures:
        raise RuntimeError('Retarget changed geometry, materials, groups, or shape keys')
    if not target_actions.issubset(set(bpy.data.actions)):
        raise RuntimeError('Original animation action deleted')
    if output.suffix.lower()=='.blend':
        bpy.ops.wm.save_as_mainfile(filepath=str(output))
        print('Rigger new retarget action stored in BLEND');return
    if output.suffix.lower()!='.glb':raise ValueError('Output must be GLB or BLEND')
    # Only the original character rig and its original objects are eligible for export.
    for ob in bpy.data.objects:ob.select_set(False)
    rig.select_set(True)
    for mesh in skinned:mesh.select_set(True)
    bpy.context.view_layer.objects.active=rig
    bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,
       export_animations=True,export_animation_mode='ACTIONS',
       export_merge_animation='NONE',export_skins=True,export_morph=True,export_apply=False)
    data=glb_json(output)
    names={a.get('name') for a in data.get('animations',[])} if data else set()
    missing=old_clips-names
    if a.clip not in names or missing or not data.get('skins') or not data.get('meshes'):
        output.unlink(missing_ok=True)
        raise RuntimeError('Output failed game GLB validation (new/old clips or skin/mesh missing): '+str(sorted(missing)))
    print('Rigger retarget GLB valid:',output)

if __name__=='__main__':
    main()
