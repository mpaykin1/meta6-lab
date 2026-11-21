#!/usr/bin/env python3
"""Get the actual Zlib-licensed upstream source repository in a separate directory."""
from pathlib import Path
import argparse, subprocess

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    if a.out.exists():
        raise SystemExit('Destination exists: '+str(a.out))
    subprocess.run(['git','clone','--depth','1','--branch','main',
      'https://github.com/pmndrs/postprocessing.git',str(a.out)],check=True)
    print('Source checked out in',a.out)
if __name__=='__main__':main()
