import hashlib
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import ImageFont


def cli(main):
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8')
    try:
        main()
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.SubprocessError) as exc:
        print(f'Ошибка: {exc}', file=sys.stderr)
        raise SystemExit(1)


def output_path(value):
    path = Path(value).expanduser()
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def load_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def safe_name(value):
    if not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*', value):
        raise ValueError('Имя: только латинские буквы, цифры, дефис и подчёркивание')
    return value


def require_tool(name):
    path = shutil.which(name)
    if not path:
        raise RuntimeError(f'{name} не найден в PATH. Установите ffmpeg с ffprobe и добавьте папку bin в PATH')
    return path


def probe_video(path):
    path = Path(path).expanduser().resolve()
    if not path.is_file():
        raise ValueError(f'Нет клипа: {path}')
    result = subprocess.run([require_tool('ffprobe'), '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate,width,height:format=duration', '-of', 'json', str(path)], capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    if not data.get('streams'):
        raise ValueError(f'Нет видеодорожки: {path.name}')
    stream = data['streams'][0]
    num, den = stream['r_frame_rate'].split('/')
    fps = float(num) / float(den)
    if fps <= 0:
        raise ValueError(f'Неверная частота кадров: {path.name}')
    return {**stream, 'fps': fps, 'rate': stream['r_frame_rate'], 'duration': float(data.get('format', {}).get('duration', 0))}


def extract_video(video, work):
    video = Path(video).expanduser().resolve()
    info = probe_video(video)
    stat = video.stat()
    signature = [str(video), stat.st_size, stat.st_mtime_ns]
    digest = hashlib.sha256(str(video).encode()).hexdigest()[:12]
    directory = Path(work) / f'{video.stem}_{digest}'
    marker = directory / 'meta.json'
    if marker.is_file():
        cached = load_json(marker)
        if cached.get('signature') == signature and cached.get('n', 0) > 0 and all((directory / f'f{i:05d}.png').is_file() for i in range(1, cached['n'] + 1)):
            return str(directory), cached['fps'], cached['n']
    directory.mkdir(parents=True, exist_ok=True)
    subprocess.run([require_tool('ffmpeg'), '-v', 'error', '-y', '-i', str(video), '-vsync', '0', str(directory / 'f%05d.png')], check=True)
    import cv2
    cap = cv2.VideoCapture(str(video))
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    if n <= 0 or not all((directory / f'f{i:05d}.png').is_file() for i in range(1, n + 1)):
        raise RuntimeError(f'Не удалось извлечь все кадры: {video.name}')
    marker.write_text(json.dumps({'signature': signature, 'fps': info['fps'], 'n': n}), encoding='utf-8')
    return str(directory), info['fps'], n


def font(size=18, path=None):
    if path:
        return ImageFont.truetype(path, size)
    for name in ('DejaVuSans.ttf', 'arial.ttf', 'Arial.ttf', 'LiberationSans-Regular.ttf'):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


def validate_config(cfg):
    safe_name(cfg['id'])
    for key in ('ppu', 'height', 'src_height'):
        if not isinstance(cfg[key], (int, float)) or not math.isfinite(cfg[key]) or cfg[key] <= 0:
            raise ValueError(f'{key} должен быть положительным числом')
    for field in ('out_dir', 'work'):
        if not isinstance(cfg[field], str) or not cfg[field].strip():
            raise ValueError(f'Нужно поле {field}')
    if not cfg['anims']:
        raise ValueError('Нет анимаций')
    for name, anim in cfg['anims'].items():
        safe_name(name)
        if not isinstance(anim.get('fps'), (int, float)) or not math.isfinite(anim['fps']) or anim['fps'] <= 0:
            raise ValueError(f'{name}: fps должен быть положительным')
        if not anim.get('warp'):
            raise ValueError(f'{name}: нужен warp')
        for segment in anim['warp']:
            if len(segment) != 3 or any(not isinstance(v, (int, float)) or not math.isfinite(v) for v in segment) or segment[0] < 0 or segment[1] <= segment[0] or segment[2] <= 0:
                raise ValueError(f'{name}: неверный участок warp')
        total = sum(s[2] for s in anim['warp'])
        if 'release' in anim and not 0 <= anim['release'] <= total:
            raise ValueError(f'{name}: release вне анимации')
        for key in ('loopFrom', 'pingpong'):
            value = anim.get(key)
            if value is not None and not isinstance(value, bool) and not 0 <= value < total:
                raise ValueError(f'{name}: {key} вне анимации')
        for key in ('ppu', 'src_height'):
            if key in anim and anim[key] <= 0:
                raise ValueError(f'{name}: {key} должен быть положительным')


def clip_capture(path):
    import cv2
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened() or cap.get(cv2.CAP_PROP_FPS) <= 0:
        cap.release()
        raise ValueError(f'Не удалось открыть клип: {path}')
    return cap
