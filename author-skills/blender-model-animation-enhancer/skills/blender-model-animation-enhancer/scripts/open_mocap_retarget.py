#!/usr/bin/env python3
"""Blender >=4.5: add a named mocap Action to the SAME character rig.
Never replace mesh geometry, materials, armature or other Action datablocks.
Body directions are driven by Open Mocap's 40 tracked landmarks; optional explicit
bone mapping allows rigs with arbitrary SkinTokens bone names.
"""
from __future__ import annotations
import argparse
import json
import math
from pathlib import Path
import re
import struct
import sys

# MediaPipe/Open Mocap landmarks: shoulder 11/12, elbow 13/14, wrist 15/16,
# hip 23/24, knee 25/26, ankle 27/28, foot 31/32; 32..39 are added by Open Mocap.
# Upstream appends extra points: hips index 33, shoulders index 34,
# right hand 35, left hand 36, ears 37, mouth 38, eyes 39.
# Keep aliases narrowly defined; don't guess on unnamed SkinTokens bones.
CANON = {
    'spine':(33,34), 'neck':(34,37),
    'leftupperarm':(11,13), 'leftforearm':(13,15),
    'rightupperarm':(12,14), 'rightforearm':(14,16),
    'leftthigh':(23,25), 'leftcalf':(25,27), 'leftfoot':(27,31),
    'rightthigh':(24,26), 'rightcalf':(26,28), 'rightfoot':(28,32),
}
# Avoid ambiguous rigify upper-/lower- arms by exact normalized alternatives.
ALIASES={
 'leftupperarm':['leftarm','upperarml','upperarmleft','upperarml001','armupperl','lupperarm','mixamorigleftarm','defupperarml'],
 'leftforearm':['leftforearm','lowerarml','forearml','armlowerl','lforearm','mixamorigleftforearm','defforearml'],
 'rightupperarm':['rightarm','upperarmr','upperarmright','armupperr','rupperarm','mixamorigrightarm','defupperarmr'],
 'rightforearm':['rightforearm','lowerarmr','forearmr','armlowerr','rforearm','mixamorigrightforearm','defforearmr'],
 'leftthigh':['leftupleg','thighl','upperlegl','lthigh','mixamorigleftupleg','defthighl'],
 'leftcalf':['leftleg','shinl','calfl','lowerlegl','lshin','mixamorigleftleg','defshinl'],
 'leftfoot':['leftfoot','footl','mixamorigleftfoot','deffootl'],
 'rightthigh':['rightupleg','thighr','upperlegr','rthigh','mixamorigrightupleg','defthighr'],
 'rightcalf':['rightleg','shinr','calfr','lowerlegr','rshin','mixamorigrightleg','defshinr'],
 'rightfoot':['rightfoot','footr','mixamorigrightfoot','deffootr'],
 'spine':['spine','spine001','mixamorigspine','defspine'],
 'neck':['neck','mixamorigneck','defneck'],
}

def argv():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    p=argparse.ArgumentParser()
    p.add_argument('--input',required=True)
    p.add_argument('--output',required=True)
    p.add_argument('--landmarks',required=True)
    p.add_argument('--bone-map')
    p.add_argument('--rig-name')
    p.add_argument('--clip',default='Mocap_Walk')
    p.add_argument('--mirror',action='store_true')
    return p.parse_args(args)


def normalized(s):
    return re.sub('[^a-z0-9]','',s.lower())


def mapping(armature, path):
    if path:
        obj=json.loads(Path(path).read_text(encoding='utf8'))
        if not isinstance(obj,dict): raise ValueError('Bone map must be JSON object: {"BoneName": [start, end]}')
        mapped={}
        for bone,indices in obj.items():
            if bone not in armature.pose.bones: raise ValueError('Missing mapped bone: '+bone)
            if not isinstance(indices,list) or len(indices)!=2 or not all(type(v) is int and 0<=v<40 for v in indices) or indices[0]==indices[1]:
                raise ValueError('Invalid landmark pair for '+bone)
            mapped[bone]=tuple(indices)
        if len(mapped)<3: raise ValueError('Map at least 3 bones for meaningful motion')
        return mapped
    mapped={}; used=set()
    for bone in armature.pose.bones:
        slug=normalized(bone.name)
        for kind,aliases in ALIASES.items():
            if slug in aliases and kind not in used:
                mapped[bone.name]=CANON[kind]
                used.add(kind)
                break
    if len(mapped)<3:
        sample=', '.join(b.name for b in list(armature.pose.bones)[:25])
        raise ValueError('Could not safely map target bones automatically; supply --mocap-bone-map JSON. Target bones: '+sample)
    return mapped


