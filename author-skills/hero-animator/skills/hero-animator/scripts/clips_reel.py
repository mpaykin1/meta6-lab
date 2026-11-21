import argparse
import math
import re
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, clip_capture, font, output_path, require_tool


def main():
    ap = argparse.ArgumentParser(description='Ролик клипов с подписями для одобрения')
    ap.add_argument('out')
    ap.add_argument('clips', nargs='+', help='Подпись=клип.mp4 или Подпись=клип.mp4:0.5-4.2')
    ap.add_argument('--font', help='Путь к шрифту с русскими буквами')
    args = ap.parse_args()
    ffmpeg = require_tool('ffmpeg')
    plans = []
    for spec in args.clips:
        label, path = spec.split('=', 1)
        match = re.fullmatch(r'(.*):([\d.]+)-([\d.]+)', path)
        begin, end = 0, None
        if match:
            path, begin, end = match[1], float(match[2]), float(match[3])
        cap = clip_capture(path)
        duration = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
        cap.release()
        end = duration if end is None else min(end, duration)
        if not 0 <= begin < end:
            raise ValueError(f'Неверный диапазон: {label}')
        plans.append((label, path, begin, end))
    width, height, fps = 960, 540, 24
    encoder = subprocess.Popen([ffmpeg, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{width}x{height}', '-r', str(fps), '-i', '-', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(output_path(args.out))], stdin=subprocess.PIPE)
    total = 0
    label_font = font(26, args.font)
    try:
        for label, path, begin, end in plans:
            cap = clip_capture(path)
            source_fps = cap.get(cv2.CAP_PROP_FPS)
            last_index, frame = -1, None
            for i in range(math.ceil((end - begin) * fps)):
                time = begin + i / fps
                index = int(time * source_fps)
                if index != last_index:
                    if index != last_index + 1:
                        cap.set(cv2.CAP_PROP_POS_FRAMES, index)
                    ok, frame = cap.read()
                    if not ok:
                        raise ValueError(f'Не читается кадр {index}: {path}')
                    last_index = index
                ratio = min(width / frame.shape[1], (height - 46) / frame.shape[0])
                size = (max(1, round(frame.shape[1] * ratio)), max(1, round(frame.shape[0] * ratio)))
                image = Image.fromarray(cv2.cvtColor(cv2.resize(frame, size, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB))
                canvas = Image.new('RGB', (width, height), (20, 20, 28))
                canvas.paste(image, ((width - size[0]) // 2, 46 + (height - 46 - size[1]) // 2))
                ImageDraw.Draw(canvas).text((14, 6), f'{label}   {time:.2f} с', font=label_font, fill='white')
                encoder.stdin.write(np.asarray(canvas).tobytes())
                total += 1
            cap.release()
    finally:
        encoder.stdin.close()
        status = encoder.wait()
    if status:
        raise RuntimeError('ffmpeg не смог записать ролик')
    print(args.out, f'{total} кадров, {total / fps:.2f} с')


if __name__ == '__main__':
    cli(main)
