#!/usr/bin/env python3
"""Strict smoothness & delivery gate for Living Image Animator.

Wraps existing articulated renderer. Fail closed rather than delivering a fake
fully-animated GIF. Inspect per-actor pose discontinuities, cycle seam,
registration, mandatory roles, asset references, and output files. Never relabel
ordinary translations/light changes as articulated actions.
"""
from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageStat

ACTIONS = {'idle','walk','wave','talk','gesture','eat','drink','pour','read','page',
           'turn_page','groom','tail','stretch','blink'}
# These actions are actually implemented by the bundled v0.2 articulated renderer.
ACTIVE_ACTIONS = ACTIONS - {'idle'}
PARTICLE_TYPES = {'petals','rain','steam','fireflies','dust','stars'}


def fail(message):
    raise ValueError('ANIMATION BLOCKED: ' + message)


def validate_scene(config, seconds, fps, require_full):
    if not 40 <= seconds <= 60 and require_full:
        fail('complete living-world delivery requires a 40–60 second seamless cycle')
    if fps < 24 and require_full:
        fail('complete living-world delivery requires at least 24 fps')
    if seconds*fps > 1500:
        fail('frame budget exceeded (>1500); lower seconds or fps')
    if not config.get('seamless', True):
        fail('loop must be seamless')
    actors=config.get('actors',[])
    if not actors:
        fail('no actors identified; human/animal animation may not be omitted')
    ids=[str(a.get('id','')) for a in actors]
    if len(set(ids)) != len(ids) or any(not x for x in ids):
        fail('each actor needs a unique nonempty ID')
    declared=set(config.get('inventory',{}).get('actors',[]))
    if require_full and not declared:
        fail('inventory.actors missing; cannot verify all visible characters are included')
    if declared and declared != set(ids):
        fail('inventory/actors mismatch: missing='+str(sorted(declared-set(ids)))+
             ', undeclared='+str(sorted(set(ids)-declared)))
    for actor in actors:
        name=actor['id']
        mode=actor.get('animation',{}).get('mode','rig' if actor.get('rig') else 'static')
        if mode!='rig':
            fail(f'{name}: static / sprite-only actor cannot pass all-actors-articulated gate')
        pieces={p.get('name','').lower() for p in actor.get('rig',{}).get('parts',[])}
        if len(pieces)<2:
            fail(f'{name}: at least two independently moving anatomical parts required')
        evts=actor.get('animation',{}).get('events',[])
        if not evts:
            fail(f'{name}: explicit independently timed action events required')
        actions={e.get('action') for e in evts}
        if not actions.intersection(ACTIVE_ACTIONS):
            fail(f'{name}: no articulated activity (bobbing/idle alone does not count)')
        unsupported=actions-ACTIONS
        if unsupported:
            fail(f'{name}: actions not implemented by renderer: {sorted(unsupported)}')
        if 'walk' in actions and not {'left_leg','right_leg'}<=pieces:
            fail(f'{name}: walk requires separately articulated left and right leg')
        if require_full and len(actions)<2:
            fail(f'{name}: only one action in a requested living world')
        if any((float(e.get('start',0))<0 or float(e.get('end',1))>1 or
                float(e.get('end',1))<=float(e.get('start',0))) for e in evts):
            fail(f'{name}: event intervals must be increasing segments within [0,1]')
        intervals=sorted((float(e.get('start',0)),float(e.get('end',1))) for e in evts)
        if require_full and (intervals[0][0]>.001 or intervals[-1][1]<.999 or
           any(b[0] - a[1]>.001 or a[1]-b[0]>.001 for a,b in zip(intervals,intervals[1:]))):
            fail(f'{name}: event timeline must partition entire 0–1 cycle without gaps')
    # Check requested event coverage, do not invent that unsupported environment
    # events are animated. Every mandatory activity must have an implementation.
    if require_full:
        required=config.get('required_events')
        if not isinstance(required,list) or not required:
            fail('required_events list missing; cannot certify every requested animation')
        implemented=set()
        for a in actors:
            for e in a.get('animation',{}).get('events',[]):
                if e.get('action') in ACTIVE_ACTIONS:
                    implemented.add(f"actor:{a['id']}:{e['action']}")
        for p in config.get('particles',[]):
            if p.get('type') in PARTICLE_TYPES and int(p.get('count',0))>0:
                implemented.add('particle:'+p['type'])
        for l in config.get('lights',[]):
            implemented.add('light:'+str(l.get('id','')))
        if config.get('day_night',{}).get('enabled') and config.get('day_night',{}).get('day_background'):
            implemented.add('sky:registered-day-night')
        missing=sorted(set(required)-implemented)
        if missing:
            fail('requested effects still lack an implemented animation: '+', '.join(missing))


