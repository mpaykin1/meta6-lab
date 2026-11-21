#!/usr/bin/env python3
"""Download unmodified Pixelorama upstream separately under MIT, if network is available."""
from pathlib import Path
import argparse, subprocess
p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True)
a=p.parse_args()
if a.out.exists():raise SystemExit('Output already exists; refusing overwrite')
subprocess.run(['git','clone','--filter=blob:none','--depth','1','https://github.com/Orama-Interactive/Pixelorama.git',str(a.out)],check=True,timeout=120)
print('Original Pixelorama source:',a.out)
