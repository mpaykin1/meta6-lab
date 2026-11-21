import argparse

import numpy as np
from PIL import Image

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from blendmap import next_frame
from common import cli, load_json
from pathlib import Path


def difference(a, b):
    return float((a ^ b).sum() / max(1, (a | b).sum()))


def main():
    ap = argparse.ArgumentParser(description='Изменение силуэта между кадрами и на шве петли')
    ap.add_argument('meta')
    ap.add_argument('--anims', default='')
    args = ap.parse_args()
    meta = load_json(args.meta)
    wanted = set(args.anims.split(',')) if args.anims else set(meta['anims'])
    if wanted - meta['anims'].keys():
        raise ValueError('Не найдены выбранные анимации')
    for name, anim in meta['anims'].items():
        if name not in wanted:
            continue
        frames = anim['frames']
        x0, y0 = min(f[4] for f in frames), min(f[5] for f in frames)
        width = max(f[4] + f[2] for f in frames) - x0
        height = max(f[5] + f[3] for f in frames) - y0
        sheet = np.array(Image.open(Path(args.meta).parent / anim['sheet']).convert('RGBA'))
        cached = {}
        def mask(i):
            sx, sy, w, h, ox, oy = frames[i]
            key = tuple(frames[i])
            if key not in cached:
                canvas = np.zeros((height, width), bool)
                canvas[oy-y0:oy-y0+h, ox-x0:ox-x0+w] = sheet[sy:sy+h, sx:sx+w, 3] > 128
                cached[key] = canvas
            return cached[key]
        values = np.array([difference(mask(i), mask(i+1)) for i in range(len(frames)-1)])
        seam = next_frame(anim, len(frames)-1)
        seam_text = f', шов {difference(mask(len(frames)-1), mask(seam)):.4f}' if seam is not None else ''
        top = ', '.join(f'{values[i]:.4f}@{i}->{i+1}' for i in np.argsort(values)[-3:][::-1])
        print(f'{name}: кадров {len(frames)}, медиана {np.median(values) if len(values) else 0:.4f}, максимум {top or "нет переходов"}{seam_text}')


if __name__ == '__main__':
    cli(main)
