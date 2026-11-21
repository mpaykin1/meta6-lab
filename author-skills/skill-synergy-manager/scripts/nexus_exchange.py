#!/usr/bin/env python3
"""Skill Nexus: conservative, file-based interop between independent game skills.

Does not run scripts from imported plugins, synthesize art, call cloud plugins,
or assert any receiving runtime works merely because the bundle validates.
"""
import argparse
import hashlib
import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTES = ROOT / 'assets' / 'synergy-map.json'
PLUGINS = ROOT / 'assets' / 'catalog.json'
FORMAT = 'skill-nexus.exchange/1'
MAX_BYTES = 512 * 1024 * 1024
ALLOWED = {'.glb', '.gltf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.webm', '.mp4',
           '.vox', '.bbmodel', '.vrm', '.json', '.glsl', '.frag', '.vert', '.js',
           '.mjs', '.html', '.css', '.bin', '.wav', '.ogg', '.mp3', '.ktx2', '.basis',
           '.txt', '.md', '.obj', '.mtl', '.fbx', '.blend', '.ptex'}
MAGIC = {'.png':b'\x89PNG\r\n\x1a\n', '.gif':b'GIF8', '.glb':b'glTF', '.vox':b'VOX ', '.webm':b'\x1a\x45\xdf\xa3'}


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def dump_json(path, obj):
    p=Path(path);p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')


def sha256(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):
            h.update(block)
    return h.hexdigest()


def routes():
    d=read_json(ROUTES)
    edges=d['edges']
    assert len(edges)==42 and len({(r['from'],r['to']) for r in edges})==42
    return edges


def route(source,target):
    for e in routes():
        if e['from']==source and e['to']==target:return e
    raise ValueError(f'unknown directed route: {source} -> {target}')


def clean_id(value):
    if not (value and len(value)<=128 and all(c.isalnum() or c in '_-.' for c in value)):
        raise ValueError('ID must be 1..128 characters from letters, digits, ._-')
    return value


def guard_path(p,base):
    p=Path(p)
    if p.is_symlink():raise ValueError('symlink assets forbidden: '+str(p))
    rel=p.relative_to(base)
    if rel.is_absolute() or '..' in rel.parts or any(part.startswith('.') for part in rel.parts):
        raise ValueError('unsafe or hidden asset path: '+str(rel))
    if p.suffix.lower() not in ALLOWED: raise ValueError('unsupported file extension: '+str(rel))
    if not p.is_file():raise ValueError('asset is not a regular file: '+str(rel))
    return rel


def check_content(p):
    suffix=p.suffix.lower()
    with p.open('rb') as f:head=f.read(16)
    if suffix in MAGIC and not head.startswith(MAGIC[suffix]):
        raise ValueError('Invalid '+suffix+' signature for '+str(p))
    if suffix in ('.json','.bbmodel','.gltf'):read_json(p)
    if suffix == '.glb' and len(head)>=12:
        if int.from_bytes(head[4:8],'little')!=2 or int.from_bytes(head[8:12],'little') != p.stat().st_size:
            raise ValueError('GLB version/length incorrect: '+str(p))


def command_routes(args):
    for r in routes():
        print(r['from']+' -> '+r['to']+' | '+r['payload_kind']+' | '+r['handoff'])


def command_catalog(args):
    for p in read_json(PLUGINS)['game_plugins']:
        print(f"{p['name']}  v{p['version']}  ({', '.join(p['skill_modules'])})")


def command_prepare(args):
    r=route(args.source,args.target)
    game_id=clean_id(args.game_id)
    hero_id=clean_id(args.hero_id) if args.hero_id else None
    if args.source=='hero-animator' or args.target=='hero-animator':
        if not hero_id:raise ValueError('hero_id is required for every Hero Animator route')
    if not args.rights_confirmed or not args.license.strip():
        raise ValueError('explicit --rights-confirmed and --license required')
    inp=Path(args.input).expanduser().resolve(strict=True)
    out=Path(args.out).expanduser().resolve()
    if out.exists():raise ValueError('output exists; will not overwrite: '+str(out))
    if inp.is_file():files=[inp];base=inp.parent
    elif inp.is_dir():
        base=inp
        files=[f for f in inp.rglob('*') if f.is_file() or f.is_symlink()]
    else:raise ValueError('input is neither a file nor directory')
    if not files: raise ValueError('input contains no files')
    entries=[];total=0
    for f in files:
        rel=guard_path(f,base);check_content(f)
        size=f.stat().st_size;total+=size
        if total>MAX_BYTES:raise ValueError('payload exceeds 512 MiB')
        entries.append((f,rel))
    expected=r['payload_kind'].split('.')[-1].lower()
    expected_ext='.'+expected
    if not any(f.suffix.lower()==expected_ext for f,rel in entries):
        raise ValueError('route requires at least one '+expected_ext+' payload file; got '+', '.join(sorted({f.suffix.lower() for f,_ in entries})))
    if out==inp or inp in out.parents or out in inp.parents:
        raise ValueError('output cannot be nested inside input or input parent')
    out.mkdir(parents=True)
    payload=out/'payload';payload.mkdir()
    manifest={'schema':FORMAT,'route_id':r['id'],'source':args.source,'target':args.target,
      'expected_kind':r['payload_kind'],'game_id':game_id,'hero_id':hero_id,
      'license':args.license,'rights_confirmed':True,
      'physics_owner':args.physics_owner,'postfx_owner':args.postfx_owner,
      'handoff':r['handoff'],'guard':r['guard'],
      'files':[],'status':'handoff_prepared_not_runtime_verified'}
    for f,rel in entries:
        dst=payload/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,dst)
        manifest['files'].append({'path':rel.as_posix(),'sha256':sha256(dst),'size':dst.stat().st_size})
    dump_json(out/'nexus-handoff.json',manifest)
    print(str(out))


