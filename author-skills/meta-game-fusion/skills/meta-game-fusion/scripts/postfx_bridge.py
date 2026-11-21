#!/usr/bin/env python3
"""Edit art direction in a generated META GAME FUSION 3D world only.

No source games, imported rigs, physical actions, Ink variables or Rete graph
structure are touched. The validator requires an authored generated world layout.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path

STYLES = ('nocturne','ink','ember','horror','dream','pixel')


def update(args: argparse.Namespace) -> None:
    public_world = Path(args.world).expanduser().resolve(strict=True)
    if public_world.name != 'world.json' or public_world.parent.name != 'public':
        raise ValueError('Expected generated game public/world.json')
    project = public_world.parent.parent
    pkg = project / 'package.json'
    adapter = project / 'src' / 'postfx.js'
    if public_world.is_symlink() or pkg.is_symlink() or not adapter.is_file():
        raise ValueError('Generated world must include Postprocessing adapter')
    manifest = json.loads(pkg.read_text(encoding='utf-8'))
    if manifest.get('name') != 'meta-game-fusion-rapier-world' or manifest.get('dependencies',{}).get('postprocessing') != '6.39.6':
        raise ValueError('Not an authorized META GAME FUSION generated world')
    data = json.loads(public_world.read_text(encoding='utf-8'))
    if data.get('schema') != 'meta-game-fusion.physics-world.v1':
        raise ValueError('Unknown world schema')
    style = data.setdefault('visual_direction',{})
    style['engine'] = 'postprocessing@6.39.6'
    style['styles'] = list(STYLES)
    style['hero_identity_preserved'] = True
    style['gameplay_state_untouched'] = True
    if args.default is not None:
        style['default'] = args.default
    if args.quality is not None:
        style['quality'] = args.quality
    scenes={n['id'] for n in data.get('nodes',[]) if isinstance(n,dict) and n.get('type') in ('scene','mechanic') and isinstance(n.get('id'),str)}
    by_node=style.setdefault('by_node',{})
    if not isinstance(by_node,dict):
        raise ValueError('Invalid node style manifest')
    for pair in args.scene or []:
        if '=' not in pair:raise ValueError('Use --scene node_id=style')
        node,sty=pair.split('=',1)
        if node not in scenes or sty not in STYLES:raise ValueError('Unknown scene ID or style')
        by_node[node]=sty
    temp=public_world.with_suffix('.json.tmp')
    with temp.open('w',encoding='utf-8') as fh:
        json.dump(data,fh,ensure_ascii=False,indent=2)
        fh.write('\n')
    os.replace(temp,public_world)
    print('Art-direction styles updated for', project)


def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    sub=p.add_subparsers(dest='command',required=True)
    sub.add_parser('presets')
    u=sub.add_parser('set')
    u.add_argument('--world',required=True)
    u.add_argument('--default',choices=STYLES)
    u.add_argument('--quality',choices=('cinema','eco','off'))
    u.add_argument('--scene',action='append',help='scene_id=ink|ember|horror|dream|pixel|nocturne')
    args=p.parse_args()
    if args.command=='presets':print('\n'.join(STYLES));return
    try:update(args)
    except (ValueError,OSError,KeyError,TypeError) as e:p.exit(2,str(e)+'\n')

if __name__=='__main__':main()
