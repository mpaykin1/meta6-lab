#!/usr/bin/env python3
"""Isolated Instant Meshes batch adapter. Python stdlib + native upstream binary.

This runs on a temporary geometry-only OBJ; it never writes the approved input.
It does not create UVs, skin weights, shape keys, animations, or materials.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
import tempfile
from pathlib import Path


def validate_geometry(vertices, faces, *, quads=True):
    if len(vertices) < 3 or not faces:
        raise ValueError('Geometry is empty')
    for vertex in vertices:
        if len(vertex) != 3 or not all(math.isfinite(float(v)) for v in vertex):
            raise ValueError('Invalid vertex position')
    for face in faces:
        if len(face) not in ((3, 4) if quads else (3,)):
            raise ValueError('Only triangles and quads supported')
        if len(set(face)) != len(face) or any(type(i) is not int or i < 0 or i >= len(vertices) for i in face):
            raise ValueError('Invalid or degenerate face index')


def write_obj(path, vertices, faces):
    with open(path, 'w', encoding='utf-8') as stream:
        stream.write('# Local-space static mesh for Instant Meshes; no identity data\n')
        for vertex in vertices:
            stream.write('v {:.12g} {:.12g} {:.12g}\n'.format(*(float(c) for c in vertex)))
        for face in faces:
            stream.write('f ' + ' '.join(str(index + 1) for index in face) + '\n')


def parse_obj(path):
    vertices, faces = [], []
    with open(path, 'r', encoding='utf-8', errors='replace') as stream:
        for line in stream:
            columns = line.strip().split()
            if not columns:
                continue
            if columns[0] == 'v':
                if len(columns) < 4:
                    raise ValueError('Malformed OBJ vertex')
                vertices.append([float(columns[1]), float(columns[2]), float(columns[3])])
            elif columns[0] == 'f':
                if len(columns) not in (4, 5):
                    raise ValueError('Unsupported OBJ face size (not a tri/quad)')
                face = []
                for column in columns[1:]:
                    raw_index = int(column.split('/')[0])
                    if raw_index == 0:
                        raise ValueError('OBJ indexing is 1-based')
                    # Negative indices are relative to current vertex count.
                    face.append(raw_index - 1 if raw_index > 0 else len(vertices) + raw_index)
                faces.append(face)
    validate_geometry(vertices, faces, quads=True)
    return vertices, faces


def bbox(vertices):
    return [[min(v[axis] for v in vertices), max(v[axis] for v in vertices)] for axis in range(3)]


def validate_retopology(source_vertices, source_faces, new_vertices, new_faces, target_faces):
    validate_geometry(new_vertices, new_faces, quads=True)
    if len(new_vertices) > max(2000, len(source_vertices) * 6):
        raise ValueError('New mesh has implausibly many vertices')
    if len(new_faces) > max(1000, target_faces * 3, len(source_faces) * 4):
        raise ValueError('New mesh has implausibly many faces')
    source_box, new_box = bbox(source_vertices), bbox(new_vertices)
    span = max(b - a for a, b in source_box)
    if span <= 1e-9:
        raise ValueError('Degenerate source mesh')
    max_delta = max(abs(a - c) for (a, b), (c, d) in zip(source_box, new_box) for a, c in ((a, c), (b, d)))
    if max_delta > max(1e-5, span * 0.08):
        raise ValueError('Retopology changed source bounding box beyond 8% of max extent')
    return round(max_delta, 9)


def process(payload, binary, *, target_faces=0, deterministic=True, timeout=240):
    vertices = payload['vertices']
    faces = payload['faces']
    validate_geometry(vertices, faces, quads=False)
    if len(faces) < 100:
        raise ValueError('Skip low-poly mesh: retopology only for >=100 input triangles')
    if not Path(binary).is_file():
        raise FileNotFoundError('Instant Meshes binary is not available: ' + binary)
    desired_faces = target_faces or min(30000, max(100, len(faces) // 2))
    if not 100 <= desired_faces <= 2000000:
        raise ValueError('target_faces must be 100..2,000,000 (or 0=auto)')
    with tempfile.TemporaryDirectory(prefix='instant-meshes-') as folder:
        src, dst = Path(folder) / 'source.obj', Path(folder) / 'retopo.obj'
        write_obj(src, vertices, faces)
        command = [str(binary), '--output', str(dst), '--faces', str(desired_faces),
                   '--rosy', '4', '--posy', '4']
        if deterministic:
            command.append('--deterministic')
        command.append(str(src))
        run = subprocess.run(command, capture_output=True, text=True, timeout=timeout, check=False)
        if run.returncode != 0 or not dst.is_file() or dst.stat().st_size == 0:
            message = (run.stderr or run.stdout)[-1600:]
            raise RuntimeError(f'Instant Meshes batch error ({run.returncode}): {message}')
        new_vertices, new_faces = parse_obj(dst)
    delta = validate_retopology(vertices, faces, new_vertices, new_faces, desired_faces)
    return {
        'source': {'vertices': len(vertices), 'triangles': len(faces)},
        'result': {'vertices': len(new_vertices), 'polygons': len(new_faces)},
        'target_faces': desired_faces,
        'bbox_max_delta': delta,
        'vertices': new_vertices,
        'faces': new_faces,
    }


def main():
    parser = argparse.ArgumentParser(description='Instant Meshes geometry-only batch bridge')
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--binary', type=Path, required=True)
    parser.add_argument('--target-faces', type=int, default=0)
    parser.add_argument('--timeout', type=int, default=240)
    args = parser.parse_args()
    if args.input.resolve() == args.output.resolve():
        parser.error('Input and output must differ')
    payload = json.loads(args.input.read_text(encoding='utf-8'))
    result = process(payload, str(args.binary), target_faces=args.target_faces, timeout=args.timeout)
    args.output.write_text(json.dumps(result, separators=(',', ':')), encoding='utf-8')
    print('[instant-meshes] {} -> {}'.format(result['source'], result['result']))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'[instant-meshes] ERROR: {type(exc).__name__}: {exc}', file=sys.stderr)
        raise
