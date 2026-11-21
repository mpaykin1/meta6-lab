import argparse
import numpy as np
from PIL import Image, ImageDraw
from pathlib import Path
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, font as load_font, load_json, output_path

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('meta')
    ap.add_argument('out')
    ap.add_argument('--anims', default='idle,stun,victory,idle_happy')
    ap.add_argument('--n', type=int, default=6)
    ap.add_argument('--scale', type=float, default=1.5625)
    ap.add_argument('--font', help='Путь к шрифту с русскими буквами')
    a = ap.parse_args()
    meta = load_json(a.meta)
    cand = []
    for name in a.anims.split(','):
        an = meta['anims'].get(name)
        if a.scale <= 0 or a.n <= 0:
            raise ValueError('scale и n должны быть положительными')
        if not an or not an.get('blend'):
            continue
        for i, e in enumerate(an['blend']):
            if e[0] <= 0:
                continue
            shift = (e[1] ** 2 + e[2] ** 2) ** 0.5 if len(e) > 2 else 0
            risk = (1 - e[0]) * 10 + shift / 10
            cand.append((risk, name, i, e))
    if not cand:
        raise ValueError('В выбранных анимациях нет смешиваемых переходов')
    cand.sort(reverse=True)
    font = load_font(18, a.font)
    tiles = []
    for _, name, i, e in cand[:a.n]:
        an = meta['anims'][name]
        fr = an['frames']
        n = len(fr)
        j = i + 1 if i + 1 < n else 0 if an.get('loop') else an.get('loopFrom', 0)
        sheet = np.asarray(Image.open(Path(a.meta).parent / an['sheet']).convert('RGBA'), np.float32)
        f, g = (fr[i], fr[j])
        sx, sy = (e[1], e[2]) if len(e) > 2 else (0, 0)
        ax, ay = (f[4] + round(0.5 * sx), f[5] + round(0.5 * sy))
        bx, by = (g[4] + round(-0.5 * sx), g[5] + round(-0.5 * sy))
        x0, y0 = (min(ax, bx) - 6, min(ay, by) - 6)
        W, H = (max(ax + f[2], bx + g[2]) - x0 + 6, max(ay + f[3], by + g[3]) - y0 + 6)
        acc = np.zeros((H, W, 4), np.float32)
        for px, py, r in ((ax, ay, f), (bx, by, g)):
            part = sheet[r[1]:r[1] + r[3], r[0]:r[0] + r[2]].copy()
            part[..., :3] *= part[..., 3:] / 255
            acc[py - y0:py - y0 + r[3], px - x0:px - x0 + r[2]] += 0.5 * part
        img = acc[..., :3] + np.array([96, 150, 70], np.float32) * (1 - acc[..., 3:] / 255)
        t = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((round(W * a.scale), round(H * a.scale)), Image.BICUBIC)
        d = ImageDraw.Draw(t)
        d.rectangle((0, 0, 260, 26), fill=(0, 0, 0))
        d.text((6, 2), f'{name} #{i}: доля {e[0]}', font=font, fill=(255, 255, 255))
        tiles.append(t)
    hh = max((t.height for t in tiles))
    out = Image.new('RGB', (sum((t.width for t in tiles)) + 8 * len(tiles), hh), (20, 20, 20))
    x = 0
    for t in tiles:
        out.paste(t, (x, 0))
        x += t.width + 8
    out.save(output_path(a.out))
    print(a.out, out.size, 'переходов:', len(tiles))
if __name__ == '__main__':
    cli(main)
