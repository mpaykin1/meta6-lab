# pmndrs/postprocessing: native WebGL-only VGC integration

Source: https://github.com/pmndrs/postprocessing
Pinned SHA: `a1f103559d15cf56cbcbb15d4373711b09418f3f`
Reviewed npm version `postprocessing@6.39.6` (Zlib license), peer THREE `>=0.168 <0.188`. Lumenwild uses Three.js `^0.185.1`, compatible; Voxelize uses THREE.WebGPURenderer and is intentionally skipped.

The new `voxel_game_postfx.py` wrapper delegates ALL existing engine routing to the unmodified `voxel_game.py`, stages output, patches generated Lumenwild only, and atomically commits or discards output. `postfx_bridge.py` adds one pmndrs EffectComposer to the **direct renderer branch only**. Never stack on native Lumenwild PostPipeline (HDR, bloom and god rays), never add a second rendering loop, and never replace player controls or NPC animation.

- `--postfx-mode auto`: try npm lockfile resolution, skip and preserve native game if unavailable.
- `--postfx-mode required`: stop if supported Lumenwild source or npm is missing.
- `--postfx-mode off`: identical to existing unified VGC CLI behavior.
- `--engine browser|both|all`: Lumenwild output supports WebGL pmndrs; Voxelize retains its native WebGPU post-processing.
- Visual changes only in native direct WebGL quality mode (`?quality=low`), or when no HDR target exists; existing medium/high quality remain governed by the game's native pipeline.
- On mobile omit bloom and keep subtle grade/vignette; on reduced-motion preference use native rendering; on sustained FPS<29 temporarily back off pmndrs.

No source or images of Postprocessing are bundled. Optional exact source downloader: `download_postprocessing.py`. All source redistribution must retain Zlib notice in `POSTPROCESSING-LICENSE.txt`.
