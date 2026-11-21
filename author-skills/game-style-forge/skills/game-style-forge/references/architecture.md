# One workspace, one growing capability graph

Workflow: video → OpenCV measured frames → optional PySceneDetect cuts → verified semantic style profile → curated project selection → git clone SHA-pinned source → adapters → Vite+Three renderer → game.

Visual layers: (1) deep sky and fog (shader), (2) terrain, architecture and ambient particles, (3) ground cover and props near hero, (4) vignette/bloom/UI overlay. Optional webgl-noise injects upstream GLSL noise; postprocessing adds separate screen effects; Rapier attaches a collision world without taking over renderer. MiDaS is optional and never pretends relative depth is accurate 3D geometry.

The skill definition is static between explicit versioned plugin releases; project additions are persisted in workspace lock. A plugin update can bundle the new adapters and revised lock/template only with user authorization and accessible Plugin Creator. Runtime git/npm downloads require network and execute within the user's or tool environment—not inside ChatGPT's stored skill text.


Bundled webgl-noise shader integration (v1.1): exact MIT upstream `src/noise2D.glsl` and `src/noise3D.glsl` retrieved at commit `6abed1e...`, verified against GitHub git-blob SHAs in `references/webgl-noise-snapshot.json`. `install-bundled` copies these into `workspace/sources/webgl-noise`, adds an accurate `partial_snapshot` lock entry, and `build` vendors both GLSL files and the LICENSE into the generated scene. The ground shader uses 2D noise, while a separate sky shader uses animated 3D noise; they never collide in GLSL namespaces. This combines the already-pinned Three.js renderer dependency with upstream webgl-noise; full Three.js source checkout is not claimed.

**Stage 1.2:** the upstream Zlib postprocessing snapshot is checksum-verified against v6.39.6 and combined with Ashima noise as an EffectComposer screen pass. Runtime uses npm `postprocessing@6.39.6` (not the partial source files). The noise shader is injected into both terrain material and full-screen animated atmospheric veil; bloom highlights emissive crystals; color grading/vignette/grain add screen-layer finish. Keyboard P toggles postFX independently of gameplay.

## Rapier 0.21.0 (v1.3)
Three.js is solely responsible for visuals and camera; Ashima Noise handles materials and weather; postprocessing owns screen FX. Rapier's position-based kinematic capsule is the ONLY collision authority when loaded. Visual pillars and physics cylinders share data, dynamic stone debris has rigid bodies, and fixed-timestep movement comes from the character controller. The existing manual collision/jump path remains an error fallback; it must never simultaneously move the active Rapier hero. Rapier runtime WASM is fetched from pinned NPM, never from GitHub snippets.

## OpenCV 4.13.0 (v1.4)
Input video → adjacent frame sampling with OpenCV → Farneback optical flow (median translation-like displacement, residual local motion, motion vector preview), deterministic Lab k-means palette → scene palette and bounded visual knobs. Rapier never uses image flow to move the hero or override collision bodies. Three.js owns materials, scene fog, particle animations; postprocessing owns screen-layer haze and grading; webgl-noise remains single shared source of ambient variation. OpenCV is an offline Python analysis dependency, never shipped as a browser JavaScript runtime. The upstream example source + exact Apache-2.0 LICENSE are partial pinned GitHub snapshots, not a claimed full clone.

## MiDaS 2.5D (v1.5)
Only the exact-source MIT excerpt is included. A separate complete pinned repo+approved model weights is needed for inference, or a ready grayscale map can be imported. Depth map = *relative inverse depth*, not measurements in meters or real geometry. A three-band image-depth shader builds distant perspective layers with subtle parallax while Ashima GLSL adds drifting haze and Postprocessing grades the full result. Existing Three.js game objects and Rapier colliders are never inferred or overwritten by MiDaS. MiDaS upstream was archived; future model swaps require review.

## Stage 8 — shot-aware visual segmentation
PySceneDetect v0.7.3 ContentDetector separates edited video shots. For each shot an OpenCV-selected sharp frame provides an independent Lab palette and brightness preset, with untouched global-frame OpenCV style profile. Deep/near/screen renderer layers can switch shots with N. This is a visual grade change; Rapier and character art are never altered. The selected frame is a valid input for the optional MiDaS depth inference or import step; estimating depth is never implicit. Runtime `scenedetect==0.7.3` must be installed separately; absent runtime is explicitly labeled OpenCV fallback.


## v1.7 GLB asset pipeline

Additional authored props in GLB 2.0 format: register immutable original → optional
Meshopt optimization with pinned glTF-Transform CLI → GLTFLoader with MeshoptDecoder
in Three.js → explicit user-authored box colliders in Rapier (never inferred
from video/relative MiDaS depth). Meshopt is geometry and animation encoding,
not a new renderer, and does not change any approved hero PNG/GIF. It supports
multiple props, retains their scene transforms, and preserves original model
bytes as a recovery path. GLSL and post-processing affect their rendered surfaces
as before. No model has to be provided for the existing scene to work.

## v1.8 spatial BVH without physics duplication

After glTF-Transform restores authored GLB meshes, optional `three-mesh-bvh@0.9.18` indexes only static visual triangles. Three.js raycasts (`E`: surface scan) and camera line-of-sight become precise for complex props. Original mesh index buffers are untouched (`indirect:true`). Skinned/morphed/deforming characters are excluded. This is a render-side query index, never the physics world: Rapier remains the sole source of collision/grounding/jumps, with explicitly authored boxes for additional models. Ashima GLSL, OpenCV, MiDaS, PySceneDetect and Postprocessing are unchanged. The npm runtime is installed separately when building; bundled GitHub excerpts are only license/provenance snapshots.

## v1.9 CSG architectural layer
An extra static structural layer is carved by true CSG. Three.js renders CSG output; the existing BVH indexes only resulting static geometry for raycast / camera occlusion. Rapier uses independently authored *solid material* box proxies around an open arch, not a copied CSG mesh collider. Ashima procedural sky/ground and screen grading continue, and the original GLB source files and hero sprites are immutable.  CSG `SUBTRACTION` is performed once before animation; the light and particles continue animating each frame. Upstream can produce nonmanifold geometry in numerical edge cases; do not imply CSG yields production-safe physics shapes.


## v1.10 Navigation linked to CSG and Rapier

`recast-navigation-js@0.44.0` uses the same author-authored gateway meshes and floor as Three.js/CSG; generating navmesh is not a substitute for collision. The navmesh planner avoids the real CSG opening's structural walls, while Rapier owns the kinematic NPC collider translations and all hero physics. `navigation-grid.js` is an explicit authored-geometry A* fallback if Recast WASM cannot initialize; it's not falsely represented as Recast. Four atmospheric NPCs move with independent patrol schedules and animate head/arms/body and lamp light in the existing GLSL world. All source hero PNGs are untouched.
