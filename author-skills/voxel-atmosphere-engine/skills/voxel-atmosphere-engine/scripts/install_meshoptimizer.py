#!/usr/bin/env python3
"""Download pinned MIT meshoptimizer + gltfpack without touching the game source."""
import argparse, pathlib, shutil, subprocess, json

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--dir',type=pathlib.Path,required=True)
    args=parser.parse_args()
    dest=args.dir.resolve();dest.mkdir(parents=True,exist_ok=True)
    npm=shutil.which('npm')
    if not npm:raise SystemExit('Node/npm required; no upstream binary installed')
    deps={'meshoptimizer':'1.3.0','gltfpack':'1.3.0'}
    (dest/'package.json').write_text(json.dumps({'name':'vae-meshoptimizer','private':True,'version':'0.7.0','dependencies':deps},indent=2)+'\n')
    try:
        subprocess.run([npm,'install','--omit=dev','--ignore-scripts=false','--no-audit','--no-fund'],cwd=dest,check=True,timeout=180)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired) as exc:
        raise SystemExit(f'Upstream meshoptimizer/gltfpack NOT installed: {exc}')
    binpath=dest/'node_modules'/'.bin'/'gltfpack'
    if not binpath.exists():raise SystemExit('Npm succeeded but gltfpack binary missing; stop')
    print('Installed pinned upstream meshoptimizer 1.3.0:',binpath)
if __name__=='__main__':main()
