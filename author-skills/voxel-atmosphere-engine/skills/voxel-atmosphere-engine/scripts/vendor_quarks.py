#!/usr/bin/env python3
"""Vendor Three.Quarks 0.17.1 for Voxel Atmosphere Engine when npm network is available.

npm and esbuild bundle quarks.core + three.quarks but leave THREE external.
This guarantees one Three.js shared runtime, resolving through the game's import map.
If offline, leaves the current runnable game untouched (native particle fallback).
"""
import argparse
from pathlib import Path
import shutil
import subprocess
import tempfile


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--game',type=Path,required=True,help='Game root containing fx/')
    args=p.parse_args()
    output=args.game/'fx/vendor/three.quarks.esm.js'
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='vae-quarks-') as td:
        root=Path(td)
        (root/'main.mjs').write_text("export * from 'three.quarks';\n", encoding='utf8')
        subprocess.run(['npm','install','--prefix',str(root),'--no-audit','--no-fund',
            'three.quarks@0.17.1','three@0.187.0','esbuild@0.25.12'],check=True)
        npx=root/'node_modules/.bin/esbuild'
        subprocess.run([str(npx),str(root/'main.mjs'),'--bundle','--platform=browser',
            '--format=esm','--target=es2022','--external:three',f'--outfile={output}'],check=True)
    print('Vendored:',output)
    print('Keep MIT attribution: https://github.com/Alchemist0823/three.quarks/blob/master/LICENSE')

if __name__=='__main__':main()
