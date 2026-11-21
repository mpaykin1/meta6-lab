#!/usr/bin/env python3
"""Download official Three.js npm package and vendor exactly the two ESM modules.

Uses the registry-supplied sha512/sha1 SRI and a pinned package version.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import io
import json
import pathlib
import shutil
import tarfile
import urllib.request

VERSION = '0.187.0'
REGISTRY_META = f'https://registry.npmjs.org/three/{VERSION}'
EXPECTED_TARBALL = f'https://registry.npmjs.org/three/-/three-{VERSION}.tgz'
WANTED = {
    'package/build/three.module.js': 'three.module.js',
    'package/build/three.core.js': 'three.core.js',
    'package/examples/jsm/loaders/GLTFLoader.js': 'three-addons/loaders/GLTFLoader.js',
    'package/examples/jsm/utils/BufferGeometryUtils.js': 'three-addons/utils/BufferGeometryUtils.js',
    'package/examples/jsm/utils/SkeletonUtils.js': 'three-addons/utils/SkeletonUtils.js',
    'package/examples/jsm/loaders/KTX2Loader.js': 'three-addons/loaders/KTX2Loader.js',
    'package/examples/jsm/utils/WorkerPool.js': 'three-addons/utils/WorkerPool.js',
    'package/examples/jsm/libs/ktx-parse.module.js': 'three-addons/libs/ktx-parse.module.js',
    'package/examples/jsm/libs/zstddec.module.js': 'three-addons/libs/zstddec.module.js',
    'package/examples/jsm/math/ColorSpaces.js': 'three-addons/math/ColorSpaces.js',
    'package/examples/jsm/libs/basis/basis_transcoder.js': 'three-addons/libs/basis/basis_transcoder.js',
    'package/examples/jsm/libs/basis/basis_transcoder.wasm': 'three-addons/libs/basis/basis_transcoder.wasm',
    'package/LICENSE': 'LICENSE-three.txt',
}


def fetch(url: str, cap: int = 16_000_000) -> bytes:
    request = urllib.request.Request(url, headers={'User-Agent': 'CasualGameStudio/0.1'})
    with urllib.request.urlopen(request, timeout=30) as stream:
        data = stream.read(cap+1)
        if len(data)>cap:
            raise ValueError('Download exceeds expected size')
        return data


def vendor(game: pathlib.Path) -> None:
    if not (game/'game.js').is_file():
        raise SystemExit(f'Expected generated game folder containing game.js: {game}')
    meta=json.loads(fetch(REGISTRY_META))
    if meta.get('name')!='three' or meta.get('version')!=VERSION:
        raise RuntimeError('Incorrect npm registry metadata')
    dist=meta['dist']
    url=dist['tarball']
    if url!=EXPECTED_TARBALL:
        raise RuntimeError('Unexpected Three.js package URL')
    archive=fetch(url)
    algo, encoded=dist['integrity'].split('-',1)
    if algo!='sha512':
        raise RuntimeError('Unsupported npm integrity algorithm')
    actual=base64.b64encode(hashlib.sha512(archive).digest()).decode('ascii')
    if actual!=encoded:
        raise RuntimeError('Integrity check failed for Three.js package')
    extracted={}
    with tarfile.open(fileobj=io.BytesIO(archive),mode='r:gz') as tar:
        for member in tar:
            if member.name in WANTED:
                if not member.isfile() or member.size>10_000_000:
                    raise RuntimeError('Invalid package member')
                fp=tar.extractfile(member)
                if fp is None:
                    raise RuntimeError('Missing source member')
                extracted[member.name]=fp.read()
    if set(extracted)!=set(WANTED):
        raise RuntimeError('Official Three.js build files not all present')
    dest=game/'vendor';dest.mkdir(parents=True,exist_ok=True)
    for source,name in WANTED.items():
        path=dest/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(extracted[source])
    html_file=game/'index.html'
    if html_file.exists():
        html=html_file.read_text(encoding='utf-8')
        html=html.replace('https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js','./vendor/three.module.js')
        html=html.replace('https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/','./vendor/three-addons/')
        html_file.write_text(html,encoding='utf-8')
    print('Note: compressed GLB also requires running vendor_engines.py to vendor meshoptimizer/decoder.')
    print(f'Vendored Three.js {VERSION} into {dest}: {len(extracted)} official files; SHA-512 verified')


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--game',required=True,type=pathlib.Path)
    args=p.parse_args()
    vendor(args.game.expanduser().resolve())

if __name__=='__main__': main()
