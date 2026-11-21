#!/usr/bin/env python3
"""Game Style Forge: video fingerprint, repo registry and incremental game assembly."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / 'references' / 'projects.json'
TEMPLATE = ROOT / 'templates'


def load_json(p: Path, default=None):
    return json.loads(p.read_text('utf-8')) if p.exists() else (default if default is not None else {})


def save_json(p: Path, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def projects():
    return sorted(load_json(REGISTRY)['projects'], key=lambda x: x['stage'])


def repo_by_id(name: str):
    match = next((x for x in projects() if x['id'] == name), None)
    if not match:
        raise ValueError('Unknown curated repo: ' + name)
    return match


def analyze(args):
    try:
        import cv2
        import numpy as np
        from PIL import Image, ImageDraw
    except ImportError as e:
        raise SystemExit('Install video analyzer: python -m pip install opencv-python numpy pillow') from e
    from vision_opencv import motion_fingerprint, lab_palette
    src = Path(args.video).expanduser().resolve()
    if not src.is_file():
        raise SystemExit('Video file not found: ' + str(src))
    out = Path(args.out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(str(src))
    if not cap.isOpened():
        raise SystemExit('Cannot decode the video (check file/codec).')
    count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    fps = float(cap.get(cv2.CAP_PROP_FPS) or 0)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    duration = count / fps if count > 0 and fps > 0 else None
    # Sample at most 16 points to keep latency and memory bounded.
    samples = []
    if count > 0:
        targets = np.unique(np.linspace(0, count - 1, min(12, count), dtype=int))
        for idx in targets:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ok, frame = cap.read()
            if ok: samples.append((int(idx), cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
    else:
        # Some codecs do not expose frame_count. Probe first ~1 min of frames.
        stride = max(1, int(fps or 24))
        for i in range(60 * stride):
            ok, frame = cap.read()
            if not ok: break
            if i % max(1, stride * 5) == 0:
                samples.append((i, cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
            if len(samples) >= 12: break
    cap.release()
    if not samples:
        raise SystemExit('No decodable frames.')
    grays, sat, brights, edges, pal = [], [], [], [], []
    thumbnails, rgb_colors = [], []
    for idx, rgb in samples:
        resized = cv2.resize(rgb, (320, 180), interpolation=cv2.INTER_AREA)
        hsv = cv2.cvtColor(resized, cv2.COLOR_RGB2HSV)
        gray = cv2.cvtColor(resized, cv2.COLOR_RGB2GRAY)
        canny = cv2.Canny(gray, 70, 150)
        grays.append(gray)
        sat.append(float(hsv[:, :, 1].mean()) / 255)
        brights.append(float(hsv[:, :, 2].mean()) / 255)
        edges.append(float(np.count_nonzero(canny)) / canny.size)
        thumb = Image.fromarray(resized)
        thumbnails.append((idx, thumb))
        color_samples = cv2.resize(resized, (50, 28), interpolation=cv2.INTER_AREA).reshape(-1, 3)
        rgb_colors.append(color_samples)
    pixels = np.concatenate(rgb_colors)
    # Simple color histogram, snapped into a perceptual-ish fixed RGB cube.
    levels = (pixels // 32).astype(int)
    keys, amounts = np.unique(levels, axis=0, return_counts=True)
    top_idx = np.argsort(amounts)[-8:][::-1]
    palette = ['#' + ''.join(f'{min(255, int(z)*32+16):02x}' for z in keys[i]) for i in top_idx]
    motion = [float(np.abs(grays[i].astype('float32')-grays[i-1]).mean()) / 255 for i in range(1, len(grays))]
    avg_edge = float(np.mean(edges))
    avg_sat = float(np.mean(sat))
    # These are starting hypotheses, never exact pipeline inferences.
    hints = []
    if avg_sat < .2: hints.append('low_saturation')
    if avg_sat > .50: hints.append('rich_color')
    if avg_edge < .07: hints.append('soft_forms_or_fog')
    if avg_edge > .17: hints.append('high_outline_density')
    if float(np.mean(brights)) < .3: hints.append('low_key_lighting')
    if len(motion) and float(np.median(motion)) > .12: hints.append('high_frame_difference_possible_camera_motion')
    canvas = Image.new('RGB', (320*3, 212*4), '#12151d')
    draw = ImageDraw.Draw(canvas)
    for n, (idx, im) in enumerate(thumbnails):
        x, y = (n % 3)*320, (n // 3)*212
        canvas.paste(im, (x, y))
        draw.text((x+8, y+183), f'frame {idx}', fill='#e9eaeb')
    canvas.save(out / 'contact_sheet.jpg', quality=88)
    profile = {
        'source_filename': src.name,
        'video': {'width': w, 'height': h, 'fps': fps, 'duration_seconds': duration, 'sampled_frames': len(samples)},
        'measured': {'mean_saturation': round(avg_sat, 3), 'mean_brightness': round(float(np.mean(brights)), 3), 'edge_fraction': round(avg_edge, 3), 'mean_frame_difference': round(float(np.mean(motion)) if motion else 0, 3)},
        'palette': palette,
        'visual_hints_not_certainties': hints,
        'semantic_notes': {'projection': 'unknown', 'camera': 'unknown', 'art_medium': 'unknown', 'shading': 'unknown', 'character_identity': 'unknown', 'world_layers': ['deep', 'mid', 'near', 'screen']},
        'reference': 'Video pixels do not reveal the original source code, underlying geometry or license.'
    }
    # OpenCV 4.13 adapter: temporal optical flow is measured from true consecutive
    # frames, NOT from far-apart contact sheet samples. Preserve earlier fields.
    integrated = load_json(out / 'integrations.lock.json', {'integrated': {}}).get('integrated', {})
    if 'opencv' in integrated:
        spec = load_json(ROOT / 'references' / 'opencv-snapshot.json')
        if integrated['opencv'].get('commit') != spec['commit']:
            raise SystemExit('OpenCV profile requested with a mismatched pinned snapshot.')
        profile['opencv'] = {'source_tag': spec['tag'], 'runtime_version': cv2.__version__,
                              'optical_flow': motion_fingerprint(src, [idx for idx, _ in samples], out),
                              'palette_lab': lab_palette(rgb_colors)}
        profile['measured']['analysis_level'] = 'OpenCV 4.13.0: Lab palette and adjacent-frame optical flow'
        if len(profile['opencv']['palette_lab']) >= 3:
            profile['palette'] = profile['opencv']['palette_lab']
    # Keep independently approved depth data when video is re-analyzed.
    old_profile=load_json(out/'style_profile.json')
    if old_profile.get('relative_depth') and (out/'depth/depth_profile.json').exists():
        profile['relative_depth']=old_profile['relative_depth']
    save_json(out / 'style_profile.json', profile)
    # Stage 8: shot-aware segmentation + representative per-shot palettes.
    # Only active after explicitly installing the pinned project into this workspace.
    if 'pyscenedetect' in integrated:
        spec = load_json(ROOT / 'references' / 'pyscenedetect-snapshot.json')
        state = integrated['pyscenedetect']
        if state.get('commit') != spec['commit'] or state.get('git_blobs') != spec['git_blobs']:
            raise SystemExit('Pinned PySceneDetect manifest mismatch.')
        from scenes_pyscenedetect import analyze_scene_shots
        scene_data = analyze_scene_shots(src, out, fps, duration, count)
        profile['pyscenedetect'] = scene_data
        profile['scene_boundaries_seconds'] = [v['start_seconds'] for v in scene_data.get('shots', [])[1:]]
        profile['scene_detector'] = scene_data['detector']
        # Intentional: preserve global OpenCV palette for backwards-compatible art.
        # Shot palettes are separate presets selectable via N in the game.
        save_json(out / 'style_profile.json', profile)
    else:
        profile['scene_detector'] = 'not_integrated'
        save_json(out / 'style_profile.json', profile)
    print(json.dumps({'profile': str(out / 'style_profile.json'), 'contact_sheet': str(out / 'contact_sheet.jpg'), 'hints': hints}, ensure_ascii=False))


def recommend(args):
    workspace = Path(args.workspace)
    profile = load_json(workspace / 'style_profile.json')
    lock = load_json(workspace / 'integrations.lock.json', {'integrated': {}})
    installed = set(lock.get('integrated', {}))
    results = []
    for p in projects():
        why = p['role']
        status = 'integrated' if p['id'] in installed else ('available' if set(p['requires']).issubset(installed) else 'needs ' + ', '.join(set(p['requires'])-installed))
        if p['id'] == 'midas' and 'soft_forms_or_fog' in profile.get('visual_hints_not_certainties', []):
            why += '; useful for a 2.5D atmospheric depth prototype'
        results.append({'id':p['id'], 'order':p['stage'], 'role':why, 'license':p['license'], 'status':status, 'url':p['homepage']})
    print(json.dumps(results, ensure_ascii=False, indent=2))


def verify_license(root: Path, expected: str):
    candidates = [p for p in root.iterdir() if p.is_file() and p.name.lower().startswith(('license','licence','copying'))]
    if not candidates:
        return False, 'Missing top-level license text'
    text = '\n'.join(p.read_text('utf-8', errors='ignore')[:16000] for p in candidates).lower()
    tests = {
        'MIT': ['mit license', 'permission is hereby granted, free of charge'],
        'BSD-3-Clause': ['bsd 3-clause', 'redistribution and use in source and binary forms'],
        'Zlib': ['zlib', 'this software is provided'],
        'Apache-2.0': ['apache license', 'apache-2.0'],
    }
    matches = any(token in text for token in tests.get(expected, [expected.lower()]))
    return matches, ', '.join(p.name for p in candidates)


def extend(args):
    workspace = Path(args.workspace).expanduser().resolve()
    lockpath = workspace / 'integrations.lock.json'
    lock = load_json(lockpath, {'schema':1, 'integrated': {}})
    entries = lock.setdefault('integrated', {})
    if args.next and 'webgl-noise' not in entries:
        return install_bundled(args)
    if args.next and 'webgl-noise' in entries and 'postprocessing' not in entries:
        return install_bundled_postfx(args)
    if args.next and 'postprocessing' in entries and 'rapier' not in entries:
        return install_bundled_rapier(args)
    if args.next and 'rapier' in entries and 'opencv' not in entries:
        return install_bundled_opencv(args)
    if args.next and 'opencv' in entries and 'midas' not in entries:
        return install_bundled_midas(args)
    if args.next and 'midas' in entries and 'pyscenedetect' not in entries:
        return install_bundled_scenes(args)
    if args.next and 'pyscenedetect' in entries and 'gltf-transform' not in entries:
        return install_bundled_gltf_transform(args)
    if args.next and 'gltf-transform' in entries and 'three-mesh-bvh' not in entries:
        return install_bundled_mesh_bvh(args)
    if args.next and 'three-bvh-csg' in entries and 'recast-navigation-js' not in entries:
        return install_bundled_navigation(args)
    if not args.next and args.project == 'recast-navigation-js':
        return install_bundled_navigation(args)
    if not args.next and args.project == 'three-mesh-bvh':
        return install_bundled_mesh_bvh(args)
    if not args.next and args.project == 'gltf-transform':
        return install_bundled_gltf_transform(args)
    if not args.next and args.project == 'opencv':
        return install_bundled_opencv(args)
    if not args.next and args.project == 'midas':
        return install_bundled_midas(args)
    if not args.next and args.project == 'pyscenedetect':
        return install_bundled_scenes(args)
    if args.next:
        choices = [p for p in projects() if p['id'] not in entries and set(p['requires']).issubset(entries)]
        if not choices: raise SystemExit('No more uninstalled dependency-ready modules.')
        p = choices[0]
    else:
        p = repo_by_id(args.project)
    if p['id'] in entries:
        raise SystemExit(f"Already integrated: {p['id']}. No duplicate/re-download.")
    missing = sorted(set(p['requires']) - set(entries))
    if missing: raise SystemExit('Install dependencies first: ' + ', '.join(missing))
    dest = workspace / 'sources' / p['id']
    if dest.exists(): raise SystemExit('Source folder already exists; do not overwrite: ' + str(dest))
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Exact allowlisted URL only. Cloning never invokes npm install or builds repo code.
    cmd = ['git', '-c', 'core.hooksPath=/dev/null', '-c', 'filter.lfs.smudge=', 'clone', '--depth', '1', '--single-branch', '--filter=blob:none', '--', p['repo'], str(dest)]
    env = dict(os.environ, GIT_TERMINAL_PROMPT='0', GIT_LFS_SKIP_SMUDGE='1')
    try:
        subprocess.run(cmd, env=env, timeout=180, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        sha = subprocess.check_output(['git','-C',str(dest),'rev-parse','HEAD'], text=True, timeout=15).strip()
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError) as e:
        shutil.rmtree(dest, ignore_errors=True)
        raise SystemExit(f"Repository download unavailable: {p['repo']} ({str(e)[:300]}). No integration recorded.") from e
    ok, evidence = verify_license(dest, p['license'])
    if not ok:
        shutil.rmtree(dest, ignore_errors=True)
        raise SystemExit(f"License cannot be verified for {p['id']} at {sha}: {evidence}. Not integrated.")
    entries[p['id']] = {'source':p['homepage'], 'commit':sha, 'license':p['license'], 'license_files':evidence,
                        'feature':p['feature'], 'retrieved_at_utc':datetime.now(timezone.utc).isoformat()}
    save_json(lockpath, lock)
    print(json.dumps({'integrated':p['id'],'commit':sha,'lockfile':str(lockpath),'stage':p['stage']}, ensure_ascii=False))



def _git_blob_sha256compatible(data: bytes) -> str:
    """Git blob SHA-1, NOT a raw file SHA-1; matches GitHub blob identifiers."""
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def install_bundled(args):
    """Install the pinned, exact-source webgl-noise GLSL subset retrieved from GitHub.

    This is an explicitly partial source snapshot, not a claim that a full repo was cloned.
    """
    workspace = Path(args.workspace).expanduser().resolve()
    source = ROOT / 'vendor' / 'webgl-noise'
    dest = workspace / 'sources' / 'webgl-noise'
    spec = load_json(ROOT / 'references' / 'webgl-noise-snapshot.json')
    if dest.exists():
        raise SystemExit('Pinned source already exists; no overwriting: ' + str(dest))
    lockpath = workspace / 'integrations.lock.json'
    lock = load_json(lockpath, {'schema':1, 'integrated':{}})
    entries = lock.setdefault('integrated', {})
    if 'webgl-noise' in entries:
        raise SystemExit('Already integrated: webgl-noise')
    # Three.js is a pre-existing pinned npm dependency in the game generator;
    # its Git source checkout is NOT falsely marked as installed here.
    for relative, expected in spec['git_blobs'].items():
        f = source / relative
        if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != expected:
            raise SystemExit('Vendored source integrity mismatch: ' + relative)
    ok, license_files = verify_license(source, 'MIT')
    if not ok:
        raise SystemExit('Vendored MIT LICENSE could not be verified: ' + license_files)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, dest)
    entries['webgl-noise'] = {
        'source': spec['url'], 'commit': spec['commit'],
        'license': 'MIT', 'license_files': license_files,
        'feature': 'noise', 'method': 'GitHub API pinned-file snapshot',
        'partial_snapshot': True, 'git_blobs': spec['git_blobs'],
        'integrates_with': 'three@0.186.1 (npm build dependency)',
        'retrieved_at_utc': datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath, lock)
    print(json.dumps({'integrated':'webgl-noise', 'commit':spec['commit'],
        'files':list(spec['git_blobs']), 'partial_source':True,
        'lockfile':str(lockpath)}, ensure_ascii=False))

def install_bundled_postfx(args):
    """Install a pin-checked upstream *partial* source snapshot for postprocessing.

    The actual runtime is the exact npm postprocessing version, NOT the vendored
    excerpts. That npm dependency gets installed by the game's npm install step.
    """
    workspace = Path(args.workspace).expanduser().resolve()
    source = ROOT / 'vendor' / 'postprocessing'
    dest = workspace / 'sources' / 'postprocessing'
    spec = load_json(ROOT / 'references' / 'postprocessing-snapshot.json')
    lockpath = workspace / 'integrations.lock.json'
    lock = load_json(lockpath, {'schema':1,'integrated':{}})
    entries = lock.setdefault('integrated', {})
    if 'postprocessing' in entries or dest.exists():
        raise SystemExit('postprocessing already present; no overwrite')
    if 'webgl-noise' not in entries:
        raise SystemExit('Install pinned webgl-noise first: postprocessing reuses its 2D GLSL for atmospheric screen haze.')
    if 'postprocessing' in entries: raise SystemExit('Already integrated postprocessing')
    for relative, sha in spec['git_blobs'].items():
        file = source / relative
        if not file.is_file() or _git_blob_sha256compatible(file.read_bytes()) != sha:
            raise SystemExit('postprocessing upstream source SHA mismatch: ' + relative)
    ok, lic = verify_license(source, 'Zlib')
    if not ok: raise SystemExit('postprocessing Zlib LICENSE missing')
    # Upstream says three >=0.168 <0.188; bundled engine uses 0.186.1.
    if spec['peer_dependencies']['three'] != '>=0.168.0 <0.188.0':
        raise SystemExit('Unexpected upstream Three.js compatibility. Refusing integration.')
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, dest)
    entries['postprocessing'] = {
        'source':spec['url'],'commit':spec['commit'],'tag':spec['tag'],
        'license':spec['license'],'license_files':lic,'feature':'postfx',
        'method':'GitHub API pinned-file snapshot','partial_snapshot':True,
        'runtime_package':'postprocessing@6.39.6','requires_runtime_npm_install':True,
        'integrates_with':['three@0.186.1','webgl-noise (2D GLSL)'],
        'git_blobs':spec['git_blobs'],
        'retrieved_at_utc':datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath,lock)
    print(json.dumps({'integrated':'postprocessing','commit':spec['commit'],
                      'files':list(spec['git_blobs']),'partial_source':True,
                      'runtime':'npm install --ignore-scripts','lockfile':str(lockpath)},ensure_ascii=False))



def install_bundled_rapier(args):
    """Verify and install a pinned subset of upstream Rapier TypeScript sources.

    The complete WASM engine is not vendored: its pinned runtime is resolved by
    npm while building the generated game. This command must not imply a clone.
    """
    workspace = Path(args.workspace).expanduser().resolve()
    source = ROOT / 'vendor' / 'rapier'
    dest = workspace / 'sources' / 'rapier'
    spec = load_json(ROOT / 'references' / 'rapier-snapshot.json')
    lockpath = workspace / 'integrations.lock.json'
    lock = load_json(lockpath, {'schema':1,'integrated':{}})
    entries = lock.setdefault('integrated', {})
    if 'rapier' in entries or dest.exists():
        raise SystemExit('Rapier already installed; refusing overwrite.')
    if 'webgl-noise' not in entries or 'postprocessing' not in entries:
        raise SystemExit('Install pinned webgl-noise and postprocessing first.')
    for relative, sha in spec['git_blobs'].items():
        f = source / relative
        if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != sha:
            raise SystemExit('Rapier upstream source checksum mismatch: ' + relative)
    ok, lic = verify_license(source, 'Apache-2.0')
    if not ok:
        raise SystemExit('Bundled Apache-2.0 notice missing.')
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, dest)
    entries['rapier'] = {
        'source':spec['url'], 'commit':spec['commit'], 'license':spec['license'],
        'license_files':lic, 'license_source':spec['license_source'],
        'feature':'physics', 'method':'GitHub API pinned-file snapshot',
        'partial_snapshot':True, 'git_blobs':spec['git_blobs'],
        'runtime_package':'@dimforge/rapier3d-compat@0.21.0',
        'requires_runtime_npm_install':True,
        'integrates_with':['three@0.186.1','webgl-noise','postprocessing@6.39.6'],
        'retrieved_at_utc':datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath, lock)
    print(json.dumps({'integrated':'rapier','partial_source':True,
        'runtime':'npm install --ignore-scripts', 'commit':spec['commit'],
        'files':list(spec['git_blobs']), 'lockfile':str(lockpath)},ensure_ascii=False))



def install_bundled_opencv(args):
    """Install the verified partial OpenCV 4.13 source snapshot.

    Python cv2 native bindings are supplied separately by the pinned PyPI wheel;
    this command does not imply a full C++ repository clone or wheel installation.
    """
    workspace = Path(args.workspace).expanduser().resolve()
    source = ROOT / 'vendor' / 'opencv'
    dest = workspace / 'sources' / 'opencv'
    spec = load_json(ROOT / 'references' / 'opencv-snapshot.json')
    lockpath = workspace / 'integrations.lock.json'
    lock = load_json(lockpath, {'schema':1, 'integrated': {}})
    entries = lock.setdefault('integrated', {})
    if dest.exists() or 'opencv' in entries:
        raise SystemExit('OpenCV already installed; do not overwrite.')
    if not set(('webgl-noise','postprocessing','rapier')).issubset(entries):
        raise SystemExit('Install bundled GLSL, postprocessing and Rapier before this OpenCV stage.')
    for relative, expected in spec['git_blobs'].items():
        f = source / relative
        if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != expected:
            raise SystemExit('OpenCV GitHub source checksum mismatch: ' + relative)
    ok, license_files = verify_license(source, 'Apache-2.0')
    if not ok:
        raise SystemExit('OpenCV Apache-2.0 source license cannot be verified.')
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, dest)
    entries['opencv'] = {
        'source':spec['url'], 'commit':spec['commit'], 'tag':spec['tag'],
        'license':spec['license'], 'license_files':license_files,
        'feature':'vision', 'method':'GitHub API pinned-file snapshot',
        'partial_snapshot':True,'git_blobs':spec['git_blobs'],
        'runtime_python_package':spec['runtime_python_package'],
        'requires_runtime_pip_install':True,
        'analysis':'Lab palette clustering + Farneback adjacent-frame optical flow',
        'integrates_with':['three@0.186.1','webgl-noise','postprocessing@6.39.6','rapier@0.21.0'],
        'retrieved_at_utc': datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath, lock)
    print(json.dumps({'integrated':'opencv','source_tag':spec['tag'],
          'partial_source':True,'runtime':spec['runtime_python_package'],
          'lockfile':str(lockpath)}, ensure_ascii=False))



def install_bundled_midas(args):
    """Install a verified small MiDaS code snapshot (NOT weights or full network)."""
    workspace=Path(args.workspace).expanduser().resolve()
    source=ROOT/'vendor'/'midas'
    dest=workspace/'sources'/'midas'
    spec=load_json(ROOT/'references'/'midas-snapshot.json')
    lockpath=workspace/'integrations.lock.json'
    lock=load_json(lockpath,{'schema':1,'integrated':{}})
    entries=lock.setdefault('integrated',{})
    if 'midas' in entries or dest.exists():
        raise SystemExit('MiDaS already integrated; refusing overwrite.')
    if 'opencv' not in entries:
        raise SystemExit('MiDaS requires the OpenCV analysis stage.')
    for relative,blob in spec['git_blobs'].items():
        f=source/relative
        if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != blob:
            raise SystemExit('MiDaS source snapshot hash mismatch: '+relative)
    ok,lic=verify_license(source,'MIT')
    if not ok: raise SystemExit('MIT license missing in MiDaS snapshot.')
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copytree(source,dest)
    entries['midas']={
      'source':spec['url'],'commit':spec['commit'],'license':'MIT',
      'license_files':lic,'feature':'depth','partial_snapshot':True,
      'method':'GitHub pinned source excerpt','git_blobs':spec['git_blobs'],
      'model_weights_bundled':False,'runtime_model':spec['model'],
      'requires_local_full_repo_for_inference':True,
      'supports_imported_depth_map':True,
      'integrates_with':['OpenCV reference frames','Three.js 2.5D depth planes',
                         'Ashima GLSL atmospheric haze','postprocessing full-screen grade',
                         'Rapier 3D gameplay colliders remain independent'],
      'retrieved_at_utc':datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath,lock)
    print(json.dumps({'integrated':'midas','source':spec['url'],
      'partial_source':True,'model_weights_bundled':False,
      'commit':spec['commit'],'lockfile':str(lockpath)},ensure_ascii=False))



def install_bundled_scenes(args):
    """Install a pinned, partial PySceneDetect source snapshot and shot adapter.

    No git clone, installed Python wheel, or C++/native video runtime is claimed.
    PySceneDetect 0.7.3 is installed separately via pip in the analysis environment.
    """
    workspace = Path(args.workspace).expanduser().resolve()
    lockpath = workspace / 'integrations.lock.json'
    lock = load_json(lockpath, {'schema': 1, 'integrated': {}})
    entries = lock.setdefault('integrated', {})
    spec = load_json(ROOT / 'references' / 'pyscenedetect-snapshot.json')
    origin = ROOT / 'vendor' / 'pyscenedetect'
    dest = workspace / 'sources' / 'pyscenedetect'
    if dest.exists() or 'pyscenedetect' in entries:
        raise SystemExit('PySceneDetect already integrated; not overwriting.')
    if 'opencv' not in entries or 'midas' not in entries:
        raise SystemExit('PySceneDetect shot stage requires existing OpenCV and MiDaS adapters.')
    for relative, expected in spec['git_blobs'].items():
        file = origin / relative
        if not file.is_file() or _git_blob_sha256compatible(file.read_bytes()) != expected:
            raise SystemExit('PySceneDetect pinned GitHub source integrity mismatch: ' + relative)
    ok, license_files = verify_license(origin, 'BSD-3-Clause')
    if not ok:
        raise SystemExit('PySceneDetect BSD-3-Clause notice missing.')
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(origin, dest)
    entries['pyscenedetect'] = {
        'source':spec['url'], 'commit':spec['commit'], 'tag':spec['tag'],
        'license':spec['license'], 'license_files':license_files,
        'git_blobs':spec['git_blobs'], 'feature':'shot segmentation',
        'partial_snapshot':True, 'method':'GitHub connector pinned-file snapshot',
        'runtime_python_package':'scenedetect==0.7.3',
        'requires_runtime_pip_install':True,
        'integrates_with':['OpenCV Lab palette/optical flow',
                           'MiDaS depth-map keyframe selection',
                           'Three.js scene color presets',
                           'postprocessing scene grade; Rapier collision model unchanged'],
        'retrieved_at_utc':datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath,lock)
    print(json.dumps({'integrated':'pyscenedetect','partial_source':True,
        'runtime_requires':'scenedetect==0.7.3', 'commit':spec['commit'],
        'lockfile':str(lockpath)},ensure_ascii=False))

def install_bundled_gltf_transform(args):
    """Install exact pinned upstream source snapshot + safe local asset optimizer adapter.

    This is NOT a full upstream repo or installed npm CLI. The source snapshot
    contains an upstream meshopt transform for review/provenance. CLI binaries
    are separately fetched and installed only in a networked build workspace.
    """
    workspace=Path(args.workspace).expanduser().resolve()
    lockpath=workspace/'integrations.lock.json'
    lock=load_json(lockpath,{'schema':1,'integrated':{}})
    entries=lock.setdefault('integrated',{})
    if 'gltf-transform' in entries:raise SystemExit('glTF-Transform already installed; keeping existing version')
    if 'pyscenedetect' not in entries:
        raise SystemExit('glTF-Transform stage follows the existing analysis stack (pyscenedetect)')
    spec=load_json(ROOT/'references/gltf-transform-snapshot.json')
    origin=ROOT/'vendor/gltf-transform'
    dest=workspace/'sources/gltf-transform'
    if dest.exists():raise SystemExit('Source directory already exists, refusing overwrite')
    for name,git_sha in spec['git_blobs'].items():
        f=origin/name
        if not f.is_file() or _git_blob_sha256compatible(f.read_bytes())!=git_sha:
            raise SystemExit('Pinned upstream glTF-Transform Git blob mismatch: '+name)
    ok,lic=verify_license(origin,'MIT')
    if not ok:raise SystemExit('Missing MIT license in glTF-Transform source snapshot')
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copytree(origin,dest)
    entries['gltf-transform']={
      'source':spec['url'], 'commit':spec['commit'], 'tag':spec['tag'],
      'license':'MIT', 'license_files':lic,'git_blobs':spec['git_blobs'],
      'partial_snapshot':True,'method':'GitHub connector pinned-file snapshot',
      'feature':'asset optimization + Three.js meshopt loading',
      'runtime_cli':'@gltf-transform/cli@4.5.1',
      'requires_separate_npm_install':True,
      'protect_author_hero':True,
      'integrates_with':['Three.js GLTFLoader + MeshoptDecoder',
                         'Rapier optional explicit static collision boxes',
                         'OpenCV/MiDaS/PySceneDetect do not modify authored GLB',
                         'GLSL and postprocessing continue unchanged'],
      'retrieved_at_utc':datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath,lock)
    print(json.dumps({'integrated':'gltf-transform','partial_source':True,
       'runtime_cli_installed':False,'version':'4.5.1','commit':spec['commit'],
       'lockfile':str(lockpath)},ensure_ascii=False))


def install_bundled_mesh_bvh(args):
    """Integrate verified partial GitHub source plus pinned npm BVH adapter.

    Never claim the entire npm package has been bundled or imported from disk.
    Rapier stays the only physics engine; BVH performs static visual ray queries.
    """
    workspace=Path(args.workspace).expanduser().resolve()
    lockpath=workspace/'integrations.lock.json'
    lock=load_json(lockpath,{'schema':1,'integrated':{}})
    entries=lock.setdefault('integrated',{})
    if 'three-mesh-bvh' in entries:raise SystemExit('three-mesh-bvh already integrated, no replacement')
    if 'gltf-transform' not in entries or 'rapier' not in entries:
        raise SystemExit('three-mesh-bvh requires existing glTF-Transform + Rapier capability')
    spec=load_json(ROOT/'references/three-mesh-bvh-snapshot.json')
    origin=ROOT/'vendor/three-mesh-bvh'
    dest=workspace/'sources/three-mesh-bvh'
    if dest.exists():raise SystemExit('Pinned source snapshot already exists; refusing overwrite')
    for rel, expected in spec['git_blobs'].items():
        f=origin/rel
        if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != expected:
            raise SystemExit('Pinned three-mesh-bvh source integrity failure: '+rel)
    ok,licenses=verify_license(origin,'MIT')
    if not ok: raise SystemExit('MIT license not found in three-mesh-bvh source')
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copytree(origin,dest)
    entries['three-mesh-bvh']={
        'source':spec['url'],'commit':spec['commit'],'tag':spec['tag'],
        'version':spec['version'],'license':'MIT','license_files':licenses,
        'git_blobs':spec['git_blobs'],'feature':'static geometry visual BVH',
        'partial_snapshot':True,'method':'GitHub connector pinned-file snapshot',
        'runtime_package':'three-mesh-bvh@0.9.18',
        'requires_separate_npm_install':True,
        'integrates_with':['glTF-Transform GLB static meshes + Meshopt decoding',
                           'Three.js exact surface raycasts and camera occlusion',
                           'Rapier collision model untouched',
                           'GSFL author artwork/depth/shaders/postprocessing unchanged'],
        'retrieved_at_utc':datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath,lock)
    print(json.dumps({'integrated':'three-mesh-bvh','partial_source':True,
        'runtime_installed':False,'commit':spec['commit'],
        'runtime_package':'three-mesh-bvh@0.9.18','lockfile':str(lockpath)},ensure_ascii=False))


def install_bundled_csg(args):
    """Install a pinned source excerpt for CSG; npm runtime remains separate.

    CSG geometry is for authored static props. Rapier remains collision authority.
    """
    workspace=Path(args.workspace).expanduser().resolve()
    lockpath=workspace/'integrations.lock.json'
    lock=load_json(lockpath,{'schema':1,'integrated':{}})
    entries=lock.setdefault('integrated',{})
    if 'three-bvh-csg' in entries:raise SystemExit('three-bvh-csg already integrated')
    for dep in ('three-mesh-bvh','gltf-transform','rapier'):
        if dep not in entries:raise SystemExit('Missing CSG prerequisite: '+dep)
    spec=load_json(ROOT/'references/three-bvh-csg-snapshot.json')
    origin=ROOT/'vendor/three-bvh-csg'
    dest=workspace/'sources/three-bvh-csg'
    if dest.exists():raise SystemExit('CSG source already exists; refusing overwrite')
    for rel,expected in spec['git_blobs'].items():
        f=origin/rel
        if not f.is_file() or _git_blob_sha256compatible(f.read_bytes())!=expected:
            raise SystemExit('Pinned three-bvh-csg source digest mismatch: '+rel)
    ok,license_files=verify_license(origin,'MIT')
    if not ok:raise SystemExit('Missing three-bvh-csg MIT license')
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copytree(origin,dest)
    entries['three-bvh-csg']={
        'source':spec['url'],'commit':spec['commit'],'tag':spec['tag'],
        'version':spec['version'],'license':'MIT','license_files':license_files,
        'git_blobs':spec['git_blobs'],'partial_snapshot':True,
        'method':'GitHub connector pinned-file snapshot',
        'runtime_package':'three-bvh-csg@0.0.18',
        'requires_separate_npm_install':True,
        'feature':'CSG authentic carved 3D geometry',
        'integrates_with':['Three.js static architecture','three-mesh-bvh visual raycast',
                           'Rapier manually authored solid collision proxies',
                           'glTF-Transform static GLB assets (without modifying original)',
                           'Ashima GLSL and postprocessing atmosphere'],
        'retrieved_at_utc':datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath,lock)
    print(json.dumps({'integrated':'three-bvh-csg','partial_source':True,
        'runtime_installed':False,'commit':spec['commit'],
        'runtime_package':'three-bvh-csg@0.0.18','lockfile':str(lockpath)},ensure_ascii=False))



def install_bundled_navigation(args):
    """Source-pinned Recast/Detour routing adapter. Full WASM runtime via npm only."""
    workspace=Path(args.workspace).expanduser().resolve()
    lockpath=workspace/'integrations.lock.json'
    lock=load_json(lockpath,{'schema':1,'integrated':{}})
    entries=lock.setdefault('integrated',{})
    if 'recast-navigation-js' in entries:raise SystemExit('Recast navigation is already integrated.')
    for dep in ('three-bvh-csg','three-mesh-bvh','rapier','gltf-transform'):
        if dep not in entries:raise SystemExit('Missing nav prerequisite: '+dep)
    spec=load_json(ROOT/'references/recast-navigation-js-snapshot.json')
    origin=ROOT/'vendor/recast-navigation-js'
    dest=workspace/'sources/recast-navigation-js'
    if dest.exists():raise SystemExit('Navigation source already exists; refusing overwrite')
    for rel,expected in spec['git_blobs'].items():
        src=origin/rel
        if not src.is_file() or _git_blob_sha256compatible(src.read_bytes())!=expected:
            raise SystemExit('Pinned Recast navigation Git blob mismatch: '+rel)
    ok,lic=verify_license(origin,'MIT')
    if not ok:raise SystemExit('Missing pinned Recast MIT license')
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copytree(origin,dest)
    entries['recast-navigation-js']={
        'source':spec['url'],'commit':spec['commit'],'tag':spec['tag'],'version':'0.44.0',
        'license':'MIT','license_files':lic,'git_blobs':spec['git_blobs'],
        'partial_snapshot':True,'method':'GitHub connector pinned-file snapshot',
        'feature':'CSG-aware navmesh generation and autonomous NPC paths',
        'runtime_packages':spec['runtime_packages'],'requires_separate_npm_install':True,
        'integrates_with':['Three.js authored walkable geometry','three-bvh-csg carved archways',
                           'three-mesh-bvh static query acceleration','Rapier NPC kinematic collision bodies',
                           'OpenCV lighting palette / GLSL atmosphere / postprocessing preserved'],
        'retrieved_at_utc':datetime.now(timezone.utc).isoformat()
    }
    save_json(lockpath,lock)
    print(json.dumps({'integrated':'recast-navigation-js','partial_source':True,
        'wasm_runtime_installed':False,'commit':spec['commit'],
        'runtime_packages':spec['runtime_packages'],'lockfile':str(lockpath)},ensure_ascii=False))

def build(args):
    workspace = Path(args.workspace).expanduser().resolve()
    dest = Path(args.out).expanduser().resolve()
    dest.mkdir(parents=True, exist_ok=True)
    src = dest / 'src'
    src.mkdir(exist_ok=True)
    (src / 'custom').mkdir(exist_ok=True)
    style = load_json(workspace / 'style_profile.json', {'palette':['#161b2e','#778497','#cfb58d']})
    lock = load_json(workspace / 'integrations.lock.json', {'integrated': {}})
    active = set(lock.get('integrated', {}))
    # Core renderer is required as a Vite package even if GitHub cloning is not yet complete.
    dependencies = {'three':'0.186.1'}
    if 'postprocessing' in active: dependencies['postprocessing'] = '6.39.6'
    if 'rapier' in active: dependencies['@dimforge/rapier3d-compat'] = '0.21.0'
    if 'three-mesh-bvh' in active: dependencies['three-mesh-bvh'] = '0.9.18'
    if 'three-bvh-csg' in active: dependencies['three-bvh-csg'] = '0.0.18'
    if 'recast-navigation-js' in active:
        dependencies['recast-navigation'] = '0.44.0'
        dependencies['@recast-navigation/three'] = '0.44.0'
    package = {'name':'game-style-forge-scene','version':'1.0.0','private':True,'type':'module',
               'scripts':{'dev':'vite --host 0.0.0.0','build':'vite build','preview':'vite preview --host 0.0.0.0'},
               'dependencies':dependencies, 'devDependencies':{'vite':'^7.1.0'}}
    save_json(dest / 'package.json', package)
    palette = [str(x) for x in style.get('palette', []) if re.fullmatch(r'#[a-fA-F0-9]{6}', str(x))]
    if len(palette) < 3: palette = ['#141e32','#8a8690','#ccb28c']
    motion = style.get('opencv', {}).get('optical_flow', {}) if 'opencv' in active else {}
    motion = motion if motion.get('status') == 'measured' else {}
    # Depth only influences visuals when data exists and an explicitly tracked source is valid.
    depth_meta = load_json(workspace/'depth/depth_profile.json') if 'midas' in active else {}
    depth_ready=bool(depth_meta and (workspace/'depth/reference.png').is_file() and (workspace/'depth/relative-depth.png').is_file())
    config = {'depth':{'enabled':depth_ready,'source':depth_meta.get('source') if depth_ready else None,
                       'metric_depth':False,'near_fraction':depth_meta.get('near_fraction',0),
                       'fog':palette[1]},'palette':palette[:8],'features': sorted(active), 'video_hints':style.get('visual_hints_not_certainties', []),
              'visual':style.get('semantic_notes', {}), 'source_video':style.get('source_filename'),
              'vision': {
                  'opencv_enabled':'opencv' in active,
                  'edge_fraction':float(style.get('measured', {}).get('edge_fraction', .1)),
                  'mean_saturation':float(style.get('measured', {}).get('mean_saturation',.35)),
                  'mean_brightness':float(style.get('measured', {}).get('mean_brightness',.4)),
                  'motion': motion,
              }}
    # Shot-specific atmosphere presets come from the verified scene detector,
    # not from averaging unrelated daylight/nighttime shots together.
    if 'pyscenedetect' in active:
        shot_info = style.get('pyscenedetect', {})
        if shot_info.get('status') == 'ready':
            config['scene_presets'] = [{
                'id':v['id'], 'palette':v['palette'][:3],
                'brightness':v['brightness'], 'duration_seconds':v['duration_seconds']
            } for v in shot_info.get('shots', [])[:12] if len(v.get('palette',[])) >= 3]
            config['scene_selected_id'] = shot_info.get('selected_scene_id')
    save_json(src / 'config.json', config)
    for name in ['index.html', 'style.css', 'main.js']:
        t = TEMPLATE / name
        content = t.read_text('utf-8')
        if name == 'index.html': (dest / name).write_text(content, 'utf-8')
        else: (src / name).write_text(content, 'utf-8')
    mainjs = src / 'main.js'
    js = mainjs.read_text('utf-8').replace('/*POSTFX_LOADER*/ null', "() => import('./postfx.js')" if 'postprocessing' in active else 'null').replace('/*RAPIER_LOADER*/ null', "() => import('./physics.js')" if 'rapier' in active else 'null').replace('/*DEPTH_LOADER*/ null', "() => import('./depth.js')" if depth_ready else 'null').replace('/*ASSET_LOADER*/ null', "() => import('./assets.js')" if 'gltf-transform' in active and load_json(workspace/'assets/models.json', {'models':[]}).get('models') else 'null').replace('/*SPATIAL_LOADER*/ null', "() => import('./spatial.js')" if 'three-mesh-bvh' in active else 'null').replace('/*CSG_LOADER*/ null', "() => import('./csg.js')" if 'three-bvh-csg' in active else 'null').replace('/*NAV_LOADER*/ null', "() => import('./navigation.js')" if 'recast-navigation-js' in active else 'null')
    mainjs.write_text(js, 'utf-8')
    (src/'noise.js').write_text('export default \"\";\n','utf-8')
    # Copy only a license-checked shader, not third-party modules indiscriminately.
    notice = ['# Third-party dependencies','three: MIT — https://github.com/mrdoob/three.js']
    if 'webgl-noise' in active:
        vendor_src = workspace / 'sources' / 'webgl-noise'
        blobs = lock['integrated']['webgl-noise'].get('git_blobs', {})
        spec = load_json(ROOT / 'references' / 'webgl-noise-snapshot.json')
        if not blobs or blobs != spec['git_blobs']:
            raise SystemExit('webgl-noise manifest missing or mismatched; reinstall pinned snapshot.')
        vendor = src / 'vendor'; vendor.mkdir(exist_ok=True)
        for name in ['noise2D.glsl','noise3D.glsl']:
            relative = 'src/' + name
            upstream = vendor_src / relative
            if not upstream.is_file() or _git_blob_sha256compatible(upstream.read_bytes()) != blobs[relative]:
                raise SystemExit('Source integrity failed: ' + relative)
            shutil.copy2(upstream, vendor / name)
        lic = vendor_src / 'LICENSE'
        if not lic.is_file() or _git_blob_sha256compatible(lic.read_bytes()) != blobs['LICENSE']:
            raise SystemExit('Source license integrity failed.')
        shutil.copy2(lic, vendor / 'LICENSE.webgl-noise')
        (src / 'noise.js').write_text('import shader from "./vendor/noise2D.glsl?raw"; export default shader;\n','utf-8')
        (src / 'noise3D.js').write_text('import shader from "./vendor/noise3D.glsl?raw"; export default shader;\n','utf-8')
        notice.append('webgl-noise (2D + 3D GLSL): MIT; SHA ' + spec['commit'] + '; LICENSE in src/vendor/LICENSE.webgl-noise — https://github.com/ashima/webgl-noise')
    if 'postprocessing' in active:
        spec = load_json(ROOT / 'references' / 'postprocessing-snapshot.json')
        vendor_src = workspace / 'sources' / 'postprocessing'
        blobs = lock['integrated']['postprocessing'].get('git_blobs', {})
        if blobs != spec['git_blobs']:
            raise SystemExit('postprocessing source mismatch with pinned manifest')
        for rel, sha in blobs.items():
            file = vendor_src / rel
            if not file.is_file() or _git_blob_sha256compatible(file.read_bytes()) != sha:
                raise SystemExit('postprocessing source integrity failed: ' + rel)
        lic_dest = src / 'vendor' / 'LICENSE.postprocessing'
        lic_dest.parent.mkdir(exist_ok=True)
        shutil.copy2(vendor_src / 'LICENSE.md', lic_dest)
        shutil.copy2(TEMPLATE / 'postfx.js', src / 'postfx.js')
        notice.append('postprocessing@6.39.6: Zlib; SHA '+spec['commit'] + '; LICENSE in src/vendor/LICENSE.postprocessing — https://github.com/pmndrs/postprocessing')
    if 'rapier' in active:
        spec = load_json(ROOT / 'references' / 'rapier-snapshot.json')
        origin = workspace / 'sources' / 'rapier'
        checks = lock['integrated']['rapier'].get('git_blobs', {})
        if checks != spec['git_blobs']:
            raise SystemExit('Rapier manifest mismatch with upstream snapshot.')
        for rel, sha in checks.items():
            f = origin / rel
            if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != sha:
                raise SystemExit('Rapier source integrity failed: ' + rel)
        ok, _ = verify_license(origin, 'Apache-2.0')
        if not ok: raise SystemExit('Rapier license missing in source snapshot.')
        shutil.copy2(TEMPLATE / 'physics.js', src / 'physics.js')
        dst = src / 'vendor' / 'LICENSE.rapier'
        dst.parent.mkdir(exist_ok=True)
        shutil.copy2(origin / 'LICENSE', dst)
        notice.append('Rapier @dimforge/rapier3d-compat@0.21.0: Apache-2.0; '
                      'selected GitHub source at '+spec['commit']+
                      '; license in src/vendor/LICENSE.rapier — https://github.com/dimforge/rapier')
    if 'opencv' in active:
        spec = load_json(ROOT / 'references' / 'opencv-snapshot.json')
        origin = workspace / 'sources' / 'opencv'
        verified = lock['integrated']['opencv'].get('git_blobs', {})
        if verified != spec['git_blobs']:
            raise SystemExit('OpenCV registered snapshot does not match this plugin release.')
        for relative, expected in verified.items():
            f=origin / relative
            if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != expected:
                raise SystemExit('OpenCV source integrity failed: '+relative)
        # Python offline analysis only; no cv2 binaries in the browser game.
        dst = dest / 'tools' / 'opencv-sources'
        dst.mkdir(parents=True, exist_ok=True)
        shutil.copy2(origin / 'LICENSE', dst / 'LICENSE')
        shutil.copy2(origin / 'samples/python/opt_flow.py', dst / 'opt_flow.py')
        shutil.copy2(ROOT / 'scripts/vision_opencv.py', dst / 'vision_opencv.py')
        notice.append('OpenCV Python bindings (analysis, NOT browser runtime): '+
                      spec['runtime_python_package']+'; Apache-2.0, upstream sample '+
                      spec['tag']+' at '+spec['commit']+
                      '; license and pinned example in tools/opencv-sources/ — https://github.com/opencv/opencv')
    if 'midas' in active:
        spec=load_json(ROOT/'references/midas-snapshot.json')
        origin=workspace/'sources'/'midas'
        checks=lock['integrated']['midas'].get('git_blobs',{})
        if checks != spec['git_blobs'] or lock['integrated']['midas'].get('commit') != spec['commit']:
            raise SystemExit('MiDaS registered snapshot mismatch.')
        for relative,blob in checks.items():
            f=origin/relative
            if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != blob:
                raise SystemExit('MiDaS pinned code checksum mismatch: '+relative)
        lic_dst=dest/'tools/midas-sources'
        lic_dst.mkdir(parents=True,exist_ok=True)
        shutil.copy2(origin/'LICENSE',lic_dst/'LICENSE')
        shutil.copy2(origin/'midas/base_model.py',lic_dst/'base_model.py')
        shutil.copy2(ROOT/'scripts/depth_midas.py',lic_dst/'depth_midas.py')
        notice.append('MiDaS (optional Python depth): MIT code at '+spec['commit']+
                      '; PARTIAL pinned source in tools/midas-sources; no model weights bundled; '
                      'see https://github.com/isl-org/MiDaS')
        if depth_ready:
            from depth_midas import file_sha256
            c=workspace/'depth/reference.png'
            d=workspace/'depth/relative-depth.png'
            if (file_sha256(c)!=depth_meta.get('color_sha256') or
                file_sha256(d)!=depth_meta.get('depth_sha256')):
                raise SystemExit('Depth asset checksum mismatch. Do not silently replace the reference art.')
            save_dir=src/'depth'
            save_dir.mkdir(exist_ok=True)
            shutil.copy2(c,save_dir/'reference.png')
            shutil.copy2(d,save_dir/'relative-depth.png')
            shutil.copy2(TEMPLATE/'depth.js',src/'depth.js')
            (dest/'depth_profile.json').write_text(json.dumps(depth_meta,ensure_ascii=False,indent=2)+'\n','utf-8')
    if 'pyscenedetect' in active:
        spec=load_json(ROOT/'references/pyscenedetect-snapshot.json')
        origin=workspace/'sources/pyscenedetect'
        checks=lock['integrated']['pyscenedetect'].get('git_blobs',{})
        if checks != spec['git_blobs'] or lock['integrated']['pyscenedetect'].get('commit') != spec['commit']:
            raise SystemExit('PySceneDetect registered source snapshot mismatch.')
        for relative,expected in checks.items():
            f=origin/relative
            if not f.is_file() or _git_blob_sha256compatible(f.read_bytes()) != expected:
                raise SystemExit('PySceneDetect pinned file changed: '+relative)
        target=dest/'tools/pyscenedetect-sources'
        target.mkdir(parents=True,exist_ok=True)
        shutil.copy2(origin/'LICENSE', target/'LICENSE')
        shutil.copy2(ROOT/'scripts/scenes_pyscenedetect.py',target/'scenes_pyscenedetect.py')
        if (workspace/'scenes/scene_map.json').is_file():
            target_scene=dest/'reference-scenes'
            target_scene.mkdir(exist_ok=True)
            shutil.copy2(workspace/'scenes/scene_map.json',target_scene/'scene_map.json')
            sheet=workspace/'scene_contact_sheet.jpg'
            if sheet.is_file():shutil.copy2(sheet,target_scene/'scene_contact_sheet.jpg')
        notice.append('PySceneDetect 0.7.3 (offline video scene analysis, NOT browser runtime): '
                      'BSD-3-Clause; verified partial source at '+spec['commit']+
                      '; complete runtime separately installed via pip. See '
                      'tools/pyscenedetect-sources/LICENSE — https://github.com/Breakthrough/PySceneDetect')
    if 'three-mesh-bvh' in active:
        spec=load_json(ROOT/'references/three-mesh-bvh-snapshot.json')
        snapshot=lock['integrated']['three-mesh-bvh']
        vendor_src=workspace/'sources/three-mesh-bvh'
        if snapshot.get('git_blobs')!=spec['git_blobs'] or snapshot.get('commit')!=spec['commit']:
            raise SystemExit('three-mesh-bvh source lock mismatch')
        for rel, expected in spec['git_blobs'].items():
            f=vendor_src/rel
            if not f.is_file() or _git_blob_sha256compatible(f.read_bytes())!=expected:
                raise SystemExit('three-mesh-bvh pinned source damaged: '+rel)
        shutil.copy2(TEMPLATE/'spatial.js',src/'spatial.js')
        license_dir=dest/'third-party-source'
        license_dir.mkdir(parents=True,exist_ok=True)
        shutil.copy2(vendor_src/'LICENSE',license_dir/'LICENSE.three-mesh-bvh')
        notice.append('three-mesh-bvh@0.9.18: MIT, partial pinned GitHub source at '+spec['commit']+
                      '; bundled source is NOT runtime: install pinned npm package; license at '+
                      'third-party-source/LICENSE.three-mesh-bvh — https://github.com/gkjohnson/three-mesh-bvh')
    if 'three-bvh-csg' in active:
        spec=load_json(ROOT/'references/three-bvh-csg-snapshot.json')
        snapshot=lock['integrated']['three-bvh-csg']
        if snapshot.get('git_blobs')!=spec['git_blobs'] or snapshot.get('commit')!=spec['commit']:
            raise SystemExit('CSG source lock mismatch')
        source=workspace/'sources/three-bvh-csg'
        for rel, expected in spec['git_blobs'].items():
            f=source/rel
            if not f.is_file() or _git_blob_sha256compatible(f.read_bytes())!=expected:
                raise SystemExit('CSG pinned source modified: '+rel)
        shutil.copy2(TEMPLATE/'csg.js',src/'csg.js')
        third_party=dest/'third-party-source'
        third_party.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source/'LICENSE',third_party/'LICENSE.three-bvh-csg')
        notice.append('three-bvh-csg@0.0.18: MIT; pinned partial GitHub source '+spec['commit']+
                      '; full runtime fetched by npm, NOT bundled; license third-party-source/LICENSE.three-bvh-csg')
    if 'recast-navigation-js' in active:
        spec=load_json(ROOT/'references/recast-navigation-js-snapshot.json')
        snapshot=lock['integrated']['recast-navigation-js']
        origin=workspace/'sources/recast-navigation-js'
        if snapshot.get('git_blobs')!=spec['git_blobs'] or snapshot.get('commit')!=spec['commit']:
            raise SystemExit('Recast navigation source lock mismatch')
        for rel,expected in spec['git_blobs'].items():
            f=origin/rel
            if not f.is_file() or _git_blob_sha256compatible(f.read_bytes())!=expected:
                raise SystemExit('Recast navigation pinned upstream source modified: '+rel)
        shutil.copy2(TEMPLATE/'navigation.js',src/'navigation.js')
        shutil.copy2(TEMPLATE/'navigation-grid.js',src/'navigation-grid.js')
        notices=dest/'third-party-source'
        notices.mkdir(parents=True,exist_ok=True)
        shutil.copy2(origin/'LICENSE',notices/'LICENSE.recast-navigation-js')
        notice.append('recast-navigation-js@0.44.0 and @recast-navigation/three@0.44.0: MIT, '
            'GitHub tag '+spec['tag']+' commit '+spec['commit']+
            '; pinned partial source only, full WASM runtime installed separately by npm. '
            'LICENSE in third-party-source/LICENSE.recast-navigation-js. '
            'Fallback uses authored collision boxes, not estimated image geometry.')
    # Explicitly imported GLB assets, never generated hero replacements.
    if 'gltf-transform' in active:
        asset_manifest=load_json(workspace/'assets/models.json',{'schema':1,'models':[]})
        if asset_manifest.get('schema')!=1:raise SystemExit('Invalid GLB model manifest')
        modelcfg=[]
        from assets_gltf import read_glb, sha256
        for entry in asset_manifest.get('models',[]):
            if entry.get('hero_asset'):
                raise SystemExit('Hero art must not be modified by this pipeline')
            name=entry.get('name','')
            if not re.fullmatch(r'[a-z][a-z0-9_-]{0,63}',name):
                raise SystemExit('Invalid model asset name')
            key='optimized' if entry.get('selected')=='optimized' else 'raw'
            source=workspace/'assets/models'/key/(name+'.glb')
            sigkey='optimized_sha256' if key=='optimized' else 'source_sha256'
            if not source.is_file() or sha256(source)!=entry.get(sigkey):
                raise SystemExit('Model asset integrity error: '+name)
            read_glb(source)
            target=dest/'public/models'
            target.mkdir(parents=True,exist_ok=True)
            shutil.copy2(source,target/(name+'.glb'))
            modelcfg.append({'name':name,'position':entry.get('position',[4,0,-7]),
                             'scale':entry.get('scale',1),'collider':entry.get('collider'),
                             'optimized':key=='optimized'})
        config['models']=modelcfg
        save_json(src/'config.json',config)
        if modelcfg:
            shutil.copy2(TEMPLATE/'assets.js',src/'assets.js')
        vendor_src=workspace/'sources/gltf-transform'
        spec=load_json(ROOT/'references/gltf-transform-snapshot.json')
        snap=lock['integrated']['gltf-transform']
        if snap.get('git_blobs')!=spec['git_blobs'] or snap.get('commit')!=spec['commit']:
            raise SystemExit('glTF-Transform source lock version mismatch')
        for rel,blob in spec['git_blobs'].items():
            f=vendor_src/rel
            if not f.is_file() or _git_blob_sha256compatible(f.read_bytes())!=blob:
                raise SystemExit('glTF-Transform source snapshot modified: '+rel)
        notices=dest/'third-party-source'
        notices.mkdir(parents=True,exist_ok=True)
        shutil.copy2(vendor_src/'LICENSE.md',notices/'LICENSE.gltf-transform.md')
        notice.append('glTF-Transform v4.5.1: MIT, pinned partial source snapshot at '
           +spec['commit']+'; CLI installed separately. License: third-party-source/LICENSE.gltf-transform.md')
    for id in active:
        if id not in ('three','webgl-noise','postprocessing','rapier','opencv','midas','pyscenedetect','three-mesh-bvh','three-bvh-csg','recast-navigation-js'):
            p=repo_by_id(id); notice.append(f"{id}: {p['license']} — {p['homepage']}")
    (dest/'THIRD_PARTY_NOTICES.md').write_text('\n'.join(notice)+'\n', 'utf-8')
    (dest/'README.md').write_text('# Playable Game Style Forge scene\n\nRun `npm install --ignore-scripts && npm run dev`.\nMove: WASD/arrows or touch. Jump: Space/↑ button. No automatic attacks or pose changes. Put optional approved hero texture in `src/custom/hero.png` (same source for all actions).\n', 'utf-8')
    print(json.dumps({'game':str(dest),'features':sorted(active),'install':'npm install --ignore-scripts','run':'npm run dev'}, ensure_ascii=False))


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    sub = cli.add_subparsers(dest='command', required=True)
    pa = sub.add_parser('analyze'); pa.add_argument('video'); pa.add_argument('--out',required=True);pa.set_defaults(func=analyze)
    pr = sub.add_parser('recommend'); pr.add_argument('--workspace',required=True);pr.set_defaults(func=recommend)
    pe = sub.add_parser('extend'); pe.add_argument('--workspace',required=True)
    choice=pe.add_mutually_exclusive_group(required=True); choice.add_argument('--next',action='store_true');choice.add_argument('--project');pe.set_defaults(func=extend)
    pi = sub.add_parser('install-bundled');pi.add_argument('--workspace', required=True);pi.set_defaults(func=install_bundled)
    pp = sub.add_parser('install-bundled-postfx');pp.add_argument('--workspace', required=True);pp.set_defaults(func=install_bundled_postfx)
    rp = sub.add_parser('install-bundled-rapier');rp.add_argument('--workspace', required=True);rp.set_defaults(func=install_bundled_rapier)
    op = sub.add_parser('install-bundled-opencv');op.add_argument('--workspace', required=True);op.set_defaults(func=install_bundled_opencv)
    md = sub.add_parser('install-bundled-midas');md.add_argument('--workspace',required=True);md.set_defaults(func=install_bundled_midas)
    sd = sub.add_parser('install-bundled-scenes');sd.add_argument('--workspace',required=True);sd.set_defaults(func=install_bundled_scenes)
    gt = sub.add_parser('install-bundled-gltf-transform');gt.add_argument('--workspace',required=True);gt.set_defaults(func=install_bundled_gltf_transform)
    bvh = sub.add_parser('install-bundled-mesh-bvh');bvh.add_argument('--workspace',required=True);bvh.set_defaults(func=install_bundled_mesh_bvh)
    csg=sub.add_parser('install-bundled-csg');csg.add_argument('--workspace',required=True);csg.set_defaults(func=install_bundled_csg)
    nav=sub.add_parser('install-bundled-navigation');nav.add_argument('--workspace',required=True);nav.set_defaults(func=install_bundled_navigation)
    import assets_gltf; assets_gltf.add_cli(sub)
    di = sub.add_parser('import-depth');di.add_argument('--workspace',required=True);di.add_argument('--image',required=True);di.add_argument('--depth-map',required=True);di.add_argument('--darker-nearer',action='store_true');di.set_defaults(func=lambda a: __import__('depth_midas').import_depth(a))
    dp = sub.add_parser('infer-midas');dp.add_argument('--workspace',required=True);dp.add_argument('--image',required=True);dp.add_argument('--repo',required=True);dp.add_argument('--weights',required=True);dp.add_argument('--model',default='midas_v21_small_256');dp.add_argument('--device',choices=['cpu','cuda'],default='cpu');dp.set_defaults(func=lambda a: __import__('depth_midas').infer_depth(a))
    pb = sub.add_parser('build');pb.add_argument('--workspace',required=True);pb.add_argument('--out',required=True);pb.set_defaults(func=build)
    args=cli.parse_args()
    args.func(args)


if __name__ == '__main__': main()
