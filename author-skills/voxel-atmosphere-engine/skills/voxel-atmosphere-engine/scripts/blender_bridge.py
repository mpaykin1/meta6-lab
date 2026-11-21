#!/usr/bin/env python3
"""Run independent Blender headless model and animation export on a GLB asset."""
import argparse
import pathlib
import shutil
import subprocess
import sys

HERE=pathlib.Path(__file__).resolve().parent

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input',type=pathlib.Path,required=True)
    p.add_argument('--out',type=pathlib.Path,required=True)
    p.add_argument('--blend',type=pathlib.Path)
    p.add_argument('--blender',default='blender',help='Blender executable, or full executable path')
    p.add_argument('--motion',choices=['hover','breathe','static'],default='hover')
    p.add_argument('--optimize-static',action='store_true')
    a=p.parse_args()
    source=a.input.resolve()
    target=a.out.resolve()
    if not source.is_file():p.error('Input GLB not found: '+str(source))
    if source==target:p.error('Output must not overwrite source')
    exe=shutil.which(a.blender)
    if not exe:p.error('Blender not installed. Download it from https://www.blender.org/download/; or use glb_motion.py offline.')
    blend=(a.blend or target.with_suffix('.blend')).resolve()
    target.parent.mkdir(parents=True,exist_ok=True)
    blend.parent.mkdir(parents=True,exist_ok=True)
    cmd=[exe,'--background','--factory-startup','--python',str(HERE/'blender_scene.py'),'--',
        '--input',str(source),'--output',str(target),'--blend',str(blend),'--motion',a.motion]
    if a.optimize_static:cmd.append('--optimize-static')
    subprocess.run(cmd,check=True)
    if not target.is_file() or target.stat().st_size<20 or not blend.is_file():
        raise SystemExit('Blender did not generate both GLB and editable BLEND source')
    print('BLEND:',blend,'GLB:',target)

if __name__=='__main__':main()
