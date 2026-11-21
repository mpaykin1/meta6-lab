#!/usr/bin/env python3
"""META GAME FUSION: deterministic Three.js game assembly.

No source project modification, no eval of imported code, no inferred media rights.
This orchestrates the existing Rete -> Rapier/Recast/Ink/PostFX template with
new living-world visual composition, secure asset gate and immutable sources.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import re
import shutil
import tempfile
from pathlib import Path, PurePosixPath
from types import SimpleNamespace
from typing import Any

import rapier_bridge
from bvh_bridge import create_plan
from rete_bridge import read_json, ensure_output_not_in_source, BLUEPRINT_SCHEMA
from scancode_bridge import lookup, load_json, sha, INDEX_SCHEMA, SCHEMA as RIGHTS_SCHEMA

BUILD_SCHEMA = 'meta-game-fusion.unified-three-build.v1'
HEX = re.compile(r'^[a-f0-9]{64}$')
STYLES = rapier_bridge.VISUAL_STYLES


def _index_source(library:Path)->dict[tuple[str,str],tuple[str,Path]]:
    path=library/'fusion-index.json'
    if not path.is_file():raise ValueError('First index source games with fusion.py')
    data=load_json(path, 40_000_000)
    if data.get('schema')!=INDEX_SCHEMA:raise ValueError('Unexpected source index schema')
    out={}
    for game in data.get('games',[]):
        gid=game.get('id');root=Path(game.get('source_root','')).expanduser().resolve()
        for f in game.get('files',[]):
            rel=f.get('path');digest=f.get('sha256')
            if not isinstance(rel,str) or not rel or not HEX.fullmatch(str(digest)):
                continue
            p=PurePosixPath(rel)
            if p.is_absolute() or '..' in p.parts or '\\' in rel:continue
            out[(gid,rel)]=(digest,root.joinpath(*p.parts))
    return out


def asset_gate(library:Path, blueprint:dict[str,Any]|None)->int:
    """Fail closed before conversion/copy if requested model reuse lacks rights or is stale."""
    if blueprint is None:return 0
    if blueprint.get('schema')!=BLUEPRINT_SCHEMA or blueprint.get('runtime_executable') is not False:
        raise ValueError('Only validated, non-executable Rete blueprints accepted')
    models={}
    for step in blueprint.get('scene_plan',[]):
        if not isinstance(step,dict):raise ValueError('Malformed scene plan')
        for doc in step.get('resources',[]):
            if not isinstance(doc,dict):raise ValueError('Malformed scene component')
            if doc.get('kind')=='model':
                key=(doc.get('game'),doc.get('file'),doc.get('source_sha256'))
                models[key]=doc
    if not models:return 0
    path=library/'scancode-rights.json'
    if not path.is_file():raise ValueError('Asset reuse requires local ScanCode rights inventory')
    inventory=load_json(path,64_000_000)
    if inventory.get('schema')!=RIGHTS_SCHEMA:raise ValueError('Unexpected ScanCode rights schema')
    src_index=_index_source(library)
    opt_path=library/'optimized-model-library.json'
    if not opt_path.is_file():raise ValueError('No optimized GLB library for requested models')
    opt=read_json(opt_path,25_000_000)
    approved={(v.get('game'),v.get('path'),v.get('source_sha256')):v for v in opt.get('models',[]) if isinstance(v,dict)}
    for key,doc in models.items():
        game,rel,digest=key
        origin=src_index.get((game,rel))
        if not origin or origin[0]!=digest:raise ValueError('Model source not indexed/hash mismatch: '+str(rel))
        source=origin[1]
        if not source.is_file() or source.is_symlink() or sha(source)!=digest:
            raise ValueError('Model source changed: '+str(rel))
        record=lookup(inventory,game,rel,digest)
        if not record or record.get('status') not in ('reviewed_exception','permissive_detected'):
            raise ValueError('Asset rights not cleared by ScanCode: '+str(rel))
        if not doc.get('approved_for_reuse') or doc.get('license_scan_blocked'):
            raise ValueError('Model not individually approved for reuse: '+str(rel))
        model=approved.get(key)
        if not model or model.get('approved_for_reuse') is not True:
            raise ValueError('No approved optimized asset for '+str(rel))
        op=model.get('optimization') or {}
        if op.get('status') not in ('existing','optimized') or op.get('output')!=doc.get('optimized_output'):
            raise ValueError('Model optimization record missing/changed: '+str(rel))
        asset=rapier_bridge.limited_path(library,op['output'])
        if not asset.is_file() or asset.is_symlink() or sha(asset)!=op.get('output_sha256'):
            raise ValueError('Optimized model hash mismatch: '+str(rel))
    return len(models)


def create_concept_world(world:dict[str,Any],concept:str,style:str,seed:int)->None:
    """An original minimal explorable chapter chain; no invented Ink or borrowed mechanics."""
    text=concept.strip()[:150]
    if not text or any(ord(c)<32 for c in text):raise ValueError('Concept should be nonempty printable text')
    node_names=['Порог','Следы','Тайна','Возвращение']
    themes=list(STYLES)
    index=themes.index(style)
    nodes=[{'id':'start','type':'start','title':'Начало'}]
    links=[];last='start'
    for i in range(3):
        nid=f'chapter_{i+1}'
        st=themes[(index+(i*2))%len(themes)]
        nodes.append({'id':nid,'type':'scene','title':node_names[i]+': '+text,'visual_style':st})
        links.append({'id':f'flow_{i+1}','source':last,'target':nid,'sourceOutput':'flow','targetInput':'flow'})
        last=nid
    nodes.append({'id':'ending','type':'ending','title':node_names[-1]+': '+text})
    links.append({'id':'flow_4','source':last,'target':'ending','sourceOutput':'flow','targetInput':'flow'})
    rapier_bridge.check_world_graph({'nodes':nodes,'connections':links})
    scenes=[v for v in nodes if v['type']=='scene']
    world['title']=text;world['nodes']=nodes;world['connections']=links
    world['markers']={n['id']:{'x':0.,'y':1.35,'z':float(-9-13*i)} for i,n in enumerate(scenes)}
    world['visual_direction']['by_node']={n['id']:n['visual_style'] for n in scenes}
    world['assets']=[]
    world['source']='user-authored-concept';world['seed']=seed


def build(args:argparse.Namespace)->dict[str,Any]:
    library=Path(args.library).expanduser().resolve(strict=True)
    dest=Path(args.out).expanduser().resolve()
    if dest.exists():raise ValueError('Output exists; select a NEW directory to avoid overwrites')
    ensure_output_not_in_source(dest,library)
    if dest==rapier_bridge.ROOT or rapier_bridge.ROOT in dest.parents:
        raise ValueError('Output cannot overwrite plugin templates')
    if dest==library or library in dest.parents or dest in library.parents:
        raise ValueError('Output must be outside library')
    if args.blueprint and args.concept:raise ValueError('Choose either --blueprint or --concept')
    bp=read_json(Path(args.blueprint).expanduser().resolve(strict=True),6_000_000) if args.blueprint else None
    count=asset_gate(library,bp)
    dest.parent.mkdir(parents=True,exist_ok=True)
    stage=Path(tempfile.mkdtemp(prefix='.mgf-build-',dir=dest.parent))
    try:
        rapier_bridge.prepare(SimpleNamespace(library=str(library),out=str(stage),blueprint=args.blueprint,
            workbench=args.workbench,visual_style=args.visual_style))
        world_file=stage/'public'/'world.json'
        world=read_json(world_file,4_000_000)
        if args.concept:create_concept_world(world,args.concept,args.visual_style,args.seed)
        world['renderer']='three@0.186.1'
        world['scene_composer']={'engine':'three@0.186.1','module':'src/living-world.js',
             'procedural_decorations_only':True,'seed':args.seed,'max_animated_stages':24,
             'hero_actions_input_only':True,'static_collision_source':'Rapier'}
        world['spatial_index']={'engine':'three-mesh-bvh@0.9.18','mode':'runtime-static-triangle-bvh',
             'module':'src/spatial-bvh.js','manifest':'/bvh-manifest.json',
             'physics_authority':'Rapier','navigation_authority':'Recast',
             'animated_and_skinned_models_excluded':True}
        rapier_bridge.write_json(world_file,world)
        spatial_plan=create_plan(stage,world) # Fails closed on every approved GLB hash.
        out_assets=world.get('assets',[])
        if bp and len({x.get('id') for x in out_assets})!=count:
            raise ValueError('Some requested approved GLB models could not be copied; refusing partial build')
        manifest={'schema':BUILD_SCHEMA,'engine':'three@0.186.1',
             'components':{'code':'Tree-sitter','asset_import':'Assimp','glb':'glTF-Transform',
                 'index':'Qdrant','graph':'Rete.js','narrative':'inkjs','physics':'Rapier',
                 'navigation':'Recast','spatial':'three-mesh-bvh','fx':'Postprocessing','verification':'Playwright','rights':'ScanCode'},
             'chapters':len([v for v in world['nodes'] if v['type'] in ('scene','mechanic')]),
             'approved_asset_count':len(out_assets),'bvh_static_models':sum(a['mode']=='static-raycast' for a in spatial_plan['model_assets']),
             'original_sources_untouched':True,
             'builder_version':'1.3.0', 'npm_deps_required':True}
        rapier_bridge.write_json(stage/'fusion-build.json',manifest)
        stage.rename(dest) # Same parent, atomic when both paths are on one filesystem.
    except Exception:
        shutil.rmtree(stage,ignore_errors=True)
        raise
    return {'out':str(dest),'chapters':manifest['chapters'], 'models':manifest['approved_asset_count']}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('command',choices=['build'])
    p.add_argument('--library',required=True,help='Indexed read-only games, metadata kept outside sources')
    p.add_argument('--out',required=True,help='New project location outside sources and plugin')
    p.add_argument('--blueprint',help='Validated Rete scene blueprint')
    p.add_argument('--workbench',help='Approved Ink stories workbench')
    p.add_argument('--concept',help='New original explorable three-chapter concept without imported game media')
    p.add_argument('--visual-style',choices=STYLES,default='ink')
    p.add_argument('--seed',type=int,default=257)
    a=p.parse_args()
    try:print(json.dumps(build(a),ensure_ascii=False))
    except (OSError,ValueError,KeyError,TypeError,FileNotFoundError) as e:p.exit(2,str(e)+'\n')

if __name__=='__main__':main()
