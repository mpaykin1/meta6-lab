#!/usr/bin/env python3
"""Rigger CLI bridge: an isolated Blender invocation; never modifies its input."""
from __future__ import annotations
import argparse
import os
import re
import subprocess
import sys
from pathlib import Path
from run_enhancer import find_blender


def main():
    p = argparse.ArgumentParser(description='Rigger / Blender bridge')
    p.add_argument('--mode', required=True, choices=('retarget', 'controls', 'export'))
    p.add_argument('--input', required=True)
    p.add_argument('--output', required=True)
    p.add_argument('--rigger-dir', default=os.environ.get('RIGGER_SOURCE_DIR'))
    p.add_argument('--source')
    p.add_argument('--source-action')
    p.add_argument('--source-rig-name')
    p.add_argument('--rig-name')
    p.add_argument('--clip', default='Rigger_Retarget')
    p.add_argument('--bone-map')
    p.add_argument('--in-place', action='store_true')
    p.add_argument('--overwrite', action='store_true')
    a = p.parse_args()
    source = Path(a.input).expanduser().resolve()
    output = Path(a.output).expanduser().resolve()
    if not source.is_file(): p.error('Input model not found')
    if source == output: p.error('Source must never equal output')
    if output.exists() and not a.overwrite: p.error('Output already exists (provide --overwrite)')
    if not a.rigger_dir: p.error('Rigger repository missing; supply --rigger-dir or RIGGER_SOURCE_DIR')
    repo = Path(a.rigger_dir).expanduser().resolve()
    if not (repo/'rigger'/'__init__.py').is_file() or not (repo/'LICENSE').is_file():
        p.error('Not a real checked-out asu37/Rigger repository')
    if not re.fullmatch(r'[A-Za-z0-9_.-]{1,64}',a.clip): p.error('Invalid animation clip name')
    if a.mode == 'retarget':
        if not a.source: p.error('Retarget mode requires --source animated GLB/FBX')
        if source.suffix.lower() not in ('.glb','.gltf','.fbx','.blend'):p.error('Target must be GLB/glTF/FBX/BLEND')
        motion = Path(a.source).expanduser().resolve()
        if not motion.is_file() or motion.suffix.lower() not in ('.glb','.fbx'):
            p.error('Animated source must exist and must be GLB or FBX')
        if motion == source or motion == output:p.error('Choose distinct source, target and output files')
        if output.suffix.lower() not in ('.glb','.blend'):p.error('Output must be GLB or BLEND')
    elif a.mode == 'controls':
        if a.source or a.bone_map: p.error('Controls mode does not import an animated source or bone map')
        if output.suffix.lower()!='.blend':p.error('Control-rig mode is BLEND-only to preserve source game skeleton')
        if source.suffix.lower() not in ('.glb','.gltf','.fbx','.blend'):
            p.error('Unsupported input format')
    else:
        if a.source or a.bone_map: p.error('Game-export mode uses an existing Rigger control rig')
        if source.suffix.lower()!='.blend' or output.suffix.lower()!='.glb':
            p.error('Game-export requires input BLEND, output GLB')
    if a.bone_map and not Path(a.bone_map).is_file():p.error('Bone map JSON missing')
    blender = find_blender()
    if not blender: p.error('Blender 4.2+ not found; install Blender and set BLENDER_BIN')
    bridge = Path(__file__).with_name('rigger_blender.py')
    cmd=[blender,'--background','--factory-startup','--python-exit-code','3','--python',str(bridge),'--',
         '--mode',a.mode,'--input',str(source),'--output',str(output),'--rigger-dir',str(repo),'--clip',a.clip]
    for key,val in [('source',a.source),('source-action',a.source_action),('source-rig-name',a.source_rig_name),
                    ('rig-name',a.rig_name),('bone-map',a.bone_map)]:
        if val:cmd+=['--'+key,str(Path(val).resolve() if key in ('source','bone-map') else val)]
    if a.in_place:cmd+=['--in-place']
    output.parent.mkdir(parents=True,exist_ok=True)
    print('[Rigger] '+a.mode,flush=True)
    result=subprocess.run(cmd,check=False)
    if result.returncode!=0:
        print('[Rigger] Blender failed; output is not verified',file=sys.stderr)
        return result.returncode
    if not output.is_file() or output.stat().st_size<512:
        print('[Rigger] Output missing',file=sys.stderr)
        return 4
    print('[Rigger] '+str(output))
    return 0

if __name__=='__main__':
    raise SystemExit(main())
