#!/usr/bin/env python3
"""Host-side Open Mocap → same-identity Blender animation orchestration."""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

BASE=Path(__file__).resolve().parent

def main():
    p=argparse.ArgumentParser(description='Open Mocap video capture + Blender retarget')
    p.add_argument('--input',required=True)
    p.add_argument('--output',required=True)
    g=p.add_mutually_exclusive_group(required=True)
    g.add_argument('--video')
    g.add_argument('--landmarks')
    p.add_argument('--side-video')
    p.add_argument('--addon-dir')
    p.add_argument('--blender40')
    p.add_argument('--blender')
    p.add_argument('--bone-map')
    p.add_argument('--rig-name')
    p.add_argument('--clip',default='Mocap_Walk')
    p.add_argument('--mirror',action='store_true')
    p.add_argument('--overwrite',action='store_true')
    p.add_argument('--timeout',type=int,default=1800)
    args=p.parse_args()
    src=Path(args.input).expanduser().resolve();dst=Path(args.output).expanduser().resolve()
    if not src.is_file() or src.suffix.lower() not in ('.glb','.gltf','.fbx','.obj','.blend'):
        p.error('Input 3D file is missing or unsupported')
    if dst.suffix.lower()!='.glb' or src==dst:p.error('Output must be a distinct GLB')
    if dst.exists() and not args.overwrite:p.error('Output already exists')
    if args.side_video and not args.video:p.error('Side video needs a front video')
    if args.bone_map and not Path(args.bone_map).is_file():p.error('Bone map JSON missing')
    from run_enhancer import find_blender
    blender=args.blender or find_blender()
    if not blender or not Path(blender).is_file():p.error('Blender >=4.5 binary missing; set BLENDER_BIN')
    with tempfile.TemporaryDirectory(prefix='enhancer-mocap-') as tmp:
        temp=Path(tmp)
        if args.video:
            video=Path(args.video).resolve()
            if not video.is_file():p.error('Mocap video missing: '+str(video))
            if not args.addon_dir or not Path(args.addon_dir).is_dir():
                p.error('Real Open Mocap repo missing; use get_official_open_mocap_source.sh; --mocap-addon-dir required')
            legacy=args.blender40 or os.environ.get('BLENDER40_BIN')
            if not legacy or not Path(legacy).is_file():
                p.error('Open Mocap requires Blender 4.0; provide --mocap-blender40 or BLENDER40_BIN')
            capture=temp/'captured.json'
            cmd=[legacy,'--background','--factory-startup','--python-exit-code','3',
                 '--python',str(BASE/'open_mocap_capture.py'),'--',
                 '--video',str(video),'--output',str(capture),'--addon-dir',str(Path(args.addon_dir).resolve())]
            if args.side_video:cmd += ['--side-video',str(Path(args.side_video).resolve())]
            subprocess.run(cmd,check=True,timeout=args.timeout)
        else:
            capture=Path(args.landmarks).expanduser().resolve()
            if not capture.is_file():p.error('Mocap landmark JSON missing')
        candidate=temp/'mocap-final.glb'
        cmd=[blender,'--background','--factory-startup','--python-exit-code','3',
             '--python',str(BASE/'open_mocap_retarget.py'),'--',
             '--input',str(src),'--output',str(candidate),
             '--landmarks',str(capture),'--clip',args.clip]
        if args.bone_map:cmd += ['--bone-map',str(Path(args.bone_map).resolve())]
        if args.rig_name:cmd += ['--rig-name',args.rig_name]
        if args.mirror:cmd += ['--mirror']
        subprocess.run(cmd,check=True,timeout=args.timeout)
        if candidate.stat().st_size<500:raise RuntimeError('Generated GLB was empty')
        # Export is committed atomically only after Blender has checked clip conservation.
        dst.parent.mkdir(parents=True,exist_ok=True)
        os.replace(candidate,dst)
        print('[open-mocap] GLB ready:',dst)
    return 0

if __name__=='__main__':
    try:raise SystemExit(main())
    except (OSError,RuntimeError,subprocess.CalledProcessError,subprocess.TimeoutExpired) as ex:
        print('[open-mocap] ERROR:',ex,file=sys.stderr)
        raise SystemExit(2)
