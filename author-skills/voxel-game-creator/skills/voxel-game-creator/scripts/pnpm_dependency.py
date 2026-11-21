#!/usr/bin/env python3
"""Transactional pnpm-workspace lockfile edits (Voxelize Rust + Three.js client).

Voxelize uses pnpm-lock.yaml rather than package-lock.json; using npm inside that
workspace would create mismatched locks and silently disable Yuka/Recast.
"""
from __future__ import annotations
import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from create_game import fail


def resolve(client:Path, packages:dict[str,str], mode:str, label:str)->tuple[bool,str]:
    root=client.parent.parent  # <generated-Voxelize>/examples/client -> root
    manifest=client/'package.json'
    lock=root/'pnpm-lock.yaml'
    workspace=root/'pnpm-workspace.yaml'
    if not (manifest.is_file() and lock.is_file() and workspace.is_file()):
        if mode=='required':fail(label+' requires intact pnpm workspace and lockfile')
        return False,'pnpm-workspace-missing'
    if not shutil.which('pnpm'):
        if mode=='required':fail(label+' requires pnpm to resolve Voxelize dependencies')
        return False,'pnpm-not-installed'
    originals={p:p.read_bytes() for p in (manifest,lock)}
    try:
        args=['pnpm','add','--save-exact','--lockfile-only','--ignore-scripts',
              '--reporter=silent',*(n+'@'+v for n,v in packages.items())]
        proc=subprocess.run(args,cwd=client,env={**os.environ,'CI':'true'},
                            check=False,capture_output=True,text=True,timeout=60)
        if proc.returncode:raise RuntimeError((proc.stderr or proc.stdout)[-500:])
        spec=json.loads(manifest.read_text(encoding='utf8'))
        contents=lock.read_text(encoding='utf8')
        block=re.search(r'(?ms)^  examples/client:\s*\n(.*?)(?=^  [^ \n].*:\s*\n|^packages:|^snapshots:|\Z)',contents)
        if not block:raise RuntimeError('missing pnpm importer for examples/client')
        lines=block.group(1)
        for name,version in packages.items():
            if spec.get('dependencies',{}).get(name)!=version:
                raise RuntimeError('missing pinned pnpm package '+name)
            pattern=r'(?m)^      [\'\"]?'+re.escape(name)+r'[\'\"]?:\s*\n        specifier: [\'\"]?'+re.escape(version)+r'[\'\"]?\s*\n        version: '+re.escape(version)+r'(?![.0-9])'
            if not re.search(pattern,lines):
                raise RuntimeError('mismatched pnpm-lock importer '+name)
        return True,'pnpm-lock-resolved'
    except (OSError,subprocess.TimeoutExpired,RuntimeError,ValueError) as err:
        for path,raw in originals.items():path.write_bytes(raw)
        if mode=='required':fail(label+' pnpm dependency resolution failed: '+str(err))
        return False,'pnpm-unavailable; original manifests restored'
