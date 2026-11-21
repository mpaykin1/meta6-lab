"""glTF-Transform 4.5.1 adapter for Game Style Forge.

This module handles safe GLB validation, manifest registration, and optional
Meshopt optimization through a locally installed, version-pinned CLI. It never
fetches executables, runs npm install, or changes author-approved hero assets.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import struct
import subprocess
import tempfile

MAX_BYTES = 256 * 1024 * 1024
VALID_NAME = re.compile(r'^[a-z][a-z0-9_-]{0,63}$')


def read_glb(path):
    path = Path(path)
    if not path.is_file():
        raise ValueError('GLB input not found: ' + str(path))
    raw = path.read_bytes()
    if len(raw) > MAX_BYTES:
        raise ValueError('GLB input exceeds 256 MB safeguard')
    if len(raw) < 20 or raw[:4] != b'glTF' or struct.unpack_from('<I',raw,4)[0] != 2:
        raise ValueError('Expected a glTF 2.0 binary GLB file')
    if struct.unpack_from('<I',raw,8)[0] != len(raw):
        raise ValueError('Invalid GLB byte length')
    pos = 12
    chunks = []
    while pos < len(raw):
        if pos + 8 > len(raw):
            raise ValueError('Truncated GLB chunk header')
        length, chunk_type = struct.unpack_from('<II',raw,pos)
        pos += 8
        if pos + length > len(raw):
            raise ValueError('Truncated GLB chunk')
        chunks.append((chunk_type,raw[pos:pos+length]))
        pos += length
    if not chunks or chunks[0][0] != 0x4E4F534A:
        raise ValueError('Missing GLB JSON chunk')
    try:
        doc = json.loads(chunks[0][1].rstrip(b' \t\r\n\x00'))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError('Invalid GLB JSON chunk') from exc
    if str(doc.get('asset',{}).get('version',''))[:1] != '2':
        raise ValueError('Invalid glTF asset version')
    if not isinstance(doc.get('scenes',[]),list):
        raise ValueError('Missing scene list')
    return doc


def signature(document):
    return {key:len(document.get(key,[])) for key in ('nodes','meshes','materials','textures','animations','skins','cameras')}


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load_manifest(workspace):
    path = workspace/'assets'/'models.json'
    if not path.is_file():return {'schema':1,'models':[]}
    doc=json.loads(path.read_text('utf-8'))
    if doc.get('schema')!=1 or not isinstance(doc.get('models'),list):
        raise ValueError('Invalid GLB asset manifest')
    return doc


def save_manifest(workspace, manifest):
    dst=workspace/'assets'/'models.json'
    dst.parent.mkdir(parents=True,exist_ok=True)
    tmp=dst.with_suffix('.tmp')
    tmp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    tmp.replace(dst)


def ensure_installed(workspace):
    lock=workspace/'integrations.lock.json'
    doc=json.loads(lock.read_text('utf-8')) if lock.is_file() else {}
    if 'gltf-transform' not in doc.get('integrated',{}):
        raise ValueError('Install the pinned glTF-Transform integration first')
    return doc


def add_model(args):
    workspace=Path(args.workspace).expanduser().resolve()
    ensure_installed(workspace)
    src=Path(args.input).expanduser().resolve()
    if src.suffix.lower()!='.glb':raise ValueError('Only standalone .glb assets are supported')
    doc=read_glb(src)
    name=args.name
    if not VALID_NAME.fullmatch(name):raise ValueError('Use a safe lowercase model name')
    manifest=load_manifest(workspace)
    if any(v['name']==name for v in manifest['models']):raise ValueError('Model name already registered')
    dst=workspace/'assets'/'models'/'raw'/f'{name}.glb'
    if dst.exists():raise ValueError('Raw asset exists; not overwriting')
    dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dst)
    collider=None
    if args.collider:
        if any(v<=0 or v>100 for v in args.collider):raise ValueError('Collider dimensions out of bounds')
        collider={'width':args.collider[0],'height':args.collider[1],'depth':args.collider[2]}
    entry={'name':name,'source_sha256':sha256(dst),'raw_path':f'models/raw/{name}.glb',
           'optimized_path':None,'selected':'raw','source_counts':signature(doc),
           'position':[float(v) for v in args.position], 'scale':float(args.scale),
           'collider':collider,'hero_asset':False}
    manifest['models'].append(entry)
    save_manifest(workspace,manifest)
    print(json.dumps({'registered':name,'source':str(dst),'optimized':False,'counts':signature(doc)}))


def optimize_model(args):
    workspace=Path(args.workspace).expanduser().resolve()
    ensure_installed(workspace)
    manifest=load_manifest(workspace)
    entry=next((x for x in manifest['models'] if x['name']==args.name),None)
    if entry is None:raise ValueError('Model not registered')
    src=workspace/'assets'/entry['raw_path']
    if sha256(src)!=entry['source_sha256']:raise ValueError('Raw asset has changed')
    before=read_glb(src)
    cmdpath=Path(args.cli).expanduser().resolve() if args.cli else workspace/'tools'/'gltf-transform'/'node_modules'/'.bin'/'gltf-transform'
    if not cmdpath.is_file() and args.cli is None:
        # An explicit optimize-model action authorizes installation of this pinned
        # tool into a private workspace, without npm lifecycle hooks. No global
        # writes, no shell, no silent fallback to unoptimized output.
        tool_root=workspace/'tools'/'gltf-transform'
        tool_root.mkdir(parents=True,exist_ok=True)
        (tool_root/'package.json').write_text(json.dumps({
            'private':True,'name':'gsf-private-gltf-optimizer',
            'dependencies':{'@gltf-transform/cli':'4.5.1'}},indent=2)+'\n','utf-8')
        try:
            setup=subprocess.run(['npm','install','--prefix',str(tool_root),
                                   '--ignore-scripts','--no-audit','--no-fund'],
                                  capture_output=True,text=True,timeout=120)
        except (subprocess.TimeoutExpired,FileNotFoundError) as exc:
            raise ValueError('Cannot install glTF-Transform in this environment; original GLB retained') from exc
        if setup.returncode:
            raise ValueError('CLI install unavailable: '+setup.stderr[-400:]+'. Original GLB retained')
    if not cmdpath.is_file():
        raise ValueError('Missing local glTF-Transform 4.5.1 CLI; no optimizer run')
    if not os.access(cmdpath,os.X_OK):raise ValueError('CLI not executable')
    version=subprocess.run([str(cmdpath),'--version'],capture_output=True,text=True,timeout=15)
    if version.returncode or not re.search(r'(?<!\d)4\.5\.1(?!\d)',version.stdout+' '+version.stderr):
        raise ValueError('CLI must be pinned @gltf-transform/cli 4.5.1')
    output=workspace/'assets'/'models'/'optimized'/f'{args.name}.glb'
    if output.exists() and not args.replace:raise ValueError('Already optimized; pass --replace for intentional re-optimization')
    output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='gsf-opt-') as tmp:
        result=Path(tmp)/'result.glb'
        # Meshopt compresses and quantizes attributes; never run on approved hero art.
        command=[str(cmdpath),'meshopt',str(src),str(result),'--level','medium']
        proc=subprocess.run(command,timeout=240,capture_output=True,text=True)
        if proc.returncode:
            raise ValueError('glTF-Transform failed: '+proc.stderr[-800:])
        after=read_glb(result)
        counts_before=signature(before)
        counts_after=signature(after)
        for k in ('animations','skins','materials','textures','meshes'):
            if counts_after[k]!=counts_before[k]:
                raise ValueError(f'{k} count changed unexpectedly: {counts_before[k]} -> {counts_after[k]}')
        if before.get('animations') and [a.get('name') for a in before['animations']] != [a.get('name') for a in after.get('animations',[])]:
            raise ValueError('Animation names changed unexpectedly')
        if output.exists():output.unlink()
        shutil.copy2(result,output)
    entry.update({'optimized_path':f'models/optimized/{args.name}.glb',
                  'optimized_sha256':sha256(output),'selected':'optimized',
                  'optimization':{'tool':'@gltf-transform/cli','version':'4.5.1','command':'meshopt --level medium',
                                  'type':'geometry/animation quantization; approved sprites/textures untouched',
                                  'input_bytes':src.stat().st_size,'output_bytes':output.stat().st_size}})
    save_manifest(workspace,manifest)
    print(json.dumps({'optimized':args.name,'bytes_before':src.stat().st_size,'bytes_after':output.stat().st_size,
                      'ratio':round(output.stat().st_size/src.stat().st_size,3),'source_sha256':entry['source_sha256'],
                      'optimized_sha256':entry['optimized_sha256']}))


def add_cli(sub):
    pa=sub.add_parser('import-model',help='Register a GLB model without modifying geometry or art')
    pa.add_argument('--workspace',required=True);pa.add_argument('--input',required=True);pa.add_argument('--name',required=True)
    pa.add_argument('--position',type=float,nargs=3,default=[4,0,-7]);pa.add_argument('--scale',type=float,default=1.)
    pa.add_argument('--collider',type=float,nargs=3,metavar=('WIDTH','HEIGHT','DEPTH'))
    pa.set_defaults(func=add_model)
    pb=sub.add_parser('optimize-model',help='Optimize only registered non-hero models with the local glTF Transform CLI')
    pb.add_argument('--workspace',required=True);pb.add_argument('--name',required=True)
    pb.add_argument('--cli');pb.add_argument('--replace',action='store_true');pb.set_defaults(func=optimize_model)