def validate(bundle):
    bundle=Path(bundle).expanduser().resolve(strict=True)
    data=read_json(bundle/'nexus-handoff.json')
    if data.get('schema')!=FORMAT:raise ValueError('invalid schema')
    r=route(data.get('source'),data.get('target'))
    if data.get('route_id')!=r['id']:raise ValueError('route id mismatch')
    clean_id(data.get('game_id'))
    if data.get('source')=='hero-animator' or data.get('target')=='hero-animator':
        clean_id(data.get('hero_id'))
    elif data.get('hero_id'): clean_id(data['hero_id'])
    if not data.get('rights_confirmed') or not isinstance(data.get('license'),str) or not data['license'].strip():
        raise ValueError('missing rights declaration')
    files=data.get('files')
    if not isinstance(files,list) or not files:raise ValueError('bundle has no files')
    seen=set()
    for entry in files:
        rel=Path(entry['path'])
        if rel.is_absolute() or '..' in rel.parts or rel.as_posix() in seen or not rel.as_posix():
            raise ValueError('unsafe or duplicate path in manifest')
        seen.add(rel.as_posix())
        p=bundle/'payload'/rel
        guard_path(p,bundle/'payload')
        if not p.resolve().is_relative_to((bundle/'payload').resolve()):raise ValueError('path escape')
        check_content(p)
        if sha256(p)!=entry['sha256'] or p.stat().st_size!=entry['size']:
            raise ValueError('SHA256/size mismatch: '+str(p))
    physically_present={str(x.relative_to(bundle/'payload')) for x in (bundle/'payload').rglob('*') if x.is_file()}
    if physically_present!=seen:raise ValueError('undeclared or missing files in payload')
    return data


def command_verify(args):
    data=validate(args.bundle)
    print(f"HANDOFF VERIFIED: {data['route_id']}; {len(data['files'])} immutable files; target runtime NOT VERIFIED")


def command_compose(args):
    manifests=[validate(Path(x)) for x in args.bundles]
    games={m['game_id'] for m in manifests}
    heroes={m['hero_id'] for m in manifests if m.get('hero_id')}
    physics={m['physics_owner'] for m in manifests if m.get('physics_owner')}
    postfx={m['postfx_owner'] for m in manifests if m.get('postfx_owner')}
    if len(games)!=1:raise ValueError('game_id mismatch: '+str(sorted(games)))
    if len(heroes)>1:raise ValueError('hero_identity_lock failure: multiple hero IDs')
    if len(physics)>1:raise ValueError('multiple physics owners conflict')
    if len(postfx)>1:raise ValueError('multiple postfx owners conflict')
    if Path(args.out).exists():raise ValueError('will not overwrite existing plan')
    plan={'schema':'skill-nexus.game-plan/1','game_id':next(iter(games)),
          'hero_id':next(iter(heroes)) if heroes else None,
          'physics_owner':next(iter(physics)) if physics else None,
          'postfx_owner':next(iter(postfx)) if postfx else None,
          'bundle_routes':[m['route_id'] for m in manifests],
          'inputs':[{'route_id':m['route_id'],'files':m['files'],'license':m['license']} for m in manifests],
          'status':'composed_declarative_plan_not_executable_game',
          'real_runtime_integration_verified':False}
    dump_json(args.out,plan)
    print(str(args.out))


def command_coverage(args):
    allr=routes()
    n=len(read_json(PLUGINS)['game_plugins'])
    declared=len(allr)
    maxlinks=n*(n-1)
    print(json.dumps({'game_skills':n,'unique_pairs':n*(n-1)//2,'directed_possible':maxlinks,
      'documented_contracts':declared,'documented_coverage_pct':round(100*declared/maxlinks,2),
      'handoffs_verified_by_receiving_skill':None,
      'runtime_game_integrations_verified':0,
      'runtime_verification_pct_evidenced':0,
      'note':'0 evidenced routes is NOT proof that existing games have no working integrations.'},ensure_ascii=False,indent=2))


def main():
    parser=argparse.ArgumentParser(description='Skill Nexus file-based cross-plugin exchange v1')
    subs=parser.add_subparsers(dest='cmd',required=True)
    subs.add_parser('catalog').set_defaults(fn=command_catalog)
    subs.add_parser('routes').set_defaults(fn=command_routes)
    subs.add_parser('coverage').set_defaults(fn=command_coverage)
    prep=subs.add_parser('prepare')
    prep.add_argument('--source',required=True);prep.add_argument('--target',required=True)
    prep.add_argument('--input',required=True);prep.add_argument('--out',required=True)
    prep.add_argument('--game-id',required=True);prep.add_argument('--hero-id')
    prep.add_argument('--license',required=True);prep.add_argument('--rights-confirmed',action='store_true')
    prep.add_argument('--physics-owner',default='meta-game-fusion');prep.add_argument('--postfx-owner',default='meta-game-fusion')
    prep.set_defaults(fn=command_prepare)
    v=subs.add_parser('verify');v.add_argument('--bundle',required=True);v.set_defaults(fn=command_verify)
    c=subs.add_parser('compose');c.add_argument('--out',required=True);c.add_argument('bundles',nargs='+');c.set_defaults(fn=command_compose)
    a=parser.parse_args()
    try:a.fn(a)
    except (ValueError,KeyError,OSError,json.JSONDecodeError) as ex:
        print('NEXUS ERROR:',str(ex),file=sys.stderr);sys.exit(2)

if __name__=='__main__':main()
