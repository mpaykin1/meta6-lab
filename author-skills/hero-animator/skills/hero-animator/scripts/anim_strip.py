import argparse
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
    ap.add_argument('--anims', default='')
    ap.add_argument('--scale', type=float, default=1.0, help='px картинки на мировую единицу')
    ap.add_argument('--cols', type=int, default=8)
    ap.add_argument('--bg', default='40,44,60')
    ap.add_argument('--font', help='Путь к шрифту с русскими буквами')
    a = ap.parse_args()
    meta = load_json(a.meta)
    names = [n for n in (a.anims.split(',') if a.anims else meta['anims'].keys()) if n in meta['anims']]
    if not names:
        raise ValueError('Нет выбранных анимаций')
    if a.scale <= 0 or a.cols <= 0:
        raise ValueError('scale и cols должны быть положительными')
    bg = tuple((int(v) for v in a.bg.split(','))) + (255,)
    font = load_font(15, a.font)
    blocks = []
    for name in names:
        an = meta['anims'][name]
        ppu = an.get('ppu', meta['ppu'])
        k = a.scale / ppu
        sheet = Image.open(Path(a.meta).parent / an['sheet']).convert('RGBA')
        fr = an['frames']
        x0 = min((f[4] for f in fr)) * k
        x1 = max((f[4] + f[2] for f in fr)) * k
        y0 = min((f[5] for f in fr)) * k
        y1 = max(max((f[5] + f[3] for f in fr)) * k, 10)
        pad = 10
        W, H = (int(x1 - x0) + pad * 2, int(y1 - y0) + pad * 2 + 22)
        fx, fy = (pad - x0, pad + 22 - y0)
        rel = an.get('release')
        rel_i = min(range(len(fr)), key=lambda i: abs(i / an['fps'] - rel)) if rel is not None else None
        mz = an.get('muzzle')
        tiles = []
        for i, f in enumerate(fr):
            sx, sy, w, h, ox, oy = f[:6]
            t = Image.new('RGBA', (W, H), bg)
            im = sheet.crop((sx, sy, sx + w, sy + h))
            if k != 1:
                im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
            t.alpha_composite(im, (round(fx + ox * k), round(fy + oy * k)))
            d = ImageDraw.Draw(t)
            d.line((0, fy, W, fy), fill=(220, 80, 80, 255))
            d.text((4, 2), f'{name} {i}  {i / an['fps']:.3f}с', font=font, fill=(255, 255, 255, 255))
            if i == rel_i:
                d.rectangle((0, 0, W - 1, H - 1), outline=(255, 40, 40, 255), width=3)
                if isinstance(mz, (list, tuple)):
                    mx, my = (fx + mz[0] * a.scale, fy + mz[1] * a.scale)
                    d.ellipse((mx - 6, my - 6, mx + 6, my + 6), outline=(255, 40, 40, 255), width=3)
            tiles.append(t)
        cols = min(a.cols, len(tiles))
        rows = (len(tiles) + cols - 1) // cols
        blk = Image.new('RGBA', (W * cols, H * rows), (20, 20, 20, 255))
        for i, t in enumerate(tiles):
            blk.alpha_composite(t, (i % cols * W, i // cols * H))
        blocks.append(blk)
    Wt = max((b.width for b in blocks))
    out = Image.new('RGB', (Wt, sum((b.height + 8 for b in blocks))), (255, 255, 255))
    y = 0
    for b in blocks:
        out.paste(b.convert('RGB'), (0, y))
        y += b.height + 8
    out.save(output_path(a.out))
    print(a.out, out.size, ', '.join((f'{n}: {len(meta['anims'][n]['frames'])} кадров' for n in names)))
if __name__ == '__main__':
    cli(main)