def compare_actor_temporal(config, src, scene_path, fps, seconds):
    """Compare actual rendered source-locked actor motion at sampled moments.

    Reject impossible instantaneous changes in silhouette, centroid, and seam.
    It will not certify realism; missing animation is separately rejected.
    """
    sys.path.insert(0,str(Path(__file__).resolve().parent))
    from render_rigged_scene import RigActor
    import numpy as np
    import tempfile
    image=np.asarray(Image.open(src).convert('RGB'))
    basedir=scene_path.parent
    # Renderer may shrink; avoid false positives by evaluating at original size.
    width,height=Image.open(src).size
    frame_times=[]
    # Sample at final export fps; measure 1st+last frames and cycle boundary.
    for k in range(round(seconds*fps)):
        frame_times.append(k/fps)
    with tempfile.TemporaryDirectory() as temp:
        for a in config.get('actors',[]):
            obj=RigActor(a,image,basedir,Path(temp),(width,height))
            prev=None; pose0=None; pose_last=None; max_jump=0.0
            for t in frame_times:
                im,pos,action=obj.pose(t)
                alpha=np.asarray(im.getchannel('A'),np.uint8)
                if prev is not None:
                    older,prevpos=prev
                    # Difference of alpha silhouettes catches snap transitions of limbs.
                    delta=abs(alpha.astype(np.int16)-older.astype(np.int16)).mean()/255.
                    travel=math.hypot(pos[0]-prevpos[0],pos[1]-prevpos[1]) / max(8, math.hypot(*obj.rsize))
                    max_jump=max(max_jump,delta,travel)
                    if delta>0.30 or travel>0.16:
                        fail(f'{a["id"]}: abrupt character motion at {t:.2f}s (mask={delta:.3f}, move={travel:.3f})')
                prev=(alpha,pos)
                if pose0 is None:pose0=(alpha.copy(),pos)
                pose_last=(alpha.copy(),pos)
            if pose0 and pose_last:
                diff=abs(pose0[0].astype(np.int16)-pose_last[0].astype(np.int16)).mean()/255.
                travel=math.hypot(pose0[1][0]-pose_last[1][0],pose0[1][1]-pose_last[1][1])/max(8, math.hypot(*obj.rsize))
                if diff>0.30 or travel>0.16:
                    fail(f'{a["id"]}: actor snaps across GIF loop seam')


def verify_files(output, fps, seconds):
    gif=output/'living_scene.gif'; zpath=output/'living_scene_assets.zip'
    if not gif.is_file() or not zpath.is_file():
        fail('GIF or ZIP is missing; NEVER deliver one without the other')
    with Image.open(gif) as im:
        n=getattr(im,'n_frames',1)
        if n < min(24,round(seconds*fps)//2):
            fail('GIF has too few distinct retained frames; likely static or collapsed output')
        if im.info.get('loop',None)!=0:
            fail('GIF is not infinitely looping')
        samples=[]
        for k in sorted(set([0,max(0,n//4),n//2,(3*n)//4,n-1])):
            im.seek(k)
            samples.append(im.convert('RGB'))
        if max(ImageStat.Stat(ImageChops.difference(samples[0],s)).mean[0] for s in samples[1:])<.25:
            fail('animation almost completely static')
    with zipfile.ZipFile(zpath) as z:
        if z.testzip() is not None:fail('asset ZIP is corrupt')
        names=z.namelist()
        needed={'source.png','background_clean.png','scene.json','actions_actual.json'}
        missing=needed-set(names)
        if missing:fail('ZIP missing required files '+', '.join(sorted(missing)))
        if not any(n.startswith('layers/') and n.endswith('.png') for n in names):
            fail('ZIP has no separate PNG actor layers')
        if not any(n.startswith('poses/') and n.endswith('.png') for n in names):
            fail('ZIP has no articulated pose assets')


def pack_sources(out, scene, config):
    """Include all original input masks/pose/day plates, not broken path references."""
    root=scene.parent; assets=out/'assets'; proj=assets/'project'
    proj.mkdir(parents=True,exist_ok=True)
    shutil.copy2(scene,proj/'input_scene.json')
    paths=set()
    def walk(d):
        if isinstance(d,dict):
            for k,v in d.items():
                if k in {'mask','day_background','sky_mask'} and isinstance(v,str):paths.add(v)
                else:walk(v)
        elif isinstance(d,list):
            for x in d:walk(x)
    walk(config)
    written={}
    for raw in sorted(paths):
        src=Path(raw)
        if not src.is_absolute():src=root/src
        if not src.is_file():fail('referenced input asset missing: '+raw)
        target=proj/'inputs'/str(len(written)).zfill(4)/src.name
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(src,target)
        written[raw]=str(target.relative_to(assets))
    (proj/'input_assets.json').write_text(json.dumps(written,ensure_ascii=False,indent=2),'utf-8')
    # zip existing assets again after source/material is copied.
    from render_scene import zip_assets
    zip_assets(assets,out/'living_scene_assets.zip')


def main():
    p=argparse.ArgumentParser()
    p.add_argument('source',type=Path)
    p.add_argument('--scene',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--seconds',type=float,default=48.)
    p.add_argument('--fps',type=float,default=24.)
    p.add_argument('--max-width',type=int,default=720)
    p.add_argument('--allow-partial',action='store_true',help='Explicit preview mode, never call this a complete animation')
    args=p.parse_args()
    source=args.source.resolve(); scene=args.scene.resolve(); out=args.out.resolve()
    cfg=json.loads(scene.read_text('utf-8'))
    full=not args.allow_partial
    validate_scene(cfg,args.seconds,args.fps,full)
    # Keep third-party/renderer outputs from escaping user-specified destination.
    out.mkdir(parents=True,exist_ok=True)
    # Verify user-defined rigs and per-step continuity before expensive render.
    compare_actor_temporal(cfg,source,scene,args.fps,args.seconds)
    from streamed_animator import render as render_streamed
    render_streamed(source,scene,out,args.seconds,args.fps,args.max_width)
    pack_sources(out,scene,cfg)
    verify_files(out,args.fps,args.seconds)
    print(json.dumps({'gif':str(out/'living_scene.gif'),
       'asset_zip':str(out/'living_scene_assets.zip'),
       'complete':full,'smoothness_gate':'PASS'},ensure_ascii=False))


if __name__=='__main__':
    main()
