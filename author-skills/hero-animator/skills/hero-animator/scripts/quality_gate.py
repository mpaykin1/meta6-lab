#!/usr/bin/env python3
"""Game-art frame gate. Silent unless accepted/blocked; exit 0/2.

A conservative structural validator, NOT a proof of artistic correctness.
Uses existing numpy/Pillow/OpenCV dependencies from scripts/requirements.txt.
"""
import argparse
from pathlib import Path
import sys

import cv2
import numpy as np
from PIL import Image, ImageSequence


def load_frames(path: Path):
    if path.is_dir():
        paths = sorted(p for p in path.iterdir() if p.suffix.lower() == '.png')
        if not paths:
            raise ValueError('Папка не содержит PNG-кадров')
        frames = [Image.open(p).convert('RGBA').copy() for p in paths]
    else:
        with Image.open(path) as img:
            if img.format not in ('GIF', 'PNG', 'WEBP', 'TIFF'):
                raise ValueError('Ожидается GIF/PNG/WebP или каталог PNG')
            frames = [frame.convert('RGBA').copy() for frame in ImageSequence.Iterator(img)]
    if not frames:
        raise ValueError('Нет кадров')
    if len({i.size for i in frames}) != 1:
        raise ValueError('У кадров разное разрешение')
    return frames


def validate(path: Path, kind='actor', min_frames=2, edge_padding=2, anchor_tolerance=0.10):
    frames = load_frames(path)
    errors = []
    if len(frames) < min_frames:
        errors.append(f'мало кадров: {len(frames)} (минимум {min_frames})')
    w,h=frames[0].size
    if w < 64 or h < 64:
        errors.append('низкое разрешение кадра')
    if kind == 'background':
        # Background is normally full-bleed, and must NOT be rejected for edge contact.
        return errors
    if kind == 'effect':
        # Sparks/particles may be detached by design; check neither component count nor anchors.
        return errors

    bottoms=[]
    for i,img in enumerate(frames):
        rgba=np.asarray(img)
        alpha=rgba[:,:,3]
        mask=(alpha >= 32).astype(np.uint8)
        visible=int(mask.sum())
        if visible <= 0:
            errors.append(f'кадр {i}: пустой спрайт')
            continue
        if visible > 0.93*w*h:
            errors.append(f'кадр {i}: вероятно непрозрачный фон вместо прозрачного спрайта')
        ys,xs=np.where(mask)
        bottoms.append((i,int(ys.max())))
        # For actors: a large visible section abutting any canvas edge indicates crop / duplicate.
        margin_x=max(2,int(round(w*edge_padding/100)))
        margin_y=max(2,int(round(h*edge_padding/100)))
        border_pixels=int(mask[:margin_y,:].sum()+mask[-margin_y:,:].sum()+
                          mask[:, :margin_x].sum()+mask[:, -margin_x:].sum())
        # Require substantial foreground at the edge; do not reject single isolated sparks.
        if border_pixels > max(80, int(0.003*w*h)):
            errors.append(f'кадр {i}: персонаж/лишняя фигура касается границы холста')
        n, labels, stats, _=cv2.connectedComponentsWithStats(mask, 8)
        comps=sorted((s for s in stats[1:] if s[cv2.CC_STAT_AREA] > 0),
                     key=lambda s:s[cv2.CC_STAT_AREA],reverse=True)
        if comps:
            main=comps[0]
            for second in comps[1:]:
                area_ratio=second[cv2.CC_STAT_AREA]/float(main[cv2.CC_STAT_AREA])
                height_ratio=second[cv2.CC_STAT_HEIGHT]/float(main[cv2.CC_STAT_HEIGHT])
                width_ratio=second[cv2.CC_STAT_WIDTH]/float(main[cv2.CC_STAT_WIDTH])
                if area_ratio >= 0.25 and height_ratio >= 0.56 and width_ratio >= 0.26:
                    errors.append(f'кадр {i}: отдельная крупная фигура / дубликат персонажа')
                    break
    if len(bottoms) >= 2:
        values=[y for _,y in bottoms]
        if max(values)-min(values) > int(h*anchor_tolerance):
            errors.append('нестабильная нижняя точка персонажа (проверь якорь; исключение — прыжок/падение)')
    # Repeat errors only at first few frames to keep output brief.
    if len(errors)>16:
        errors=errors[:16]+[f'и ещё {len(errors)-16} нарушений']
    return errors


def main():
    p=argparse.ArgumentParser(description='Запрет упаковки бракованных игровых кадров')
    p.add_argument('source', type=Path, help='GIF/WebP/PNG или папка PNG-кадров')
    p.add_argument('--kind', choices=('actor','background','effect'),default='actor')
    p.add_argument('--min-frames',type=int,default=2)
    p.add_argument('--anchor-tolerance',type=float,default=0.10)
    args=p.parse_args()
    try:
        errors=validate(args.source,args.kind,args.min_frames,anchor_tolerance=args.anchor_tolerance)
    except (OSError,ValueError) as e:
        print(f'BLOCKED: {e}',file=sys.stderr)
        return 2
    if errors:
        print('BLOCKED — NOT GAME-READY:\n'+'\n'.join('• '+e for e in errors),file=sys.stderr)
        return 2
    print(f'ACCEPTED — structural gate passed ({args.kind}); visual style review still required')
    return 0

if __name__=='__main__':
    sys.exit(main())
