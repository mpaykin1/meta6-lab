#!/usr/bin/env python3
"""Living Image Animator v0.4: visible, actor-local action gate and enhanced source-locked articulation.

Requires bundled v0.3 `smooth_delivery`, `render_rigged_scene`, `streamed_animator`.
Never certify lighting or scene movement as movement of a character.
"""
from __future__ import annotations
import argparse
import json
import math
import sys
from collections import Counter
from pathlib import Path
import tempfile
import numpy as np
from PIL import Image

# Action envelopes are C1 at the beginning and end. Motion is anatomically
# role-driven and the same source-pixel identities are used throughout.

def _env(p):
    p = min(1., max(0., float(p)))
    return math.sin(math.pi*p)**2

def _osc(p,n=2):
    return math.sin(math.pi*2*n*p)

def degrees(name, action, progress, t, phase=0.):
    n = str(name).lower().replace('-', '_')
    left='left' in n; right='right' in n
    arm='arm' in n or 'foreleg' in n or 'front_leg' in n
    leg=('leg' in n or 'foot' in n) and not ('front_leg' in n or 'foreleg' in n)
    head='head' in n; tail='tail' in n
    s = _osc(progress,2)
    env = _env(progress)
    d=1. if left else (-1. if right else 1.)
    # Move BOTH legs with alternating strides. No static cutout translation masquerading as walking.
    if action=='walk':
        if leg: return 36. * d * s * env
        if arm: return -23. * d * s * env
        if head: return 5. * _osc(progress,2) * env
        if tail:return 16. * _osc(progress,2) * env
        return 0.
    if action=='wave':
        if right and arm: return -48.*env + 14.*_osc(progress,3)*env
        if left and arm: return 9.*_osc(progress,1)*env
        if head:return 7.*_osc(progress,1)*env
        return 0.
    if action in {'talk','gesture'}:
        if right and arm: return (-31. + 13.*_osc(progress,3))*env
        if left and arm: return (21. + 9.*_osc(progress,2))*env
        if head:return 9.*_osc(progress,2)*env
        return 0.
    if action in {'eat','drink'}:
        if right and arm:return (-57. if action=='drink' else -44.)*env + 7.*_osc(progress,2)*env
        if left and arm:return 13.*_osc(progress,1)*env
        if head:return (-10. + 5.*_osc(progress,2))*env
        return 0.
    if action=='pour':
        if right and arm:return (-38. + 11.*_osc(progress,2))*env
        if left and arm:return 25.*env
        if head:return 7.*_osc(progress,1)*env
        return 0.
    if action in {'read','page','turn_page'}:
        if right and arm:return 20.*_osc(progress,1)*env
        if left and arm:return -23.*_osc(progress,1)*env
        if head:return 11.*_osc(progress,1)*env
        return 0.
    if action=='groom':
        if 'front_leg' in n or 'foreleg' in n:return -41.*env + 9.*_osc(progress,3)*env
        if head:return 22.*_osc(progress,2)*env
        if tail:return 15.*_osc(progress,1)*env
        return 0.
    if action=='stretch':
        if 'front_leg' in n or 'foreleg' in n:return -31.*env
        if 'back_leg' in n:return 18.*env
        if head:return -24.*env
        if tail:return 30.*env
        return 0.
    if action=='tail':
        if tail:return 37.*_osc(progress,2)*env
        if head:return 8.*_osc(progress,1)*env
        return 0.
    if action=='blink':
        # The original eye pixels do NOT change merely by rotating a head.
        # Explicit closed-eye frames are mandatory for actual blinking.
        return 0.
    return (2.*_osc(progress,1)*env) if head else 0.


def install_motion_driver():
    import render_rigged_scene as rigs
    import streamed_animator as render
    rigs.degrees=degrees
    # Patching the single renderer module keeps preview, temporal gate,
    # production export and pose PNGs on identical source-locked joint curves.
    render.RigActor=rigs.RigActor


