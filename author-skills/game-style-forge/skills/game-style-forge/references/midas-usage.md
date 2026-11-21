# MiDaS 2.5D — one skill, source-locked optional depth stage

- Upstream project: https://github.com/isl-org/MiDaS (archived). Code: MIT; current pinned commit 454597711a62eabcbf7d1e89f3fb9f569051ac9b.
- Plugin includes the exact upstream LICENSE and base_model.py only, with matching GitHub blob checksums. This is NOT the full repo, checkpoint, pretrained model, or inference runtime.
- Source checkout for inference: clone `isl-org/MiDaS`, checkout pinned commit, verify HEAD with `git rev-parse HEAD`. On model inference MiDaS executes code from that checked out repo, which requires its dependencies; never run unreviewed unpinned remote code.
- Checkpoint weights: NOT included; their license and provenance must be reviewed separately. `infer-midas` requires explicit `--weights` path; code forces `torch.load(weights_only=True)`. It will not fetch weights automatically.
- To import a relative depth map that you already own (safe fast path): `python scripts/styleforge.py import-depth --workspace W --image reference.png --depth-map grayscale.png`.
- To infer (only after local repo+weights are available): `python scripts/styleforge.py infer-midas --workspace W --repo /path/MiDaS --weights /path/midas_v21_small_256.pt --image reference.png`.
- To build: `python scripts/styleforge.py build --workspace W --out GAME`. `src/depth.js` provides 3 camera-facing parallax bands; it uses the existing Ashima noise shader for atmospheric haze; the final image goes through Postprocessing effects; it never changes Rapier collision bodies or hero identity.
- Depth values are normalized *inverse relative* depth, not metric distance, not a reliable mesh. The feature is disabled if depth textures are not present.
- `source=supplied_depth_map` is not MiDaS inference. Never claim that a pretrained model was run when only a supplied map was imported.
