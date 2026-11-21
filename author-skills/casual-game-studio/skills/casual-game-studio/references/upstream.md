# Three.js upstream

- Repository: https://github.com/mrdoob/three.js
- Source tag: r187 (package 0.187.0)
- MIT license: https://github.com/mrdoob/three.js/blob/r187/LICENSE
- npm tarball: https://registry.npmjs.org/three/-/three-0.187.0.tgz
- License: ../references/THREE-LICENSE.txt (copied verbatim from r187)
- Three.js is a 3D engine, NOT a complete cute-art toolkit; all art direction, shaders, shapes and gameplay in this plugin are original templates.

The archive does not embed the entire upstream Three.js distribution. Run the provided `vendor_three.py` to fetch exactly v0.187.0 from npm (and verify its integrity against npm registry metadata); the resulting game can then run offline from a local HTTP server. When not vendored, the example has a CDN fallback.

## Second upstream: Tween.js 23.1.3

- https://github.com/tweenjs/tween.js/tree/v23.1.3
- Official `dist/tween.esm.js` was copied directly from GitHub, and the resulting bytes match its upstream Git blob hash.
- Locally bundled into generated game directory under `vendor/tween.esm.js`; no CDN needed.
- Shared motion controller synchronizes Three.js transforms, reward geometry, destruction and UI; no overlap with Three.js renderer responsibilities.
- Copyright/attribution: `references/TWEEN-LICENSE.txt`.


## v0.3 pmndrs/postprocessing
Repo https://github.com/pmndrs/postprocessing tag v6.39.6
npm postprocessing@6.39.6, peer three >=0.168.0 <0.188.0, Zlib LICENSE.md (bundled exact copy).
Exact original GLSL from upstream repo is bundled in `references/pmndrs-shaders/`.
Runtime ESM from version-pinned CDN or fully-vendored npm archive; script vendor_engines.py checks SHA-512 npm integrity and puts library at vendor/postprocessing.js.
Browser import-map forces pmndrs and game to share one Three.js module. Actual EffectComposer, BloomEffect, VignetteEffect via postfx.js.

## Blockbench editor v5.2.0
- https://github.com/JannisX11/blockbench/tree/v5.2.0 (GPL-3.0 external app, NOT shipped).
- Repo source and .bbmodel codec checked via the GitHub connector at this tag.
- Optional separate full clone: `python scripts/install_blockbench_source.py --out /path/for/blockbench-source`.
- Original `.bbmodel` asset + original limited converter bundled; game receives actual `.glb` meshes and GLTFLoader, never GPL editor source.

## Rapier 3D (fifth open-source component)

- Repository: https://github.com/dimforge/rapier
- Package: @dimforge/rapier3d-compat@0.21.0
- License: Apache-2.0, kept in `references/RAPIER-APACHE-LICENSE.txt`.
- Runtime import: `dist/rapier.mjs`; local offline installer uses verified npm tarball, not an imitation solver.
- `templates/pastel-blocks/physics.js` owns the dynamic world and Three.js transform sync; Tween never drives dynamic rigid bodies.


### Three.quarks v0.17.1 + quarks.core v0.17.1 (MIT)
- Repository: https://github.com/Alchemist0823/three.quarks
- Official npm: https://www.npmjs.com/package/three.quarks
- Repo license: `references/QUARKS-MIT-LICENSE.txt` (MIT, Forrest Sun)
- Browser integration uses pinned upstream npm distributions through the importmap. The vendoring installer checks SHA-512 archive integrity.
- Repo source was inspected via GitHub, but the whole Quarks release distribution is **not** embedded until a networked vendoring step runs.


## Seventh upstream: glTF-Transform 4.5.1 (MIT)
- Source: https://github.com/donmccurdy/glTF-Transform
- npm modules: @gltf-transform/core, /extensions, /functions, version 4.5.1 each
- Copyright (c) 2024 Don McCurdy; source license preserved verbatim in `GLTF-TRANSFORM-MIT-LICENSE.txt`.
- glTF-Transform code is NOT bundled. `scripts/optimize_glb.py --install` downloads genuine upstream packages via npm when network access permits.
- The BUILD pipeline connects Blockbench model export to Three.js GLTFLoader and preserves source, animations, and material identity; Rapier physics, Tween.js motion and Quarks particles remain independent runtime subsystems.

- Meshoptimizer: https://github.com/zeux/meshoptimizer (v1.3, MIT, npm meshoptimizer@1.3.0). Encoder at js/meshopt_encoder.js, decoder at js/meshopt_decoder.mjs.


### Three-VRM (ninth integrated source)
- pixiv/three-vrm: https://github.com/pixiv/three-vrm (tag v3.5.5), official npm package `@pixiv/three-vrm@3.5.5`, MIT.
- Runtime is imported through the official `VRMLoaderPlugin`; required npm package not pre-downloaded in skill archive, but the SHA-512-verifying vendor script supports it. Source license in `THREE-VRM-MIT-LICENSE.txt`.
- VRM 1.0 format specification: https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_vrm-1.0. The included sample model is original.

Khronos KTX-Software 4.4.2: https://github.com/KhronosGroup/KTX-Software/tree/v4.4.2 ; native CLI source and binaries NOT bundled; uses official `ktx` if installed; generally Apache-2.0, individual embedded components have other licenses. Three.js KTX2Loader and transcoder are part of Three.js npm tarball; CDN fallback when not vendored.

11. three-mesh-bvh 0.9.18: https://github.com/gkjohnson/three-mesh-bvh (MIT); official npm package, pinned browser import; see `three-mesh-bvh.md`.

- Three BVH CSG 0.0.18 — https://github.com/gkjohnson/three-bvh-csg — MIT, optional UI-triggered real boolean subtraction on closed static meshes, paired with three-mesh-bvh.