def _relative_pixel_change(im1, im2, actor_pixels):
    a=np.asarray(im1,dtype=np.int16);b=np.asarray(im2,dtype=np.int16)
    union=(a[:,:,3]>96)|(b[:,:,3]>96)
    changed=union & ((np.abs(a[:,:,3]-b[:,:,3])>70) |
                     (np.max(np.abs(a[:,:,:3]-b[:,:,:3]),axis=2)>38))
    return round(float(np.count_nonzero(changed))/max(1,actor_pixels),4)


def _largest_part_motion(actor_obj, actor_spec, act, progress_samples):
    """Screen-space displacement of original part pixels (not whole-sprite bobbing)."""
    x0,y0,x1,y1=actor_obj.rect
    height=max(1,y1-y0)
    results=[]
    for part in actor_obj.parts:
        a=np.asarray(part['px']);yy,xx=np.where(a[:,:,3]>90)
        if len(xx)<2:continue
        px,py=part['pivot']
        far=max(float(np.percentile(np.hypot(xx-px,yy-py),80)),1.)
        angles=[degrees(part['name'],act,p,0.) for p in progress_samples]
        span=max(angles)-min(angles)
        swept=2*far*math.sin(math.radians(min(170,abs(span)))/2)
        results.append((part['name'],round(swept,2),round(span,1)))
    results.sort(key=lambda x:x[1],reverse=True)
    return results


def _sample_action(actor, event, samples=13):
    anim=actor.spec['animation']
    period=float(anim.get('period',4.))
    phase=float(anim.get('phase',0))
    st=float(event['start']);en=float(event['end'])
    result=[]
    for i in range(samples):
        p=(i+.5)/samples
        u=st + p*(en-st)
        t=((u-phase)%1.)*period
        sprite,position,action=actor.pose(t)
        result.append((sprite,position,action))
    return result


