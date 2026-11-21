#!/usr/bin/env python3
"""Build a hash-verified static-BVH *plan* for an already generated Fusion world.

The trees are constructed at runtime by three-mesh-bvh from the approved GLB
geometry; this script does not fabricate BVH acceleration or license approval.
"""
from __future__ import annotations
import hashlib
import json
import re
from pathlib import Path
from typing import Any

SCHEMA = 'meta-game-fusion.spatial-bvh-plan.v1'
SHA = re.compile(r'^[0-9a-f]{64}$')
SRC = re.compile(r'^/assets/[0-9a-f]{18}\.glb$')


def create_plan(project: Path, world: dict[str, Any]) -> dict[str, Any]:
    root = project / 'public'
    if root.is_symlink() or not root.is_dir():
        raise ValueError('Missing regular project/public directory')
    assets = world.get('assets', [])
    if not isinstance(assets, list):
        raise ValueError('Malformed world assets')
    approved = []
    for asset in assets:
        if not isinstance(asset, dict):
            raise ValueError('Malformed asset record')
        src, digest = asset.get('src'), asset.get('asset_sha256')
        if not isinstance(src, str) or not SRC.fullmatch(src) or not SHA.fullmatch(str(digest)):
            raise ValueError('Unsafe or unverified GLB asset path')
        if src != '/assets/' + digest[:18] + '.glb':
            raise ValueError('GLB asset name does not match digest')
        path = root / src.lstrip('/')
        if path.is_symlink() or not path.is_file() or path.stat().st_size > 128 * 1024 * 1024:
            raise ValueError('Missing, symlinked or oversized approved GLB')
        with path.open('rb') as stream:
            hashvalue = hashlib.file_digest(stream, 'sha256').hexdigest()
        if hashvalue != digest:
            raise ValueError('GLB changed since approved optimization')
        clips = asset.get('animation_clips') or []
        if not isinstance(clips, list):
            raise ValueError('Malformed animation list')
        approved.append({
            'scene_id': asset.get('scene_id'), 'src': src,
            'asset_sha256': digest, 'source_sha256': asset.get('source_sha256'),
            'mode': 'exclude-animated' if clips else 'static-raycast',
            'animation_clips': len(clips),
        })
    plan = {
        'schema': SCHEMA,
        'engine': 'three-mesh-bvh@0.9.18',
        'renderer': 'three@0.186.1',
        'static_visual_geometry_only': True,
        'collision_authority': 'Rapier',
        'pathfinding_authority': 'Recast',
        'rights_authority': 'ScanCode+explicit-authorizations',
        'model_assets': approved,
        'indexing': {'mode': 'runtime','min_triangles': 12,
                     'skinned_or_morph_geometry': 'never-index', 'dynamic_bodies': 'never-index'},
    }
    (root / 'bvh-manifest.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return plan