def parse_landmarks(path):
    data=json.loads(Path(path).read_text(encoding='utf8'))
    if data.get('format')!='open-mocap-landmarks-v1' or data.get('points')!=40:
        raise ValueError('Invalid Open Mocap landmark format')
    fps=float(data.get('fps',0))
    frames=data.get('landmarks')
    if not 1<=fps<=240 or not isinstance(frames,list) or not 2<=len(frames)<=18000:
        raise ValueError('Invalid mocap FPS or frame count')
    for frame in frames:
        if not isinstance(frame,list) or len(frame)!=120 or not all(isinstance(v,(int,float)) and math.isfinite(v) for v in frame):
            raise ValueError('Invalid mocap frame')
    return fps,frames


def tracked_vec(frame, index, vec, mirror):
    i=3*index
    x,y,z=frame[i:i+3]
    return vec((-x if mirror else x,z,-y))


def parse_glb(path):
    if Path(path).suffix.lower()!='.glb':return None
    with open(path,'rb') as f:
        magic,vers,total=struct.unpack('<III',f.read(12))
        if magic!=0x46546c67 or vers!=2 or total>Path(path).stat().st_size:
            raise ValueError('Input GLB header invalid')
        chunklen,typ=struct.unpack('<II',f.read(8))
        if typ!=0x4e4f534a or chunklen>50_000_000:raise ValueError('Invalid glTF JSON chunk')
        return json.loads(f.read(chunklen).decode('utf8'))


