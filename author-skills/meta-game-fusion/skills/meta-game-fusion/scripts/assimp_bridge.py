#!/usr/bin/env python3
"""META GAME FUSION · Assimp bridge.

Builds a provenance-preserving, opt-in GLB library from the Tree-sitter asset
index. No original game files are written or executed. Native Assimp import
must be installed separately; this package does not bundle an Assimp binary.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import struct
import subprocess
import sys
import tempfile
from typing import Any

MODEL_EXT = {
    '.3ds', '.3mf', '.dae', '.fbx', '.glb', '.gltf', '.lwo', '.md2', '.md3',
    '.obj', '.off', '.ply', '.stl', '.x', '.x3d', '.blend', '.usd', '.usdz'
}
# Exporter formats vary across builds. This importer can only guarantee a GLB
# if the installed assimp binary has the GLTF2 exporter compiled in.
SUPPORTED_DIRECT = {'.glb'}
DEFAULT_MAX_BYTES = 200 * 1024 * 1024


def digest_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def safe_path(root: Path, rel: str) -> Path:
    p = PurePosixPath(rel)
    if not rel or p.is_absolute() or '..' in p.parts or '\\' in rel or '\0' in rel:
        raise ValueError(f'Invalid path in index: {rel!r}')
    path = root.joinpath(*p.parts)
    # Even a symlink from an untrusted project index must not escape the root.
    resolved = path.resolve(strict=True)
    if not resolved.is_relative_to(root) or not resolved.is_file() or path.is_symlink():
        raise ValueError(f'Outside source root or symlink: {rel!r}')
    return resolved


def model_candidates(index: dict[str, Any]) -> list[dict[str, Any]]:
    found = []
    if index.get('schema') != 'meta-game-fusion.index.v1':
        raise ValueError('Incompatible index schema; run fusion.py scan first')
    for game in index.get('games', []):
        if game.get('readonly') is not True:
            raise ValueError('Source origin must be explicitly read-only')
        name = game['id']
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', name):
            raise ValueError('Invalid game ID')
        root = Path(game['source_root']).expanduser().resolve(strict=True)
        if not root.is_dir():
            raise ValueError(f'Source directory missing: {root}')
        code_tags = {file['path']: file.get('tags', []) for file in game.get('files', []) if file.get('kind') == 'code'}
        for f in game.get('files', []):
            if f.get('kind') != 'asset' or Path(f.get('path', '')).suffix.lower() not in MODEL_EXT:
                continue
            rel = f['path']
            name_only = PurePosixPath(rel).name.lower()
            possible_links = []
            for imp in game.get('imports', []):
                mod = str(imp.get('module', '')).replace('\\', '/').split('?', 1)[0].split('#', 1)[0].lower()
                if mod and (mod == rel.lower() or mod.endswith('/' + name_only) or mod == name_only):
                    possible_links.append({
                        'code_path': imp.get('file', ''), 'line': imp.get('line'),
                        'gameplay_tags': code_tags.get(imp.get('file', ''), []),
                        'detection': 'tree-sitter-import-path-candidate',
                    })
                    if len(possible_links) == 64:
                        break
            found.append({
                'id': f'{name}:{rel}',
                'game': name, 'source_root': str(root), 'path': rel,
                'source_sha256': f['sha256'], 'bytes_indexed': f['size'],
                'possible_code_links': possible_links,
                'format': Path(rel).suffix.lower(),
                'license': 'review_required', 'compatibility': 'unverified',
                'source_engine': 'unknown', 'conversion': 'not_attempted',
                'approved_for_reuse': False, 'animations_verified': False,
                'materials_verified': False, 'rig_verified': False,
            })
    return found


def parse_glb(path: Path) -> dict[str, Any]:
    """Validate GLB v2 header + JSON chunk without loading binary buffers."""
    length = path.stat().st_size
    if length < 20:
        raise ValueError('GLB too small')
    with path.open('rb') as f:
        head = f.read(20)
        magic, version, stated_size, json_len, json_type = struct.unpack('<4sIIII', head)
        if magic != b'glTF' or version != 2 or stated_size != length:
            raise ValueError('GLB2 header invalid')
        if json_type != 0x4E4F534A or json_len > length - 20 or json_len % 4:
            raise ValueError('GLB2 JSON chunk invalid')
        raw = f.read(json_len)
        scene = json.loads(raw.decode('utf8').rstrip(' \t\r\n\0'))
        if str(scene.get('asset', {}).get('version', '')).split('.')[0] != '2':
            raise ValueError('GLB is not glTF 2.0')
    return {
        'nodes': len(scene.get('nodes', [])),
        'meshes': len(scene.get('meshes', [])),
        'materials': len(scene.get('materials', [])),
        'textures': len(scene.get('textures', [])),
        'images': len(scene.get('images', [])),
        'animations': len(scene.get('animations', [])),
        'skins': len(scene.get('skins', [])),
        'scenes': len(scene.get('scenes', [])),
        'scene_metadata_only': True,
    }


def resource_limits():
    """Linux/macOS limits for processing untrusted model formats."""
    try:
        import resource
        resource.setrlimit(resource.RLIMIT_CPU, (50, 50))
        resource.setrlimit(resource.RLIMIT_AS, (3 * 1024**3, 3 * 1024**3))
        resource.setrlimit(resource.RLIMIT_FSIZE, (256 * 1024**2, 256 * 1024**2))
    except (ImportError, ValueError, OSError):
        pass


def available_assimp(binary: str) -> str | None:
    path = shutil.which(binary)
    return str(Path(path).resolve()) if path else None


def write_atomic(path: Path, obj: dict[str, Any]):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name('.pending-' + path.name)
    temp.write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding='utf8')
    os.replace(temp, path)


def safe_out_dir(index: dict[str, Any], out: Path):
    for game in index['games']:
        root = Path(game['source_root']).expanduser().resolve(strict=True)
        if out == root or root in out.parents:
            raise ValueError('Output cannot be inside any original game project')


def convert_one(item: dict[str, Any], output: Path, binary: str | None, max_bytes: int, timeout: int, convert: bool) -> dict[str, Any]:
    rec = dict(item)
    src_root = Path(rec['source_root']).resolve(strict=True)
    try:
        src = safe_path(src_root, rec['path'])
        if src.stat().st_size > max_bytes:
            raise ValueError('Source model exceeds the configured size limit')
        if src.stat().st_size != rec['bytes_indexed'] or digest_file(src) != rec['source_sha256']:
            raise ValueError('Source changed since the Tree-sitter catalog was built')
        if not convert:
            rec['conversion'] = 'catalogued'; return rec
        if src.suffix.lower() != '.glb' and not binary:
            rec['conversion'] = 'unavailable'
            rec['warning'] = 'Assimp CLI is unavailable. No model was converted.'
            return rec
        slug = re.sub(r'[^A-Za-z0-9_-]+', '-', Path(rec['path']).stem)[:36].strip('-') or 'model'
        fname = f"{rec['game']}-{slug}-{rec['source_sha256'][:16]}.glb"
        target = output / 'glb' / fname
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            if target.is_symlink():
                raise ValueError('Refusing to overwrite a symlink')
            metadata = parse_glb(target)
            rec.update(conversion='existing', output=target.relative_to(output).as_posix(),
                       output_sha256=digest_file(target), gltf2=metadata)
            return rec
        # A separate temporary directory prevents an importer/exporter from
        # scattering output files into the source game project.
        with tempfile.TemporaryDirectory(prefix='fusion-assimp-', dir=output) as tmpdir:
            temp = Path(tmpdir) / 'candidate.glb'
            if src.suffix.lower() == '.glb':
                shutil.copyfile(src, temp)
            else:
                options: dict[str, Any] = {
                    'capture_output': True, 'text': True, 'timeout': timeout,
                    'cwd': str(src.parent), 'check': False,
                }
                if os.name == 'posix':
                    options['preexec_fn'] = resource_limits
                result = subprocess.run([binary, 'export', str(src), str(temp), '-fglb2'], **options)
                if result.returncode != 0:
                    raise ValueError('Assimp export failed: ' + (result.stderr or result.stdout)[-700:])
            if not temp.is_file() or temp.stat().st_size > 256 * 1024 * 1024:
                raise ValueError('No valid bounded GLB output')
            metadata = parse_glb(temp)
            # Don't confuse valid structure with animation/material fidelity.
            output_hash = digest_file(temp)
            os.replace(temp, target)
        rec.update(conversion='converted' if src.suffix.lower() != '.glb' else 'copied_glb2',
                   output=target.relative_to(output).as_posix(),
                   output_sha256=output_hash, gltf2=metadata,
                   runtime='assimp-cli' if src.suffix.lower() != '.glb' else 'native-glb2',
                   warning='Source license, material fidelity and animations still require review.')
    except (OSError, ValueError, subprocess.TimeoutExpired, subprocess.SubprocessError, json.JSONDecodeError) as e:
        rec['conversion'] = 'failed'
        rec['warning'] = str(e)[:900]
    return rec


def main() -> int:
    parser = argparse.ArgumentParser(description='META GAME FUSION Assimp GLB bridge')
    parser.add_argument('command', choices=['inventory', 'convert'])
    parser.add_argument('--index', required=True, type=Path, help='fusion-index.json from Tree-sitter scan')
    parser.add_argument('--out', required=True, type=Path, help='Separate library directory, outside original games')
    parser.add_argument('--assimp-cli', default='assimp', help='Installed Assimp CLI path (never downloaded silently)')
    parser.add_argument('--game', action='append', help='Optional game IDs to include')
    parser.add_argument('--max-bytes', type=int, default=DEFAULT_MAX_BYTES)
    parser.add_argument('--timeout', type=int, default=45)
    args = parser.parse_args()
    try:
        if args.max_bytes < 1 or args.timeout < 1 or args.timeout > 600:
            raise ValueError('Invalid bounds')
        index = json.loads(args.index.expanduser().resolve(strict=True).read_text(encoding='utf8'))
        out = args.out.expanduser().resolve()
        safe_out_dir(index, out)
        selected = set(args.game or [])
        entries = [m for m in model_candidates(index) if not selected or m['game'] in selected]
        if selected and selected.difference({g['id'] for g in index['games']}):
            raise ValueError('Unknown game ID')
        out.mkdir(parents=True, exist_ok=True)
        binary = available_assimp(args.assimp_cli) if args.command == 'convert' else None
        models = [convert_one(m, out, binary, args.max_bytes, args.timeout, args.command == 'convert') for m in entries]
        registry = {
            'schema': 'meta-game-fusion.models.v1', 'source_index': str(args.index.resolve()),
            'adapter': 'assimp-cli-glb2', 'native_importer': binary if args.command == 'convert' else None,
            'models': models, 'limitations': [
                'License approval is separate from technical conversion.',
                'glTF container validity does not prove animation, material or rig fidelity.',
                'Assimp CLI is a separately installed native dependency and may support fewer file formats.',
            ],
        }
        write_atomic(out / 'model-library.json', registry)
        ok = sum(m['conversion'] in ('converted', 'copied_glb2', 'existing') for m in models)
        failed = sum(m['conversion'] == 'failed' for m in models)
        print(f'META GAME FUSION: {len(models)} models, {ok} GLB outputs, {failed} failed; catalog: {out / "model-library.json"}')
        # Absence of Assimp is not success when non-glb models were selected.
        if args.command == 'convert' and any(m['conversion'] == 'unavailable' for m in models):
            return 3
        return 4 if failed else 0
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as e:
        print(f'META GAME FUSION error: {e}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
