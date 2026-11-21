import argparse
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, output_path, probe_video, require_tool


def main():
    ap = argparse.ArgumentParser(description='Real-ESRGAN: клип x2 без сетевых запросов')
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--model', required=True)
    ap.add_argument('--tile', type=int, default=256)
    ap.add_argument('--work', required=True, help='Папка временных кадров')
    args = ap.parse_args()
    try:
        import torch
    except ImportError:
        raise RuntimeError('Для HD нужен torch с поддержкой CUDA') from None
    if not torch.cuda.is_available():
        raise RuntimeError('CUDA недоступна. Для HD нужна видеокарта NVIDIA и torch с CUDA')
    try:
        import spandrel
    except ImportError:
        raise RuntimeError('Для HD нужен пакет spandrel') from None
    if args.tile <= 0:
        raise ValueError('--tile должен быть положительным')
    model_path = Path(args.model).expanduser().resolve()
    if not model_path.is_file():
        raise ValueError('Файл модели не найден. Укажите --model')
    if Path(args.src).resolve() == Path(args.out).resolve():
        raise ValueError('Исходный клип и результат должны быть разными файлами')
    ffmpeg = require_tool('ffmpeg')
    info = probe_video(args.src)
    model = spandrel.ModelLoader().load_from_file(str(model_path)).eval().cuda()
    if model.scale != 4:
        raise ValueError('Нужна модель RealESRGAN_x4plus_anime_6B с масштабом x4')
    work = Path(args.work).expanduser()
    work.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=work) as temporary:
        directory = Path(temporary)
        subprocess.run([ffmpeg, '-v', 'error', '-y', '-i', args.src, '-vsync', '0', str(directory / 'f%05d.png')], check=True)
        files = sorted(directory.glob('f*.png'))
        if not files:
            raise ValueError('В клипе нет кадров')
        output = directory / 'out'
        output.mkdir()
        for file in files:
            image = Image.open(file).convert('RGB')
            source = np.array(image)
            width, height = image.size
            result = np.empty((height * 4, width * 4, 3), np.uint8)
            for y in range(0, height, args.tile):
                for x in range(0, width, args.tile):
                    x1, y1 = min(width, x + args.tile), min(height, y + args.tile)
                    left, top = max(0, x - 16), max(0, y - 16)
                    right, bottom = min(width, x1 + 16), min(height, y1 + 16)
                    tensor = torch.from_numpy(source[top:bottom, left:right].astype(np.float32) / 255).permute(2, 0, 1)[None].cuda()
                    with torch.inference_mode():
                        patch = model(tensor)[0].float().clamp(0, 1).permute(1, 2, 0).cpu().numpy()
                    patch = (patch * 255 + 0.5).astype(np.uint8)
                    result[y*4:y1*4, x*4:x1*4] = patch[(y-top)*4:(y1-top)*4, (x-left)*4:(x1-left)*4]
            Image.fromarray(result).resize((width * 2, height * 2), Image.Resampling.LANCZOS).save(output / file.name)
        subprocess.run([ffmpeg, '-v', 'error', '-y', '-framerate', info['rate'], '-i', str(output / 'f%05d.png'), '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv444p', '-crf', '8', str(output_path(args.out))], check=True)
        print(args.out, f'{len(files)} кадров, {info["width"]*2}x{info["height"]*2}')


if __name__ == '__main__':
    cli(main)
