# Source attribution: RIFE

Upstream: https://github.com/hzwer/ECCV2022-RIFE
Revision pinned by Hero Animator: `5d8adbdd40e12c2c8f91930eff838aebe561c086` (2025-09-10).
License: MIT, copyright Megvii Inc.; see LICENSE in this folder.

RIFE's original neural network source is intentionally installed from official
upstream by `scripts/rife_fetch.py`. The large pretrained model files are not
bundled with the plugin. `scripts/rife_frames.py` IMPORTS and executes RIFE's
`model.RIFE.Model` when the pinned checkout and compatible trusted checkpoint
are present; it never substitutes fake interpolation or claims AI output when
weights are missing.