def validate_visible_actor_motions(config, source, scene, seconds, max_width, output):
    from render_rigged_scene import RigActor
    src=Image.open(source).convert('RGB')
    if max_width and src.width>max_width:
        w=max_width;h=round(src.height*max_width/src.width)
        src=src.resize((w,h),Image.Resampling.LANCZOS)
    w,h=src.size;arr=np.asarray(src)
    metrics={'schema':'visible-motion-v0.4','actors':{},'passed':False,'notice':
        'Geometric source-cutout motion gate only. Anatomical plausibility still requires visual inspection.'}
    problems=[]
    with tempfile.TemporaryDirectory() as td:
        for item in config['actors']:
            actor=RigActor(item,arr,scene.parent,Path(td),(w,h))
            # Match the actual renderer's integer-loop-adjusted action period.
            spec=actor.spec['animation'];period=max(.25,float(spec.get('period',4.)))
            spec['period']=seconds/max(1,round(seconds/period))
            identity=item['id'];events=spec.get('events',[])
            pixels=int(np.count_nonzero(actor.fullmask>90))
            original_h=int(np.ptp(np.where(actor.fullmask>90)[0])+1)
            kind=str(item.get('role','human')).lower()
            is_animal=any(s in kind for s in ('cat','dog','animal','bird'))
            # Too-small source characters cannot show reliably distinguishable joint movement.
            if original_h<15:problems.append(f'{identity}: sprite {original_h}px too small for reliable articulated animation; draw larger poses')
            kinds={e['action'] for e in events if e['action']!='idle'}
            if len(kinds)<2:problems.append(f'{identity}: needs >=2 DISTINCT active behaviors, has {sorted(kinds)}')
            duty=sum(e['end']-e['start'] for e in events if e['action']!='idle')
            if duty<.45:problems.append(f'{identity}: active duty {duty:.0%} <45%')
            activity=[]
            for ev in events:
                act=ev['action']
                if act=='idle':continue
                if act=='blink':
                    problems.append(f'{identity}: blink requires drawn eyelid pose sprite, not an inert head turn')
                    continue
                samples=_sample_action(actor,ev)
                # Compare poses INSIDE each action; do not let previous action transitions
                # or root translation pass as a moving limb.
                poses=[s[0] for s in samples]
                distinct=max(_relative_pixel_change(poses[i],poses[j],pixels)
                            for i in range(len(poses)) for j in range(i+1,len(poses)))
                movements=_largest_part_motion(actor,item,act,[(i+.5)/13 for i in range(13)])
                meaningful=[x for x in movements if x[1]>=max(2.5,original_h*.10)]
                moving_names=[x[0] for x in meaningful]
                # Need movement of TWO anatomically distinct parts for humans/animals.
                min_parts=2
                frac_threshold=.12 if not is_animal else .11
                semantic={
                    'walk':{'left_leg','right_leg'},
                    'groom':{'head','front_leg'},
                    'stretch':{'head','front_leg'},
                    'tail':{'tail'},
                    'eat':{'right_arm','head'},
                    'drink':{'right_arm','head'},
                    'pour':{'right_arm','left_arm'},
                    'read':{'head','right_arm'},
                    'page':{'head','right_arm'},
                    'turn_page':{'head','right_arm'},
                    'wave':{'right_arm','head'},
                    'talk':{'right_arm','head'},
                    'gesture':{'right_arm','head'},
                }.get(act,set())
                # Allow the source's foreleg/foreleg part aliases, but never a mislabeled walk.
                normal={v.replace('foreleg','front_leg') for v in moving_names}
                role_ok=semantic.issubset(normal)
                good=(distinct>=frac_threshold and len(meaningful)>=min_parts and role_ok)
                activity.append({'action':act,'changed_actor_pixels_fraction':distinct,
                                 'independently_visible_parts':moving_names,
                                 'estimated_part_sweeps_px':movements,'pass':good})
                if not good:
                    problems.append(f'{identity}/{act}: pixel variation {distinct:.1%} (<{frac_threshold:.0%}) or too little TWO-PART anatomical motion; need accurately segmented rig and additional poses')
            metrics['actors'][identity]={'role':kind,'sprite_height_px':original_h,'source_pixels':pixels,
                                         'activity_fraction':round(duty,3),'activities':activity}
    if problems:
        metrics['failures']=problems
        output.mkdir(parents=True,exist_ok=True)
        (output/'motion_gate.json').write_text(json.dumps(metrics,indent=2,ensure_ascii=False),'utf8')
        raise ValueError('VISIBLE CHARACTER MOTION REJECTED:\n- '+'\n- '.join(problems[:24]))
    metrics['passed']=True
    output.mkdir(parents=True,exist_ok=True)
    (output/'motion_gate.json').write_text(json.dumps(metrics,indent=2,ensure_ascii=False),'utf8')
    return metrics


def main():
    p=argparse.ArgumentParser(description='Release-blocking per-character visible-motion render')
    p.add_argument('source',type=Path)
    p.add_argument('--scene',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--seconds',type=float,default=48.)
    p.add_argument('--fps',type=float,default=24.)
    p.add_argument('--max-width',type=int,default=720)
    args=p.parse_args()
    source=args.source.resolve();scene=args.scene.resolve();out=args.out.resolve()
    import smooth_delivery as base
    install_motion_driver()
    cfg=json.loads(scene.read_text('utf8'))
    # v0.3 structural/mandatory-events validation still applies, never lowered.
    base.validate_scene(cfg,args.seconds,args.fps,True)
    # Strictly before rendering: reject any actor whose animation is not
    # independently large, varied and semantically driven.
    result=validate_visible_actor_motions(cfg,source,scene,args.seconds,args.max_width,out)
    base.compare_actor_temporal(cfg,source,scene,args.fps,args.seconds)
    from streamed_animator import render as render_streamed
    out.mkdir(parents=True,exist_ok=True)
    render_streamed(source,scene,out,args.seconds,args.fps,args.max_width)
    asset_dir=out/'assets'
    (asset_dir/'motion_gate.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf8')
    base.pack_sources(out,scene,cfg)
    base.verify_files(out,args.fps,args.seconds)
    print(json.dumps({'gif':str(out/'living_scene.gif'),
                      'asset_zip':str(out/'living_scene_assets.zip'),
                      'complete':True,'independent_visible_actors':len(result['actors']),
                      'visible_motion_gate':'PASS'},ensure_ascii=False))

if __name__=='__main__':main()
