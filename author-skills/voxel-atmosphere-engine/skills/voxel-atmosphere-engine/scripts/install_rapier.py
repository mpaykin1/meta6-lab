#!/usr/bin/env python3
"""Optionally download pinned upstream Rapier + embedded WASM ESM for local distribution.
When unavailable (network, npm), preserve the original working online-import game.
"""
import argparse
import json
import pathlib
import shutil
import subprocess

VERSION = '0.21.0'

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--game',required=True,type=pathlib.Path)
    parser.add_argument('--npm',default=shutil.which('npm'))
    args=parser.parse_args()
    game=args.game.resolve()
    if not (game/'index.html').is_file():
        raise SystemExit('Missing game/index.html')
    if not args.npm:
        raise SystemExit('npm not installed; browser CDN import remains active')
    workspace=game/'.rapier-install'
    workspace.mkdir(exist_ok=True)
    (workspace/'package.json').write_text(json.dumps({'private':True,'name':'vae-rapier-vendor','version':'0.8.0','dependencies':{'@dimforge/rapier3d-compat':VERSION}},indent=2))
    try:
        subprocess.run([args.npm,'install','--no-audit','--no-fund','--ignore-scripts'],cwd=workspace,check=True,timeout=125)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired) as err:
        raise SystemExit(f'Rapier not downloaded: {err}; CDN fallback retained')
    upstream=workspace/'node_modules'/'@dimforge'/'rapier3d-compat'
    # Rapier compat ships its WASM embedded as base64 in its JS module.
    candidates=['rapier.es.js','rapier.mjs','rapier.js']
    source=next((upstream/name for name in candidates if (upstream/name).is_file()),None)
    if not source:
        raise SystemExit('Rapier npm package has no recognized standalone module; no source substituted')
    vendor=game/'fx'/'vendor';vendor.mkdir(parents=True,exist_ok=True)
    shutil.copy2(source,vendor/'rapier.es.js')
    (vendor/'UPSTREAM-APACHE-2.0.txt').write_text(
        'Rapier 0.21.0 by Dimforge, Apache-2.0.\n'
        'Source: https://github.com/dimforge/rapier\n'
        'License: https://github.com/dimforge/rapier/blob/master/LICENSE\n')
    print(f'Vendored actual Rapier package: {source.stat().st_size} bytes')
    print('Local module: ',vendor/'rapier.es.js')

if __name__=='__main__':main()
