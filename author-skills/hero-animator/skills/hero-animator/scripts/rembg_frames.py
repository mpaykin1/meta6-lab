#!/usr/bin/env python3
"""Hero Animator: rembg background removal for ONE action/view clip.

Creates unapproved transparent RGBA PNG candidates; never rewrites source art or approvals.
An existing authored alpha is preserved by default. Works with a PNG directory or GIF.
Run before the opt-in RIFE interpolation stage.  No rembg inference in game runtime.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageSequence

DIRECTIONS = ('front_right', 'front_left', 'back_right', 'back_left',
              'front', 'back', 'left', 'right')
MODELS = ('u2netp', 'u2net', 'isnet-general-use')
UPSTREAM = 'https://github.com/danielgatis/rembg'
COMMIT = '991927b77667946dab59c50df31f7d4640e80457'


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as fh:
        for block in iter(lambda: fh.read(1 << 20), b''):
            h.update(block)
    return h.hexdigest()


def parse_clip(name: str) -> tuple[str, str]:
    for direction in DIRECTIONS:
        if name.endswith('_' + direction):
            action = name[:-(len(direction) + 1)]
            if action and action.replace('_', '').isalnum():
                return action, direction
    raise ValueError('Expected an isolated <action>_<direction> clip; never mix actors/actions/views')


def load_frames(source: Path):
    """Decode composited GIF frames, or read source PNGs by numerical order."""
    if source.is_dir():
        files = sorted((p for p in source.iterdir() if p.is_file() and p.suffix.lower() == '.png'),
                       key=lambda p: (0, int(p.stem)) if p.stem.isdigit() else (1, p.name))
        if not files:
            raise ValueError('No PNG frames found')
        frames = []
        for p in files:
            with Image.open(p) as im:
                frames.append(im.convert('RGBA').copy())
        origins = [{'file': p.name, 'sha256': sha256(p)} for p in files]
    elif source.is_file() and source.suffix.lower() == '.gif':
        origins = [{'file': source.name, 'sha256': sha256(source)}]
        with Image.open(source) as gif:
            frames = [f.convert('RGBA').copy() for f in ImageSequence.Iterator(gif)]
        files = [None] * len(frames)
    else:
        raise ValueError('Input must be an action/view PNG directory or GIF file')
    if not frames:
        raise ValueError('No frames')
    if len({im.size for im in frames}) != 1:
        raise ValueError('Frame canvas sizes differ; preserve consistent pivot/canvas')
    if any(min(im.size) < 4 for im in frames):
        raise ValueError('Canvas too small')
    return files, frames, origins


def has_alpha(im: Image.Image) -> bool:
    return im.getchannel('A').getextrema()[0] < 255


def candidate(frame: Image.Image, *, session, remove_func, matte: str) -> Image.Image:
    args = {'session': session}
    if matte == 'decontaminate':
        args['decontaminate'] = True
    elif matte == 'alpha':
        args['alpha_matting'] = True
    # Give rembg RGB: an opaque background is the item to remove.
    output = remove_func(frame.convert('RGB'), **args)
    if isinstance(output, bytes):
        import io
        with Image.open(io.BytesIO(output)) as im:
            result = im.convert('RGBA').copy()
    elif isinstance(output, Image.Image):
        result = output.convert('RGBA')
    else:
        raise RuntimeError('rembg did not return a PIL image/bytes')
    if result.size != frame.size:
        raise ValueError('rembg resized the canvas; cannot preserve actor pivot')
    alpha = np.asarray(result.getchannel('A'))
    area = np.count_nonzero(alpha >= 32) / alpha.size
    # Prevent obvious empty cutouts / unchanged opaque backgrounds.
    if not (0.005 <= area <= 0.97):
        raise ValueError(f'implausible foreground coverage {area:.3f}; inspect/change model')
    return result


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('source', type=Path, help='art/walk_front/*.png or walk_front.gif')
    p.add_argument('output', type=Path, help='NEW candidates/walk_front folder')
    p.add_argument('--hero-id', required=True)
    p.add_argument('--clip', help='action_direction required for GIF when filename is not the clip name')
    p.add_argument('--model', choices=MODELS, default='u2netp', help='local rembg model; may download ONNX weights')
    p.add_argument('--matte', choices=('naive', 'decontaminate', 'alpha'), default='decontaminate')
    p.add_argument('--replace-existing-alpha', action='store_true',
                   help='opt-in re-segmentation; source file is STILL untouched')
    a = p.parse_args(argv)
    src, dst = a.source.resolve(), a.output.resolve()
    if not a.hero_id.strip():
        p.error('hero-id is required')
    if src == dst or src in dst.parents or dst in src.parents:
        p.error('Source and candidate output must be disjoint')
    if dst.exists():
        p.error('Refusing to overwrite output directory')
    clip_name = a.clip or src.stem if src.is_file() else a.clip or src.name
    action, direction = parse_clip(clip_name)
    files, frames, origins = load_frames(src)
    need_model = a.replace_existing_alpha or any(not has_alpha(im) for im in frames)
    if need_model:
        try:
            from rembg import new_session, remove
        except ImportError as exc:
            raise RuntimeError('rembg unavailable: install rembg[cpu] (Python 3.11–3.13)') from exc
        session = new_session(a.model)
    else:
        remove = session = None
    dst.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.hero-rembg-', dir=dst.parent) as tmp_name:
        tmp = Path(tmp_name)
        details = []
        for index, frame in enumerate(frames):
            originally_alpha = has_alpha(frame)
            do_infer = a.replace_existing_alpha or not originally_alpha
            if do_infer:
                out = candidate(frame, session=session, remove_func=remove, matte=a.matte)
            else:
                out = frame  # pixel-identical RGBA, no inference
            path = tmp / f'{index:06d}.png'
            # If already transparent and supplied as an RGBA PNG, preserve exact source bytes.
            can_copy = (not do_infer and files[index] is not None)
            if can_copy:
                with Image.open(files[index]) as original:
                    can_copy = original.mode == 'RGBA'
            if can_copy:
                shutil.copyfile(files[index], path)
            else:
                out.save(path, format='PNG', optimize=True)
            details.append({'index': index, 'sha256': sha256(path),
                            'background_removed': do_infer, 'preserved_existing_alpha': not do_infer,
                            'source_frame': files[index].name if files[index] else f'gif:{index}'})
        metadata = {
            'schema': 'hero-rembg-candidates-v1', 'approved': False,
            'hero_id': a.hero_id, 'clip': clip_name, 'action': action, 'direction': direction,
            'rembg_source': UPSTREAM, 'rembg_commit': COMMIT,
            'model': a.model if need_model else None, 'matte': a.matte if need_model else None,
            'model_weights_bundled': False, 'all_originals_unchanged': True,
            'source_files': origins, 'frames': details,
            'identity_lock': 'UNAPPROVED: every generated matte must be checked by an artist',
            'integrates_with': 'rife_frames.py accepts these RGBA PNGs; then directional_pack.py',
        }
        (tmp / 'rembg-candidate.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
        os.replace(tmp, dst)
    print('UNAPPROVED REMBG CANDIDATES: ' + str(dst))
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (ValueError, OSError, RuntimeError) as exc:
        raise SystemExit('BLOCKED: ' + str(exc))
