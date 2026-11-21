# Blockwild: source contract and integration

- Upstream: https://github.com/RedLynx101/Blockwild
- Licensed TypeScript edition: `edition/typescript` / pinned `d7173526945b60109f7c43f3b6b65b0548f7e160` (2026-09-23)
- License: **MIT**, Copyright 2026 Noah Hicks. Keep upstream `LICENSE` and any per-file third-party notices.
- Entry: `app/game/VoxelGame.tsx`; creates `VoxelEngine` from `./engine`; `engine.scene` is its true THREE.Scene; `engine.position` is its player position. Verified injection anchor: `    engineRef.current = engine;` (exactly one occurrence at reviewed SHA).
- Rendering: VGC appends an import after the required `"use client";` directive, mounts authored props in `engine.scene` with Three.js without a second canvas.
- Source edition uses `three`, `react`, `next`, `vite`; requires Node >=22.13. Full upstream is cloned at game creation, not embedded in the small skill ZIP.
- Existing engine and ecosystem preserved; no save format, physics, hitboxes, seed or multiplayer asset-state bridging.
- Ragnagrok format: `ragnagrok-models-v1`, `size:[x,y,z]`, base64 varint RLE, palette indices 0=empty, actual `scale`; exterior cells rendered as instanced cubes.
- Optional Blockbench `.glb` can be copied to `public/vgc/blockbench` and attached with native Three GLTFLoader / MeshoptDecoder if required; animations only explicit idle clips.
- `voxel_game.py --engine blockwild` dispatches to `create_blockwild.py`; legacy flags and engines retain `generate_game.py` unchanged.
- This **is not** the uploaded Unity Windows binary release BLOCKWILD v0.22.1. Do not copy Unity DLLs, proprietary models or unclear-license assets.
