#!/usr/bin/env python3
"""Rapier 0.21 / Three.js stage builder using an approved Rete/Ink blueprint.

Creates a *new* fully separated runnable Vite 3D preview. Imported code is never
executed. Only SHA-verified, rights-approved GLBs may be copied, and only as art.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import sys
from typing import Any

from gltf_optimize import inspect_glb, limited_path, sha256 as file_sha
from rete_bridge import (BLUEPRINT_SCHEMA, GRAPH_SCHEMA, ID_RE, ensure_output_not_in_source,
                         read_json, sample_graph)

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / 'templates' / 'rapier-world'
STORY_TEMPLATE = ROOT / 'templates' / 'rete-workbench'
SOURCE_STORY_SCHEMA = 'meta-game-fusion.ink-source-list.v1'
MAX_ASSET = 128 * 1024 * 1024
MAX_NODES = 400
PORTS = {
    'start':(set(),{'flow'}), 'scene':({'flow','asset'},{'flow'}),
    'mechanic':({'flow','asset'},{'flow'}), 'dialogue':({'flow'},{'flow'}),
    'branch':({'flow'},{'yes','no'}), 'ending':({'flow'},set()),
    'resource':(set(),{'asset'})
}
ALLOWED_TYPES = {'start','scene','dialogue','mechanic','branch','ending','resource'}
HEX = re.compile(r'^[a-f0-9]{64}$')
VISUAL_STYLES = ('nocturne','ink','ember','horror','dream','pixel')


def write_json(path: Path, obj: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + '\n', encoding='utf8')
    os.replace(temp, path)


def check_world_graph(data: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    nodes = data.get('nodes'); edges = data.get('connections')
    if not isinstance(nodes, list) or not 1 <= len(nodes) <= MAX_NODES or not isinstance(edges,list) or len(edges) > 1200:
        raise ValueError('Invalid graph size')
    clean = []; names = set(); starts = 0
    for node in nodes:
        if not isinstance(node, dict) or node.get('type') not in ALLOWED_TYPES:
            raise ValueError('Unknown graph node type')
        nid = node.get('id'); typ = node['type']
        if not isinstance(nid,str) or not ID_RE.fullmatch(nid) or nid in names:
            raise ValueError('Invalid/duplicate graph ID')
        names.add(nid); starts += typ == 'start'
        title = str(node.get('title',''))[:150]
        item = {'id':nid, 'type':typ, 'title':title}
        if typ in {'scene','mechanic'} and node.get('visual_style') is not None:
            if node['visual_style'] not in VISUAL_STYLES:
                raise ValueError('Unknown visual style')
            item['visual_style'] = node['visual_style']
        if typ == 'branch':
            cond = str(node.get('condition',''))
            if not re.fullmatch(r'(?:flag|item):[A-Za-z_][A-Za-z0-9_]{0,63}',cond):
                raise ValueError('Branch condition requires known typed state')
            item['condition'] = cond
        if typ == 'dialogue':
            sid = node.get('story_id'); ssha = node.get('story_sha256')
            if not isinstance(sid,str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]{0,63}',sid) or not HEX.fullmatch(str(ssha)):
                raise ValueError('Invalid Ink dialogue identity/hash')
            item.update(story_id=sid,story_sha256=ssha)
        if typ in {'mechanic','resource'}:
            item['component_id'] = str(node.get('component_id',''))[:128]
            item['source_sha256'] = str(node.get('source_sha256',''))[:64]
        clean.append(item)
    if starts != 1 or not any(n['type']=='ending' for n in clean):
        raise ValueError('Graph requires exactly one start and at least one ending')
    valid = []; known = {n['id'] for n in clean}; ids = set(); out = {}; by_id = {n['id']:n for n in clean}; successors={n:set() for n in known}; predecessor={n:set() for n in known}
    for e in edges:
        if not isinstance(e, dict): raise ValueError('Malformed edge')
        name = str(e.get('id',''))
        a = e.get('source'); b = e.get('target'); o = e.get('sourceOutput'); i = e.get('targetInput')
        if not ID_RE.fullmatch(name) or name in ids or a not in known or b not in known or a == b:
            raise ValueError('Broken or duplicate edge')
        ids.add(name)
        if o not in PORTS[by_id[a]['type']][1] or i not in PORTS[by_id[b]['type']][0] or (o=='asset')!=(i=='asset'):
            raise ValueError('Invalid typed edge')
        if i == 'flow':
            out.setdefault((a,o),0);out[(a,o)] += 1
            successors[a].add(b);predecessor[b].add(a)
        valid.append({'id':name,'source':a,'target':b,'sourceOutput':o,'targetInput':i})
    for (source, port), number in out.items():
        if number > 1: raise ValueError('Runtime requires deterministic single next edge per port')
    for n in clean:
        if n['type']=='branch' and not ({(n['id'],'yes'),(n['id'],'no')} <= set(out)):
            raise ValueError('Every branch must have yes/no outputs')
    start=next(n['id'] for n in clean if n['type']=='start')
    seen=set(); stack=[start]
    while stack:
        x=stack.pop()
        if x in seen:continue
        seen.add(x);stack.extend(successors[x])
    if {n['id'] for n in clean if n['type']!='resource'}-seen:
        raise ValueError('Disconnected narrative nodes')
    visiting=set(); visited=set()
    def visit(node):
        if node in visiting:raise ValueError('Cyclic story flow is not supported')
        if node in visited:return
        visiting.add(node)
        for nxt in successors[node]:visit(nxt)
        visiting.remove(node);visited.add(node)
    visit(start)
    return clean, valid


def gather_ink(source_root: Path, destination: Path, nodes: list[dict[str, Any]]) -> dict[str, dict[str,Any]]:
    store = source_root / 'stories-src'
    manifest_file = store / 'story-list.json'
    if manifest_file.is_symlink() or not manifest_file.is_file():
        raise ValueError('Missing Ink story-list.json')
    raw = read_json(manifest_file,500_000)
    if raw.get('schema') != SOURCE_STORY_SCHEMA or not isinstance(raw.get('stories'),list):
        raise ValueError('Invalid Ink story source manifest')
    listed = {e.get('id'):e for e in raw['stories'] if isinstance(e,dict)}
    wanted = {n['story_id']:n['story_sha256'] for n in nodes if n['type']=='dialogue'}
    entries = []
    dst = destination / 'stories-src'; dst.mkdir(parents=True,exist_ok=True)
    for sid, expected in wanted.items():
        entry = listed.get(sid)
        if not entry or entry.get('source_sha256') != expected or not entry.get('approved_for_reuse'):
            raise ValueError('Ink story missing, changed or rights unapproved: '+sid)
        if entry.get('source_file') != sid + '.ink' or not HEX.fullmatch(expected):
            raise ValueError('Unsafe Ink story filename/hash')
        file = store / (sid + '.ink')
        if not file.is_file() or file.is_symlink() or file.stat().st_size > 1_000_000 or file_sha(file) != expected:
            raise ValueError('Ink story file changed or invalid: '+sid)
        if not isinstance(entry.get('exports'),dict) or any(
            not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]{0,63}',k)
            or not re.fullmatch(r'(?:flag|item):[A-Za-z_][A-Za-z0-9_]{0,63}',str(v))
            for k,v in entry['exports'].items()
        ): raise ValueError('Invalid Ink variables')
        shutil.copy2(file, dst / file.name)
        entries.append(entry)
    write_json(dst / 'story-list.json', {'schema':SOURCE_STORY_SCHEMA,'stories':entries})
    return {item['id']:item for item in entries}


def pack_models(library: Path, plan: list[dict[str,Any]], out: Path) -> list[dict[str,Any]]:
    path = library / 'optimized-model-library.json'
    if not path.is_file(): return []
    source = read_json(path, 25_000_000)
    inventory = {}
    for obj in source.get('models',[]):
        if isinstance(obj,dict): inventory[(obj.get('game'),obj.get('path'),obj.get('source_sha256'))] = obj
    packed = []; copied = set()
    for stage in plan:
        for doc in stage.get('resources',[]):
            if not isinstance(doc,dict) or doc.get('kind') != 'model' or not doc.get('approved_for_reuse') or doc.get('license_scan_blocked'):
                continue
            if not isinstance(doc.get('license'),str) or not doc.get('license') or doc['license']=='review_required':
                continue
            model = inventory.get((doc.get('game'),doc.get('file'),doc.get('source_sha256')))
            if not model or model.get('approved_for_reuse') is not True: continue
            optimization = model.get('optimization') or {}
            if optimization.get('status') not in ('optimized','existing'): continue
            rel = optimization.get('output')
            if not isinstance(rel,str) or rel!=doc.get('optimized_output'): continue
            try:
                asset = limited_path(library,rel)
                if asset.stat().st_size > MAX_ASSET or file_sha(asset)!=optimization.get('output_sha256'):
                    continue
                meta=inspect_glb(asset)
                extensions=set(meta.get('extensionsRequired') or ())
                # The loader is prepared for meshopt only, never promise Draco/KTX2 support here.
                if extensions - {'EXT_meshopt_compression','EXT_texture_webp'}:continue
                if doc['id'] not in copied:
                    fname = f'{file_sha(asset)[:18]}.glb'
                    dest = out / 'public' / 'assets' / fname
                    dest.parent.mkdir(parents=True,exist_ok=True)
                    shutil.copy2(asset,dest)
                    copied.add(doc['id'])
                    packed.append({'id':doc['id'],'src':'/assets/'+fname,'game':doc['game'],
                                   'scene_id':stage['node']['id'],'source_sha256':doc['source_sha256'],
                                   'asset_sha256':optimization['output_sha256'],
                                   'animation_clips':[a.get('name','') for a in meta.get('animations',[])],
                                   'license':doc['license']})
            except (OSError,ValueError,KeyError):
                continue
    return packed


def prepare(args: argparse.Namespace) -> None:
    library = Path(args.library).expanduser().resolve(strict=True)
    out = Path(args.out).expanduser().resolve()
    if out.exists() and any(out.iterdir()):raise ValueError('Output directory must be empty (no overwrites)')
    if out == ROOT or ROOT in out.parents:raise ValueError('Output cannot be inside plugin')
    ensure_output_not_in_source(out,library)
    workbench = Path(args.workbench).expanduser().resolve(strict=True) if args.workbench else STORY_TEMPLATE
    if not workbench.is_dir():raise ValueError('Workbench not found')
    blueprint = read_json(Path(args.blueprint).expanduser().resolve(strict=True), 6_000_000) if args.blueprint else None
    if blueprint:
        if blueprint.get('schema')!=BLUEPRINT_SCHEMA or blueprint.get('runtime_executable') is not False:
            raise ValueError('Requires the validated non-executable Rete scene blueprint')
        plan = blueprint.get('scene_plan')
        if not isinstance(plan,list) or not plan:raise ValueError('Empty scene plan')
        nodes = [n.get('node') for n in plan if isinstance(n,dict)]
        edges=[]; seq=0
        for step in plan:
            if not isinstance(step,dict) or not isinstance(step.get('next'),list):raise ValueError('Malformed scene plan')
            for link in step['next']:
                seq += 1
                edges.append({'id':f'flow{seq}','source':step['node']['id'],'target':link['node'],
                              'sourceOutput':link['branch'],'targetInput':'flow'})
    else:
        graph=sample_graph();nodes=graph['nodes'];edges=graph['connections'];plan=[]
    nodes,edges=check_world_graph({'nodes':nodes,'connections':edges})
    out.mkdir(parents=True,exist_ok=True)
    shutil.copytree(TEMPLATE,out,dirs_exist_ok=True,symlinks=False)
    stories = gather_ink(workbench,out,nodes)
    if blueprint:
        for n in nodes:
            if n['type']=='dialogue' and n['story_id'] not in stories:raise ValueError('Unverified Ink story')
        assets=pack_models(library,plan,out)
        title=str(blueprint.get('title',''))[:150]
    else:
        assets=[];title='Последний виадук — физический пролог'
    scenes = [n for n in nodes if n['type'] in {'scene','mechanic'}]
    markers = {n['id']:{'x':0.0,'y':1.35,'z':float(-9-13*i)} for i,n in enumerate(scenes)}
    by_node = {n['id']:n.get('visual_style',('ink','ember','horror','dream','pixel')[i%5]) for i,n in enumerate(scenes)}
    write_json(out/'public'/'world.json',{
        'schema':'meta-game-fusion.physics-world.v1','title':title,
        'physics_engine':'@dimforge/rapier3d-compat@0.21.0',
        'source':blueprint.get('schema') if blueprint else GRAPH_SCHEMA,
        'nodes':nodes,'connections':edges,'markers':markers,'assets':assets,
        'visual_direction':{'engine':'postprocessing@6.39.6','default':args.visual_style,
                            'by_node':by_node,'quality':'cinema','styles':list(VISUAL_STYLES),
                            'hero_identity_preserved':True,'gameplay_state_untouched':True},
        'navigation':{'engine':'recast-navigation@0.44.0','mode':'runtime-solo-navmesh',
                      'source':'rapier-static-obstacle-footprints','npc':'scout','hero_unchanged':True},
        'rights':'Assets copied only when explicitly approved and hash-verified. Mechanics never auto-execute.'
    })
    print(f'3D Rapier/Recast world prepared: {out} / scenes {len(scenes)} / assets {len(assets)}. npm install --ignore-scripts && npm run dev required.')


def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('command',choices=['prepare'])
    p.add_argument('--library',required=True)
    p.add_argument('--workbench',help='Existing Rete workbench holding approved Ink sources')
    p.add_argument('--blueprint',help='Validated fusion-scene-blueprint.json from rete_bridge.py validate')
    p.add_argument('--out',required=True,help='Fresh directory, outside source games')
    p.add_argument('--visual-style',choices=VISUAL_STYLES,default='nocturne',help='Initial art direction; node presets remain editable')
    a=p.parse_args()
    try:prepare(a)
    except (OSError,ValueError,KeyError,TypeError,FileNotFoundError) as exc:p.exit(2,str(exc)+'\n')

if __name__=='__main__':main()
