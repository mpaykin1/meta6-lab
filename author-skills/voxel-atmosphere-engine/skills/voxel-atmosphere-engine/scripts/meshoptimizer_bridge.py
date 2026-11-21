#!/usr/bin/env python3
"""Non-destructive meshoptimizer/gltfpack 1.3.0 optimizer for GLB game assets.

Only verified smaller copies enter a manifest. The original GLB is immutable.
No optimization is claimed when upstream gltfpack is unavailable.
"""
import argparse
import hashlib
import json
import pathlib
import shutil
import struct
import subprocess
import tempfile


def parse_glb(path):
    data=path.read_bytes()
    if len(data)<20 or data[:4]!=b'glTF':
        raise ValueError('Missing glTF binary magic')
    version,length=struct.unpack_from('<II',data,4)
    if version!=2 or length!=len(data):
        raise ValueError('Invalid GLB version/length')
    json_length,chunk_type=struct.unpack_from('<I4s',data,12)
    if chunk_type!=b'JSON' or json_length<4 or 20+json_length>len(data):
        raise ValueError('Invalid glTF JSON chunk')
    return json.loads(data[20:20+json_length])


def signature(doc):
    nodes=doc.get('nodes',[])
    animations=[]
    for clip in doc.get('animations',[]):
        channels=[]
        for channel in clip.get('channels',[]):
            target=channel.get('target',{})
            node=target.get('node')
            name=nodes[node].get('name','') if isinstance(node,int) and 0<=node<len(nodes) else ''
            channels.append((name,target.get('path','')))
        animations.append((clip.get('name',''),tuple(sorted(channels))))
    mats=sorted(m.get('name','') for m in doc.get('materials',[]) if m.get('name'))
    return {'scenes':len(doc.get('scenes',[])),
            'namedNodes':sorted(n['name'] for n in nodes if n.get('name')),
            'animations':sorted(animations),
            'namedMaterials':mats,
            'skins':len(doc.get('skins',[])),
            'cameras':len(doc.get('cameras',[]))}


def optimize_one(binary,src,target,mode,timeout):
    original_bytes=src.read_bytes()
    original=parse_glb(src)
    with tempfile.TemporaryDirectory(prefix='vae_meshopt_') as tmp:
        candidate=pathlib.Path(tmp)/src.name
        # -kn/-km/-ke: preserve authored nodes, material names and metadata.
        # -noq: avoid lossy quantization of voxel silhouettes and actor keys.
        flags=['-i',str(src),'-o',str(candidate),'-kn','-km','-ke','-noq']
        if mode=='meshopt': flags.append('-c')
        proc=subprocess.run([str(binary),*flags],capture_output=True,text=True,timeout=timeout)
        if proc.returncode or not candidate.is_file():
            raise RuntimeError('gltfpack failed: '+(proc.stderr or proc.stdout)[-500:])
        optimized=parse_glb(candidate)
        if signature(original)!=signature(optimized):
            raise ValueError('Scene/animation/identity structure differs: original kept')
        if mode=='meshopt':
            extensions=set(optimized.get('extensionsUsed',[]))
            if 'EXT_meshopt_compression' not in extensions:
                raise ValueError('Compressed result missing EXT_meshopt_compression')
            if not any('EXT_meshopt_compression' in v.get('extensions',{}) for v in optimized.get('bufferViews',[])):
                raise ValueError('Compressed result has no coded buffer views')
        if len(candidate.read_bytes())>=len(original_bytes):
            return None
        if hashlib.sha256(src.read_bytes()).digest()!=hashlib.sha256(original_bytes).digest():
            raise RuntimeError('Original changed during optimization: abort')
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(candidate,target)
        return {'path':'./assets/optimized/'+target.name,
                'meshopt':mode=='meshopt',
                'sourceBytes':len(original_bytes),
                'optimizedBytes':target.stat().st_size,
                'sourceSha256':hashlib.sha256(original_bytes).hexdigest(),
                'engine':'meshoptimizer/gltfpack 1.3.0'}


def optimize_game(game,binary,mode='meshopt',timeout=90):
    assets=game/'assets'
    optimized=assets/'optimized'
    optimized.mkdir(parents=True,exist_ok=True)
    manifest={'schema':1,'engine':'meshoptimizer/gltfpack 1.3.0','profile':mode,'assets':{}}
    if binary and pathlib.Path(binary).is_file():
        for src in sorted(assets.glob('*.glb')):
            try:
                item=optimize_one(binary,src,optimized/src.name,mode,timeout)
                if item: manifest['assets']['./assets/'+src.name]=item
                else: print('Not smaller, original kept:',src.name)
            except Exception as e:
                print('Original kept:',src.name,type(e).__name__,str(e)[:220])
    else:
        print('gltfpack 1.3.0 not installed: original GLBs kept, no compression claimed')
    # In particular, never select stale optimized entries from an earlier run.
    temp=optimized/'manifest.json.tmp'
    temp.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    temp.replace(optimized/'manifest.json')
    return manifest


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--game',type=pathlib.Path,required=True)
    ap.add_argument('--binary',type=pathlib.Path)
    ap.add_argument('--mode',choices=['meshopt','uncompressed'],default='meshopt')
    ap.add_argument('--timeout',type=int,default=90)
    args=ap.parse_args()
    binary=args.binary
    if binary is None:
        located=shutil.which('gltfpack')
        binary=pathlib.Path(located) if located else None
    result=optimize_game(args.game.resolve(),binary,args.mode,args.timeout)
    print('Verified and smaller:',len(result['assets']))

if __name__=='__main__':main()
