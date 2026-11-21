#!/usr/bin/env python3
"""Download Blockbench as a separate GPL-3.0 editor; no GPL source in MIT engine."""
from __future__ import annotations
import argparse
import shutil
import subprocess
from pathlib import Path

REPO='https://github.com/JannisX11/blockbench.git'
PIN='ec0b2827104d0799c153bfb5f867579c0c44652f'

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args(); out=a.out.resolve()
    if out.exists():raise SystemExit('Will not overwrite '+str(out))
    if not shutil.which('git'):raise SystemExit('Git required to download Blockbench')
    out.parent.mkdir(parents=True,exist_ok=True)
    try:
        subprocess.run(['git','clone',REPO,str(out)],check=True)
        subprocess.run(['git','checkout','--detach',PIN],cwd=out,check=True)
        notice=(out/'LICENSE.MD').read_text(encoding='utf-8')
        if 'GNU GENERAL PUBLIC LICENSE' not in notice:
            raise RuntimeError('Expected original GPL-3.0 license')
        for rel in ['package.json','js/io/formats/bbmodel.js']:
            if not (out/rel).is_file():
                # Blockbench's internal format files may be renamed. Only package is essential.
                if rel=='package.json':raise RuntimeError('Missing Blockbench package.json')
        print('BLOCKBENCH_SOURCE '+str(out))
        print('Run: cd '+str(out)+' && npm ci && npm run serve')
    except BaseException:
        if out.exists():shutil.rmtree(out,ignore_errors=True)
        raise

if __name__=='__main__':main()
