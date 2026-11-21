#!/usr/bin/env python3
"""Fetch official meshoptimizer MIT source separately, pinned to reviewed commit.

The VGC game runtime uses Three.js' compatible MeshoptDecoder; the compressed
GLBs are written using the meshoptimizer library bundled with glTF-Transform.
Git and internet access are required; the source is not used as a binary build.
"""
from __future__ import annotations
import argparse
import shutil
import subprocess
from pathlib import Path

SOURCE = 'https://github.com/zeux/meshoptimizer.git'
PIN = 'f0a684f11ead064e176775c9b796f82a55910e92'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    dst = args.out.expanduser().resolve()
    if dst.exists():
        parser.error('destination exists; will not overwrite')
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(['git','init','--quiet',str(dst)], check=True)
        subprocess.run(['git','-C',str(dst),'remote','add','origin',SOURCE],check=True)
        subprocess.run(['git','-C',str(dst),'fetch','--quiet','--depth','1','origin',PIN],check=True)
        subprocess.run(['git','-C',str(dst),'checkout','--quiet','--detach','FETCH_HEAD'],check=True)
        print('Fetched meshoptimizer '+PIN+' at '+str(dst))
    except BaseException:
        shutil.rmtree(dst, ignore_errors=True)
        raise

if __name__ == '__main__':
    main()
