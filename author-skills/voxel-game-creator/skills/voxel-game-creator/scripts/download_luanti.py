#!/usr/bin/env python3
"""Optionally fetch the official Luanti LGPL source into a separate folder.

A Luanti mod can be generated without an engine checkout. The source clone
is separate from the MIT game engines. Requires network, git and disk space.
"""
from __future__ import annotations
import argparse
import subprocess
from pathlib import Path

UPSTREAM = 'https://github.com/luanti-org/luanti.git'
PIN = '8bb14e85d21a09d37961ed97548f6a9f71349422'

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    dest = a.out.resolve()
    if dest.exists():
        p.error('destination exists, refusing overwrite')
    dest.parent.mkdir(parents=True,exist_ok=True)
    try:
        subprocess.run(['git','init','--quiet',str(dest)],check=True)
        subprocess.run(['git','-C',str(dest),'remote','add','origin',UPSTREAM],check=True)
        subprocess.run(['git','-C',str(dest),'fetch','--quiet','--depth','1','--filter=blob:none','origin',PIN],check=True)
        subprocess.run(['git','-C',str(dest),'checkout','--quiet','--detach','FETCH_HEAD'],check=True)
        print('Fetched Luanti source '+PIN+' at '+str(dest))
    except BaseException:
        import shutil
        shutil.rmtree(dest,ignore_errors=True)
        raise
if __name__=='__main__':
    main()
