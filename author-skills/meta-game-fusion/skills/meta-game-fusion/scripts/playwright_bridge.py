#!/usr/bin/env python3
"""META GAME FUSION read-only browser verification runner. No dependency installation."""
from __future__ import annotations
import argparse, json, subprocess, os, sys
from pathlib import Path

SCHEMA='meta-game-fusion.physics-world.v1'

def inspect(world:Path)->dict:
    root=world.resolve(strict=True)
    if not root.is_file() or root.stat().st_size > 6_000_000:
        raise ValueError('Invalid or oversized world.json')
    data=json.loads(root.read_text(encoding='utf8'))
    if data.get('schema')!=SCHEMA:raise ValueError('Only approved physics-world.v1 is supported')
    nodes=data.get('nodes') or []
    edges=data.get('connections') or []
    if not isinstance(nodes,list) or not 1<=len(nodes)<=400 or not isinstance(edges,list):
        raise ValueError('Invalid scene graph')
    ids=[n.get('id') for n in nodes]
    if len(ids)!=len(set(ids)): raise ValueError('Duplicate graph node')
    if not all(e.get('source') in ids and e.get('target') in ids for e in edges):
        raise ValueError('Dangling graph connection')
    nav=data.get('navigation') or {}; visual=data.get('visual_direction') or {}
    if nav.get('engine')!='recast-navigation@0.44.0':raise ValueError('NavMesh adapter not present')
    if visual.get('engine')!='postprocessing@6.39.6':raise ValueError('Postprocessing adapter not present')
    if data.get('physics_engine')!='@dimforge/rapier3d-compat@0.21.0':raise ValueError('Rapier physics adapter not present')
    for a in data.get('assets',[]):
        if not isinstance(a,dict) or not str(a.get('src','')).startswith('/assets/') or not a.get('source_sha256'):
            raise ValueError('Unsafe/unattributed GLB asset')
    return {'scenes':len(nodes),'connections':len(edges),'assets':len(data.get('assets',[]))}

def cli():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('command',choices=['check','run'])
    p.add_argument('--project',required=True,help='Generated Rapier world path (not original game)')
    p.add_argument('--browser',choices=['desktop-chromium','mobile-chromium','all'],default='all')
    p.add_argument('--timeout',type=int,default=240)
    x=p.parse_args(); root=Path(x.project).expanduser().resolve(strict=True)
    if root.is_symlink() or not (root/'package.json').is_file() or not (root/'playwright.config.mjs').is_file():
        p.error('Generated world with Playwright adapter is required')
    stats=inspect(root/'public/world.json')
    if x.command=='check':print('World is structurally ready for browser verification:',stats);return
    if not (root/'node_modules/@playwright/test').is_dir():
        p.error('Playwright not installed in generated world; npm install --ignore-scripts and explicit browser provisioning required')
    # npm scripts only, no arbitrary user-provided commands, shell, uploads, or auto-install.
    cmd=['npm','run','e2e','--']
    if x.browser!='all':cmd+=['--project='+x.browser]
    try:subprocess.run(cmd,cwd=root,check=True,timeout=max(30,min(x.timeout,900)),env=os.environ.copy())
    except subprocess.TimeoutExpired:p.exit(124,'Browser verification timed out\n')
    except subprocess.CalledProcessError as exc:p.exit(exc.returncode or 1,'Browser verification failed\n')

if __name__=='__main__':
    try:cli()
    except (ValueError,FileNotFoundError,OSError,json.JSONDecodeError) as exc:sys.exit(str(exc))
