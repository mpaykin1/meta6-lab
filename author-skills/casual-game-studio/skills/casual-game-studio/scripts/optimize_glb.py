#!/usr/bin/env python3
"""Run the genuine @gltf-transform libraries without changing game runtime dependencies.

Full package downloads require npm access. The script never pretends success if
installation cannot complete; absent npm packages don't change the source GLB.
"""
from __future__ import annotations
import argparse
import json
import pathlib
import shutil
import subprocess
import sys

ROOT=pathlib.Path(__file__).resolve().parents[0]
TOOL=ROOT/'gltf-transform'
VERSION='4.5.1'
MESHOPT_VERSION='1.3.0'


def _run(cmd, timeout):
    return subprocess.run([str(s) for s in cmd],check=True,timeout=timeout)


def optimize(src:pathlib.Path, dst:pathlib.Path, install:bool=False, keep_larger:bool=False, meshopt:bool=False)->bool:
    src=src.expanduser().resolve()
    dst=dst.expanduser().resolve()
    if src==dst: raise ValueError('Source and destination must differ')
    if src.suffix.lower()!='.glb' or dst.suffix.lower()!='.glb':
        raise ValueError('Expected GLB files')
    if not src.is_file():raise FileNotFoundError(src)
    if shutil.which('node') is None: raise RuntimeError('Node.js 20+ is required')
    modules=TOOL/'node_modules/@gltf-transform/core/package.json'
    if install:
        if shutil.which('npm') is None: raise RuntimeError('npm is not installed')
        _run(['npm','install','--prefix',TOOL,'--no-audit','--no-fund','--save-exact','--omit=dev','--ignore-scripts'],240)
    if not modules.is_file():
        raise RuntimeError('glTF-Transform is not installed; run with --install (network access required)')
    installed=json.loads(modules.read_text('utf-8'))
    if installed.get('version')!=VERSION:
        raise RuntimeError('Installed glTF-Transform version mismatch; reinstall with --install')
    if meshopt:
        mesh_pkg=TOOL/'node_modules/meshoptimizer/package.json'
        if not mesh_pkg.is_file() or json.loads(mesh_pkg.read_text('utf-8')).get('version')!=MESHOPT_VERSION:
            raise RuntimeError('Meshoptimizer 1.3.0 missing: run with --install (network access required)')
    dst.parent.mkdir(parents=True,exist_ok=True)
    command=['node', TOOL/'optimize.mjs',src,dst]
    if meshopt:command.append('--meshopt')
    _run(command,90)
    if dst.stat().st_size>=src.stat().st_size and not keep_larger:
        dst.unlink()
        return False
    return True


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--src',required=True,type=pathlib.Path)
    p.add_argument('--out',required=True,type=pathlib.Path)
    p.add_argument('--install',action='store_true',help='Download pinned real official npm packages')
    p.add_argument('--keep-larger',action='store_true',help='Keep optimized result even if not smaller')
    p.add_argument('--meshopt',action='store_true',help='Quantize and compress geometry (lossy; opt-in)')
    a=p.parse_args()
    try:
        better=optimize(a.src,a.out,a.install,a.keep_larger,meshopt=a.meshopt)
        print('Optimized GLB ready' if better else 'Original model already smaller; left unchanged')
    except (RuntimeError,FileNotFoundError,subprocess.CalledProcessError,subprocess.TimeoutExpired,ValueError) as exc:
        raise SystemExit(f'Cannot run glTF-Transform: {exc}') from exc

if __name__=='__main__':main()
