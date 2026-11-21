#!/usr/bin/env python3
"""Optional: download official Blockbench *editor* as a SEPARATE GPL-3.0 repository.
No GPL Blockbench code is combined or shipped with the Casual Game Studio runtime.
Run once on an internet-connected host; do not run npm automatically.
"""
from __future__ import annotations
import argparse
import pathlib
import shutil
import subprocess

URL='https://github.com/JannisX11/blockbench.git'
TAG='v5.2.0'
def main():
    p=argparse.ArgumentParser()
    p.add_argument('--out',type=pathlib.Path,default=pathlib.Path('blockbench-v5.2.0-source'))
    args=p.parse_args();dest=args.out.expanduser().resolve()
    if dest.exists():raise SystemExit(f'Destination already exists: {dest}')
    if not shutil.which('git'):raise SystemExit('git executable is required')
    subprocess.run(['git','clone','--depth','1','--branch',TAG,'--single-branch',URL,str(dest)],check=True,timeout=240)
    license_file=dest/'LICENSE.MD'
    if not license_file.exists():raise SystemExit('Expected Blockbench GPLv3 license missing')
    print(f'Blockbench {TAG} source in {dest}; official editor is GPL-3.0. Use it separately.')
if __name__=='__main__':main()
