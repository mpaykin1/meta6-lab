#!/usr/bin/env python3
"""Opt-in checkout of the official standalone GPL-3.0 Goxel source repository.
No Goxel source is embedded in the proprietary game pipeline.
"""
import argparse
from pathlib import Path
import subprocess

p=argparse.ArgumentParser()
p.add_argument('--out',type=Path,required=True)
a=p.parse_args()
if a.out.exists() and any(a.out.iterdir()):
    p.error('Target directory must be empty')
a.out.parent.mkdir(parents=True,exist_ok=True)
subprocess.check_call(['git','clone','--depth','1',
                        'https://github.com/guillaumechereau/goxel.git',str(a.out)])
print('Goxel GPL-3.0 upstream:',a.out)
