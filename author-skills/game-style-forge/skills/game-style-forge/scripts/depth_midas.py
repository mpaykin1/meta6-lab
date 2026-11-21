#!/usr/bin/env python3
"""MiDaS relative-depth adapter. Does not download model weights or execute unpinned code.

Depth input is inverse-relative, not metric: brighter is nominally nearer.
Imported maps are user-provided maps, NOT claimed MiDaS predictions.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import sys

PINNED_MIDAS_COMMIT = '454597711a62eabcbf7d1e89f3fb9f569051ac9b'


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as file:
        for block in iter(lambda: file.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def save_depth(workspace: Path, rgb, depth, *, source: str, source_sha: str,
               model_type: str | None = None, weights_sha: str | None = None,
               brighter_nearer: bool = True):
    import cv2
    import numpy as np
    workspace = Path(workspace).expanduser().resolve()
    dest = workspace / 'depth'
    dest.mkdir(parents=True, exist_ok=True)
    if rgb.ndim != 3 or rgb.shape[-1] != 3:
        raise SystemExit('Color reference must be RGB.')
    if depth.ndim != 2:
        raise SystemExit('Depth must be a single-channel relative-depth image.')
    if not np.all(np.isfinite(depth)):
        raise SystemExit('Depth image contains NaN or Inf.')
    if depth.shape != rgb.shape[:2]:
        depth = cv2.resize(depth, (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_LINEAR)
    # Preserve image aspect; clamp to mobile-friendly GPU texture dimensions.
    h, w = rgb.shape[:2]
    s = min(1.0, 768 / max(1, w), 448 / max(1, h))
    if s < 1:
        size = (max(8, round(w*s)), max(8, round(h*s)))
        rgb = cv2.resize(rgb, size, interpolation=cv2.INTER_AREA)
        depth = cv2.resize(depth, size, interpolation=cv2.INTER_LINEAR)
    depth = depth.astype('float32')
    lo, hi = (float(x) for x in np.quantile(depth, [0.02, 0.98]))
    if hi - lo <= 1e-7:
        raise SystemExit('Relative-depth map is flat, no usable parallax layers.')
    normalized = np.clip((depth - lo) / (hi - lo), 0, 1)
    if not brighter_nearer:
        normalized = 1 - normalized
    normalized = cv2.GaussianBlur(normalized, (5, 5), .5)
    # 8-bit source PNG for guaranteed browser WebGL texture compatibility.
    out_depth = np.round(normalized * 255).astype('uint8')
    out_color = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    color_path, depth_path = dest / 'reference.png', dest / 'relative-depth.png'
    if not cv2.imwrite(str(color_path), out_color) or not cv2.imwrite(str(depth_path), out_depth):
        raise SystemExit('Could not save depth textures.')
    # No duplicate 3D collisions: this is a visual 2.5D background ONLY.
    meta = {
        'schema': 1, 'source': source, 'model_type': model_type,
        'midas_git_commit': PINNED_MIDAS_COMMIT if source == 'midas_inference' else None,
        'weights_sha256': weights_sha,
        'input_sha256': source_sha,
        'orientation': 'normalized_inverse_relative_depth_bright_nearer',
        'metric_depth': False, 'colliders_from_image': False,
        'width': int(rgb.shape[1]), 'height': int(rgb.shape[0]),
        'near_fraction': round(float((out_depth > 168).mean()), 5),
        'color_sha256': file_sha256(color_path), 'depth_sha256': file_sha256(depth_path)
    }
    (dest / 'depth_profile.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n','utf-8')
    profile_path = workspace / 'style_profile.json'
    profile = json.loads(profile_path.read_text('utf-8')) if profile_path.exists() else {
        'palette': ['#161b2e','#778497','#cfb58d'], 'semantic_notes': {'world_layers':['deep','mid','near','screen']}}
    profile['relative_depth'] = {
        'status': 'ready', 'source':source,
        'texture': 'depth/relative-depth.png', 'color':'depth/reference.png',
        'near_fraction':meta['near_fraction'], 'metric_depth': False,
        'follows_3d_collision_geometry': False
    }
    profile_path.write_text(json.dumps(profile, ensure_ascii=False, indent=2) + '\n','utf-8')
    return meta


def import_depth(args):
    import cv2
    color_path=Path(args.image).expanduser().resolve()
    depth_path=Path(args.depth_map).expanduser().resolve()
    if not color_path.is_file() or not depth_path.is_file():
        raise SystemExit('Both reference image and depth image must exist.')
    rgb = cv2.imread(str(color_path), cv2.IMREAD_COLOR)
    d = cv2.imread(str(depth_path), cv2.IMREAD_UNCHANGED)
    if rgb is None or d is None:
        raise SystemExit('Could not decode reference and/or depth image.')
    if d.ndim != 2:
        raise SystemExit('Depth must be single-channel grayscale, not colored RGB.')
    result = save_depth(Path(args.workspace),cv2.cvtColor(rgb,cv2.COLOR_BGR2RGB),d,
                        source='supplied_depth_map',source_sha=file_sha256(depth_path),
                        brighter_nearer=not args.darker_nearer)
    print(json.dumps({'depth_ready':True,'source':result['source'],
                      'width':result['width'],'height':result['height']},ensure_ascii=False))


def infer_depth(args):
    """Uses the verified local checkout of ORIGINAL MiDaS and opt-in local weights.

    This command executes repository model code; only the exact upstream SHA is accepted.
    It never fetches model weights, never runs GitHub code from an unpinned ref.
    """
    import cv2
    import numpy as np
    try:
        import torch
    except ImportError as exc:
        raise SystemExit('PyTorch is needed for optional MiDaS inference.') from exc
    repo = Path(args.repo).expanduser().resolve()
    weights = Path(args.weights).expanduser().resolve()
    image = Path(args.image).expanduser().resolve()
    if not (repo / 'midas/model_loader.py').is_file() or not (repo / 'LICENSE').is_file():
        raise SystemExit('Provide a complete LOCAL MiDaS checkout via --repo (partial plugin snapshot is not a model).')
    if not weights.is_file() or not image.is_file():
        raise SystemExit('Provide existing weights AND reference image paths; weights are never downloaded automatically.')
    try:
        commit = subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True,timeout=10).strip()
    except Exception as exc:
        raise SystemExit('Cannot verify local MiDaS repository revision.') from exc
    if commit != PINNED_MIDAS_COMMIT:
        raise SystemExit('MiDaS commit mismatch: pinned version is ' + PINNED_MIDAS_COMMIT)
    if args.model != 'midas_v21_small_256':
        raise SystemExit('Currently pinned inference adapter supports only midas_v21_small_256.')
    # Do not permit import path shadowing of torch/cv2 by untrusted folders.
    sys.path.insert(0,str(repo))
    try:
        from midas.model_loader import load_model
    except Exception as exc:
        raise SystemExit('MiDaS model dependencies missing: '+str(exc)) from exc
    finally:
        sys.path.pop(0)
    device=torch.device('cuda' if args.device=='cuda' and torch.cuda.is_available() else 'cpu')
    # Upstream v3.1 BaseModel.load uses torch.load without weights_only.
    # Require data-only loading for safety (trusted explicit user weights).
    original_load=torch.load
    def safe_torch_load(*a, **kw):
        kw['weights_only']=True
        return original_load(*a, **kw)
    try:
        torch.load=safe_torch_load
        model, transform, _, _ = load_model(device,str(weights),args.model,optimize=False)
    finally:
        torch.load=original_load
    bgr=cv2.imread(str(image),cv2.IMREAD_COLOR)
    if bgr is None: raise SystemExit('Reference image is not readable.')
    rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
    sample=transform({'image':rgb.astype('float32')/255.})['image']
    with torch.inference_mode():
        prediction=model(torch.from_numpy(np.ascontiguousarray(sample)).unsqueeze(0).to(device))
        prediction=torch.nn.functional.interpolate(
            prediction.unsqueeze(1),size=rgb.shape[:2],mode='bicubic',align_corners=False
        ).squeeze().cpu().numpy()
    result=save_depth(Path(args.workspace),rgb,prediction,source='midas_inference',
                      source_sha=file_sha256(image),model_type=args.model,
                      weights_sha=file_sha256(weights))
    print(json.dumps({'depth_ready':True,'source':'midas_inference',
                      'weights_sha256':result['weights_sha256'],
                      'near_fraction':result['near_fraction']},ensure_ascii=False))