def main():
    import bpy
    from mathutils import Vector,Matrix
    if tuple(bpy.app.version[:2]) < (4,5):
        raise RuntimeError('Retarget requires Blender 4.5+; use Blender 4.0 only for Open Mocap capture')
    sys.path.insert(0,str(Path(__file__).resolve().parent))
    args=argv(); src=Path(args.input).resolve();dst=Path(args.output).resolve()
    if src==dst:raise ValueError('Input file cannot be overwritten')
    if dst.exists():raise FileExistsError('Output already exists')
    if dst.suffix.lower()!='.glb':raise ValueError('Output must be GLB')
    if len(args.clip)>64 or not re.fullmatch(r'[a-zA-Z0-9_.-]+',args.clip):
        raise ValueError('Clip name must use A-Z,a-z,0-9,_,-,. and be <=64 characters')
    fps,frames=parse_landmarks(args.landmarks)
    # Source import matches Blender safe pipeline. No primitive/hero substitution.
    from auto_enhance import import_asset
    import_asset(bpy,src)
    original_data=parse_glb(src)
    if original_data:
        old_animations={a.get('name') for a in original_data.get('animations',[]) if a.get('name')}
        if args.clip in old_animations:
            raise ValueError('Mocap clip already exists, refusing replacement: '+args.clip)
    else:old_animations=set()
    armatures=[o for o in bpy.data.objects if o.type=='ARMATURE']
    if args.rig_name:
        armatures=[o for o in armatures if o.name==args.rig_name]
    if len(armatures)!=1:raise ValueError('Need exactly one target armature; use --mocap-rig-name')
    rig=armatures[0]
    weighted=[o for o in bpy.data.objects if o.type=='MESH' and o.vertex_groups and any(m.type=='ARMATURE' for m in o.modifiers)]
    if not weighted:raise ValueError('Target armature has no skinned mesh; use SkinTokens first')
    mapping_pairs=mapping(rig,args.bone_map)
    original=[(o.name,len(o.data.vertices),tuple((m.name if m else '') for m in o.data.materials),len(o.vertex_groups)) for o in weighted]
    action_names_before=set(bpy.data.actions.keys())
    from mathutils import Matrix
    for pb in rig.pose.bones:
        pb.matrix_basis.identity()
    # Establish baseline from first valid tracked frame; character stays in approved rest pose on frame 1.
    base_vectors={}
    inverse_world=rig.matrix_world.to_3x3().inverted_safe()
    for name,(a,b) in mapping_pairs.items():
        baseline=inverse_world@(tracked_vec(frames[0],b,Vector,args.mirror)-tracked_vec(frames[0],a,Vector,args.mirror))
        if baseline.length<1e-7: raise ValueError('Degenerate first-frame landmark pair for '+name)
        base_vectors[name]=baseline.normalized()
    animation=rig.animation_data_create()
    old_action=animation.action
    action=bpy.data.actions.new(name=args.clip)
    animation.action=action
    bpy.context.scene.render.fps=int(round(fps))
    bpy.context.scene.frame_start=1
    bpy.context.scene.frame_end=len(frames)
    # Parent-first order is the pose-bones iteration order in ordinary Blender armatures,
    # but explicitly sort to handle arbitrary SkinTokens bone indexes.
    def depth(pb):
        n=0; p=pb.parent
        while p:n+=1;p=p.parent
        return n
    ordered=sorted(mapping_pairs,key=lambda name:depth(rig.pose.bones[name]))
    for fi,frame in enumerate(frames,1):
        bpy.context.scene.frame_set(fi)
        for bone_name in ordered:
            pose=rig.pose.bones[bone_name]
            a,b=mapping_pairs[bone_name]
            direction=inverse_world@(tracked_vec(frame,b,Vector,args.mirror)-tracked_vec(frame,a,Vector,args.mirror))
            if direction.length<1e-7:continue
            q=base_vectors[bone_name].rotation_difference(direction.normalized())
            rest=pose.bone.matrix_local.copy()
            pivot=pose.bone.head_local
            desired=(Matrix.Translation(pivot)@q.to_matrix().to_4x4()@
                     Matrix.Translation(-pivot)@rest)
            pose.matrix=desired
            channel={'QUATERNION':'rotation_quaternion','AXIS_ANGLE':'rotation_axis_angle'}.get(pose.rotation_mode,'rotation_euler')
            pose.keyframe_insert(data_path=channel,frame=fi,group=bone_name)
    if args.clip not in bpy.data.actions:raise RuntimeError('New action missing')
    if not getattr(action,'fcurves',None) and not getattr(action,'layers',None):
        raise RuntimeError('Mocap action has no keyframes')
    if old_action is not None:
        # Original action remains in the scene, and glTF ACTIONS exports compatible actions.
        # The new action is active; other action datablocks are never deleted or modified.
        old_action.use_fake_user=True
    for ob in weighted:
        after=(ob.name,len(ob.data.vertices),tuple((m.name if m else '') for m in ob.data.materials),len(ob.vertex_groups))
        if after not in original:raise RuntimeError('Mocap altered character mesh/material/weights')
    if not action_names_before.issubset(set(bpy.data.actions.keys())):
        raise RuntimeError('Existing animation actions were deleted')
    dst.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(dst),export_format='GLB',export_animations=True,
                              export_animation_mode='ACTIONS',export_merge_animation='NONE',
                              export_anim_single_armature=True,
                              export_skins=True,export_morph=True,export_apply=False)
    if not dst.is_file() or dst.stat().st_size<500:raise RuntimeError('GLB export missing')
    result=parse_glb(dst)
    names={a.get('name') for a in result.get('animations',[])}
    if args.clip not in names:
        dst.unlink(missing_ok=True)
        raise RuntimeError('New animation clip not present in exported GLB')
    missing=old_animations-names
    if missing:
        dst.unlink(missing_ok=True)
        raise RuntimeError('Existing GLB animation clips lost during export: '+str(sorted(missing)))
    print('[open-mocap] New clip',args.clip,'frames:',len(frames),'bones:',len(mapping_pairs),'GLB:',dst)

if __name__=='__main__':
    main()
