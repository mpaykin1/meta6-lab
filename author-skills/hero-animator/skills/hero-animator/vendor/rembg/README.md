# rembg open-source integration

Upstream: https://github.com/danielgatis/rembg
Pinned revision: 991927b77667946dab59c50df31f7d4640e80457
Project license: MIT; LICENSE here contains upstream copyright and permissions.

Source code and large ONNX weights are NOT bundled in the GPT plugin. Use
`scripts/rembg_fetch.py` to download the pinned source when an execution
machine and internet are available, and then install its CPU dependencies.
Local-only use; no external paid API backends or remote image upload.
Third-party model weights have distinct licensing: confirm them separately.
