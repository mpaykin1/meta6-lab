#!/usr/bin/env python3
"""META GAME FUSION: glTF-Transform adapter for the Assimp model library.

Requires an explicitly installed @gltf-transform/cli 4.5.1 at runtime.
Reads hashed GLB2 candidates from model-library.json and writes new GLBs
under optimized-glb/ without modifying source projects, Assimp outputs,
or accepted sprites. Does not pretend metadata checks prove visual fidelity.
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

VERSION = '4.5.1'
MAX_FILE = 256 * 1024 * 1024
VALID_STATES = {'converted', 'copied_glb2', 'existing'}
PROFILES = {'safe': ('dedup',), 'meshopt': ('dedup', 'meshopt'), 'webp': ('dedup', 'webp')}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for piece in iter(lambda: f.read(1024 * 1024), b''):
            h.update(piece)
    return h.hexdigest()


def atomic_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix='.mgf-', suffix='.json', dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def limited_path(root: Path, rel: str) -> Path:
    raw = PurePosixPath(rel)
    if not rel or raw.is_absolute() or '\\' in rel or '\0' in rel or '..' in raw.parts:
        raise ValueError('Disallowed indexed path: ' + repr(rel))
    p = root.joinpath(*raw.parts)
    # Reject *any* symlink component, including symlinked parent directories.
    cursor = root
    for piece in raw.parts:
        cursor /= piece
        if cursor.is_symlink():
            raise ValueError('Symlink in indexed path: ' + repr(rel))
    result = p.resolve(strict=True)
    if not result.is_file() or not result.is_relative_to(root):
        raise ValueError('Indexed asset escaped its library root')
    return result


def inspect_glb(path: Path) -> dict[str, Any]:
    size = path.stat().st_size
    if size < 20 or size > MAX_FILE:
        raise ValueError('GLB size outside permitted bounds')
    with path.open('rb') as f:
        header = f.read(20)
        magic, version, stated, jslen, jstype = struct.unpack('<4sIIII', header)
        if magic != b'glTF' or version != 2 or stated != size:
            raise ValueError('Invalid GLB v2 header')
        if jstype != 0x4E4F534A or not jslen or jslen % 4 or jslen > min(size - 20, 50_000_000):
            raise ValueError('Invalid GLB JSON chunk')
        data = json.loads(f.read(jslen).decode('utf8').rstrip(' \n\r\t\0'))
    if str(data.get('asset', {}).get('version', '')).split('.')[0] != '2':
        raise ValueError('glTF metadata is not v2')
    return data


def _node(n: dict[str, Any]) -> dict[str, Any]:
    return {k: n.get(k) for k in ('name', 'mesh', 'skin', 'children', 'translation', 'rotation', 'scale', 'matrix', 'weights')}


def _structure(data: dict[str, Any]) -> dict[str, Any]:
    # Invariants intentionally exclude byte offsets, accessor buffers and image formats.
    return {
        'scene': data.get('scene'),
        'scenes': [(s.get('name'), s.get('nodes', [])) for s in data.get('scenes', [])],
        'nodes': [_node(n) for n in data.get('nodes', [])],
        'meshes': [(m.get('name'), len(m.get('primitives', [])),
                    [len(p.get('targets', [])) for p in m.get('primitives', [])],
                    m.get('weights')) for m in data.get('meshes', [])],
        'materials': [m.get('name') for m in data.get('materials', [])],
        'textures': len(data.get('textures', [])),
        'skins': [(s.get('name'), s.get('skeleton'), s.get('joints', [])) for s in data.get('skins', [])],
        'animations': [(a.get('name'), len(a.get('samplers', [])),
                        [(c.get('target', {}).get('node'), c.get('target', {}).get('path'), c.get('sampler'))
                         for c in a.get('channels', [])],
                        [s.get('interpolation', 'LINEAR') for s in a.get('samplers', [])])
                       for a in data.get('animations', [])],
    }


def validate_preserved(before: dict[str, Any], after: dict[str, Any], profile: str) -> None:
    b = _structure(before)
    a = _structure(after)
    for key in b:
        if a[key] != b[key]:
            raise ValueError(f'Preservation gate rejected modified {key}')
    old_ext = set(before.get('extensionsRequired', []))
    new_ext = set(after.get('extensionsRequired', []))
    additions = new_ext - old_ext
    allow = {
        'safe': set(),
        'meshopt': {'EXT_meshopt_compression'},
        'webp': {'EXT_texture_webp'},
    }[profile]
    if not additions.issubset(allow):
        raise ValueError('Unexpected new glTF runtime extensions: ' + ','.join(sorted(additions)))
    if not old_ext.issubset(new_ext):
        raise ValueError('Required input glTF extensions were removed')


def cli_executable(name: str) -> str | None:
    # Prefer the isolated, opt-in pinned npm runtime shipped as a manifest,
    # without downloading dependencies on the user's behalf.
    bundled_runtime = Path(__file__).resolve().parent.parent / 'optimizer-deps' / 'node_modules' / '.bin' / 'gltf-transform'
    if name == 'gltf-transform' and bundled_runtime.exists() and bundled_runtime.is_file():
        return str(bundled_runtime.resolve())
    binary = shutil.which(name)
    return str(Path(binary).resolve()) if binary else None


def limits() -> None:
    try:
        import resource
        resource.setrlimit(resource.RLIMIT_CPU, (90, 90))
        resource.setrlimit(resource.RLIMIT_AS, (4 * 1024 ** 3, 4 * 1024 ** 3))
        resource.setrlimit(resource.RLIMIT_FSIZE, (MAX_FILE, MAX_FILE))
    except (ImportError, ValueError, OSError):
        pass


def invoke(executable: str, args: list[str], cwd: Path, timeout: int) -> subprocess.CompletedProcess[str]:
    kwargs: dict[str, Any] = dict(cwd=cwd, capture_output=True, text=True, timeout=timeout, check=False)
    if os.name == 'posix':
        kwargs['preexec_fn'] = limits
    proc = subprocess.run([executable, *args], **kwargs)
    if proc.returncode:
        raise ValueError(f'glTF-Transform failed ({args[0]}): {(proc.stderr or proc.stdout)[-500:]}')
    return proc


def version_ok(binary: str) -> bool:
    try:
        r = subprocess.run([binary, '--version'], capture_output=True, text=True, timeout=12)
        return bool(r.returncode == 0 and re.search(r'(?<!\d)4\.5\.1(?!\d)', r.stdout + r.stderr))
    except (OSError, subprocess.TimeoutExpired):
        return False


def game_roots(models: list[dict[str, Any]]) -> list[Path]:
    roots: list[Path] = []
    for model in models:
        p = model.get('source_root')
        if p and Path(p).is_dir():
            roots.append(Path(p).resolve(strict=True))
    return roots


def run_model(model: dict[str, Any], library: Path, target_root: Path, binary: str | None,
              profile: str, timeout: int, keep_larger: bool) -> dict[str, Any]:
    result = dict(model)
    opt = {'status': 'not_attempted', 'profile': profile,
           'source_id': model.get('id'), 'requires_decoder': profile == 'meshopt',
           'license': model.get('license', 'review_required'),
           'approved_for_reuse': model.get('approved_for_reuse', False)}
    result['optimization'] = opt
    if model.get('conversion') not in VALID_STATES:
        opt['status'] = 'skipped_no_glb'; return result
    try:
        src = limited_path(library, model['output'])
        src_size = src.stat().st_size
        if src_size > MAX_FILE:
            raise ValueError('Input model exceeds size limit')
        hash_before = sha256(src)
        if not re.fullmatch(r'[0-9a-f]{64}', str(model.get('output_sha256', ''))) or hash_before != model['output_sha256']:
            raise ValueError('Input GLB differs from recorded Assimp output hash')
        source_root = Path(model['source_root']).resolve(strict=True)
        original = limited_path(source_root, model['path'])
        if sha256(original) != model['source_sha256']:
            raise ValueError('Original model changed since Tree-sitter indexing')
        before = inspect_glb(src)
        opt.update(input_sha256=hash_before, input_bytes=src_size)
        if not binary:
            opt.update(status='unavailable', warning='Install @gltf-transform/cli@4.5.1 explicitly; no download attempted')
            return result
        safe_id = hashlib.sha256((str(model.get('id')) + hash_before + profile).encode()).hexdigest()[:20]
        friendly = re.sub(r'[^a-zA-Z0-9_-]+', '-', Path(model['output']).stem)[:32].strip('-') or 'model'
        target = target_root / 'optimized-glb' / f'{friendly}-{safe_id}-{profile}.glb'
        if target.parent.is_symlink():
            raise ValueError('Optimized output directory must not be a symlink')
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.parent.resolve(strict=True) != (target_root / 'optimized-glb').resolve(strict=True):
            raise ValueError('Optimized output path escaped library')
        if target.exists():
            if target.is_symlink():
                raise ValueError('Refusing symlink target')
            existing = inspect_glb(target)
            validate_preserved(before, existing, profile)
            opt.update(status='existing', output=target.relative_to(target_root).as_posix(),
                       output_sha256=sha256(target), output_bytes=target.stat().st_size,
                       saved_bytes=src_size - target.stat().st_size)
            return result
        with tempfile.TemporaryDirectory(prefix='.gltf-opt-', dir=target.parent) as t:
            tmp = Path(t)
            current = src
            for i, command in enumerate(PROFILES[profile]):
                future = tmp / f'step-{i}.glb'
                cmd = [command, str(current), str(future)]
                if command == 'meshopt':
                    cmd += ['--level', 'medium']
                invoke(binary, cmd, tmp, timeout)
                if not future.is_file() or future.stat().st_size > MAX_FILE:
                    raise ValueError('CLI produced invalid or oversized output')
                validate_preserved(before, inspect_glb(future), profile if command != 'dedup' else 'safe')
                current = future
            after = inspect_glb(current)
            validate_preserved(before, after, profile)
            size = current.stat().st_size
            if size >= src_size and not keep_larger:
                opt.update(status='not_smaller', candidate_bytes=size,
                           warning='Original GLB retained; optimization did not reduce file size')
                return result
            h = sha256(current)
            os.replace(current, target)
            opt.update(status='optimized', output=target.relative_to(target_root).as_posix(),
                       output_sha256=h, output_bytes=size, saved_bytes=src_size - size,
                       required_extensions=after.get('extensionsRequired', []))
    except (OSError, KeyError, ValueError, struct.error, json.JSONDecodeError, subprocess.TimeoutExpired) as e:
        opt.update(status='failed', warning=str(e)[:800])
    return result


def main() -> int:
    p = argparse.ArgumentParser(description='META GAME FUSION glTF-Transform optimization adapter')
    p.add_argument('command', choices=['inventory', 'optimize'])
    p.add_argument('--models', required=True, type=Path, help='Assimp model-library.json')
    p.add_argument('--out', type=Path, help='Library output root (default: model-library parent)')
    p.add_argument('--gltf-cli', default='gltf-transform', help='Installed pinned CLI binary')
    p.add_argument('--profile', choices=sorted(PROFILES), default='safe')
    p.add_argument('--game', action='append', help='Filter to selected game ID')
    p.add_argument('--timeout', type=int, default=80)
    p.add_argument('--keep-larger', action='store_true', help='Keep results even when bigger than input')
    args = p.parse_args()
    try:
        if args.timeout < 1 or args.timeout > 120:
            raise ValueError('Invalid timeout')
        index_file = args.models.expanduser().resolve(strict=True)
        library = index_file.parent
        manifest = json.loads(index_file.read_text(encoding='utf8'))
        if manifest.get('schema') != 'meta-game-fusion.models.v1' or not isinstance(manifest.get('models'), list):
            raise ValueError('Requires Assimp model-library.json schema v1')
        out = args.out.expanduser().resolve() if args.out else library
        for game in game_roots(manifest['models']):
            if out == game or out.is_relative_to(game):
                raise ValueError('Output must not be inside a game source directory')
        selected = set(args.game or [])
        entries = [v for v in manifest['models'] if not selected or v.get('game') in selected]
        if selected.difference({v.get('game') for v in manifest['models']}):
            raise ValueError('Unknown game selection')
        # No write to original sources or Assimp model-library.json.
        out.mkdir(parents=True, exist_ok=True)
        binary = cli_executable(args.gltf_cli) if args.command == 'optimize' else None
        if binary and not version_ok(binary):
            raise ValueError('Installed gltf-transform --version is not pinned to 4.5.1')
        if args.command == 'inventory':
            records = [{**m, 'optimization': {'status': 'catalogued', 'profile': args.profile}} for m in entries]
        else:
            records = [run_model(m, library, out, binary, args.profile, args.timeout, args.keep_larger) for m in entries]
        data = {
            'schema': 'meta-game-fusion.optimized-models.v1',
            'source_model_library': str(index_file),
            'adapter': 'gltf-transform-cli', 'pinned_version': VERSION,
            'binary': binary, 'profile': args.profile, 'models': records,
            'limitations': ['Structural safety checks do not prove visible equivalence.',
                            'Source licenses and reuse approval are never inferred.',
                            'Meshopt output needs a decoder configured in the Three.js loader.'],
        }
        dest = out / 'optimized-model-library.json'
        atomic_json(dest, data)
        statuses = [m['optimization']['status'] for m in records]
        print(f'META GAME FUSION: {len(records)} models; optimized={statuses.count("optimized")}; existing={statuses.count("existing")}; failed={statuses.count("failed")}; catalog={dest}')
        if 'failed' in statuses:
            return 4
        if 'unavailable' in statuses:
            return 3
        return 0
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as e:
        print(f'META GAME FUSION error: {e}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
