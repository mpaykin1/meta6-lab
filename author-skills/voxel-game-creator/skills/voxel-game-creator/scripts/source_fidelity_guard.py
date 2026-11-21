#!/usr/bin/env python3
"""Voxel Game Creator v0.19 — fail-closed game release gate.

Run after building an original engine, and before claiming a playable final game.
Never allow a custom procedural renderer to masquerade as a source engine.
No online dependencies; uses Python standard library only.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

PINNED_ENGINES = {
    'lumenwild': ('Vincent-P-essy/minecraft-clone', '593eddaf542a563c1e9c857d42239be1d5002335'),
    'voxelize': ('voxelize/voxelize', '0737bf40c4982bc1999042dd745e11b8104a74d2'),
    'ragnagrok': ('Ragnagrok/ragnagrok-engine', '66e80c3a7451c5455e713e9c94fe1cf3da423050'),
    'minecraft-w': ('Xollonox/Minecraft', '1ca40b195bf40b4c19336cdfeb22df6ad33a9c9e'),
    'voxelcraft': ('bridge-mind/voxelcraft', '30e8a2a2f7c8be9450983fa1d57aa197e875faf6'),
    'vesper': ('winchxyz/vesper-street', 'fcc2f6eda84311194c0834de6cd7081c2965086f'),
}

class GateError(RuntimeError):
    pass


def source_sha(source: Path, engine: str) -> str:
    """Read actual HEAD from a git checkout; no guessed manifest provenance."""
    if engine not in PINNED_ENGINES:
        raise GateError(f'{engine}: no pinned source-engine attestation; must review manually')
    if not (source/'.git').exists():
        raise GateError('Missing actual upstream .git checkout; custom HTML is not proof of an engine build')
    try:
        digest = subprocess.run(['git','-C',str(source),'rev-parse','HEAD'],
            check=True, capture_output=True,text=True,timeout=8).stdout.strip()
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        raise GateError(f'Cannot verify upstream checkout: {e}') from e
    expected=PINNED_ENGINES[engine][1]
    if digest != expected:
        raise GateError(f'{engine} checkout sha mismatch: {digest} != {expected}')
    if not any((source/name).is_file() for name in ('LICENSE','LICENSE.md','LICENSE.txt')):
        raise GateError('Missing upstream license')
    return digest


def fullscreen_triangle_guard(text: str) -> None:
    """Detect the original half-screen bug in common vertex-ID fullscreen pass."""
    # Wrong: p in {0,2} and gl_Position p - 1 spans only half width/height.
    # Correct: p*2 - 1, or p in {0,4} with p - 1, giving clip range -1..3.
    if 'gl_VertexID' not in text:
        return
    broken = re.search(r'gl_Position\s*=\s*vec4\(\s*p\s*-\s*1\.?\s*,', text)
    if broken and re.search(r'gl_VertexID\s*<<\s*1\s*\)\s*&\s*2', text):
        raise GateError('GLSL fullscreen triangle ends at +1, not +3 — half screen will be missing')
    if 'uv=p*.5;gl_Position=vec4(p-1.' in text:
        raise GateError('Known v1 corrupted post vertex shader (coverage=50% of viewport)')


def no_external_resources(html: str) -> None:
    tests = (
        r'<script\b[^>]*\bsrc\s*=',
        r'<link\b[^>]*\brel\s*=\s*["\']?stylesheet',
        r'<(?:img|audio|video|source|iframe)\b[^>]*\bsrc\s*=\s*["\'](?!data:)',
        r'\bimport\s+(?:[^;]+\s+from\s+)?["\'](?:https?:|\./|/)',
        r'\bimport\s*\(\s*["\']',
        r'\bfetch\s*\(\s*["\'](?:https?:|\./|/)',
        r'\bnew\s+WebSocket\s*\(',
        r'\burl\(\s*["\']?https?://',
    )
    for pattern in tests:
        if re.search(pattern,html,re.I):
            raise GateError('One-HTML offline contract failed: '+pattern)


def check_file(path: Path, offline: bool = False):
    if not path.is_file() or not path.stat().st_size:
        raise GateError(f'File missing or empty: {path}')
    text=path.read_text(encoding='utf-8',errors='replace')
    if not re.search(r'<html\b|<!doctype html',text,re.I):
        raise GateError('Result is not HTML')
    fullscreen_triangle_guard(text)
    if offline: no_external_resources(text)
    return text


def main(argv=None):
    p=argparse.ArgumentParser(description='Native-engine visual fidelity gate: BLOCKS false release claims')
    p.add_argument('--html',required=True,type=Path)
    p.add_argument('--engine',required=True,choices=sorted(PINNED_ENGINES))
    p.add_argument('--source-root',type=Path,help='Real pinned original git checkout, not a scratch renderer')
    p.add_argument('--offline',action='store_true',help='Demand all HTML/CSS/JS and assets embedded in a single file')
    p.add_argument('--portrait',type=Path,help='Screenshot captured by running a real browser at 390x844')
    p.add_argument('--landscape',type=Path,help='Screenshot captured by running a real browser at 844x390')
    p.add_argument('--capture-verification',type=Path,help='JSON containing actual browser launch, WebGL and screenshot capture results')
    p.add_argument('--preview',action='store_true',help='Diagnostic demo only. Does NOT certify or release an engine game')
    args=p.parse_args(argv)
    try:
        check_file(args.html,args.offline)
        if args.preview:
            # A diagnosed custom-render HTML may be shared ONLY with visible 'preview' status.
            print('PREVIEW: shader/packaging diagnostic passed; NATIVE ENGINE NOT VERIFIED')
            return 0
        if args.source_root is None:
            raise GateError('Need --source-root pointing to the original engine. Standalone custom WebGL is FORBIDDEN as final.')
        sha=source_sha(args.source_root,args.engine)
        for path,label in ((args.portrait,'portrait 390x844'),(args.landscape,'landscape 844x390')):
            if path is None or not path.is_file() or path.stat().st_size < 4096:
                raise GateError(f'Missing actual {label} screenshot: block release')
        if args.capture_verification is None or not args.capture_verification.is_file():
            raise GateError('Missing browser verification of rendered frames and animation')
        proof=json.loads(args.capture_verification.read_text('utf-8'))
        flags=('webgl_ok','landscape_ok','portrait_ok','full_frame_coverage','npc_animation_visible','no_console_errors')
        if not all(proof.get(k) is True for k in flags):
            raise GateError('Browser visual checks failed or were not performed: '+','.join(k for k in flags if proof.get(k) is not True))
        if proof.get('engine') != args.engine or proof.get('source_sha') != sha:
            raise GateError('Browser verification engine/source mismatch')
        print('NATIVE ENGINE FIDELITY ACCEPTED:',args.engine,sha)
        return 0
    except (GateError, OSError, json.JSONDecodeError) as e:
        print('BLOCK RELEASE:',e,file=sys.stderr)
        return 2


if __name__=='__main__':
    sys.exit(main())
