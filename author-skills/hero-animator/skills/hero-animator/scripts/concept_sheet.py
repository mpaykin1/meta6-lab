import argparse

from PIL import Image, ImageDraw

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, font, output_path


def main():
    ap = argparse.ArgumentParser(description='Варианты концепта на одном листе')
    ap.add_argument('out')
    ap.add_argument('images', nargs='+')
    ap.add_argument('--name', default='Герой')
    ap.add_argument('--height', type=int, default=520)
    ap.add_argument('--font', help='Путь к шрифту с русскими буквами')
    args = ap.parse_args()
    if args.height <= 0:
        raise ValueError('Высота должна быть положительной')
    tiles = []
    for i, path in enumerate(args.images, 1):
        image = Image.open(path).convert('RGBA')
        box = image.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
        if not box:
            raise ValueError(f'Пустая картинка: {path}')
        image = image.crop(box)
        image = image.resize((max(1, round(image.width * args.height / image.height)), args.height), Image.Resampling.LANCZOS)
        tile = Image.new('RGBA', (max(220, image.width + 48), args.height + 96), (238, 228, 205, 255))
        tile.alpha_composite(image, ((tile.width - image.width) // 2, 16))
        ImageDraw.Draw(tile).text((14, args.height + 40), f'{i}. {args.name}', font=font(22, args.font), fill=(60, 40, 20))
        tiles.append(tile)
    result = Image.new('RGB', (sum(t.width for t in tiles), max(t.height for t in tiles)), (238, 228, 205))
    x = 0
    for tile in tiles:
        result.paste(tile, (x, 0))
        x += tile.width
    result.save(output_path(args.out))
    print(args.out, result.size, f'вариантов {len(tiles)}')


if __name__ == '__main__':
    cli(main)
