#!/usr/bin/env python3
"""Optional separate MIT Recast source checkout; never vendor into game bundles."""
import argparse
from pathlib import Path
import subprocess
REPO='https://github.com/isaac-mason/recast-navigation-js.git'
PIN='8a2ece9f8b4947fcb328e17c7ac76c41744021b3'
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    out=a.out.resolve()
    if out.exists():raise SystemExit('Refusing to overwrite existing source directory')
    subprocess.run(['git','clone','--no-checkout','--filter=blob:none',REPO,str(out)],check=True,timeout=240)
    subprocess.run(['git','-C',str(out),'checkout','--detach',PIN],check=True,timeout=240)
    head=subprocess.check_output(['git','-C',str(out),'rev-parse','HEAD'],text=True).strip()
    if head!=PIN:raise SystemExit('Unexpected Recast revision')
    print(out)
if __name__=='__main__':main()
