#!/usr/bin/env python3
"""Optional pinned official MIT three-mesh-bvh source checkout, not required for npm mode."""
import argparse
import subprocess
from pathlib import Path
from create_game import fail
from bvh_bridge import PIN

REPO='https://github.com/gkjohnson/three-mesh-bvh.git'

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args(); out=a.out.resolve()
    if out.exists():fail('output already exists: '+str(out))
    subprocess.run(['git','clone','--no-checkout',REPO,str(out)],check=True,timeout=160)
    subprocess.run(['git','checkout','--detach',PIN],cwd=out,check=True,timeout=80)
    license=(out/'LICENSE').read_text(encoding='utf8')
    if not license.startswith('MIT License'):fail('official MIT license missing')
    print(out)

if __name__=='__main__': main()
