#!/usr/bin/env python3
"""Mandatory anti-jerk GIF quality gate for Hero Animator's living pixel scenes.

Usage: python smooth_motion_gate.py ./scene.gif --plan ./scene_motion_plan.json
Exits nonzero for non-looping, short, low-FPS, palette-flashing or discontinuous
clips. It cannot certify *artistic semantic correctness* alone; that needs
review of independent action sprites against the user's reference.
"""
from __future__ import annotations
import argparse, json, math, statistics
from pathlib import Path
from PIL import Image
import numpy as np
from smooth_trajectory import enforce_no_jerks


def analyze(path:Path,plan:Path|None=None,allow_preview=False)->dict:
    if not path.is_file():raise ValueError('GIF not found')
    im=Image.open(path)
    if im.format!='GIF':raise ValueError('Output must be real GIF')
    w,h=im.size
    ratio=w/h
    if not(.55<=ratio<=.575):raise ValueError(f'Portrait 9:16 required; got {w}x{h}')
    if im.info.get('loop')!=0:raise ValueError('GIF must loop infinitely, loop=0')
    if im.n_frames<120:raise ValueError('Too few animation frames')
    durations=[]; sampled=[];previous=None;first=None;last=None;delta=[]
    sampling=max(1,round(im.n_frames/140))
    for i in range(im.n_frames):
        im.seek(i)
        durations.append(im.info.get('duration',100))
        if i%sampling!=0 and i!=im.n_frames-1:continue
        current=np.asarray(im.convert('RGB'),dtype=np.int16)
        if first is None:first=current
        if previous is not None:
            delta.append(float(np.abs(current-previous).mean())/(i-sampled[-1]))
        sampled.append(i)
        previous=current
        last=current
    seconds=sum(durations)/1000
    fps=im.n_frames/seconds
    if not allow_preview:
        if not (40<=seconds<=60):raise ValueError(f'40–60s loop required; got {seconds:.2f}s')
        if fps<16:raise ValueError(f'GIF jerk risk: {fps:.1f} fps; require >=16 fps')
    boundary=float(np.abs(last-first).mean())
    typical=statistics.median(delta)
    if boundary>max(.55,typical*3.5):
        raise ValueError(f'Visible last→first seam: delta={boundary:.3f}, typical={typical:.3f}')
    # Detect sudden entire-image frame cuts. Independently animated tiny details
    # should not cause scene-wide pixel differences orders above normal.
    # Lightning and sunrise are allowed but must ease over multiple frames.
    for i,value in enumerate(delta):
        if value>max(8.0,statistics.median(delta[max(0,i-3):i+4])*8.0):
            raise ValueError(f'One-frame flash/cut or pose jump near sampled index {i}: Δ={value:.2f}')
    out={'frames':im.n_frames,'duration_seconds':seconds,'fps':fps,'size':[w,h],
         'last_first_delta':boundary,'typical_frame_delta':typical,
         'seam_ok':True,'anti_jerk_ok':True}
    if plan:
        p=json.loads(plan.read_text(encoding='utf8'))
        tracks=p.get('character_tracks')
        if not isinstance(tracks,list) or not tracks:
            raise ValueError('Motion plan must contain independent character_tracks')
        activities=[]; phases=[]
        for actor in tracks:
            for key in ('id','source_sha256','actions','phase','positions'):
                if key not in actor:raise ValueError(f'Character requires {key}')
            if len(actor['source_sha256'])!=64:raise ValueError('Source art SHA256 required')
            if not actor['actions'] or not actor['id']:raise ValueError('Empty actor actions/id')
            activities.append(tuple(actor['actions']))
            phases.append(actor['phase'])
            if len(actor['positions'])!=im.n_frames:
                raise ValueError('Track must cover every GIF frame')
            enforce_no_jerks(actor['positions'],
                             float(actor.get('max_frame_displacement_px',2.0)),
                             float(actor.get('max_frame_acceleration_px',1.3)))
        if len(tracks)>1 and len(set(phases))<len(tracks):
            raise ValueError('Synchronised actors prohibited: use independent phases')
        out['tracked_characters']=len(tracks)
    return out


def main():
    a=argparse.ArgumentParser(description=__doc__)
    a.add_argument('gif',type=Path);a.add_argument('--plan',type=Path)
    a.add_argument('--allow-preview',action='store_true',help='only for clearly labeled previews, never final deliverables')
    p=a.parse_args()
    try:
        result=analyze(p.gif,p.plan,p.allow_preview)
    except (ValueError,OSError,KeyError) as e:
        raise SystemExit('BLOCKED: '+str(e))
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
