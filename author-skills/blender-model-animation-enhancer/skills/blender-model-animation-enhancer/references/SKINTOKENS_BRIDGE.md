# SkinTokens / TokenRig integration (v1.3)

Upstream: https://github.com/VAST-AI-Research/SkinTokens (MIT)
Pinned commit: `273b691d35989d71cd17ff2895fdc735097b92d1` (2026-05-12).
Official docs: https://github.com/VAST-AI-Research/SkinTokens/blob/main/README.md
Official inference script: `demo.py`, CLI `--input ... --output ... --use_transfer`.
Official model downloads: `python download.py --model` (Hugging Face `VAST-AI/SkinTokens`).

## What is connected

**Blender** imports and inspects source asset, then processes/export GLB.
**PyMeshLab** optionally cleans only safely eligible non-textured geometry.
**Instant Meshes** optionally remeshes eligible static geometry (before generating the rig).
**SkinTokens TokenRig** then generates bone hierarchy and weight maps for an **unrigged** character in an independent Python/CUDA environment, using `--use_transfer` to preserve the original texture/scale as the upstream tool intends.
**Blender** then roundtrips and checks a usable skinned GLB for Three.js.

The `scripts/skintokens_worker.py` calls actual `demo.py` from an official, external source checkout. This is not a fake rig, not a rigging algorithm invented in the skill, and not merely a textual suggestion. Nothing runs until its real dependencies exist.

## Installation (external GPU workstation)

```bash
bash scripts/get_official_skintokens_source.sh /work/SkinTokens
cd /work/SkinTokens
# Follow upstream README for a Python 3.11+ GPU virtual environment and CUDA >=12.1.
# For example: uv venv --python 3.11; activate; install torch, -r requirements.txt and flash-attn.
python download.py --model
```

GPU requirements per upstream README: NVIDIA GPU with >=14 GB VRAM; compatible torch/CUDA, Python >=3.11, checkpoints and auxiliary model config. PyMeshLab and Instant Meshes may live in separate installations. Source code, checkpoints and precompiled GPU binaries are not bundled in the small plugin archive.

## Usage

Only auto-rig an unrigged character:

```bash
python scripts/run_enhancer.py --input hero.glb --output hero-rigged.glb \
  --skintokens-rig --skintokens-dir /work/SkinTokens \
  --skintokens-python /work/SkinTokens/.venv/bin/python
```

Full four-project pipeline, when the model is suitable for static cleanup and retopology:

```bash
python scripts/run_enhancer.py --input hero.glb --output hero-rigged.glb \
  --pymeshlab-clean-static --pymeshlab-python /env/bin/python \
  --instant-retopo-static --instant-meshes-bin /path/to/InstantMeshes \
  --skintokens-rig --skintokens-dir /work/SkinTokens \
  --skintokens-python /work/SkinTokens/.venv/bin/python
```

## Explicit restrictions

- Existing skeleton, weights, animation actions, clips, morph targets/shape keys are **never** replaced by this automatic pathway. When present, fall back to original Blender-only enhancement; do not claim SkinTokens preserves existing animations by default. The upstream `--use_skeleton` mode is a separate process and not automatically invoked here.
- Before the GPU inference, source meshes and appearance attributes are inspected. The worker uses `--use_transfer` and checks GLB output armatures, skinning, UVs/material counts, vertex/polygon counts and world bounds. Failure stops without writing final destination. These are heuristics: they cannot verify visual identity perfectly; a human preview is still required to approve final character.
- Retopology of a textured character is deliberately skipped by the existing Blender bridge because UV/material projection is not implemented. This is a safer limit than losing the approved original textures.
- Auto-rigging does **not** invent walk/jump/attack animations. It outputs a rig ready for animations; separate animation production/retargeting is needed.
- Upstream repo, models and NVIDIA driver dependencies are large and must be fetched by the workstation. Blender host and SkinTokens GPU Python processes must remain isolated.
- If DNS or network prevents a clone, say that the source is not installed; never claim the external model ran.
