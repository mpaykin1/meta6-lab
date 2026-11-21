#!/usr/bin/env python3
"""Meshoptimizer geometry compression checks for glTF-Transform outputs.

Official MIT meshoptimizer is used by the pinned @gltf-transform/cli meshopt
command; generated clients decode via the meshopt decoder included in Three.js.
No native binaries or GPL sources bundled. No topology simplification.
"""
from __future__ import annotations

from pathlib import Path

EXT = 'EXT_meshopt_compression'
SOURCE = 'https://github.com/zeux/meshoptimizer'
PIN = 'f0a684f11ead064e176775c9b796f82a55910e92'


def verify_compressed(document: dict) -> dict:
    required = set(document.get('extensionsRequired', ()))
    used = set(document.get('extensionsUsed', ()))
    if EXT not in required or EXT not in used:
        raise ValueError('Meshoptimizer output has no required EXT_meshopt_compression extension')
    views = document.get('bufferViews') or []
    compressed = sum(EXT in v.get('extensions', {}) for v in views)
    if compressed < 1:
        raise ValueError('No bufferView was compressed with Meshoptimizer')
    if document.get('asset', {}).get('version') != '2.0':
        raise ValueError('Invalid glTF version')
    return {'extension': EXT, 'buffer_views': compressed}


def compress(call, read_doc, compare_identity, cli: str, source: Path, output: Path,
             reference: dict, level: str = 'high') -> dict:
    """Run actual MIT meshoptimizer using official CLI then validate all scene identities.

    CLI args verified against glTF-Transform 4.5.1 source. Compression may quantize
    attributes: this is NOT numerically lossless. Caller retains the original.
    """
    if level not in ('medium', 'high'):
        raise ValueError('Meshoptimizer level must be medium|high')
    call(cli, 'meshopt', str(source), str(output), '--level', level)
    result = read_doc(output, allow_meshopt=True)
    if compare_identity(reference) != compare_identity(result):
        raise ValueError('Meshoptimizer changed scene/rig/clip hierarchy')
    info = verify_compressed(result)
    previous = set(reference.get('extensionsRequired', []))
    current = set(result.get('extensionsRequired', []))
    if previous - current:
        raise ValueError('Meshoptimizer removed an extension required by the source')
    if current - previous - {'KHR_mesh_quantization', EXT}:
        raise ValueError('Meshoptimizer output introduced an unsupported required extension')
    return info
