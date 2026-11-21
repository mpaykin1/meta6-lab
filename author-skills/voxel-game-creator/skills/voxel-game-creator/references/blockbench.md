# Blockbench: fourth open-source ingredient (Voxel Game Creator v0.4)

Official upstream: https://github.com/JannisX11/blockbench
Pinned inspected commit: `ec0b2827104d0799c153bfb5f867579c0c44652f` (master, inspected 2026-11-20).
License: **GPL-3.0** (NOT MIT). See https://github.com/JannisX11/blockbench/blob/master/LICENSE.MD. Original creator JannisX11.
Editor: https://web.blockbench.net/ ; https://www.blockbench.net/.
Official format documentation: https://blockbench.net/wiki/guides/export-formats/ and https://blockbench.net/wiki/docs/bbmodel/.

## Real integration — avoid mixed code licenses

- Keep Blockbench as **separate** GPL-3.0 modeling/editor process, never paste GPL files into the MIT-licensed Lumenwild, Voxelize, or Ragnagrok runtimes. The user's authored output is theirs, as documented by the upstream README.
- In Blockbench choose `File > Export > glTF` and select **binary .glb** (self-contained textures/meshes/animation clips). Generic low-poly/rigged models preferred for glTF.
- Supply actual exported `.glb` under a folder; optionally supply placements in an asset manifest. The skill handles all copying and engine patching, without needing the user to touch Three.js files.
- `scripts/blockbench_bridge.py` validates glTF 2.0 binary structure, self-contained buffer/image references, file size (24 MiB/model), name, visible geometry, and animation names, and adds the exact GLB to both games' Vite public folders.
- The two game clients **each use their own native Three.js renderer**. They import `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader.js` (already supplied by both engines' Three.js installation), preserve mesh hierarchy, UVs, textures, materials, skinning and glTF animation clips. No extra WebGL canvas, no reconstructed primitives.
- For opt-in ambient animation, manifest `idleClip: "idle"` starts *only* that declared clip. All other clips remain inactive until gameplay code explicitly triggers them. No duplicate heroes and no unexpected actions.
- Ragnagrok Studio remains the native editor for its own `Project JSON`, including rigged voxel figures. Blockbench handles textured glTF models, Lumenwild and Voxelize display them alongside converted Ragnagrok voxel props; one shared art direction, but not shared entity physics or saves.
- The bridge supplies visual props only. Do not claim imported models have colliders, player control or combat without an actual implementation. GLB is not round-tripped automatically into `.bbmodel`; users keep their editable `.bbmodel` originals in Blockbench.

## Generator

```
python3 skills/voxel-game-creator/scripts/generate_game.py \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --engine all --out /mnt/data/world \
  --blockbench-assets-dir /path/to/your-glb-files \
  --blockbench-manifest /path/to/asset-list.json
```

If no manifest, all `.glb` from the folder are placed around spawn at `[0,0,0]`. For placement use JSON:

```
{"assets":[{"file":"hero.glb","id":"hero-v1","position":[2,0,-3],"scale":1,"yaw":0,"idleClip":"idle"}]}
```

`idleClip` must exist in the file; omit if the asset should be completely static. Position is relative to scene spawn and rests on engine-generated ground in browser mode, or on a fixed decorative-height plane in Voxelize demo. Real terrain-aware Voxelize collision requires engine-specific server work.

Separate optional upstream checkout:

```
python3 skills/voxel-game-creator/scripts/download_blockbench.py --out /mnt/data/blockbench-editor
cd /mnt/data/blockbench-editor && npm ci && npm run serve
```

Or use `--with-blockbench-editor` with `--engine all`/`both` to produce a separate `blockbench-editor/` folder with the original GPL source; no Blockbench source is shipped in the skill ZIP. **Offline environments cannot clone from GitHub**; keep this limitation explicit and never describe a planned download as already completed.

Sample original `.glb` in `examples/blockbench-assets/voxel-lantern.glb` is a non-Blockbench-generated glTF 2.0 interoperability fixture with a named idle animation. Use it to inspect visual import; it is not a claim about edited Blockbench user assets.
