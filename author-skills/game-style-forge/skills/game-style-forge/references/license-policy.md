# Upstream licensing

PySceneDetect BSD-3-Clause; Three.js MIT; ashima/webgl-noise MIT; pmndrs/postprocessing Zlib; Rapier Apache-2.0; OpenCV >= 4.5.0 Apache-2.0; MiDaS code MIT. Always inspect LICENSE from the checked-out revision. MiDaS model weights and datasets have independent terms. FFmpeg LGPL builds vary with enabled GPL components, so require separate legal review before vendoring/distributing binaries. Keep LICENSE and THIRD_PARTY_NOTICES. Never remove third-party attribution. Source clones are untrusted: don't execute their setup scripts automatically.

Postprocessing v6.39.6: Zlib, verified upstream `LICENSE.md` included, tag commit a1f103559d15cf56cbcbb15d4373711b09418f3f, compatible Three.js >=0.168 <0.188. Source snapshot is partial; complete package provided as pinned npm dependency on build.

Rapier @dimforge/rapier3d-compat@0.21.0: Apache-2.0. Preserve license and attribution in game build. The pinned GitHub excerpt comes from SHA 475caa3ff4646fd9a796b67d14116256f4962bc7; its source snapshot is deliberately partial. Bundled Apache-2.0 standard text is not byte-identical to the upstream LICENSE; upstream canonical license Git blob 97f4383a35a48ddd50566a879e836491d2fe9b75. Do not claim that the WASM binary has been bundled or executed when npm install was blocked.

OpenCV v4.13.0 commit 2e1f8da65e4f9fa1a98423e6ac223187438a4db8: Apache-2.0. Bundled exact original LICENSE and `samples/python/opt_flow.py` with pinned Git blob hashes; both are partial upstream sources, not C++ binaries. Runtime is separately installed `opencv-python-headless==4.13.0.92` (Python package), and third-party codecs and wheel redistribution require independent license review. Generated browser game uses only the analysis output; it does not load OpenCV.

MiDaS (isl-org/MiDaS) repository code MIT, pinned commit 454597711a62eabcbf7d1e89f3fb9f569051ac9b; model checkpoints are intentionally NOT downloaded or bundled. Review actual pretrained checkpoint provenance and use conditions separately. Never suggest a pretrained weight file is licensed solely because its Python code is MIT.

PySceneDetect 0.7.3 is BSD-3-Clause; the actual pinned GitHub snapshot includes LICENSE and a compatibility shim only, with runtime installed via pip. Retain upstream copyright/notice; never present the shim as a self-contained scene detector.

glTF-Transform v4.5.1 source: MIT (Don McCurdy); retain LICENSE.md. Partial pinned GitHub source snapshot only; CLI downloaded via npm when network access permits; do not pretend it was installed by adding metadata. Meshopt quantization may affect vertex precision; original GLB remains immutable. glTF model textures, meshes and animations keep their own distinct licenses.

three-mesh-bvh v0.9.18: MIT (Garrett Johnson); upstream v0.9.18 commit 1d92383233482f12512ef0804748de45ad7f2f60. Vendored LICENSE and src/index.js are pinned GitHub excerpts, NOT a complete install. Full runtime is npm dependency three-mesh-bvh@0.9.18.

three-bvh-csg v0.0.18: MIT (Garrett Johnson), tag commit 0ac3a84662958579d3627bbfcd6bb81746c2d699. License and selected upstream source exports/constants are pinned exact GitHub blobs only; NOT a complete upstream clone or installed runtime. Requires npm three-bvh-csg@0.0.18, three@0.186.1 and three-mesh-bvh@0.9.18. Parent repo describes experimental possible nonmanifold results; never infer Rapier collisions from CSG output. Preserve LICENSE notice in model build.


recast-navigation-js@0.44.0 (Isaac Mason), MIT. Pinned upstream tag `recast-navigation@0.44.0` at commit `8a2ece9f8b4947fcb328e17c7ac76c41744021b3`, selected source files and full LICENSE under vendor/recast-navigation-js/. The plugin ZIP contains ONLY these pinned textual excerpts; WebAssembly and full JS packages are pulled by npm when building a game with network. Keep MIT notices. Authored grid fallback is original Game Style Forge code, not upstream code.
