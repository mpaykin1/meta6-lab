import argparse
import shutil
import subprocess
from pathlib import Path

from PIL import Image

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, load_json, safe_name


def main():
    ap = argparse.ArgumentParser(description='Необязательное создание концептов через Codex CLI')
    ap.add_argument('jobs')
    ap.add_argument('--out-dir', required=True)
    ap.add_argument('--style', help='Картинка со стилем собственной игры')
    ap.add_argument('--codex')
    ap.add_argument('--model')
    ap.add_argument('--only', default='')
    args = ap.parse_args()
    executable = args.codex or shutil.which('codex')
    if not executable:
        raise ValueError('codex не найден в PATH. Укажите --codex или используйте концепты из Flow')
    jobs = load_json(args.jobs)['jobs']
    wanted = set(filter(None, args.only.split(',')))
    output = Path(args.out_dir).expanduser().resolve()
    output.mkdir(parents=True, exist_ok=True)
    planned = []
    for job in jobs:
        hero = safe_name(job['hero'])
        number = job['n']
        if not isinstance(number, int) or number < 1 or not isinstance(job['prompt'], str) or not job['prompt'].strip():
            raise ValueError('У задания нужны положительный n и непустой prompt')
        name = f'{hero}_{number}'
        if name in [n for n, _ in planned]:
            raise ValueError(f'Повтор задания: {name}')
        if not wanted or name in wanted:
            planned.append((name, job['prompt']))
    if not planned:
        raise ValueError('Нет выбранных заданий')
    for name, prompt in planned:
        target = output / f'{name}.png'
        if target.exists():
            print(f'{name}: уже есть, пропущен')
            continue
        command = [str(executable), 'exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', str(output)]
        if args.model:
            command += ['--model', args.model]
        if args.style:
            command += ['--image', str(Path(args.style).expanduser().resolve())]
        command.append('-')
        request = f'$imagegen Создай ровно одну картинку встроенным инструментом изображений. Передай запрос ниже полностью, без правок. Скрипты не пиши. Сохрани результат в {target.name} в рабочей папке.\n\nЗапрос:\n{prompt}'
        result = subprocess.run(command, input=request, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=540)
        if result.returncode or not target.is_file():
            raise RuntimeError(f'{name}: картинка не получена. Проверьте вход в CLI и доступность встроенного инструмента')
        with Image.open(target) as image:
            image.verify()
        print(f'{name}: готово')


if __name__ == '__main__':
    cli(main)
