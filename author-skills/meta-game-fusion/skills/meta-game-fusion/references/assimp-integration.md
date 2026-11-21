# Assimp adapter — GLB library contract

Flow: read-only game directories -> `fusion.py scan` (Tree-sitter code plus assets) -> `fusion-index.json` + `model-candidates.json` -> `assimp_bridge.py inventory` or `convert` -> `model-library.json` + optional `glb/*.glb` -> later glTF-Transform/Three.js.

## Export runtime
- Upstream: https://github.com/assimp/assimp
- Verified 2026-11-21 master SHA: `93fe5d82fb206e850a21809bf45800ae00b17fc7`.
- License: 3-clause BSD-style (see `vendor/assimp/LICENSE`). Third-party sample models have separate rights; **do not copy test/models-nonbsd**.
- Native CLI command: `assimp export INPUT OUTPUT -fglb2`. GLB2 support depends on compile options. Assimp may be preinstalled or compiled separately; this plugin includes no native binary or full repository checkout.
- Output: valid binary glTF 2.0 `.glb`, suitable as a candidate for Three.js `GLTFLoader`, not yet visually certified.
- Input extensions are *candidates* only; actual support varies with build, and some deprecated formats like BLEND may fail.
- Outputs are in separate directory; source data is hashed, never patched or moved. Shader code stays indexed separately through Tree-sitter.

## Safety and fidelity
- Native importers process arbitrary data, so use a sandbox/worker for untrusted models.
- Materials, external textures, armatures, animation tracks and axes require visual review and optional manual adapters. No auto-deletion or auto-merge of meshes.
- Do not trust a model just because it parses. A successful GLB result leaves `license=review_required` and `approved_for_reuse=false`.
- Each entry identifies `{id, game, source_root, path, source_sha256, output_sha256, gltf2, conversion}`.
- Where output file already exists, it is validated but never overwritten automatically.
- Potential embedded scripts, invalid licenses, and user-approved GIF/sprite identities are out of scope for automatic model conversion.
