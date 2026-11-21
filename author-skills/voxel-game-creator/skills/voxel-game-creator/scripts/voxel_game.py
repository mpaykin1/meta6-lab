#!/usr/bin/env python3
"""Unified Voxel Game Creator CLI: native engines + VOX/asset bridges.

Mineclonia is an independent GPL-native Luanti game, never linked into MIT WebGL.
Optional --veloren-vox imports user-owned MagicaVoxel geometry via existing Ragnagrok.
"""
from __future__ import annotations
import argparse
import sys
import tempfile
from pathlib import Path

import generate_game
import create_blockwild
import create_vesper
import create_minecraft_w
import create_voxelcraft
import create_mineclonia
import veloren_bridge

NATIVE = ('blockwild','vesper','minecraft-w','voxelcraft','mineclonia')
SUPPORT_VOX = (*NATIVE,'browser','server','both','all')


def drop_value(args: list[str], key: str) -> list[str]:
    out=[];i=0
    while i<len(args):
        if args[i]==key:
            if i+1>=len(args):raise SystemExit('Missing value for '+key)
            i+=2
        elif args[i].startswith(key+'='):
            i+=1
        else:
            out.append(args[i]);i+=1
    return out


def looks_like_upstream_copyrighted(vox: Path) -> bool:
    if (vox.parent/(vox.name+'.LICENSE-GPL-3.0')).is_file() or (vox.parent/(vox.name+'.ATTRIBUTION.txt')).is_file():
        return True
    path_parts=tuple(p.lower() for p in vox.parts)
    return any(path_parts[i:i+3] == ('assets','voxygen','voxel') or
               path_parts[i:i+3] == ('assets','common','voxel')
               for i in range(len(path_parts)-2))


def dispatch(mode: str | None, args: list[str]) -> None:
    if mode == 'veloren-assets':
        if '--engine' in args:
            k=args.index('--engine');args=args[:k]+args[k+2:]
        else:
            args=[v for v in args if not v.startswith('--engine=')]
        sys.argv=[sys.argv[0],*args]
        veloren_bridge.main()
        return
    if mode in NATIVE:
        if '--engine' in args:
            k=args.index('--engine');args=args[:k]+args[k+2:]
        else:
            args=[v for v in args if not v.startswith('--engine=')]
        if mode=='mineclonia':
            sys.argv=[sys.argv[0],*args];create_mineclonia.main()
        elif mode=='voxelcraft':
            sys.argv=[sys.argv[0],*args];create_voxelcraft.main()
        elif mode=='minecraft-w':
            sys.argv=[sys.argv[0],*args];create_minecraft_w.main()
        elif mode=='vesper':
            sys.argv=[sys.argv[0],*args];create_vesper.main()
        elif '--vesper-atmosphere' in args:
            sys.argv=[sys.argv[0],*(x for x in args if x!='--vesper-atmosphere')]
            create_vesper.weather_main()
        else:
            sys.argv=[sys.argv[0],*args];create_blockwild.main()
    else:
        sys.argv=[sys.argv[0],*args]
        generate_game.main()


def main() -> None:
    p=argparse.ArgumentParser(add_help=False)
    p.add_argument('--engine')
    p.add_argument('--veloren-vox',type=Path)
    p.add_argument('--veloren-rights',choices=('own',))
    p.add_argument('--veloren-model-id',default='vgc_vox_prop')
    p.add_argument('--veloren-model-index',type=int,default=0)
    p.add_argument('--veloren-voxel-scale',type=float,default=.1)
    p.add_argument('--out',type=Path)
    a,_=p.parse_known_args()
    args=sys.argv[1:]
    if a.veloren_vox is None:
        dispatch(a.engine,args)
        return
    if a.engine not in SUPPORT_VOX:
        p.error('--veloren-vox supported by browser/server/both/all and native Three.js/Luanti modes')
    if a.veloren_rights != 'own':
        p.error('Automatic import is for models you own: specify --veloren-rights own. GPL Veloren art requires isolated rights review.')
    if looks_like_upstream_copyrighted(a.veloren_vox.resolve()):
        p.error('Veloren-original GPL art must not be automatically embedded in an MIT game. Use --engine veloren-assets import instead.')
    if a.out is None:
        p.error('--out is required')
    if '--ragnagrok-project' in args or any(x.startswith('--ragnagrok-project=') for x in args):
        p.error('Cannot combine --veloren-vox and --ragnagrok-project in one run')
    project=veloren_bridge.make_project(a.veloren_vox.resolve(),
        name=a.veloren_model_id,scale=a.veloren_voxel_scale,
        model_index=a.veloren_model_index,rights='own')
    for name in ('--veloren-vox','--veloren-rights','--veloren-model-id',
                 '--veloren-model-index','--veloren-voxel-scale'):
        args=drop_value(args,name)
    with tempfile.TemporaryDirectory(prefix='vgc-veloren-vox-') as tmp:
        t=Path(tmp)/'ragnagrok-project.json'
        import json
        t.write_text(json.dumps(project,ensure_ascii=False),encoding='utf-8')
        dispatch(a.engine,[*args,'--ragnagrok-project',str(t)])
    out=a.out.resolve()
    notice=out/'VGC_VOX_PROVENANCE.json'
    if out.is_dir() and not notice.exists():
        notice.write_text(json.dumps({
            'source_file':a.veloren_vox.name,
            'sha256':project['vgc_origin']['sha256'],
            'rights':'claimed user-owned',
            'converter':'VGC Veloren VOX bridge',
            'format':'MagicaVoxel VOX -> native Ragnagrok asset -> original engine',
            'not_included':'Veloren GPL source or Veloren project art',
            'collision':'Mineclonia: native Luanti nodes; Three.js modes: visual-only',
        },indent=2)+'\n',encoding='utf-8')


if __name__=='__main__':main()
