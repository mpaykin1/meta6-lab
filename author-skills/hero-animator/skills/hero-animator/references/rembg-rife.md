# rembg + RIFE + Hero Animator — one pipeline, one hero

**Order:** authored GIF/PNG → **rembg** matte prep → RGBA PNG → optional **RIFE** interpolation → visual approval → `directional_pack.py` / `images2atlas.py` → approved sprite atlas → Three.js / GLSL game.

- rembg source: https://github.com/danielgatis/rembg, pinned commit `991927b77667946dab59c50df31f7d4640e80457`, MIT; notice at `vendor/rembg/LICENSE`.
- RIFE source: https://github.com/hzwer/ECCV2022-RIFE, pinned commit `5d8adbdd40e12c2c8f91930eff838aebe561c086`, MIT.
- These Python tools operate **before game export**. There is NO ONNX/PyTorch runtime in the browser. RemBG or RIFE generated frames NEVER inherit approval from original drawings.
- Model checkpoints are not part of either MIT code license by default. Check each model's rights separately before commercial use. Do not use rembg's `bria-rmbg` or paid cloud backends by default.

## How to use in an authorized local-execution environment

Set up local assets and tools once. Prefer Python 3.11–3.13 for current rembg; for a supported local RIFE environment install its compatible PyTorch dependencies separately. The open-source code can be fetched with the plugin's pinned `rembg_fetch.py` and `rife_fetch.py`. When using the pinned rembg clone, install `pip install -e './deps/rembg[cpu]'` in a compatible Python environment (separate from legacy RIFE if versions conflict). Alternatively, use a supported `pip install 'rembg[cpu]'`. RemBG's segmentation models may download on first use. No third-party uploads; default local CPU inference.

Single action/view clip (`walk_front`) from opaque authored PNG/GIF:

```bash
python skills/hero-animator/scripts/rembg_frames.py art/walk_front candidates/rembg/walk_front --hero-id hero --model u2netp
```

The script leaves original files untouched, preserves existing transparent authored RGBA pixels by default, and creates a separate `rembg-candidate.json` with source hashes and **approved=false**. It does NOT infer an unnecessary background removal on an already-transparent PNG. All output PNGs share the same canvas size and foot-pivot coordinate system.

Then interpolate one clip only, where weights and source are available:

```bash
python skills/hero-animator/scripts/rife_frames.py candidates/rembg/walk_front candidates/rife/walk_front --hero-id hero --rife-repo deps/ECCV2022-RIFE --weights models/rife-arxiv --fps 12 --exp 1
```

Or use the combined entry point:

```bash
python skills/hero-animator/scripts/rembg_rife.py art/walk_front candidates/hero --hero-id hero --model u2netp --rife-repo deps/ECCV2022-RIFE --weights models/rife-arxiv --fps 12 --exp 1
```

If RIFE source/checkpoint not available, use `--rembg-only`, NEVER substitute cross-fade or advertise a RIFE result. The resulting candidates remain unapproved; source keyframes are bit-for-bit preserved by the RIFE stage from the rembg PNG input (which itself may be a generated cutout). The original pre-rembg art remains intact.

## Essential guards

1. **One hero / one view / one action:** never mix `walk_front` and `attack_left`, and never manufacture missing `front/back` views. Full 4/8-view character identity validation stays mandatory.
2. **Art & alpha:** for existing transparent authored art, skip background removal, preserve exact RGBA source; do not overwrite original. If explicit `--replace-existing-alpha`, output candidates are unapproved. Watch for missing hands/weapons, holes, halos, lost silhouettes and unwanted background objects.
3. **Continuity:** rembg creates alpha independently per frame; hair/weapon and foot silhouette may flicker. Review the whole animation, not only a still. For RIFE, inspect generated intermediate frames and foot anchors; RIFE may hallucinate limbs or alter opacity.
4. **Approval:** only a human-approved complete clip may be copied to a separate approved art directory. Recalculate `directional_pack.py --fingerprints`, verify every new frame and update explicit approval JSON. No automatic approved=true, no bypass of Source Lock.
5. **Input / 3D:** processing is offline art prep only. Movement, roll, dodge, jump, crouch, attack remain caused by actual player input. Collision/hitboxes and event indices do not come from the matte mask. Adjust `fps`, attack windows and event indices deliberately if RIFE changed timing.
6. **Asset size:** rembg only changes the matte. RIFE 2x/4x increases texture/frame count and need not increase FPS. Prefer fewer clean frames, trim atlases with `images2atlas.py`, keep original image anchor.
7. **Fail closed:** rembg not installed, missing model weights, wrong action/view or model license unknown → do not claim new game-ready animation. Use original approved art instead.
