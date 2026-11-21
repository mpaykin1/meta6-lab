# RIFE + Hero Animator — one animation pipeline

Upstream: [hzwer/ECCV2022-RIFE](https://github.com/hzwer/ECCV2022-RIFE), commit `5d8adbdd40e12c2c8f91930eff838aebe561c086`. MIT license, copyright Megvii Inc. See `vendor/rife/LICENSE` and upstream sources. Code runs locally at **asset preparation time**, never in the web game. No runtime PyTorch dependency and no internet required after inputs have been prepared.

## What is integrated

`rife_fetch.py` fetches that exact open-source revision. `rife_frames.py` imports the genuine upstream `model.RIFE.Model` and trained `flownet.pkl` to predict 2× or 4× intermediate PNG frames. Black/white matte reconstruction preserves RGBA transparency approximately; **only the authored original keyframes are byte-identical**. The inferred frames are new art, never considered approved. The existing `directional_pack.py` / `images2atlas.py` and Three.js runtime remain the only game presentation path.

## Local pipeline

1. `python skills/hero-animator/scripts/rife_fetch.py ./deps/ECCV2022-RIFE`
2. Install PyTorch and the **matching official upstream dependencies**, see upstream requirements. Use a trusted official model checkpoint in `./models/rife-arxiv/flownet.pkl` (large pretrained weights are **NOT included**). This adapter is for the baseline `model/RIFE.py`, not automatically for unrelated newer checkpoints.
3. Prepare approved RGBA PNG frames for a **single action and a single view** in `art/hero/walk_front/*.png` at constant canvas size and aligned foot pivot. RIFE cannot create front/back views out of left/right clips or invent missing actions.
4. `python skills/hero-animator/scripts/rife_frames.py art/hero/walk_front candidates/walk_front --hero-id hero --rife-repo ./deps/ECCV2022-RIFE --weights ./models/rife-arxiv --fps 12 --exp 1`
5. Examine every candidate frame and `rife-candidate.json`. Any ghosting, detached limbs, changed clothing, alpha halo, duplicated faces, jitter or invalid anchor → reject generated clip and use the originals unchanged.
6. Once the artist explicitly approves **each new action-view clip**, place it in a fresh, separate approved art directory. Compute `directional_pack.py --fingerprints`, compare the art visually, and explicitly update the approval manifest. `approved:true` MUST NEVER be generated automatically. The packer then verifies hashes and makes atlases. Preserve approved source clips unchanged.
7. Update *event frame indices* when changing FPS: source fps 12 → candidate fps 24 means the event timing in seconds is unchanged but `hitStart`, `hitEnd`, `release` and per-frame `hitboxes` need artist/gameplay verification. Do not silently reuse old event indices.

**Default safety:** only `walk`, `run`, `fly`, `swim` are interpolation-safe candidates. `idle`, `attack`, `roll`, `dodge`, `jump`, `crouch` are blocked unless explicitly using `--allow-high-risk-action`, and even then output is *unapproved*. No transition across clips, camera angles, or unrelated actors. No inference when running the game. If no local model, original approved clips remain the sole valid build source; do not claim RIFE results exist.

**Practical limitations:** RIFE source (PyTorch) may be heavy, model weights must be supplied separately, GPU acceleration is optional but recommended, alpha reconstruction is approximate, and intermediate frames cannot guarantee character identity. No automatic 60 FPS or extra game performance from interpolated art; frame count and texture size can increase, so apply interpolation selectively and preserve adaptive FPS/atlas budgets.
