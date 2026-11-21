#!/usr/bin/env python3
"""Fetch original MIT glTF-Transform source at the audited pinned Git commit.

Source checkout is optional: the generator uses the official npm CLI on demand.
Network, git and disk space are required; existing destinations are never overwritten.
"""
from __future__ import annotations
import argparse
import shutil
import subprocess
from pathlib import Path

SOURCE = 'https://github.com/donmccurdy/glTF-Transform.git'
PIN = '8e2a94a2616d293c4b503d0fb6a4b42e6ec7c62f'


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',required=True,type=Path)
    args=p.parse_args()
    out=args.out.resolve()
    if out.exists():p.error('destination exists: will not overwrite '+str(out))
    out.parent.mkdir(parents=True,exist_ok=True)
    try:
        subprocess.run(['git','init','--quiet',str(out)],check=True)
        subprocess.run(['git','-C',str(out),'remote','add','origin',SOURCE],check=True)
        subprocess.run(['git','-C',str(out),'fetch','--quiet','--depth','1','origin',PIN],check=True)
        subprocess.run(['git','-C',str(out),'checkout','--quiet','--detach','FETCH_HEAD'],check=True)
        print('Fetched glTF-Transform source '+PIN+' at '+str(out))
    except BaseException:
        shutil.rmtree(out,ignore_errors=True)
        raise

if __name__=='__main__':main()
