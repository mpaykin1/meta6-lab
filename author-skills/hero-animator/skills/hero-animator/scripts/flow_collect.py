import argparse
import hashlib
import re
import shutil
import time
from pathlib import Path

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, clip_capture, safe_name


def digest(path):
    value = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1 << 20), b''):
            value.update(chunk)
    return value.hexdigest()


def main():
    ap = argparse.ArgumentParser(description='Копирование скачанных клипов без перезаписи')
    ap.add_argument('out_dir')
    ap.add_argument('--downloads', default=str(Path.home() / 'Downloads'))
    ap.add_argument('--names', help='Имена через запятую, в порядке скачивания')
    ap.add_argument('--match', default='', help='Фрагмент имени загрузки')
    ap.add_argument('--since', default='3h', help='Например 30m, 3h или 1d')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    match = re.fullmatch(r'(\d+)([smhd])', args.since)
    if not match:
        raise ValueError('--since: нужно число и s, m, h или d')
    cutoff = time.time() - int(match[1]) * {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}[match[2]]
    source = Path(args.downloads).expanduser()
    destination = Path(args.out_dir).expanduser()
    found = []
    for path in source.iterdir():
        if not path.is_file() or path.suffix.lower() not in ('.mp4', '.webm') or args.match.lower() not in path.name.lower():
            continue
        stat = path.stat()
        if stat.st_mtime < cutoff:
            continue
        if time.time() - stat.st_mtime < 2 or Path(str(path) + '.crdownload').exists():
            raise ValueError('Загрузка ещё не завершена. Дождитесь завершения и повторите сбор')
        cap = clip_capture(path)
        ok, _ = cap.read()
        cap.release()
        if not ok:
            raise ValueError(f'Клип ещё не читается: {path.name}')
        found.append(path)
    found.sort(key=lambda p: (p.stat().st_mtime_ns, p.name))
    if not found:
        raise ValueError('Подходящих завершённых загрузок нет')
    names = [safe_name(n.strip()) for n in args.names.split(',')] if args.names else None
    if names and (len(names) != len(found) or len(set(names)) != len(names)):
        raise ValueError(f'Клипов {len(found)}, имён {len(names)}. Уточните --match или --since; ничего не скопировано')
    plan = []
    for i, path in enumerate(found):
        name = names[i] if names else re.sub(r'[^A-Za-z0-9_-]+', '_', re.sub(r'[_-][0-9a-f]{8,}$', '', path.stem)).strip('_').lower() or 'clip'
        target = destination / (name + path.suffix.lower())
        if target.exists():
            if digest(path) == digest(target):
                print(f'{target.name}: уже скопирован')
                continue
            raise ValueError(f'Имя занято другим клипом: {target.name}; ничего не скопировано')
        if any(t == target for _, t in plan):
            raise ValueError('Имена совпали. Задайте --names; ничего не скопировано')
        plan.append((path, target))
    for path, target in plan:
        if not args.dry_run:
            destination.mkdir(parents=True, exist_ok=True)
            with path.open('rb') as source_stream, target.open('xb') as target_stream:
                shutil.copyfileobj(source_stream, target_stream)
        print(f'{path.name} -> {target.name}')
    print(f'{"Будет скопировано" if args.dry_run else "Скопировано"}: {len(plan)}. Исходные загрузки сохранены')


if __name__ == '__main__':
    cli(main)
