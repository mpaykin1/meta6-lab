import argparse
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, output_path
import numpy as np
from PIL import Image
CANDIDATES = {'green': (0, 200, 0), 'blue': (0, 71, 255), 'magenta': (255, 0, 255), 'cyan': (0, 230, 230), 'red': (230, 0, 0), 'orange': (255, 140, 0)}

def ycc(c):
    c = np.asarray(c, np.float32) / 255.0
    y = 0.299 * c[..., 0] + 0.587 * c[..., 1] + 0.114 * c[..., 2]
    return np.stack([(c[..., 2] - y) * 0.564, (c[..., 0] - y) * 0.713], -1)

def pick_key(rgba: np.ndarray) -> tuple[str, tuple[int, int, int], float]:
    a = rgba[..., 3]
    px = rgba[..., :3][a > 200].astype(np.float32)
    if len(px) > 60000:
        px = px[np.random.default_rng(1).choice(len(px), 60000, replace=False)]
    ch = ycc(px)
    sat = np.hypot(ch[:, 0], ch[:, 1])
    ch = ch[sat > 0.04]
    best = None
    for name, col in CANDIDATES.items():
        k = ycc(np.array(col, np.float32))
        d = np.hypot(ch[:, 0] - k[0], ch[:, 1] - k[1])
        risk = float((d < 0.16).mean()) if len(d) else 0.0
        p1 = float(np.percentile(d, 1)) if len(d) else 1.0
        score = p1 - risk * 2
        if best is None or score > best[2]:
            best = (name, col, score)
    return best

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--key', default='auto')
    ap.add_argument('--x', type=float, default=0.42)
    ap.add_argument('--foot', type=float, default=0.9)
    ap.add_argument('--h', type=float, default=0.46)
    ap.add_argument('--size', default='1920x1080', help='размер кадра, для вертикального видео 1080x1920')
    ap.add_argument('--wmax', type=float, default=0.62, help='предел ширины героя в долях кадра')
    a = ap.parse_args()
    im = Image.open(a.src).convert('RGBA')
    arr = np.array(im)
    ys, xs = np.nonzero(arr[..., 3] > 8)
    if len(xs) == 0:
        raise ValueError('Концепт полностью прозрачный')
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    if a.key == 'auto':
        name, col, score = pick_key(np.array(im))
        print(f'фон: {name} {col} (запас {score:.3f})')
    elif a.key.startswith('#'):
        col = tuple((int(a.key[i:i + 2], 16) for i in (1, 3, 5)))
    else:
        col = CANDIDATES[a.key]
    W, H = (int(v) for v in a.size.lower().split('x'))
    k = H * a.h / im.height
    if im.width * k > W * a.wmax:
        k = W * a.wmax / im.width
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    if not (W > 0 and H > 0 and (0 < a.h <= 1) and (0 < a.wmax <= 1)):
        raise ValueError('Проверьте размер и доли --h, --wmax')
    canvas = Image.new('RGBA', (W, H), tuple(col) + (255,))
    x = int(W * a.x - im.width / 2)
    y = int(H * a.foot - im.height)
    if x < 0 or y < 0 or x + im.width > W or (y + im.height > H):
        raise ValueError('Герой выходит за кадр: измените --x, --foot или --h')
    canvas.alpha_composite(im, (x, y))
    canvas.convert('RGB').save(output_path(a.out))
    print('кадр', a.out, 'герой', (x, y, im.width, im.height), 'фон', col)
if __name__ == '__main__':
    cli(main)
