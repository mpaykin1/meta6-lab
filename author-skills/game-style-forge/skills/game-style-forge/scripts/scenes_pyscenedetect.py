"""Shot-aware video analysis: PySceneDetect 0.7.3 + OpenCV + scene palettes.

PySceneDetect detects edited shot boundaries, not actual 3D entities.  A clearly
labelled OpenCV fallback remains available if the external runtime is absent.
Only source-verified PySceneDetect metadata/source excerpt ships in the plugin;
its full Python distribution must be separately installed with pip.
"""
from __future__ import annotations

import json
from pathlib import Path

PIN = "0.7.3"


def _scenes_pyscenedetect(src: Path, fps: float, duration: float):
    import importlib.metadata
    try:
        from scenedetect import open_video, SceneManager, ContentDetector
    except ImportError:
        return None
    actual = importlib.metadata.version("scenedetect")
    if actual != PIN:
        raise RuntimeError(f"PySceneDetect {PIN} pinned; installed {actual}. Refusing incompatible API.")
    video = open_video(str(src))
    manager = SceneManager()
    manager.add_detector(ContentDetector(threshold=27.0, min_scene_len=15))
    try:
        manager.detect_scenes(video=video, show_progress=False)
        shots = manager.get_scene_list(start_in_scene=True)
    finally:
        if hasattr(video, "close"):
            video.close()
    return [(max(0, int(a.get_frames())), max(0, int(b.get_frames()))) for a, b in shots]


def _fallback_opencv(src: Path, fps: float, frames: int):
    """Conservative distinct-shot cut approximation when PySceneDetect isn't installed."""
    import cv2
    import numpy as np
    cap = cv2.VideoCapture(str(src))
    if not cap.isOpened():
        raise ValueError(f"Video cannot be decoded: {src}")
    stride = max(1, int(fps // 4))
    cuts, prev = [0], None
    i = 0
    max_frames = min(max(frames, 1), max(120, int(fps * 240)))
    while i < max_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        good, frame = cap.read()
        if not good:
            break
        thumb = cv2.resize(frame, (96, 54), interpolation=cv2.INTER_AREA)
        hsv = cv2.cvtColor(thumb, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist([hsv], [0, 1], None, [24, 16], [0, 180, 0, 256])
        cv2.normalize(hist, hist)
        gray = cv2.cvtColor(thumb, cv2.COLOR_BGR2GRAY)
        if prev is not None:
            distance = cv2.compareHist(prev[0], hist, cv2.HISTCMP_BHATTACHARYYA)
            mean_delta = np.mean(cv2.absdiff(prev[1], gray)) / 255.0
            if distance > 0.78 and mean_delta > 0.075 and i - cuts[-1] >= fps * .65:
                cuts.append(i)
        prev = (hist, gray)
        i += stride
    cap.release()
    last = frames if frames > 0 else i
    return [(cuts[j], cuts[j+1]) for j in range(len(cuts)-1)] + [(cuts[-1], last)]


def _get_frame(cap, frame_idx: int):
    import cv2
    cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, frame_idx))
    ok, frame = cap.read()
    if not ok:
        return None
    return cv2.resize(frame, (320, 180), interpolation=cv2.INTER_AREA)


def analyze_scene_shots(src: Path, out: Path, fps: float, duration: float | None, count: int):
    import cv2
    import numpy as np
    from PIL import Image, ImageDraw
    from vision_opencv import lab_palette
    if fps <= 0:
        fps = 24.0
    if duration is None:
        duration = max(0.0, count / fps)
    try:
        detected = _scenes_pyscenedetect(src, fps, duration)
        engine = "PySceneDetect 0.7.3 / ContentDetector" if detected is not None else "OpenCV fallback (PySceneDetect runtime missing)"
    except Exception as e:
        raise RuntimeError(f"Pinned PySceneDetect exists but scene detection failed: {e}") from e
    native_pyscenedetect = detected is not None
    if detected is None:
        detected = _fallback_opencv(src, fps, count)
    detected = [(int(a), int(b)) for a, b in detected if b > a]
    if not detected and count:
        detected = [(0, count)]
    out_dir = out / 'scenes'
    out_dir.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(str(src))
    if not cap.isOpened():
        raise ValueError("Cannot open video for shot frames")
    shots = []
    sheet = Image.new('RGB', (960, 212 * min(4, max(1, (min(len(detected), 12) + 2)//3))), '#141820')
    draw = ImageDraw.Draw(sheet)
    for index, (start, end) in enumerate(detected[:64]):
        if end <= start:
            continue
        candidates = sorted(set(min(end - 1, max(start, int(start + f * (end-start)))) for f in (.25, .5, .75)))
        best = None
        for j in candidates:
            frame = _get_frame(cap, j)
            if frame is None:
                continue
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # Prefer a legible keyframe and avoid excessively blurred transition frames.
            sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            score = min(450, sharpness)
            if best is None or score > best[0]:
                best = (score, j, frame)
        if best is None:
            continue
        _, j, frame = best
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        palette = lab_palette([cv2.resize(rgb, (55, 31), interpolation=cv2.INTER_AREA).reshape(-1, 3)], size=6)
        name = f'shot-{index+1:03d}.jpg'
        cv2.imwrite(str(out_dir / name), frame)
        info = {'id':index + 1, 'start_seconds':round(start/fps, 3),
                'end_seconds':round(end/fps,3), 'duration_seconds':round((end-start)/fps,3),
                'keyframe_seconds':round(j/fps,3), 'keyframe':f'scenes/{name}',
                'palette':palette,
                'brightness':round(float(hsv[...,2].mean())/255,3),
                'saturation':round(float(hsv[...,1].mean())/255,3),
                'sharpness':round(float(best[0]),2)}
        shots.append(info)
        if index < 12:
            x = (index % 3) * 320
            y = (index // 3) * 212
            sheet.paste(Image.fromarray(rgb), (x,y))
            draw.text((x+8, y+182), f'SHOT {index+1} / {start/fps:.1f}-{end/fps:.1f}s', fill='#f2e3cf')
    cap.release()
    if not shots:
        return {'status':'no_keyframes', 'detector':engine, 'shots':[], 'selected_scene_id':None}
    # Longest source shot is a deterministic default, not a claim about narrative importance.
    selected = max(shots, key=lambda s: (s['duration_seconds'], s['sharpness']))
    sheet.save(out / 'scene_contact_sheet.jpg', quality=88)
    data = {'status':'ready','detector':engine, 'source_version':PIN if native_pyscenedetect else None,
            'selected_scene_id':selected['id'],'selection_method':'longest shot (review suggested)',
            'shots':shots,'truncated':len(detected)>64,
            'caution':'Shot transitions are edits, not gameplay boundaries; colors are references, not exact source assets.'}
    (out_dir / 'scene_map.json').write_text(json.dumps(data, indent=2, ensure_ascii=False)+'\n',encoding='utf-8')
    return data
