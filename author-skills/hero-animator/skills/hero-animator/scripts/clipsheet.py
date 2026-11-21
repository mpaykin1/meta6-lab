import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, clip_capture, font, output_path


def main():
    ap = argparse.ArgumentParser(description='Кадры клипа сеткой, номера с нуля')
    ap.add_argument('out')
    ap.add_argument('clips', nargs='+')
    ap.add_argument('--frames', help='Диапазон включительно, например 12-40')
    ap.add_argument('--crop', help='x0,y0,x1,y1 в долях кадра')
    ap.add_argument('--count', type=int, default=12)
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--cols', type=int, default=8)
    ap.add_argument('--width', type=int, default=220)
    ap.add_argument('--font', help='Путь к шрифту с русскими буквами')
    args = ap.parse_args()
    if min(args.count, args.cols, args.width) <= 0:
        raise ValueError('Число кадров, колонок и ширина должны быть положительными')
    crop = [float(v) for v in args.crop.split(',')] if args.crop else None
    if crop and (len(crop) != 4 or not (0 <= crop[0] < crop[2] <= 1 and 0 <= crop[1] < crop[3] <= 1)):
        raise ValueError('Обрезка: 0 <= x0 < x1 <= 1 и 0 <= y0 < y1 <= 1')
    blocks = []
    for path in args.clips:
        cap = clip_capture(path)
        n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        begin, end = [int(v) for v in args.frames.split('-')] if args.frames else (0, n - 1)
        if not 0 <= begin <= end < n:
            raise ValueError(f'Диапазон вне клипа: {path}, кадров {n}')
        indices = range(begin, end + 1) if args.all else np.unique(np.linspace(begin, end, min(args.count, end - begin + 1)).round().astype(int))
        tiles = []
        for index in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(index))
            ok, frame = cap.read()
            if not ok:
                raise ValueError(f'Кадр {index} не читается: {path}')
            image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if crop:
                image = image.crop((round(crop[0] * image.width), round(crop[1] * image.height), round(crop[2] * image.width), round(crop[3] * image.height)))
            image.thumbnail((args.width, args.width * 4))
            tile = Image.new('RGB', (args.width, image.height + 28), (30, 30, 38))
            tile.paste(image, ((args.width - image.width) // 2, 28))
            ImageDraw.Draw(tile).text((5, 3), f'{Path(path).stem}: {index}', font=font(14, args.font), fill='white')
            tiles.append(tile)
        cap.release()
        cols = min(args.cols, len(tiles))
        height = max(t.height for t in tiles)
        block = Image.new('RGB', (cols * args.width, ((len(tiles) + cols - 1) // cols) * height), (30, 30, 38))
        for i, tile in enumerate(tiles):
            block.paste(tile, ((i % cols) * args.width, (i // cols) * height))
        blocks.append(block)
    result = Image.new('RGB', (max(b.width for b in blocks), sum(b.height for b in blocks)), (30, 30, 38))
    y = 0
    for block in blocks:
        result.paste(block, (0, y))
        y += block.height
    result.save(output_path(args.out))
    print(args.out, result.size)


if __name__ == '__main__':
    cli(main)
