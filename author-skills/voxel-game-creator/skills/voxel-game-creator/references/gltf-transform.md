# glTF-Transform — native VGC asset optimization (v0.6)

**Official source:** https://github.com/donmccurdy/glTF-Transform, MIT © Don McCurdy.
**Pinned source commit:** `8e2a94a2616d293c4b503d0fb6a4b42e6ec7c62f`.
**Pinned executable package:** `@gltf-transform/cli@4.5.1` (Node.js >=20).
**Official CLI manual:** https://gltf-transform.dev/cli

## Concrete, safe connection to other open sources

- Blockbench exports self-contained GLB, owned by the author. `blockbench_bridge.manifest_items()` validates clips, URI locality, GLB structure and limits.
- `scripts/gltf_transform_bridge.py` consumes those validated assets, runs official glTF-Transform `dedup`, and optionally `webp --lossless true` to compress embedded textures without degrading the artist's colors or pixel-art texture fidelity. It never touches original files.
- Before accepting an optimized file, the script checks glTF v2 validity, animation clip/channel identity, node count and names, skins/joints, mesh and scene counts. If an optimization changes figure identity, triggers unsupported compression, fails, or increases file size, the original GLB is used.
- `generate_game.py` calls the optimizer ONCE per model, then passes the chosen path into the original Blockbench bridge. Both Lumenwild (standalone) and Voxelize (Rust + Three) share the same compressed asset bytes; Ragnagrok Studio continues its original editable rig & scene workflow. Luanti is a separate native mod runtime and never attempts to read GLB.
- No Draco, EXT_meshopt_compression, KTX2, triangle simplification, mesh merge, skeleton recreation, fake fallback geometry, or automatic attack animations. Original native Three.js GLTFLoader and AnimationMixer unchanged. WebP requires modern browser support; use `--texture-optimization off` for maximum backwards compatibility.

## Commands

Default integration (safe, automatic):

```bash
python3 skills/voxel-game-creator/scripts/generate_game.py \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/my-voxel-game --engine all \
  --blockbench-assets-dir skills/voxel-game-creator/examples/blockbench-assets
```

This attempts to locate official `gltf-transform`; when absent it automatically installs **pinned** `@gltf-transform/cli@4.5.1` under `~/.cache/voxel-game-creator/`. Installation requires Node >=20, npm and network; if unavailable, optimization is skipped and original GLB is still placed in game. Only claim that optimization succeeded when `world-blueprint.json` shows `status: optimized` and actual byte savings. Each edition remains playable with original models.

To require the optimizer and stop rather than silently skip:

```bash
python3 skills/voxel-game-creator/scripts/generate_game.py --spec spec.json \
  --out /mnt/data/game --engine browser --blockbench-assets-dir glbs \
  --asset-optimizer required
```

Disable all optimization: `--asset-optimizer off`.
Preserve the original PNG/JPEG texture encoding: `--texture-optimization off` (only `dedup`).
Use custom CLI executable: `--gltf-transform /path/to/gltf-transform`.
Run standalone on one GLB: `python3 scripts/gltf_transform_bridge.py --source asset.glb --out asset-optimized.glb`.
Get full upstream source separately (optional): `python3 scripts/download_gltf_transform.py --out /mnt/data/gltf-transform-upstream`.

The actual glTF-Transform repository is NOT bundled with the skill ZIP; its official npm CLI is an on-demand dependency and the source can be fetched separately. No claims of actual byte reductions when CLI could not run.


### v0.7: Meshoptimizer integration

`--geometry-compression meshopt` is now enabled by default. The same official glTF-Transform CLI runs `meshopt input.glb output.glb --level high` *after* dedup and optional WebP. The generator checks `EXT_meshopt_compression` on the result and wires Three.js's already bundled `MeshoptDecoder` into both runtime GLTFLoaders. This **may quantize geometry and animation**, unlike the strictly lossless texture stage. To retain v0.6 behavior, pass `--geometry-compression off`. See `references/meshoptimizer.md`. Any older sentence in this file saying "no meshopt" describes only v0.6, and is superseded by this section.
