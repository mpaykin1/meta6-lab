# Ragnagrok Engine — third source, art and character studio

Upstream: https://github.com/Ragnagrok/ragnagrok-engine
Snapshot: `66e80c3a7451c5455e713e9c94fe1cf3da423050` (verified 2026-11-20), MIT © 2026 Ragnagrok.
Package `ragnagrok-engine` 0.3.7; modules `core`, `render`, `paint`, `audio`, `kit`, editor and browser adventure.

## Real workflows

1. Use `--engine studio` or `--engine all` to clone the full MIT Ragnagrok source at the pinned SHA. The official /editor/ supports sculpting voxel models, painting, rigging and keyframe animation; the /examples/adventure/ game is playable, with real authored 3D figures and native scene and collision logic. `create_ragnagrok.py` extends official `starterProject` with thematically colored models and a `createHumanoid` NPC. It retains all upstream engine modules, animation, WebAudio and game kit.
2. The studio's Ragnagrok `Project` JSON exported through the editor can be supplied to `generate_game.py --ragnagrok-project path/to/editor-export.json` to import its scene's **placed static Models** into the other engines. This exporter understands Ragnagrok's original `Model.data` base64 variable-length run RLE and palette index 0=empty.
3. The `ragnagrok_bridge.py` helper installs native `THREE.InstancedMesh` props using actual Ragnagrok colors, geometry and scales into *each engine's own* scene — in Lumenwild near the procedural spawn, in Voxelize near the initial camera. Uses one mesh per visible palette index and only exposed cells. Materials can emit light visually; collisions are unchanged. Neither game attempts to run Ragnagrok's WebGL renderer inside its own render loop.
4. The skill generates original stone monuments, crystals, trees and lanterns in exact Ragnagrok-compatible `Model` schema by default, so the connection is visible without a custom file. Ragnagrok Studio can edit and export new authored assets instead.

## Compatibility constraints

- **Figures and animations**: rigged Ragnagrok figures are playable in native Studio; they are NOT yet exported to Lumenwild or Voxelize with working animation controllers. Studio source remains the editable truth. Do not tell the user the hero is animated in the other engines without implementing/rendering it.
- **Physics**: decorative model instances do not create block colliders in either native engine, irrespective of `solid` in Studio. Do not spawn props as player-blocking obstacles unless explicit collision is added per engine. Their visual alignment differs in the 2 engines because Voxelize's Rust terrain is independent of Lumenwild's `createColumnSampler`.
- **Saving**: the three engines' worlds, seeds, spawn, inventory and save formats are not interchangeable. Art colors, model geometry and semantic specs are shareable, not the same terrain.
- **Engine renderer**: Lumenwild uses `three` (WebGL2), Voxelize's current example uses `three/webgpu`, and Ragnagrok uses its own `three` View. Always import Three.js from the host game's own entrypoint to avoid duplicate renderer contexts. Keep renderer instancing isolated to scene objects.
- **Audio**: Ragnagrok has synthesized `GameAudio`, but importing its audio engine into Lumenwild's or Voxelize's runtime is not automatic. Existing audio stays native; do not claim cross-engine sound transfer.
- **Network**: Ragnagrok clone/build and Voxelize Rust dependencies need real system network and toolchains. If unavailable, accept `--source-ragnagrok` with existing checkout and never claim a full verified production build.

## Build

```
python3 scripts/generate_game.py --spec examples/game-spec.json --out /mnt/data/voxel-game --engine all
# studio
cd /mnt/data/voxel-game/studio && npm ci && npm run dev
# editor: http://localhost:5173/editor/  | adventure: http://localhost:5173/examples/adventure/
# static studio site: npm run build:site; deploy studio/site
```

`--engine both` retains its old meaning (browser + server) but automatically receives the shared Ragnagrok-compatible voxel props. `--engine all` now builds all three independently in one output folder, with `shared-assets/ragnagrok-assets.json` as interchange pack.
