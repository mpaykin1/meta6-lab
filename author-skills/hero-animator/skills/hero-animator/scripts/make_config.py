import argparse
import json
import os
import re
from pathlib import Path

import cv2

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, clip_capture, output_path, safe_name
from measure import measure


def animation_name(stem):
    stem = re.sub(r'[_-][0-9a-f]{8,}$', '', stem.lower())
    aliases = {'atk': 'attack', 'atk_full': 'attack', 'ulta': 'cast', 'ult': 'cast', 'happy': 'idle_happy', 'joy': 'idle_happy', 'idle_calm': 'idle', 'victory_full': 'victory'}
    return aliases.get(stem, stem)


def main():
    ap = argparse.ArgumentParser(description='Черновик конфига по именам клипов')
    ap.add_argument('clips')
    ap.add_argument('out')
    ap.add_argument('--id', required=True)
    ap.add_argument('--out-dir', default='sheets')
    ap.add_argument('--work', default='work')
    ap.add_argument('--height', type=float, default=245)
    ap.add_argument('--float', dest='floating', action='store_true')
    ap.add_argument('--force', action='store_true')
    args = ap.parse_args()
    safe_name(args.id)
    target = Path(args.out).expanduser().resolve()
    if target.exists() and not args.force:
        raise ValueError('Конфиг уже есть. Для замены нужен --force')
    clips = sorted(p for p in Path(args.clips).expanduser().iterdir() if p.suffix.lower() in ('.mp4', '.webm', '.mov') and p.is_file())
    if not clips:
        raise ValueError('В папке нет клипов')
    selected = {}
    duplicates = []
    for path in clips:
        name = animation_name(path.stem)
        safe_name(name)
        if name in selected:
            if path.stem.lower() == 'idle_calm':
                selected[name] = path
            duplicates.append(name)
            continue
        selected[name] = path
    baseline = selected.get('idle', clips[0])
    measured = measure(baseline)
    anims = {}
    for name, path in selected.items():
        cap = clip_capture(path)
        duration = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
        cap.release()
        loop = name in ('idle', 'idle_happy', 'stun')
        fps = 24 if loop or name.startswith('fidget_') else 30
        end = min(duration, 1.6) if loop else duration
        try:
            video_path = Path(os.path.relpath(path.resolve(), target.parent)).as_posix()
        except ValueError:
            video_path = path.resolve().as_posix()
        anim = {'video': video_path, 'fps': fps, 'warp': [[0, round(end, 6), round(end, 6)]]}
        if loop:
            anim.update(loop=True, pingpong=True)
        if name in ('attack', 'cast'):
            anim['release'] = 0.16 if name == 'attack' else 0.32
        if name == 'death':
            anim['hold'] = True
        if name.startswith('fidget_'):
            anim['label'] = name
        anims[name] = anim
    if 'victory' in anims:
        anims['cheer'] = dict(anims['victory'])
    x0, y0, x1, y1 = measured['box']
    size = max(1, round(measured['src_height'] * 0.73))
    portrait_x = round((x0 + x1 - size) / 2)
    cfg = {'id': args.id, 'out_dir': args.out_dir, 'work': args.work, 'ppu': 1.0, 'height': args.height, 'src_height': measured['src_height'], 'foot': measured['foot'], 'key': 'auto', 'despill': 'hue', 'dropBorder': False, 'groundClamp': not args.floating, 'minArea': 60, 'quality': 80, 'shadow': [78, 13], 'anims': anims, 'portrait': {'anim': next((n for n in ('idle',) if n in anims), next(iter(anims))), 't': 0, 'box': [portrait_x, max(0, y0), portrait_x + size, max(0, y0) + size], 'size': 256}}
    output_path(target).write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{target.name}: {len(anims)} анимаций, рост {measured["src_height"]}, ступни {measured["foot"]}')
    if duplicates:
        print('Повторные имена, оставлен первый клип; idle_calm имеет приоритет: ' + ', '.join(sorted(set(duplicates))))
    missing = {'idle', 'attack', 'cast', 'hit', 'stun', 'victory', 'death', 'idle_happy'} - selected.keys()
    if missing:
        print('Нет клипов: ' + ', '.join(sorted(missing)))
    if sum(name.startswith('fidget_') for name in selected) < 3:
        print('Для полного набора нужны три разных fidget_клипа')
    print('Это черновик: подберите warp, выпуск, маски и петли по кадрам. Параметры victory пока не зациклены')


if __name__ == '__main__':
    cli(main)
