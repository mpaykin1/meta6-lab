import json
import cv2
import numpy as np
from PIL import Image
from pathlib import Path
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, load_json
BLEND_CLIPS = ('idle', 'idle_happy', 'stun', 'victory')
FAR = 2.5
F_LO, F_HI = (0.01, 0.03)

def wants_blend(name: str, cfg_anim: dict | None=None) -> bool:
    flag = (cfg_anim or {}).get('blend')
    return flag is True or (flag is not False and name in BLEND_CLIPS)

def next_frame(a: dict, i: int) -> int | None:
    if i + 1 < len(a['frames']):
        return i + 1
    if a.get('loop'):
        return 0
    if a.get('loopFrom') is not None:
        return a['loopFrom']
    return None

def _outline(rgba: np.ndarray) -> np.ndarray:
    luma = rgba[..., 0] * 0.299 + rgba[..., 1] * 0.587 + rgba[..., 2] * 0.114
    return (rgba[..., 3] > 128) & (luma < 80)

def _gray(rgba: np.ndarray) -> np.ndarray:
    luma = rgba[..., 0] * 0.299 + rgba[..., 1] * 0.587 + rgba[..., 2] * 0.114
    return (luma * (rgba[..., 3] / 255.0)).astype(np.float32)

def measure(A: np.ndarray, B: np.ndarray, win: np.ndarray, far_px: float) -> tuple[float, float, float]:
    (dx, dy), _ = cv2.phaseCorrelate(_gray(A), _gray(B), win)
    if not (abs(dx) < 80 and abs(dy) < 80):
        dx = dy = 0.0
    oa, ob = (_outline(A), _outline(B))
    if not oa.any() or not ob.any():
        return (1.0, 0.0, 0.0)
    h, w = oa.shape
    m = np.float32([[1, 0, -dx], [0, 1, -dy]])
    ob = cv2.warpAffine(ob.astype(np.uint8) * 255, m, (w, h), flags=cv2.INTER_LINEAR) > 127
    if not ob.any():
        return (1.0, 0.0, 0.0)
    da = cv2.distanceTransform(np.where(oa, 0, 255).astype(np.uint8), cv2.DIST_L2, 3)
    db = cv2.distanceTransform(np.where(ob, 0, 255).astype(np.uint8), cv2.DIST_L2, 3)
    far = max(float((db[oa] > far_px).mean()), float((da[ob] > far_px).mean()))
    return (far, float(dx), float(dy))

def clip_weights(a: dict, rgba_of, ppu: float, stats: list | None=None) -> list[list[float]]:
    fr = a['frames']
    x0 = min((f[4] for f in fr))
    y0 = min((f[5] for f in fr))
    W = max((f[4] + f[2] for f in fr)) - x0
    H = max((f[5] + f[3] for f in fr)) - y0
    win = cv2.createHanningWindow((W, H), cv2.CV_32F)
    placed: dict = {}

    def put(i):
        key = (fr[i][0], fr[i][1])
        if key not in placed:
            f = fr[i]
            m = np.zeros((H, W, 4), np.uint8)
            m[f[5] - y0:f[5] - y0 + f[3], f[4] - x0:f[4] - x0 + f[2]] = rgba_of(i)
            placed[key] = m
        return placed[key]
    out = []
    for i in range(len(fr)):
        j = next_frame(a, i)
        if j is None or fr[i][:2] == fr[j][:2]:
            out.append([0])
            continue
        far, dx, dy = measure(put(i), put(j), win, FAR * ppu)
        if stats is not None:
            stats.append(far)
        share = float(np.clip((F_HI - far) / (F_HI - F_LO), 0, 1))
        out.append([round(share, 2), round(dx, 1), round(dy, 1)] if share > 0 else [0])
    return out

def main():
    import argparse
    ap = argparse.ArgumentParser(description='Разметка смешивания кадров')
    ap.add_argument('meta')
    ap.add_argument('--stats', action='store_true')
    args = ap.parse_args()
    path = Path(args.meta)
    meta = load_json(path)
    for name, anim in meta['anims'].items():
        if not wants_blend(name) and (not anim.get('blend')):
            continue
        sheet = np.array(Image.open(path.parent / anim['sheet']).convert('RGBA'))
        frames = anim['frames']
        stats = []
        anim['blend'] = clip_weights(anim, lambda i: sheet[frames[i][1]:frames[i][1] + frames[i][3], frames[i][0]:frames[i][0] + frames[i][2]], anim.get('ppu', meta['ppu']), stats)
        print(f'{name}: переходов {len(stats)}, медиана {(np.median(stats) if stats else 0):.4f}')
    if not args.stats:
        path.write_text(json.dumps(meta, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
if __name__ == '__main__':
    cli(main)
