import argparse
import cv2
import numpy as np

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, clip_capture


def silhouette(frame):
    border = np.concatenate([frame[:6].reshape(-1, 3), frame[-6:].reshape(-1, 3), frame[:, :6].reshape(-1, 3), frame[:, -6:].reshape(-1, 3)])
    key = np.median(border, axis=0).astype(np.uint8)
    ycc = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb).astype(np.float32)
    k = cv2.cvtColor(key[None, None], cv2.COLOR_BGR2YCrCb).astype(np.float32)[0, 0]
    mask = (np.hypot(ycc[..., 1] - k[1], ycc[..., 2] - k[2]) > 30).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if n < 2:
        raise ValueError('Герой не отделился от фона по цвету')
    return labels == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA])), key[::-1].tolist()


def measure(path, time=0):
    cap = clip_capture(path)
    cap.set(cv2.CAP_PROP_POS_MSEC, time * 1000)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise ValueError(f'Нет кадра в {time} с: {path}')
    mask, key = silhouette(frame)
    ys, xs = np.nonzero(mask)
    top, bottom = int(ys.min()), int(ys.max())
    low = ys > bottom - (bottom - top + 1) * 0.05
    foot = [int(xs[low].mean()), bottom]
    return {'width': frame.shape[1], 'height': frame.shape[0], 'key': key, 'src_height': bottom - top + 1, 'foot': foot, 'box': [int(xs.min()), top, int(xs.max()) + 1, bottom + 1]}


def main():
    ap = argparse.ArgumentParser(description='Рост героя и положение ступней')
    ap.add_argument('clips', nargs='+')
    ap.add_argument('--time', type=float, default=0)
    args = ap.parse_args()
    for path in args.clips:
        print(path, measure(path, args.time))


if __name__ == '__main__':
    cli(main)
