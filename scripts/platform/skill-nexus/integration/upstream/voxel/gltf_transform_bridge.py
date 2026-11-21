#!/usr/bin/env python3
"""Lossless-first glTF-Transform pipeline for VGC's existing GLB asset bridge.

Uses official MIT @gltf-transform/cli 4.5.1 (installed in user cache on demand).
Geometry compression optionally invokes official meshoptimizer through glTF-Transform.
Generated Three.js GLTFLoader receives a bundled MIT MeshoptDecoder automatically.
Meshopt quantization can change precision slightly; originals stay untouched.
Original files are never rewritten. Animation clips, skeleton and node hierarchy are checked.
"""
from __future__ import annotations

import argparse
import collections
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

from blockbench_bridge import read_glb
from meshoptimizer_bridge import compress as meshopt_compress

VERSION = '4.5.1'
MODULE = f'@gltf-transform/cli@{VERSION}'
SOURCE = 'https://github.com/donmccurdy/glTF-Transform'
CACHE = Path.home() / '.cache' / 'voxel-game-creator' / f'gltf-transform-{VERSION}'


class OptimizationError(RuntimeError):
    pass


def glb_json(path: Path, *, allow_meshopt: bool = False) -> dict:
    """Read GLB JSON chunk while validating v2 header and embedded assets."""
    read_glb(path, allow_meshopt=allow_meshopt)
    with path.open('rb') as f:
        header = f.read(20)
        _, _, _, json_length, _ = struct.unpack('<4sIIII', header)
        return json.loads(f.read(json_length).rstrip(b'\x00 '))


def identity(doc: dict) -> dict:
    """Semantic identity preserved by the pixel-art-safe preset."""
    nodes = doc.get('nodes', [])
    def nodes_named(indices):
        return tuple((nodes[i].get('name') or f'#{i}') for i in indices)
    skins = [nodes_named(s.get('joints', [])) for s in doc.get('skins', [])]
    anims=[]
    for anim in doc.get('animations', []):
        anims.append((anim.get('name', ''), len(anim.get('samplers', [])),
             tuple((c.get('target', {}).get('path', ''),
                    nodes[c['target']['node']].get('name') if 'node' in c.get('target', {}) else None)
                   for c in anim.get('channels', []))))
    return {
        'nodes': len(nodes),
        'node_names': collections.Counter(n.get('name', '') for n in nodes),
        'skins': skins,
        'animations': anims,
        'scene_count': len(doc.get('scenes', [])),
        'mesh_count': len(doc.get('meshes', [])),
    }


def which_cli(explicit: Path | None = None, *, install: bool = True) -> str | None:
    if explicit:
        path = explicit.expanduser().resolve()
        if not path.is_file():
            raise OptimizationError('glTF-Transform CLI not found: ' + str(explicit))
        return str(path)
    env = os.environ.get('VGC_GLTF_TRANSFORM')
    if env:
        return which_cli(Path(env), install=False)
    system = shutil.which('gltf-transform')
    if system:
        return system
    local = CACHE / 'node_modules' / '.bin' / 'gltf-transform'
    if local.is_file():
        return str(local)
    if not install:
        return None
    if shutil.which('npm') is None:
        return None
    try:
        CACHE.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        print(f'VGC optimizer: cache unavailable ({exc})', file=sys.stderr)
        return None
    # No shell interpolation. Pinned version; install to cache, outside any game build.
    cmd = ['npm', 'install', '--prefix', str(CACHE), MODULE,
           '--no-save', '--no-package-lock', '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=7000']
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=55, check=False)
    except (OSError, subprocess.TimeoutExpired) as exc:
        print(f'VGC optimizer: official CLI unavailable ({exc})', file=sys.stderr)
        return None
    if proc.returncode:
        print(f'VGC optimizer: npm installation skipped ({proc.stderr[-400:]})', file=sys.stderr)
        return None
    return str(local) if local.is_file() else None


def cli_command(cli: str, *args: str) -> list[str]:
    return ['node', cli, *args] if cli.endswith(('.js', '.mjs')) else [cli, *args]


def call(cli: str, *args: str) -> None:
    proc = subprocess.run(cli_command(cli, *args), capture_output=True, text=True,
                          timeout=160, check=False)
    if proc.returncode:
        raise OptimizationError('glTF-Transform '+str(args[0])+' failed: '+proc.stderr[-900:])


