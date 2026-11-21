#!/usr/bin/env python3
"""Hero Animator combined asset-prep: rembg RGBA matte -> RIFE temporal interpolation.

Both stages output UNAPPROVED candidates. No modification of original art or approvals.
Use --rembg-only when RIFE weights/source aren't available; do not fake RIFE.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import rembg_frames
import rife_frames


def filehash(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('source', type=Path, help='art/walk_front or walk_front.gif')
    p.add_argument('output_root', type=Path, help='NEW candidate root (must not exist)')
    p.add_argument('--hero-id', required=True)
    p.add_argument('--clip', help='action_direction, if GIF does not use that filename')
    p.add_argument('--model', default='u2netp', choices=rembg_frames.MODELS)
    p.add_argument('--matte', default='decontaminate', choices=('naive', 'decontaminate', 'alpha'))
    p.add_argument('--replace-existing-alpha', action='store_true')
    p.add_argument('--rembg-only', action='store_true', help='explicitly disable RIFE')
    p.add_argument('--rife-repo', type=Path)
    p.add_argument('--weights', type=Path)
    p.add_argument('--exp', choices=(1, 2), type=int, default=1)
    p.add_argument('--fps', type=int, default=12)
    p.add_argument('--allow-high-risk-action', action='store_true')
    a = p.parse_args(argv)
    source, root = a.source.resolve(), a.output_root.resolve()
    if root.exists():
        p.error('Refusing to overwrite candidate output root')
    if source == root or source in root.parents or root in source.parents:
        p.error('Output must be disjoint from source')
    clip = a.clip or (source.stem if source.is_file() else source.name)
    rembg_frames.parse_clip(clip)
    if not a.rembg_only and (not a.rife_repo or not a.weights):
        p.error('RIFE requires --rife-repo AND --weights; otherwise explicitly use --rembg-only')
    bg_dest = root / 'rembg' / clip
    bg_args = [str(source), str(bg_dest), '--hero-id', a.hero_id, '--clip', clip,
               '--model', a.model, '--matte', a.matte]
    if a.replace_existing_alpha:
        bg_args.append('--replace-existing-alpha')
    rembg_frames.main(bg_args)
    rife_dest = None
    if not a.rembg_only:
        rife_dest = root / 'rife' / clip
        rive = [str(bg_dest), str(rife_dest), '--hero-id', a.hero_id,
                '--rife-repo', str(a.rife_repo), '--weights', str(a.weights),
                '--exp', str(a.exp), '--fps', str(a.fps)]
        if a.allow_high_risk_action:
            rive.append('--allow-high-risk-action')
        rife_frames.main(rive)
    pipeline = {
        'schema': 'hero-rembg-rife-pipeline-v1', 'approved': False,
        'hero_id': a.hero_id, 'clip': clip,
        'stages': ['rembg'] + (['rife'] if rife_dest else []),
        'rembg_manifest_sha256': filehash(bg_dest / 'rembg-candidate.json'),
        'rife_manifest_sha256': filehash(rife_dest / 'rife-candidate.json') if rife_dest else None,
        'approval_required': 'Visual review of all frames; re-fingerprint each action/view with directional_pack.py',
    }
    (root / 'pipeline-candidate.json').write_text(json.dumps(pipeline, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print('UNAPPROVED pipeline candidates: ' + str(root))
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (ValueError, OSError, RuntimeError) as exc:
        raise SystemExit('BLOCKED: ' + str(exc))
