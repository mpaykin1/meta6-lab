#!/usr/bin/env python3
"""Optional separate pinned upstream source checkout; full source not bundled."""
from __future__ import annotations
import argparse
import subprocess
from pathlib import Path

URL='https://github.com/Auburn/FastNoiseLite.git'
PIN='785f37a9ad76e283586a379675085f2063ae03f7'

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    out=a.out.resolve()
    if out.exists():raise SystemExit('output exists: '+str(out))
    subprocess.run(['git','clone','--no-checkout','--filter=blob:none',URL,str(out)],check=True,timeout=240)
    subprocess.run(['git','-C',str(out),'checkout','--detach',PIN],check=True,timeout=240)
    head=subprocess.check_output(['git','-C',str(out),'rev-parse','HEAD'],text=True).strip()
    assert head==PIN, 'upstream revision mismatch'
    assert (out/'LICENSE').is_file(), 'MIT license missing'
    print(out)
if __name__=='__main__':main()