def optimize(items: list[dict], workdir: Path, *, policy: str = 'auto',
             textures: str = 'lossless-webp', executable: Path | None = None,
             geometry: str = 'meshopt', meshopt_level: str = 'high') -> tuple[list[dict], list[dict]]:
    """Return updated manifest items and per-asset outcomes. Originals untouched.

    In auto mode, missing CLI or invalid output -> original GLB. In required mode,
    fail clearly, no partly optimized result is published. Never keep bigger output.
    """
    if policy not in ('off', 'auto', 'required'):
        raise OptimizationError('optimizer policy must be off|auto|required')
    if textures not in ('off', 'lossless-webp'):
        raise OptimizationError('texture mode must be off|lossless-webp')
    if geometry not in ('off', 'meshopt'):
        raise OptimizationError('geometry compression must be off|meshopt')
    if meshopt_level not in ('medium', 'high'):
        raise OptimizationError('meshopt level must be medium|high')
    if not items:
        return [], []
    copied = [dict(item) for item in items]
    if policy == 'off':
        return copied, [dict(id=x['id'], status='disabled', original_bytes=x['source'].stat().st_size) for x in copied]
    cli = which_cli(executable, install=True)
    if not cli:
        if policy == 'required':
            raise OptimizationError('glTF-Transform '+VERSION+' not available; npm/network required')
        return copied, [dict(id=x['id'], status='unavailable', original_bytes=x['source'].stat().st_size) for x in copied]
    workdir.mkdir(parents=True, exist_ok=True)
    results=[]
    for item in copied:
        source = Path(item['source'])
        original_size = source.stat().st_size
        deduped = workdir / f'{item["id"]}-dedup.glb'
        webp_path = workdir / f'{item["id"]}-webp.glb'
        meshopt_path = workdir / f'{item["id"]}-meshopt.glb'
        result = dict(id=item['id'], original_bytes=original_size, status='original-smaller', applied=[])
        baseline = source
        try:
            before = glb_json(source, allow_meshopt=True)
            call(cli, 'dedup', str(source), str(deduped))
            baseline = deduped
            transforms = ['dedup']
            if textures == 'lossless-webp' and before.get('textures'):
                call(cli, 'webp', str(deduped), str(webp_path), '--lossless', 'true')
                baseline = webp_path
                transforms.append('lossless-webp')
            after = glb_json(baseline, allow_meshopt=True)
            if identity(before) != identity(after):
                raise OptimizationError('dedup/webp changed model, skeleton or animation identities')
            if baseline.stat().st_size < original_size:
                item['source'] = baseline
                result.update(status='optimized', optimized_bytes=baseline.stat().st_size, applied=transforms)
            else:
                result['applied'] = []
        except (OSError, ValueError, KeyError, IndexError, TypeError, OptimizationError, subprocess.TimeoutExpired) as exc:
            if policy == 'required':
                raise OptimizationError(f'{item["id"]}: {exc}') from exc
            print(f'VGC glTF-Transform: {item["id"]} left intact ({exc})', file=sys.stderr)
            results.append(dict(id=item['id'], status='original-on-error', original_bytes=original_size))
            continue

        if geometry == 'meshopt':
            try:
                info = meshopt_compress(call, glb_json, identity, cli, baseline, meshopt_path,
                                        before, meshopt_level)
                size = meshopt_path.stat().st_size
                result['meshopt'] = dict(status='verified', level=meshopt_level, **info)
                if size < Path(item['source']).stat().st_size:
                    item['source'] = meshopt_path
                    result.update(status='optimized', optimized_bytes=size, applied=transforms+['meshopt'])
                else:
                    result['meshopt']['status'] = 'larger-than-best'
            except (OSError, ValueError, KeyError, IndexError, TypeError, OptimizationError,
                    subprocess.TimeoutExpired) as exc:
                if policy == 'required':
                    raise OptimizationError(f'{item["id"]}: Meshoptimizer: {exc}') from exc
                print(f'VGC Meshoptimizer: {item["id"]} kept previous GLB ({exc})', file=sys.stderr)
                result['meshopt'] = dict(status='unavailable-or-invalid', reason=str(exc)[:150])
        item['meshopt'] = bool(read_glb(item['source'], allow_meshopt=True)['meshopt'])
        results.append(result)
    return copied, results


def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source', type=Path, required=True, help='Unmodified source .glb')
    p.add_argument('--out', type=Path, required=True, help='Optimized GLB output; must not exist')
    p.add_argument('--texture-mode', choices=['off','lossless-webp'], default='lossless-webp')
    p.add_argument('--gltf-transform', type=Path)
    p.add_argument('--geometry-compression', choices=['off','meshopt'], default='meshopt')
    p.add_argument('--meshopt-level', choices=['medium','high'], default='high')
    args=p.parse_args()
    if args.out.exists(): p.error('output already exists')
    read_glb(args.source)
    selected=[{'id': args.source.stem, 'source':args.source}]
    with tempfile.TemporaryDirectory(prefix='vgc-glb-') as t:
        optimized, results=optimize(selected,Path(t),policy='required',textures=args.texture_mode,executable=args.gltf_transform,geometry=args.geometry_compression,meshopt_level=args.meshopt_level)
        shutil.copyfile(optimized[0]['source'],args.out)
        print(json.dumps(results,indent=2,ensure_ascii=False))

if __name__=='__main__': main()
