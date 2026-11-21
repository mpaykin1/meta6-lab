#!/usr/bin/env python3
"""Clone official pinned MIT Yuka source for inspection or reuse, separately from game builds."""
from __future__ import annotations
import argparse
import shutil
import subprocess
from pathlib import Path

REPOSITORY='https://github.com/Mugen87/yuka.git'
PIN='10591304811222d6856020d5de129b39ef43b58d'


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',required=True,type=Path)
    args=p.parse_args()
    out=args.out.resolve()
    if out.exists():raise SystemExit('Refusing existing source path: '+str(out))
    out.parent.mkdir(parents=True,exist_ok=True)
    try:
        subprocess.run(['git','clone','--no-checkout','--filter=blob:none',REPOSITORY,str(out)],check=True,timeout=240)
        subprocess.run(['git','-C',str(out),'checkout','--detach',PIN],check=True,timeout=240)
        actual=subprocess.check_output(['git','-C',str(out),'rev-parse','HEAD'],text=True,timeout=15).strip()
        if actual!=PIN:raise RuntimeError('Yuka source checkout commit mismatch')
        if 'MIT License' not in (out/'LICENSE').read_text(encoding='utf-8'):
            raise RuntimeError('Yuka source license missing')
    except BaseException:
        shutil.rmtree(out,ignore_errors=True)
        raise
    print('Yuka source ready:',out)

if __name__=='__main__':main()
