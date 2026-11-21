---
name: voxel-game-creator-postfx
description: "Add real Zlib pmndrs/postprocessing cinematic bloom, color grade and vignette to current Voxel Game Creator Lumenwild WebGL output, preserving HDR/god rays and all other engine integrations."
---

# Voxel Game Creator — pmndrs Postprocessing (17th OSS)

Use on author requests to increase Three.js WebGL atmosphere and preserve live animation, graphics, Ragnagrok/Blockbench/Meshoptimizer art and all older engines. This extension **never changes the player's identity, action controls, NPC AI, source textures or voxel physics**.

**No patches to existing engine generators or the unified `voxel_game.py`**: this skill wraps the latest unified router, so concurrent engine upgrades (including Veloren, Voxelcraft, Minecraft-W, Vesper and Blockwild) cannot be dropped by a stale file overwrite.

Run with the newly provided wrapper:

```sh
python3 skills/voxel-game-creator/scripts/voxel_game_postfx.py \
  --engine browser --postfx-mode auto \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/my-cinematic-voxel-game
```

To fail if the renderer cannot be configured use `--postfx-mode required`. To keep the original intact use `--postfx-mode off`. All other flags from `voxel_game.py` pass through untouched, including optional Ragnagrok and Blockbench GLB assets. `--engine both|all` applies it only to `browser/` Lumenwild and preserves Voxelize's native WebGPU and other runtimes. Do not apply pmndrs Postprocessing to WebGPURenderer, legacy Three.js r128 (Voxelcraft), Luanti or independent GL/Canvas executables.

## Real connection and scene layers

- Far layer: **native** Lumenwild atmospheric sky, fog and shader/weather; no shader replacement.
- Mid layer: native chunks + FastNoiseLite/Ragnagrok instances, Yuka + Recast NPCs, Blockbench GLB, accurate mesh BVH.
- Near layer: native falling rain, terrain blocks and first-person hand remain as rendered by upstream.
- Screen layer: **real `postprocessing@6.39.6` via its native `EffectComposer`/`RenderPass`/`EffectPass`**, with grade, vignette and gentle bloom on WebGL desktop. No second Three.js canvas or second render loop.

**Important:** Lumenwild already owns an HDR post pipeline at medium/high tiers, which includes its own bloom and god rays. The pmndrs alternative runs ONLY on its existing direct-render path when there is no native HDR pipeline, not twice; set game quality to `low` (or run on non-HDR WebGL2 hardware) to see the extension. With native HDR, native postprocessing retains priority. Mobile runs grade/vignette without bloom, honors reduced-motion preference, and reverts temporarily to the native renderer under sustained low FPS. This is an *opt-in alternate look*, not a claim of global FPS increase.

Dependencies: official Zlib license (`references/POSTPROCESSING-LICENSE.txt`), npm `postprocessing@6.39.6` with `three@^0.185.1`; package.json and package-lock.json are updated together. If offline/unsupported in auto mode, original game remains unmodified; required mode fails and atomically removes temporary output. Pinned upstream source SHA `a1f103559d15cf56cbcbb15d4373711b09418f3f` at https://github.com/pmndrs/postprocessing. Full upstream source can optionally be fetched by `scripts/download_postprocessing.py`; it is NOT included in this patch ZIP. Never claim npm install, runtime FPS, published game or asset preview confirmed without actual execution.
