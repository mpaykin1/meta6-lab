#!/usr/bin/env python3
"""Strict anti-jerk validation of released GIFs, character art, camera, and loop.
Rejects temporal scene cuts, non-looping/strobed GIFs, missing full-body frames,
and camera teleports; structural result is not artistic approval.
"""
from __future__ import annotations
import argparse, json, math, statistics, hashlib
from pathlib import Path
import numpy as np
from PIL import Image

def validate(gif_path:Path,manifest:Path,scene:Path):
    if not all(p.is_file() for p in [gif_path,manifest,scene]):
        raise ValueError('BLOCKED: GIF, manifest and scene plan are all required')
    im=Image.open(gif_path)
    if im.format!='GIF' or im.info.get('loop')!=0:
        raise ValueError('BLOCKED: real infinitely looping GIF is required')
    w,h=im.size
    if not (.55 <= w/h <= .575):raise ValueError('BLOCKED: expected portrait 9:16')
    if im.n_frames < 1000:raise ValueError('BLOCKED: new 40s scene needs 1000+ rendered frames')
    m=json.loads(manifest.read_text('utf-8'))
    s=json.loads(scene.read_text('utf-8'))
    durations=[];deltas=[];previous=None;first=None;last=None
    # To disambiguate full-body sprite switches from architectural cuts, inspect a
    # stable upper architectural region, outside the foreground hero sprite.
    for i in range(im.n_frames):
        im.seek(i)
        durations.append(im.info.get('duration',100))
        a=np.asarray(im.convert('L').resize((160,284)),dtype=np.int16)[:148]
        if first is None:first=a
        if previous is not None:deltas.append(float(np.abs(a-previous).mean()))
        previous=a;last=a
    seconds=sum(durations)/1000
    fps=im.n_frames/seconds
    if not (40<=seconds<=60):raise ValueError(f'BLOCKED: loop {seconds:.2f}s outside 40–60s')
    if fps<24.9:raise ValueError(f'BLOCKED: jerk risk at {fps:.2f} FPS, need 25 FPS')
    typical=max(1,statistics.median(deltas))
    if np.quantile(deltas,.995)>max(12,2.5*typical):
        raise ValueError('BLOCKED: sudden room cut / full-image flash')
    seam=float(np.abs(last-first).mean())
    if seam>max(8,2.4*typical):
        raise ValueError(f'BLOCKED: broken last-to-first seam ({seam:.2f} vs {typical:.2f})')
    camera=s.get('camera',{})
    laps=float(camera.get('laps',0)); world_width=float(camera.get('width_pixels',0))
    if laps<=0 or world_width<=0:
        raise ValueError('BLOCKED: no documented looped camera/world coordinates')
    frame_step=laps*world_width/im.n_frames
    if frame_step > 2.5*(w/240):
        raise ValueError(f'BLOCKED: camera moves {frame_step:.2f}px/frame; limit is 2.5px at 240px output')
    characters=m.get('characters')
    if not isinstance(characters,list) or not characters:
        raise ValueError('BLOCKED: no separate character sprite sequences')
    for actor in characters:
        frames=actor.get('poseFrames',[])
        hashes=actor.get('poseSHA256',[])
        if len(frames)<8 or len(frames)!=len(hashes):
            raise ValueError('BLOCKED: fewer than 8 named artist-authored pose files')
        checks=[];dims=[]
        for p,hsh in zip(frames,hashes):
            file=manifest.parent/p
            if not file.is_file() or file.suffix.lower()!='.png':
                raise ValueError('BLOCKED: missing RGBA pose')
            if hashlib.sha256(file.read_bytes()).hexdigest()!=hsh:
                raise ValueError('BLOCKED: sprite SHA256 mismatch')
            with Image.open(file) as sr:
                if sr.mode!='RGBA':raise ValueError('BLOCKED: character frame not RGBA')
                dims.append(sr.size)
                checks.append(hashlib.sha256(sr.tobytes()).digest())
        if len(set(dims))!=1 or len(set(checks))<8:
            raise ValueError('BLOCKED: sprite poses are duplicated or misframed')
    return {'status':'STRUCTURALLY SMOOTH / ARTIST REVIEW REQUIRED',
            'fps':round(fps,2),'frames':im.n_frames,'seconds':round(seconds,2),
            'seam_mean_abs':round(seam,3),'typical_background_delta':round(typical,3),
            'camera_step_px_per_frame':round(frame_step,3),'characters':len(characters)}

def main():
    a=argparse.ArgumentParser()
    a.add_argument('gif',type=Path);a.add_argument('--manifest',type=Path,required=True)
    a.add_argument('--scene',type=Path,required=True)
    args=a.parse_args()
    try:print(json.dumps(validate(args.gif,args.manifest,args.scene),ensure_ascii=False,indent=2))
    except (ValueError,OSError,KeyError) as e:raise SystemExit(str(e))
if __name__=='__main__':main()
