#!/usr/bin/env python3
"""Sparse/shallow checkout of Blender source (GPL-3.0); runtime/editor separate."""
import argparse
from pathlib import Path
import subprocess

REPO='https://github.com/blender/blender.git'

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--full',action='store_true',help='Download entire giant Blender source tree')
    a=ap.parse_args();target=a.out.resolve()
    if target.exists():ap.error('Target must not exist (do not overwrite repository)')
    target.parent.mkdir(parents=True,exist_ok=True)
    try:
        if a.full:
            subprocess.run(['git','clone','--depth','1',REPO,str(target)],check=True)
        else:
            subprocess.run(['git','clone','--depth','1','--filter=blob:none','--sparse',REPO,str(target)],check=True)
            subprocess.run(['git','-C',str(target),'sparse-checkout','set','--no-cone',
                            'README.md','COPYING','scripts/addons_core/io_scene_gltf2',
                            'scripts/modules/bpy'],check=True)
    except subprocess.CalledProcessError as e:
        ap.exit(1,f'Blender source checkout unavailable: {e}. The bpy pipeline still works with installed Blender.\n')
    print('Blender source:',target)

if __name__=='__main__':main()
