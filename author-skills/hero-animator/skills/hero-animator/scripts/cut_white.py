import argparse
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, output_path
import cv2
import numpy as np
from PIL import Image

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--flip', action='store_true')
    ap.add_argument('--check')
    ap.add_argument('--near', type=int, default=232, help='минимум каналов, с которого пиксель считается белым')
    ap.add_argument('--hole', type=float, default=6e-05, help='доля картинки, с которой белый карман внутри - фон')
    ap.add_argument('--no-holes', action='store_true', help='карманы внутри не трогать')
    a = ap.parse_args()
    original = np.asarray(Image.open(a.src).convert('RGBA'))
    if a.flip:
        original = original[:, ::-1].copy()
    rgb = original[..., :3].astype(np.float32)
    h, w = rgb.shape[:2]
    mn = rgb.min(axis=2)
    sat = rgb.max(axis=2) - mn
    near = (mn >= a.near).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(near, connectivity=4)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.zeros((h, w), bool)
    holes = []
    for i in range(1, n):
        m = lab == i
        if i in border:
            bg |= m
        elif not a.no_holes and st[i, cv2.CC_STAT_AREA] >= a.hole * h * w and (mn[m].mean() >= 245) and (sat[m].mean() <= 8):
            bg |= m
            holes.append(int(st[i, cv2.CC_STAT_AREA]))
    fg = (~bg).astype(np.uint8)
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(fg, connectivity=8)
    specks = 0
    for i in range(1, n2):
        if st2[i, cv2.CC_STAT_AREA] < 60:
            bg |= lab2 == i
            specks += 1
    fg = ~bg
    dist = cv2.distanceTransform(fg.astype(np.uint8), cv2.DIST_L2, 3)
    band = fg & (dist <= 2.5)
    alpha = fg.astype(np.float32)
    alpha[band] = np.clip((255 - mn[band]) / 225, 0, 1)
    alpha = np.minimum(alpha, original[..., 3].astype(np.float32) / 255)
    col = rgb.copy()
    k = band & (alpha > 0.02)
    col[k] = np.clip((rgb[k] - (1 - alpha[k, None]) * 255) / alpha[k, None], 0, 255)
    out = np.dstack([col, alpha * 255]).round().astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(output_path(a.out))
    ys, xs = np.nonzero(alpha > 0.03)
    if len(xs) == 0:
        raise ValueError('После удаления белого фона герой не найден')
    print(f'{a.out}: {w}x{h}, герой {xs.min()}..{xs.max()} x {ys.min()}..{ys.max()} ({(ys.max() - ys.min() + 1) / h:.0%} высоты), дыр-фона {len(holes)} {holes[:6]}, крошек {specks}{(', отзеркален' if a.flip else '')}')
    if a.check:
        im = Image.fromarray(out, 'RGBA')
        sheet = Image.new('RGB', (w * 2, h), (30, 30, 34))
        sheet.paste((60, 170, 80), (w, 0, w * 2, h))
        sheet.paste(im, (0, 0), im)
        sheet.paste(im, (w, 0), im)
        sheet.resize((1400, 700), Image.LANCZOS).save(output_path(a.check), quality=88)
if __name__ == '__main__':
    cli(main)
