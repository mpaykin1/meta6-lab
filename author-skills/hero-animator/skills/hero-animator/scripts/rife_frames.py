#!/usr/bin/env python3
"""Hero Animator: opt-in RIFE RGBA interpolation in a quarantined candidate directory.

Original approved frames and hero approval manifests are NEVER modified.
Requires the official upstream RIFE repository and pretrained model weights.
The resulting candidates are NOT approved until an artist reviews them and
explicitly updates the normal directional_pack.py approval fingerprints.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

from PIL import Image

UPSTREAM = 'https://github.com/hzwer/ECCV2022-RIFE'
SAFE_ACTIONS = ('walk', 'run', 'fly', 'swim')
DIRECTIONS = ('front_right', 'front_left', 'back_right', 'back_left',
              'front', 'back', 'left', 'right')


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def parse_clip(name: str):
    for d in DIRECTIONS:
        if name.endswith('_' + d):
            return name[:-(len(d) + 1)], d
    raise ValueError('Use an isolated <action>_<direction> folder (no mixed action clips)')


def read_frames(path: Path):
    frames = sorted((p for p in path.iterdir() if p.suffix.lower() == '.png' and p.is_file()),
                    key=lambda p: (0, int(p.stem)) if p.stem.isdigit() else (1, p.name))
    if len(frames) < 2:
        raise ValueError('RIFE requires at least 2 PNG frames; do not interpolate idle')
    images = []
    wh = None
    for p in frames:
        with Image.open(p) as im:
            if im.mode != 'RGBA':
                raise ValueError(f'{p.name}: only explicit RGBA PNG allowed; no background guesses')
            im.load()
            if wh is None:
                wh = im.size
            if im.size != wh:
                raise ValueError(f'{p.name}: input canvas/foot anchor differs')
            images.append(im.copy())
    return frames, images


def get_model(rife_repo: Path, weights: Path):
    try:
        import torch
    except ImportError as exc:
        raise RuntimeError('PyTorch is required for genuine RIFE; install upstream dependencies') from exc
    if not (rife_repo / 'model' / 'RIFE.py').is_file():
        raise ValueError('Official RIFE source missing. Use rife_fetch.py or --rife-repo')
    if not (weights / 'flownet.pkl').is_file():
        raise ValueError('Official RIFE model weights missing: expected <weights>/flownet.pkl')
    sys.path.insert(0, str(rife_repo.resolve()))
    try:
        from model.RIFE import Model
        model = Model()
        model.load_model(str(weights.resolve()), -1)
        model.eval()
        model.device()
    except Exception as exc:
        raise RuntimeError('RIFE model/weights incompatible. Use a matching official pretrained checkpoint') from exc
    return model, torch


def to_input(t: 'torch.Tensor', torch, pad) -> 'torch.Tensor':
    return torch.nn.functional.pad(t, pad)


def midpoint(a: Image.Image, b: Image.Image, model, torch) -> Image.Image:
    """Infer on black/white mattes, recover straight RGB + transparency.

    Alpha inference is approximate (RIFE is RGB-only): the resulting artistic
    candidate must NEVER automatically replace the approved original art.
    """
    import numpy as np
    if a.size != b.size:
        raise ValueError('Canvas mismatch')
    h, w = a.height, a.width
    def make_tensors(im):
        f = np.asarray(im, dtype=np.float32) / 255.0
        alpha = f[:, :, 3:4]
        premul = f[:, :, :3] * alpha
        black = torch.from_numpy(premul.transpose(2, 0, 1)[None]).to(model_device)
        white = torch.from_numpy((premul + 1.0 - alpha).transpose(2, 0, 1)[None]).to(model_device)
        return black, white
    # RIFE's own inference_img.py uses multiples of 32.
    pad = (0, (-w) % 32, 0, (-h) % 32)
    model_device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    black_a, white_a = make_tensors(a)
    black_b, white_b = make_tensors(b)
    with torch.no_grad():
        black = model.inference(to_input(black_a, torch, pad), to_input(black_b, torch, pad))[:, :, :h, :w].clamp(0, 1)
        white = model.inference(to_input(white_a, torch, pad), to_input(white_b, torch, pad))[:, :, :h, :w].clamp(0, 1)
        alpha = (1.0 - (white - black).mean(dim=1, keepdim=True)).clamp(0, 1)
        rgb = (black / alpha.clamp(min=0.02)).clamp(0, 1)
        rgba = torch.cat((rgb, alpha), dim=1)[0].permute(1, 2, 0)
        if not torch.isfinite(rgba).all().item():
            raise ValueError('RIFE returned NaN/Infinity')
        out = (rgba.cpu().numpy() * 255.0 + 0.5).astype('uint8')
        out[out[:, :, 3] == 0, :3] = 0
        # Strong opacity-change guard: do not accidentally erase the hero.
        coverage = (out[:, :, 3] >= 32).sum()
        src = [(np.asarray(im)[:, :, 3] >= 32).sum() for im in (a, b)]
        if coverage < max(1, min(src) * 0.30) or coverage > max(src) * 2.75:
            raise ValueError('RIFE alpha mask drift: candidate hero may be distorted')
        return Image.fromarray(out, mode='RGBA')


def expanded_pair(a: Image.Image, b: Image.Image, exponent: int, model, torch):
    if exponent == 0:
        return [a, b]
    m = midpoint(a, b, model, torch)
    left = expanded_pair(a, m, exponent - 1, model, torch)
    right = expanded_pair(m, b, exponent - 1, model, torch)
    return left[:-1] + right


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('source', type=Path, help='e.g. approved/walk_front')
    p.add_argument('output', type=Path, help='NEW candidate directory; originals untouched')
    p.add_argument('--hero-id', required=True)
    p.add_argument('--rife-repo', type=Path, required=True, help='official ECCV2022-RIFE checkout')
    p.add_argument('--weights', type=Path, required=True, help='official model weights dir with flownet.pkl')
    p.add_argument('--exp', type=int, choices=(1, 2), default=1, help='2x or 4x frame cadence')
    p.add_argument('--fps', type=int, default=12, help='original action fps (output fps increases)')
    p.add_argument('--allow-high-risk-action', action='store_true',
                   help='attempt non-locomotion actions only as UNAPPROVED candidates')
    args = p.parse_args(argv)
    source, output = args.source.resolve(), args.output.resolve()
    if not source.is_dir():
        p.error('Source action-view folder does not exist')
    if not args.hero_id.strip() or args.fps < 1 or args.fps > 120:
        p.error('hero-id required and fps must be 1..120')
    if source == output or source in output.parents or output in source.parents:
        p.error('Output and source folders must be disjoint')
    if output.exists():
        p.error('Refusing to overwrite candidate output; choose a new directory')
    action, direction = parse_clip(source.name)
    if action not in SAFE_ACTIONS and not args.allow_high_risk_action:
        p.error(f'Action {action} is not interpolation-safe by default: explicit --allow-high-risk-action required')
    inputs, frames = read_frames(source)
    model, torch = get_model(args.rife_repo.resolve(), args.weights.resolve())
    factor = 2 ** args.exp
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='hero-rife-', dir=output.parent) as tmp:
        temp = Path(tmp)
        produced = []
        for i in range(len(frames) - 1):
            part = expanded_pair(frames[i], frames[i + 1], args.exp, model, torch)
            produced.extend(part[:-1])
        produced.append(frames[-1])
        if len(produced) != (len(frames) - 1) * factor + 1:
            raise ValueError('Generated frame count is incorrect')
        source_set = set(range(0, len(produced), factor))
        meta_frames = []
        for j, image in enumerate(produced):
            dest = temp / f'{j:06}.png'
            if j in source_set:
                src = inputs[j // factor]
                shutil.copyfile(src, dest)  # byte-identical approved keyframe
            else:
                image.save(dest, format='PNG', optimize=True)
            meta_frames.append({'index': j, 'sha256': sha256(dest),
                                'source_keyframe': j in source_set})
        manifest = {
            'schema': 'hero-rife-candidate-v1', 'approved': False, 'hero_id': args.hero_id,
            'clip': source.name, 'action': action, 'direction': direction,
            'rife_project': UPSTREAM, 'rife_commit': '5d8adbdd40e12c2c8f91930eff838aebe561c086',
            'model_weights_sha256': sha256(args.weights / 'flownet.pkl'),
            'exponent': args.exp, 'factor': factor, 'source_fps': args.fps,
            'candidate_fps': args.fps * factor,
            'source_files': [{'name': x.name, 'sha256': sha256(x)} for x in inputs],
            'frames': meta_frames,
            'identity_lock': 'NOT_APPROVED: keep separate; manual review + directional_pack fingerprints/approval required',
            'input_lock': 'No new inputs or actions; adjust event timings for fps ratio explicitly',
        }
        (temp / 'rife-candidate.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf8')
        os.replace(temp, output)
    print('UNAPPROVED RIFE CANDIDATES: ' + str(output))
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (ValueError, OSError, RuntimeError) as exc:
        raise SystemExit('BLOCKED: ' + str(exc))
