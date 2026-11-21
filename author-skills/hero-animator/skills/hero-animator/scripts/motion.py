import argparse
from pathlib import Path

import cv2
import numpy as np

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, clip_capture


def profile(path):
    cap = clip_capture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    previous = None
    values = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        gray = cv2.resize(frame, (max(1, frame.shape[1] // 4), max(1, frame.shape[0] // 4)), interpolation=cv2.INTER_AREA).astype(np.int16)
        if previous is not None:
            values.append(float((np.abs(gray - previous).max(2) > 40).mean() * 100))
        previous = gray
    cap.release()
    if not values:
        raise ValueError(f'Нужно минимум два кадра: {path}')
    values = np.array(values)
    active = values > max(0.15, values.max() * 0.12)
    segments, start = [], None
    for i, value in enumerate(np.append(active, False)):
        if value and start is None:
            start = i
        if not value and start is not None:
            if i - start >= 2:
                segments.append([start / fps, i / fps])
            start = None
    return fps, values, segments


def main():
    ap = argparse.ArgumentParser(description='Профиль движения клипа')
    ap.add_argument('clips', nargs='+')
    args = ap.parse_args()
    for path in args.clips:
        fps, values, segments = profile(path)
        print(f'{Path(path).name}: {fps:g} fps, {len(values)+1} кадров, пик {values.max():.2f}%')
        print('Движение: ' + ', '.join(f'{a:.2f}-{b:.2f} с' for a, b in segments))


if __name__ == '__main__':
    cli(main)
