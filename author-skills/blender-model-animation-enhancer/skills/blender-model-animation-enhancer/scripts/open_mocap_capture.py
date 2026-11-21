#!/usr/bin/env python3
"""Blender 4.0 headless adapter calling Open Mocap's real PoseTracking.detect_pose.
Runs only in legacy Blender 4.0 and does not use the add-on's GUI/timer path.
This captures tracked landmarks, not a skinned or animated character.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
import math
from pathlib import Path
import sys


def get_args():
    command = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument('--video', required=True)
    p.add_argument('--side-video')
    p.add_argument('--output', required=True)
    p.add_argument('--addon-dir', required=True)
    p.add_argument('--max-frames', type=int, default=18000)
    return p.parse_args(command)


def load_source(folder):
    init = folder / '__init__.py'
    if not init.is_file() or not (folder / 'utils.py').is_file():
        raise FileNotFoundError('Open Mocap checkout must contain __init__.py and utils.py')
    name = 'enhancer_mocap_upstream'
    spec = importlib.util.spec_from_file_location(name, init, submodule_search_locations=[str(folder)])
    if spec is None or spec.loader is None:
        raise RuntimeError('Open Mocap package import spec unavailable')
    package = importlib.util.module_from_spec(spec)
    sys.modules[name] = package
    spec.loader.exec_module(package)
    return package


def capture(package, video, mode, max_frames):
    # Calls original, upstream Open Mocap motion estimator (not a placeholder).
    import cv2
    utils = package.utils
    gvar = package.globalVariables
    if utils.PoseDetector is None:
        raise RuntimeError('Open Mocap requires compatible cvzone, mediapipe and opencv-python inside Blender 4.0')
    source = cv2.VideoCapture(str(video))
    if not source.isOpened():
        raise RuntimeError('OpenCV cannot open video: ' + str(video))
    fps = float(source.get(cv2.CAP_PROP_FPS))
    if not math.isfinite(fps) or fps <= 0:
        fps = 30.0
    tracker = utils.PoseTracking.__new__(utils.PoseTracking)
    tracker.detector = None
    tracker.mode = mode
    frames = []
    misses = 0
    count = 0
    try:
        while count < max_frames:
            ok, frame = source.read()
            if not ok: break
            count += 1
            before = len(gvar.positionList if mode=='front_pose' else gvar.zlist)
            tracker.detect_pose(frame)
            data = gvar.positionList if mode=='front_pose' else gvar.zlist
            if len(data) > before:
                new = list(data[-1])
                if len(new) != 120 or not all(math.isfinite(v) for v in new):
                    raise ValueError('Open Mocap produced non-finite or malformed 40-landmark frame')
                frames.append(new)
            else:
                # Preserve video-frame timing when detection briefly fails.
                misses += 1
                frames.append(list(frames[-1]) if frames else None)
    finally:
        source.release()
    if not frames or all(v is None for v in frames):
        raise RuntimeError('No person detected: Open Mocap returned zero valid pose frames')
    first_valid = next(v for v in frames if v is not None)
    frames = [first_valid if v is None else v for v in frames]
    return fps, frames, misses


def main():
    args=get_args()
    import bpy
    if tuple(bpy.app.version[:2]) > (4,0):
        raise RuntimeError('Open Mocap is only supported with Blender 4.0 or earlier; use --mocap-blender40')
    package=load_source(Path(args.addon_dir).expanduser().resolve())
    var=package.globalVariables
    var.positionList.clear(); var.zlist.clear()
    front=Path(args.video).expanduser().resolve()
    fps,frames,misses=capture(package,front,'front_pose',args.max_frames)
    if args.side_video:
        side=Path(args.side_video).expanduser().resolve()
        var.zlist.clear()
        fps2,other,missing_side=capture(package,side,'side_pose',args.max_frames)
        if abs(fps2-fps)/max(fps,1.0)>0.03:
            raise RuntimeError('Front and side videos have different FPS: synchronize before multiview capture')
        if abs(len(other)-len(frames)) > max(2,int(0.02*len(frames))):
            raise RuntimeError('Two camera videos are not frame-synchronized')
        frames=frames[:min(len(frames),len(other))]
        other=other[:len(frames)]
        for f, s in zip(frames,other):
            for i in range(40):
                # Same front/side Z combine as upstream CombineMotionData.
                f[3*i+2] = -s[3*i]
        misses+=missing_side
    payload={'format':'open-mocap-landmarks-v1','fps':fps,'count':len(frames),'points':40,
             'coordinates':'opencv-normalized','landmarks':frames,'missing_detections':misses,
             'provenance':'Open Mocap PoseTracking.detect_pose'}
    out=Path(args.output).expanduser().resolve()
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(payload,separators=(',',':')),encoding='utf8')
    if out.stat().st_size<250:
        raise RuntimeError('Capture produced no useful data')
    print('[open-mocap] Captured',len(frames),'frames at',fps,'FPS')

if __name__=='__main__':
    main()
