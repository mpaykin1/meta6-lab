#!/usr/bin/env python3
"""Vendor official Three.js, postprocessing, Rapier, Three.quarks, Meshoptimizer and Three-VRM into a generated game.

This script requires network only for the one-time download. It verifies both
archives against the npm registry SHA-512 integrity and never executes npm scripts.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import io
import json
from pathlib import Path
import re
import tarfile
import urllib.request
from urllib.parse import quote

THREE_VERSION='0.187.0'
POST_VERSION='6.39.6'
RAPIER_VERSION='0.21.0'
QUARKS_VERSION='0.17.1'
MESHOPT_VERSION='1.3.0'
BVH_VERSION='0.9.18'
CSG_VERSION='0.0.18'
THREE_VRM_VERSION='3.5.5'
REGISTRY='https://registry.npmjs.org'


def fetch(url: str, cap: int) -> bytes:
    req=urllib.request.Request(url,headers={'User-Agent':'CasualGameStudio/1.0'})
    with urllib.request.urlopen(req,timeout=45) as resp:
        data=resp.read(cap+1)
        if len(data)>cap:
            raise RuntimeError('Package exceeds download size limit')
        return data


def fetch_and_verify(name:str,version:str,files:dict[str,str]) -> dict[str,bytes]:
    """files: archive member -> filename inside generated game/vendor."""
    meta=json.loads(fetch(f"{REGISTRY}/{quote(name,safe='@')}/{version}",2_000_000))
    if meta.get('name')!=name or meta.get('version')!=version:
        raise RuntimeError(f'Unexpected registry metadata for {name}')
    expected_url=f'{REGISTRY}/{name}/-/{name.rsplit("/",1)[-1]}-{version}.tgz'
    dist=meta.get('dist') or {}
    if dist.get('tarball')!=expected_url:
        raise RuntimeError('Unexpected tarball URL: '+str(dist.get('tarball')))
    archive=fetch(expected_url,16_000_000)
    integrity=dist.get('integrity','')
    if not integrity.startswith('sha512-'):
        raise RuntimeError('NPM SHA-512 integrity missing')
    actual=base64.b64encode(hashlib.sha512(archive).digest()).decode('ascii')
    if actual!=integrity[len('sha512-'):]:
        raise RuntimeError('NPM archive integrity verification failed')
    result={}
    with tarfile.open(fileobj=io.BytesIO(archive),mode='r:gz') as tar:
        for member in tar:
            if member.name not in files: continue
            if not member.isfile() or member.size>7_000_000:
                raise RuntimeError('Unexpected package member size/type')
            stream=tar.extractfile(member)
            if stream is None: raise RuntimeError('Unreadable tar entry')
            result[files[member.name]]=stream.read()
    if set(result)!=set(files.values()):
        raise RuntimeError(f'Package missing required artifacts: {set(files.values())-set(result)}')
    return result


def fetch_bvh() -> dict[str,bytes]:
    """Copy upstream MIT library's ESM source subtree, verified against npm SRI.

    npm package exports src/index.js as the browser ESM entrypoint. Relative
    imports require all JS files under src/, not a guessed build filename.
    """
    name='three-mesh-bvh';version=BVH_VERSION
    meta=json.loads(fetch(f'{REGISTRY}/{name}/{version}',2_000_000))
    if meta.get('name')!=name or meta.get('version')!=version:
        raise RuntimeError('Incorrect three-mesh-bvh registry metadata')
    dist=meta.get('dist') or {}
    expected_url=f'{REGISTRY}/{name}/-/{name}-{version}.tgz'
    if dist.get('tarball')!=expected_url: raise RuntimeError('Unexpected BVH tarball URL')
    data=fetch(expected_url,16_000_000)
    sri=dist.get('integrity','')
    if not sri.startswith('sha512-') or base64.b64encode(hashlib.sha512(data).digest()).decode('ascii')!=sri[7:]:
        raise RuntimeError('three-mesh-bvh npm SHA-512 verification failed')
    copied={}
    with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as tar:
        for entry in tar:
            if not entry.isfile(): continue
            if entry.name=='package/LICENSE':
                target='LICENSE-three-mesh-bvh.txt'
            elif entry.name.startswith('package/src/') and entry.name.endswith(('.js','.json')):
                relative=entry.name[len('package/src/'):]
                # Reject path traversal and ignore source maps, .ts and tests.
                if not relative or any(p in ('..','.') for p in relative.split('/')):continue
                target='three-mesh-bvh/src/'+relative
            else:continue
            if entry.size<0 or entry.size>2_000_000:raise RuntimeError('Invalid BVH member size')
            file=tar.extractfile(entry)
            if file is None:raise RuntimeError('Missing BVH member')
            copied[target]=file.read()
    for mandatory in ('three-mesh-bvh/src/index.js','three-mesh-bvh/src/utils/ExtensionUtilities.js','LICENSE-three-mesh-bvh.txt'):
        if mandatory not in copied:raise RuntimeError('Incomplete BVH archive: '+mandatory)
    return copied

def fetch_csg() -> dict[str,bytes]:
    """Vendor complete official MIT three-bvh-csg ESM source with npm SHA-512 verification."""
    name='three-bvh-csg';version=CSG_VERSION
    meta=json.loads(fetch(f'{REGISTRY}/{name}/{version}',2_000_000))
    if meta.get('name')!=name or meta.get('version')!=version:
        raise RuntimeError('Incorrect CSG registry metadata')
    dist=meta.get('dist') or {}
    expected=f'{REGISTRY}/{name}/-/{name}-{version}.tgz'
    if dist.get('tarball')!=expected:raise RuntimeError('Unexpected CSG tarball URL')
    data=fetch(expected,16_000_000)
    sri=dist.get('integrity','')
    if not sri.startswith('sha512-') or base64.b64encode(hashlib.sha512(data).digest()).decode('ascii')!=sri[7:]:
        raise RuntimeError('three-bvh-csg npm SHA-512 verification failed')
    copied={}
    with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as tar:
        for entry in tar:
            if not entry.isfile(): continue
            if entry.name=='package/LICENSE':
                target='LICENSE-three-bvh-csg.txt'
            elif entry.name.startswith('package/src/') and entry.name.endswith(('.js','.json')):
                relative=entry.name[len('package/src/'):]
                if not relative or any(p in ('..','.') for p in relative.split('/')):continue
                target='three-bvh-csg/src/'+relative
            else:continue
            if entry.size<0 or entry.size>2_000_000:raise RuntimeError('Invalid CSG source entry')
            stream=tar.extractfile(entry)
            if stream is None:raise RuntimeError('Invalid CSG archive member')
            copied[target]=stream.read()
    for required in ('three-bvh-csg/src/index.js','LICENSE-three-bvh-csg.txt'):
        if required not in copied: raise RuntimeError('Incomplete CSG source: '+required)
    return copied

def vendor(game:Path):
    if not (game/'game.js').is_file() or not (game/'index.html').is_file():
        raise SystemExit('The --game directory must be a Casual Game Studio generated game')
    three=fetch_and_verify('three',THREE_VERSION,{
      'package/build/three.module.js':'three.module.js',
      'package/build/three.core.js':'three.core.js',
      'package/examples/jsm/loaders/GLTFLoader.js':'three-addons/loaders/GLTFLoader.js',
      'package/examples/jsm/utils/BufferGeometryUtils.js':'three-addons/utils/BufferGeometryUtils.js',
      'package/examples/jsm/utils/SkeletonUtils.js':'three-addons/utils/SkeletonUtils.js',
      'package/examples/jsm/loaders/KTX2Loader.js':'three-addons/loaders/KTX2Loader.js',
      'package/examples/jsm/utils/WorkerPool.js':'three-addons/utils/WorkerPool.js',
      'package/examples/jsm/libs/ktx-parse.module.js':'three-addons/libs/ktx-parse.module.js',
      'package/examples/jsm/libs/zstddec.module.js':'three-addons/libs/zstddec.module.js',
      'package/examples/jsm/math/ColorSpaces.js':'three-addons/math/ColorSpaces.js',
      'package/examples/jsm/libs/basis/basis_transcoder.js':'three-addons/libs/basis/basis_transcoder.js',
      'package/examples/jsm/libs/basis/basis_transcoder.wasm':'three-addons/libs/basis/basis_transcoder.wasm',
      'package/LICENSE':'LICENSE-three.txt'
    })
    post=fetch_and_verify('postprocessing',POST_VERSION,{
      'package/build/index.js':'postprocessing.js',
      'package/LICENSE.md':'LICENSE-postprocessing.txt'
    })
    rapier=fetch_and_verify('@dimforge/rapier3d-compat',RAPIER_VERSION,{
      'package/dist/rapier.mjs':'rapier.mjs',
      'package/LICENSE':'LICENSE-rapier.txt'
    })
    quarks=fetch_and_verify('three.quarks',QUARKS_VERSION,{
      'package/dist/three.quarks.esm.js':'three.quarks.esm.js',
      'package/LICENSE':'LICENSE-quarks.txt'
    })
    quarks_core=fetch_and_verify('quarks.core',QUARKS_VERSION,{
      'package/dist/quarks.core.esm.js':'quarks.core.esm.js'
    })
    bvh=fetch_bvh()
    csg=fetch_csg()
    meshopt=fetch_and_verify('meshoptimizer',MESHOPT_VERSION,{
      'package/meshopt_decoder.mjs':'meshopt_decoder.mjs',
      'package/LICENSE.md':'LICENSE-meshoptimizer.txt'
    })
    # VRM characters use the exact same Three.js instance as the gameplay.
    vrm=fetch_and_verify('@pixiv/three-vrm',THREE_VRM_VERSION,{
      'package/lib/three-vrm.module.js':'three-vrm.module.js',
      'package/LICENSE':'LICENSE-three-vrm.txt'
    })
    vendor_dir=game/'vendor';vendor_dir.mkdir(exist_ok=True,parents=True)
    for name,data in (three|post|rapier|quarks|quarks_core|meshopt|vrm|bvh|csg).items():
        target=vendor_dir/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
    html_file=game/'index.html';html=html_file.read_text(encoding='utf-8')
    pattern=r'(<script type="importmap">)(.*?)(</script>)'
    match=re.search(pattern,html,flags=re.S)
    if not match: raise RuntimeError('Import map missing; cannot switch to offline package')
    config=json.loads(match.group(2))
    config.setdefault('imports',{}).update({
      'three':'./vendor/three.module.js',
      'three-mesh-bvh':'./vendor/three-mesh-bvh/src/index.js',
      'three-bvh-csg':'./vendor/three-bvh-csg/src/index.js',
      'three/addons/':'./vendor/three-addons/',
      'postprocessing':'./vendor/postprocessing.js',
      'three.quarks':'./vendor/three.quarks.esm.js',
      'quarks.core':'./vendor/quarks.core.esm.js',
      '@dimforge/rapier3d-compat':'./vendor/rapier.mjs',
      'meshoptimizer/decoder':'./vendor/meshopt_decoder.mjs',
      '@pixiv/three-vrm':'./vendor/three-vrm.module.js',
    })
    html=html[:match.start(2)]+json.dumps(config,indent=2)+html[match.end(2):]
    html_file.write_text(html,encoding='utf-8')
    print(f'Bundled Three.js {THREE_VERSION}, Tween.js, postprocessing {POST_VERSION}, Rapier {RAPIER_VERSION} Quarks {QUARKS_VERSION} Meshoptimizer {MESHOPT_VERSION}, Three-VRM {THREE_VRM_VERSION} Three Mesh BVH {BVH_VERSION} and Three BVH CSG {CSG_VERSION}; offline ready incl. KTX2Loader and Basis transcoder.')


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--game',type=Path,required=True)
    args=p.parse_args()
    vendor(args.game.resolve())

if __name__=='__main__':main()
