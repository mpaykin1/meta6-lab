#!/usr/bin/env python3
"""Safe CPU-side orchestrator for the real, separately installed SkinTokens CLI.

Pipeline: Blender guard -> optional PyMeshLab/Instant Meshes static cleanup ->
SkinTokens TokenRig on CUDA -> Blender GLB roundtrip -> Blender guard.
No fake inference or replacement of an existing hero; never touches source files.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


BASE=Path(__file__).resolve().parent
MODEL_REL='experiments/articulation_xl_quantization_256_token_4/grpo_1400.ckpt'
VAE_REL='experiments/skin_vae_2_10_32768/last.ckpt'


def run(args, *, cwd=None, timeout=1800):
    result=subprocess.run([str(a) for a in args],cwd=cwd,check=False,timeout=timeout)
    if result.returncode!=0:
        raise RuntimeError(f'Command failed ({result.returncode}): {args[0]}')


def probe(blender, source, folder, key):
    output=folder/(key+'.json')
    run([blender,'--background','--factory-startup','--python-exit-code','3',
         '--python',BASE/'skintokens_scene_probe.py','--','--input',source,
         '--output',output],timeout=300)
    if not output.is_file():
        raise RuntimeError('Blender inspection produced no result')
    return json.loads(output.read_text(encoding='utf-8'))


def check_original(info):
    if info['rig_count']>0 or info['skinned_meshes']>0 or info['weighted_meshes']>0:
        raise ValueError('Existing skeleton or vertex weights detected: SkinTokens must not replace an existing character rig. Use the Blender-only enhancer.')
    if info['animation_names'] or info['action_count'] or any(m['mesh_animation'] for m in info['meshes']):
        raise ValueError('Animated source detected. Rigging an existing animated character is blocked to prevent losing its clips.')
    if any(m['shape_keys'] for m in info['meshes']):
        raise ValueError('Morph targets detected; SkinTokens input is not eligible without explicit vertex/morph transfer.')
    if info['vertices']<30 or info['polygons']<20:
        raise ValueError('Input is too small to be a useful character mesh')


def check_result(before,after):
    if not after['rig_count'] or not after['skinned_meshes'] or not after['weighted_meshes']:
        raise ValueError('SkinTokens output lacks a usable armature, skin modifier or weighted vertices')
    if after['material_slots']<before['material_slots'] or (before['uv_meshes'] and not after['uv_meshes']):
        raise ValueError('Identity guard: original materials or UVs were lost')
    if not after['vertices'] or not after['polygons']:
        raise ValueError('Identity guard: output is empty')
    for label in ('vertices','polygons'):
        baseline=before[label]
        change=abs(after[label]-baseline)/baseline
        if change > 0.25:
            raise ValueError(f'Identity guard: {label} changed by {change:.1%}; manual approval needed')
    src=before['bounds']; dst=after['bounds']
    span=max(max(src['max'][i]-src['min'][i] for i in range(3)),1e-6)
    deviation=max(abs(src[side][i]-dst[side][i]) for side in ('min','max') for i in range(3))
    if deviation>max(1e-4,0.08*span):
        raise ValueError(f'Identity guard: model world-space bounds shifted by {deviation:.5g} (limit {0.08*span:.5g})')


def available_blender(explicit=None):
    if explicit:
        path=Path(explicit).expanduser().resolve()
        if not path.is_file():
            raise FileNotFoundError(f'Blender executable missing: {path}')
        return str(path)
    from run_enhancer import find_blender
    path=find_blender()
    if not path:
        raise FileNotFoundError('Blender missing; install Blender or set BLENDER_BIN')
    return path


def preflight_skintokens(repo,py):
    if not repo.is_dir() or not (repo/'demo.py').is_file() or not (repo/'src/model/tokenrig.py').is_file():
        raise FileNotFoundError('Real SkinTokens repository is missing; run get_official_skintokens_source.sh or git clone the upstream repository.')
    if not (repo/MODEL_REL).is_file() or not (repo/VAE_REL).is_file():
        raise FileNotFoundError('SkinTokens checkpoints missing; in the SkinTokens Python environment run: python download.py --model')
    gpu=subprocess.run([str(py),'-c',
        'import torch,sys; sys.exit(0 if torch.cuda.is_available() and torch.cuda.get_device_properties(0).total_memory >= 14*(1024**3) else 5)'],
        capture_output=True,text=True,check=False,timeout=90)
    if gpu.returncode:
        raise RuntimeError('SkinTokens requires its own Python 3.11+ environment, installed torch/CUDA and NVIDIA GPU >=14GB. '+gpu.stderr[-450:])


def launch(argv=None):
    p=argparse.ArgumentParser(description='Blender/PyMeshLab/Instant Meshes -> real SkinTokens -> Blender GLB')
    p.add_argument('--input',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--blender-bin')
    p.add_argument('--skintokens-dir',type=Path,default=os.environ.get('SKINTOKENS_DIR'))
    p.add_argument('--skintokens-python',default=os.environ.get('SKINTOKENS_PYTHON',sys.executable))
    p.add_argument('--pymeshlab-clean-static',action='store_true')
    p.add_argument('--pymeshlab-python',default=sys.executable)
    p.add_argument('--instant-retopo-static',action='store_true')
    p.add_argument('--instant-meshes-bin')
    p.add_argument('--instant-faces',type=int,default=0)
    p.add_argument('--use-postprocess',action='store_true',help='Explicitly enable upstream voxel-based skin correction')
    p.add_argument('--timeout',type=int,default=3600)
    p.add_argument('--overwrite',action='store_true')
    args=p.parse_args(argv)
    src=args.input.expanduser().resolve()
    out=args.output.expanduser().resolve()
    if not src.is_file() or src.suffix.lower() not in {'.glb','.gltf','.fbx','.obj','.blend'}:
        p.error('Source file is missing or format unsupported (GLB, glTF, FBX, OBJ, blend)')
    if out.suffix.lower()!='.glb' or out==src:
        p.error('Output must be a distinct .glb file')
    if out.exists() and not args.overwrite:
        p.error('Output already exists; use --overwrite if intentional')
    if args.skintokens_dir is None:
        p.error('Specify --skintokens-dir (checkout from VAST-AI-Research/SkinTokens)')
    if not 300<=args.timeout<=10800:
        p.error('--timeout must be 300..10800 seconds')
    repo=args.skintokens_dir.expanduser().resolve()
    python_bin=Path(args.skintokens_python).expanduser().resolve()
    if not python_bin.is_file():
        p.error('SkinTokens Python executable missing')
    blender=available_blender(args.blender_bin)

    with tempfile.TemporaryDirectory(prefix='enhance-skintokens-') as workspace:
        folder=Path(workspace)
        before=probe(blender,src,folder,'before')
        check_original(before)
        preflight_skintokens(repo,python_bin)
        prepared=folder/'prepared.glb'
        command=[sys.executable,str(BASE/'run_enhancer.py'),'--input',src,'--output',prepared]
        if args.pymeshlab_clean_static:
            command.extend(['--pymeshlab-clean-static','--pymeshlab-python',args.pymeshlab_python])
        if args.instant_retopo_static:
            command.extend(['--instant-retopo-static','--instant-faces',str(args.instant_faces)])
            if args.instant_meshes_bin:
                command.extend(['--instant-meshes-bin',args.instant_meshes_bin])
        custom_env=os.environ.copy()
        custom_env['BLENDER_BIN']=blender
        result=subprocess.run([str(x) for x in command],env=custom_env,check=False,timeout=900)
        if result.returncode!=0:
            raise RuntimeError(f'Blender preprocessor failed ({result.returncode})')
        # Base identity must still be recognizable after the static-only stages.
        prep_info=probe(blender,prepared,folder,'prepared')
        check_original(prep_info)
        if prep_info['material_slots']<before['material_slots'] or (before['uv_meshes'] and not prep_info['uv_meshes']):
            raise ValueError('Preprocessing removed materials/UVs; stopping before AI rigging')
        raw=folder/'skintokens_rigged.glb'
        cmd=[python_bin,repo/'demo.py','--input',prepared,'--output',raw,'--use_transfer']
        if args.use_postprocess:
            cmd.append('--use_postprocess')
        # Official CLI starts its own bpy_server; never run arbitrary network downloads here.
        run(cmd,cwd=repo,timeout=args.timeout)
        if not raw.is_file() or raw.stat().st_size<512:
            raise RuntimeError('SkinTokens did not produce a nonempty GLB')
        rig_info=probe(blender,raw,folder,'rigged')
        check_result(prep_info,rig_info)
        final=folder/'game_ready.glb'
        run([sys.executable,BASE/'run_enhancer.py','--input',raw,'--output',final],timeout=900)
        final_info=probe(blender,final,folder,'final')
        check_result(prep_info,final_info)
        out.parent.mkdir(parents=True,exist_ok=True)
        # Commit only when all stages have succeeded; source is never overwritten.
        shutil.move(str(final),str(out))
        print('[skintokens] GLB ready:',out)
    return 0


if __name__=='__main__':
    try:
        raise SystemExit(launch())
    except (ValueError,FileNotFoundError,RuntimeError,subprocess.TimeoutExpired) as error:
        print('[skintokens] '+str(error),file=sys.stderr)
        raise SystemExit(2)
