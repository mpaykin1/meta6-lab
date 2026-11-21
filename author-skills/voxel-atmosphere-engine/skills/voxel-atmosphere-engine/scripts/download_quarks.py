#!/usr/bin/env python3
"""Clone three.quarks upstream (MIT) only when GitHub is reachable."""
import argparse
from pathlib import Path
import subprocess

p=argparse.ArgumentParser()
p.add_argument('--out',type=Path,required=True)
a=p.parse_args()
if a.out.exists():
    raise SystemExit('Destination exists; refusing to overwrite')
subprocess.run(['git','clone','--depth','1','https://github.com/Alchemist0823/three.quarks.git',str(a.out)],check=True)
