---
name: casual-game-studio
description: Generate complete cute casual 2.5D/3D HTML5 games using Three.js r187, Tween.js v23.1.3, postprocessing v6.39.6, Blockbench v5.2.0, Rapier 0.21.0, and Three.quarks v0.17.1 and glTF-Transform 4.5.1 and Meshoptimizer 1.3.0, Three-VRM 3.5.5, and KTX-Software 4.4.2 (with Blockbench as external GPL editor; editable .bbmodel → game GLB bridge). Use when a user asks for cute mobile game visuals, toy blocks, physics-style rewards, or a playable game inspired by a video/screenshot.
---

# Casual Game Studio — Ten complementary open-source systems, v1.0.0

You create **fully working 2.5D/3D games**, not just concept art. This is one extensible skill integrating the existing rendering, physics and VFX systems, an external editor, and two cooperating build-time geometry optimizers: Three.js r187 (MIT) for rendering, Tween.js v23.1.3 (MIT) for event-triggered animation, pmndrs/postprocessing v6.39.6 (Zlib) for Bloom and Vignette effects. Preserve the single skill identity for future additions. Add Blockbench as a separate authoring tool, with the independent original model bridge; do not copy GPL editor source into the runtime.

## Required workflow

1. Analyze reference video/screenshot: identify exact palette, shapes, screen layout, depth and interaction. Retain visual language, not proprietary art.
2. Define 4 layers: background; objects/midground; particles/foreground; UI/postprocessing. Map each to static mesh, dynamic system, light, shader, audio or interface.
3. Start from `templates/pastel-blocks` and adapt. For a fresh game, generate via `python scripts/create_game.py --out /mnt/data/game --title "..." --seed 7` from the skill directory.
4. Keep real **Blockbench** models as `*.bbmodel` and export to `*.glb` using `scripts/bbmodel_to_glb.py` for simple visible cube-only models, or Blockbench native glTF/GLB for complex/texture/rigged/animated geometry. The included example lives in `examples/blockbench/pastel-bunny.bbmodel`; the matching real GLB is in the template. Import using `model-loader.js` and upstream Three.js `GLTFLoader` (same pinned `three`). Both 3D and FX must react to the existing Tween.js hit callbacks. Read `references/blockbench.md` for limits.
5. Use real **Three.js** geometries/materials, orthographic camera and correct mobile viewport scaling. Render with `renderer.setAnimationLoop(render)`. All authored animations must use the single bundled Tween.js `Group`: call `motion.update(now)` exactly once per frame. Do not also use manual `tweens[]` arrays for the same animation. Build visually coherent complete gameplay with clear controls.
6. **Tween.js is already downloaded and bundled** as `templates/pastel-blocks/vendor/tween.esm.js`, alongside its MIT license. Generated games get the exact same file. Install Three.js locally when possible: `python scripts/vendor_three.py --game /mnt/data/game`; vendoring puts official r187 ESM modules under `vendor/`. If download is unavailable, online CDN fallback is allowed, but disclose that it requires network.
7. pmndrs/postprocessing uses the ONE same Three.js module via HTML import map (`three`) and `postfx.js` dynamic import of `postprocessing`. Use `EffectComposer -> RenderPass -> EffectPass(BloomEffect,VignetteEffect)`. FX are triggered through Tween.js, not a second render loop. The official upstream shader samples and Zlib license are bundled. The complete official compiled ESM is loaded from pinned CDN until `python vendor_engines.py --game /mnt/data/game` downloads/checks official npm archives and rewrites the import map to fully local files. **Do not falsely say the full pmndrs distribution is pre-bundled.**
8. Use `new Tween(mesh.position, motion).to({...},duration).easing(Easing.Bounce.Out).start()` to animate visible 3D physics-like bounces; use separate tweens for scale, ring bursts, coins, confetti and HUD. Tie all animation to user actions; do not animate gameplay attacks autonomously. Run local `python -m http.server 8000 --directory /mnt/data/game` and open game on a browser; ensure input works, responsive and background/foreground are actually visible. Fix blank canvas, module import and asset path errors before delivery.
9. Deliver game as a runnable folder or ZIP plus a **real working URL** when uploaded/hosted. Never invent a deployed link. Only claim successful browser execution after observed verification. Don't output reports, handoffs, test files or evidence unless user asks.

## Strong graphical requirements

- Layer 1 (far): pastel sky and luminous fog gradient, optional soft distant silhouette.
- Layer 2 (playfield): chunky physical blocks with subtle chamfers, mild shading, material identity (pink ceramic, marble, ice, brick, stone, gold).
- Layer 3 (near): little confetti bursts, fragment movement on hits, falling coins and contact rings; particles must fade and despawn.
- Layer 4 (screen): inset white UI cards, bright blue and amber action buttons, perfectly readable on both mobile and desktop.
- Keep a coherent art palette in `references/style-guide.md`. Read it before modifying colors or materials.
- Enforce stable identities/animation state: characters and key objects never visually change identity between idle/action frames. No autonomous hero actions unless explicitly requested.
- Responsive portrait and landscape, pointer + mouse + keyboard, fixed viewport with touch-action:none while gaming.

## Runtime and dependencies

- Blockbench editor upstream: `https://github.com/JannisX11/blockbench`, tag `v5.2.0` (GPL-3.0, maintained SEPARATELY). Editor source is NOT bundled. Original converter and bunny model ARE bundled. Optional upstream clone: `python scripts/install_blockbench_source.py --out /mnt/data/blockbench-source`.
- Model bridge accepts simple `.bbmodel` cube elements only and creates an actual glTF 2.0 `.glb`; group rigs, UV textures and advanced animations should be exported natively as GLB in Blockbench. Do not pretend conversion of unsupported features.
- Three.js GLTFLoader uses `three/addons/` importmap and is vendored together with `BufferGeometryUtils.js` and `SkeletonUtils.js` in offline bundle.


- Three.js upstream: `https://github.com/mrdoob/three.js`, tag `r187`, version `0.187.0`.
- Tween.js upstream: `https://github.com/tweenjs/tween.js`, tag `v23.1.3`, version `23.1.3`; bundled official ESM `dist/tween.esm.js` Git blob `1ec97cab9d9f8a50c1f90b6b6e8f3085453de17d` (SHA-256 `4e54d74514b1e5940ec5be9ce257539405fce5d49fb8845b12bb8d7d9862d40e`).
- Three.js and Tween.js: MIT; pmndrs/postprocessing: Zlib. Original license texts included in `references/THREE-LICENSE.txt` and `references/TWEEN-LICENSE.txt`.
- This plugin contains original templates, exact upstream Tween.js browser ESM, verified pmndrs GLSL shader source samples, and two secure npm tarball vendor scripts. The game visuals are original code-drawn casual materials; no proprietary game textures are redistributed.
- Official postprocessing pinned ESM CDN: `https://cdn.jsdelivr.net/npm/postprocessing@6.39.6/build/index.js`. Its peer three range is >=0.168.0 and <0.188.0. Import map resolves both engine imports to one shared Three module.
- First-party CDN fallback: `https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js`.
- Prefer local bundled engine for published games; avoid runtime CDN dependencies for offline-targeted builds.

## Built-in script entry points

- `python scripts/create_game.py --out /mnt/data/my-game --title "Candy Tower" --seed 12 --bbmodel /mnt/data/my-mascot.bbmodel` generates a full game directory with the genuine Tween.js module already bundled.
- `python scripts/vendor_engines.py --game /mnt/data/my-game` downloads Three.js r187, GLTFLoader and its two helpers, and pmndrs/postprocessing 6.39.6 official built ESM, checks SHA-512 for both packages, includes their licenses and rewrites game importmap offline. It never replaces Tween.js.
- `python scripts/vendor_three.py --game /mnt/data/my-game` remains available for Three-only vendoring (import map updated).
- `python -m http.server 8000 --directory /mnt/data/my-game` serves locally for browser play.

## Extension policy

For subsequent approved libraries, add an isolated tool or adapter and document license, provenance, constraints, and game integration. Do not create competing GPT skills; one unified `casual-game-studio` release should accumulate capabilities.

## Two engines working together (required)

- **Three.js** owns meshes, materials, lights, camera, raycasting, renderer and world coordinates.
- **Tween.js** owns every event-triggered timeline. Source import: `import { Group, Tween, Easing } from './vendor/tween.esm.js'`; `const motion = new Group()`; `new Tween(mesh.position, motion).to({y: target}, 450).easing(Easing.Bounce.Out).start()`; in render loop `motion.update(now)` exactly once.
- **Integration examples included in real code**: aim highlight glides between columns; attacking orb accelerates toward a target; impacted fragments arc and vanish; middle stack collapses with Bounce easing; gift block spawns coins; score badge springs and returns. Real 3D geometry and game state remain independent of the decorative timelines.
- **Import safety**: Use local bundled Tween.js first. Do not silently replace Tween.js with a handwritten imitation or stale CDN. User input triggers the attack; never trigger attacks from idle rendering. Avoid concurrent destructive animation on the same game object.
- **Performance**: One renderer loop, no per-effect requestAnimationFrame or setInterval; stop and clean up temporary meshes; keep material identity unchanged through motion.

## Three complimentary engines (required for v0.3)

- **Three.js** owns render geometry, original procedural textures, cameras, raycasting, lights and material identity.
- **Tween.js** owns all user-triggered motion (impact, falling pieces, coins, score), and pulse animation of bloom intensity on hit. One `motion.update(now)` per animation frame.
- **pmndrs/postprocessing** owns screen-space Bloom and Vignette via upstream EffectComposer/EffectPass. It must not own a second RAF loop or different Three.js instance. The effects are subtle and optional on slow GPUs, with an explicit FX toggle and a clean-Three fallback.
- **No fake integration:** a CSS filter or homegrown shader may NOT be described as the upstream postprocessing package. See `references/postprocessing.md` for provenance and packaging.

## FOUR complementary systems — v0.5 model bridge

- **Three.js** owns live 3D rasterization, shadows, lights, hit meshes and real glTF-loaded mascot geometry.
- **Tween.js** owns player-initiated mascot jumps plus block destruction, score pops and camera/world interactions; use one `motion` Group.
- **pmndrs/postprocessing** is in the SAME Three.js render loop and gets a one-shot bloom pulse when a block is hit or the mascot is tapped.
- **Blockbench** is the optional stand-alone GPL-3.0 artistic editor. Its human-editable model projects remain `.bbmodel`; game runtime loads compact `.glb` with Three GLTFLoader. Original converter and asset project are included, but no GPL Blockbench editor code is bundled.

Use the supplied source model for each graphic iteration so a model never changes identity across animations. Do not turn model geometry into a flat card. Model format is an asset boundary, not a second render engine.

## FIVE complementary systems — v0.5 Rapier physics

- **Rapier** (`@dimforge/rapier3d-compat@0.21.0`, Apache-2.0) now owns real physics: rigid bodies, colliders, gravity, CCD, collision events and debris spin. `physics.js` syncs Rapier poses into existing Three.js meshes at fixed 60 Hz.
- **Three.js** is still the sole scene renderer. Blockbench `GLB` asset IDs and textures stay unchanged.
- **Tween.js** is still the sole authored presentation animator (HUD, bloom pulses, mascot jumps, aim cursor, board grid reflow). DO NOT tween the transform of an active dynamic Rapier rigid body.
- **Postprocessing** receives an impact flash on a confirmed Rapier collision and retains a clean rendering fallback.
- **Blockbench** remains separately licensed (GPL-3.0), connected through authored `.bbmodel → .glb` conversion.
- One RAF loop only; do not advance physics with a second animation loop. The Rapier adapter uses `world.step(eventQueue)` and drains collisions once per fixed step.
- For a new generated game: `python scripts/create_game.py --out /mnt/data/new-game --title '...'`, then `python scripts/vendor_engines.py --game /mnt/data/new-game` in an online environment. RAPiER package is NOT prebundled; the generator provides a verified network downloader and CDN import map. Be explicit about offline limitations.
- See `references/rapier3d.md` for APIs, licensing and integration details.


## SIX complementary systems — v0.6 Three.quarks VFX

- `three.quarks@0.17.1` and `quarks.core@0.17.1` (MIT) are genuine upstream VFX systems, loaded in `templates/pastel-blocks/particles.js`. Real APIs: `BatchedRenderer`, `ParticleSystem`, `ConstantColor`, `SphereEmitter`, burst emissions.
- Existing Three.js renderer owns the scene and camera; Quarks adds one scene batch and `particles.update(dt)` inside the already existing frame loop. NO new RAF or second WebGLRenderer.
- Rapier remains the sole physical engine: collisions and rigid-body fragments. Quarks reacts to those collision locations with pastel billboards, confetti and magical sparks, never replaces physics.
- Tween.js keeps owning UI, mascot jumps, block reflow and bloom pulses. Postprocessing composes scene with Quarks particles using the same camera.
- Blockbench mascot identity remains fixed across FX. Petting the same imported `.glb` triggers a timed pink particle burst.
- Support `✿ VFX` independent FX toggle, cap particle counts, dispose each emitter, and cleanly fall back if official module cannot load. The game MUST display `PARTICLES · QUARKS` only when the real package has initialized; otherwise `PARTICLES · FALLBACK`.
- Official distribution and quarks.core are **not prebundled** inside the skill. The game importmap pins official CDN packages; `python scripts/vendor_engines.py --game /mnt/data/new-game` downloads both complete precompiled ESM modules and verifies npm SHA-512 for offline play. Preserve all upstream license notices.
- Read `references/three-quarks.md` when modifying effects. Never claim fallback meshes are the Quarks library. No reports/handoff/test artifacts unless explicitly requested.

## SEVENTH complementary system — v0.7 glTF-Transform

- **glTF-Transform** `@gltf-transform/{core,extensions,functions}@4.5.1` (MIT) is a **build-time asset optimizer**, never a game physics or render engine. Official npm packages only; do not fake their functionality.
- Flow: Blockbench `.bbmodel` → GLB (`bbmodel_to_glb.py` or native Blockbench export) → genuine `dedup()` + conservative `prune()` (`scripts/gltf-transform/optimize.mjs`) → Three.js GLTFLoader with original model identity.
- `python scripts/create_game.py --out /mnt/data/game --optimize-assets --install-optimizer` installs the pinned packages (requires network) and optimizes the model when smaller. `--optimize-assets` only runs previously installed packages. Install into build-tools directory; do NOT ship them in runtime or introduce more frontend downloads.
- Original `.bbmodel` always remains; original `.glb` is backed up if optimization actually yields smaller file. Without size benefit, keep original GLB. `scripts/optimize_glb.py` must print any failure transparently; never claim optimization if npm is unavailable.
- Preserve texture UVs, materials, morph targets, skins, animation tracks and nodes. Default pipeline is **dedup + prune**, without lossy compression or decoders. The subsequent projects Meshoptimizer and KTX may enable optional compression with supported GLTFLoader decoder paths.
- Rapier colliders are authored separately and should not be scaled or mutated by optimization. Tween.js timeline, Quarks emissions and Postprocessing remain tied to same 3D visual meshes and hit events.
- Full instructions/provenance: `references/gltf-transform.md`, `references/GLTF-TRANSFORM-MIT-LICENSE.txt`.

## EIGHTH complementary system — v0.8 Meshoptimizer

- **Official `meshoptimizer@1.3.0` (MIT)** extends the already integrated glTF-Transform `4.5.1` asset pipeline. Compression is enabled only by `--meshopt` and is never faked by a hand-written codec.
- Required flow: Blockbench `.bbmodel` → original `.glb` → glTF-Transform `dedup+prune` → optional `meshopt({encoder:MeshoptEncoder,level:'medium'})` → `.meshopt.glb` → `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)` in Three.js. The original `.glb` must always be retained and used as fallback.
- `meshopt` applies **lossy quantization**, and therefore can subtly change vertex precision. Never say that it is lossless or that it directly increases FPS. For model fidelity, keep it opt-in; do not enable for rigged character assets without visual approval.
- `scripts/gltf-transform/package.json` pins the official npm package; `scripts/gltf-transform/optimize.mjs` uses official `meshopt` and encoder/decoder; `scripts/create_game.py --meshopt --install-optimizer` generates compressed asset only if smaller and verifies output read-back. If npm unavailable, keep uncompressed game and say so.
- For compressed asset runtime, `templates/pastel-blocks/model-loader.js` uses the same `three` import map, initializes original MeshoptDecoder, then loads compressed GLB. `scripts/vendor_engines.py` vendors the exact npm decoder via SHA-512-verified tarball. No extra rendering engine, no extra RAF.
- Rapier colliders are independent of geometry compression; Tween timelines, Quarks sparks, and Postprocessing flashes attach to the same imported scene node. Do not modify their bindings or model appearance.
- See `references/meshoptimizer.md` and MIT license for source details. Next listed option after Meshoptimizer is Three-VRM.


## NINTH complementary system — v0.9 Three-VRM humanoids

- **Real pixiv `@pixiv/three-vrm@3.5.5` (MIT)** is an optional renderer-side humanoid adapter, not a replacement for the established Blockbench asset workflow. Docs: `references/three-vrm.md`.
- Generate a game with `python scripts/create_game.py --out /mnt/data/game`. The default bunny stays unchanged. The game also ships original `models/pastel-scout.vrm`; clicking **♡ HERO** loads this genuine glTF/VRMC_vrm humanoid through the upstream `VRMLoaderPlugin`. **↑ VRM** loads user-selected `.vrm` files from the browser. `--vrm /path/to/my.vrm` copies the avatar to the demo HERO slot.
- On a successful selection, the same VRM scene remains present across every gesture. Buttons **👋 WAVE** and **◡ BLINK** use its mapped human bone and expression (`VRMExpressionManager`); if a capability is absent, disable that command. Do not invent alternative characters or auto-trigger jumps, movements, attacks or facial actions. Failed loads retain the prior character.
- `vrm-avatar.js` and `game.js` use the existing `motion` Tween.js Group plus the original Three.js renderer, Rapier physical contact logic, Three.quarks burst events and postprocessing Bloom. Call `activeAvatar.update(dt)` within the existing render callback before Tween update. Never create a second RAF, graphics engine or duplicate skeleton for idle/attack.
- Source VRM1 sample is authored by this skill using `scripts/make_sample_vrm.py` (16 bone mappings, blink morph targets); preserve authored materials and rig. The sample is a pastel toy avatar, NOT the existing Blockbench bunny rewritten with arbitrary primitives.
- The official JS runtime is loaded from a pinned CDN by default, not stored in the ZIP. To bundle it for offline runtime, `python scripts/vendor_engines.py --game /mnt/data/game` retrieves npm package bytes and SHA-512-verifies them together with the other engines. Never claim offline availability if npm DNS is blocked. Source: `references/THREE-VRM-MIT-LICENSE.txt`.
- Rigged VRM model optimization via glTF-Transform/Meshopt remains opt-in and disabled by default; do not break expression/morph tracks. Any imported model must carry its own suitable redistribution rights.


## TEN complementary systems — v1.0 Khronos KTX-Software GPU texture pipeline

- The official KTX-Software `ktx` CLI is an **offline asset compression tool**, not a new browser rendering engine. Use the build-time `scripts/encode_ktx2.py` to encode original PNG source materials into real `.ktx2` files in portable UASTC format (optionally Zstd supercompressed), generating a manifest atomically only after all files exist. The uncompressed PNG sources are included with the game. **Never claim KTX compression happened if the CLI is unavailable.**
- Add `--ktx2` when generating a game only if the official `ktx` executable is installed. For an existing emitted game: `python encode_ktx2.py --game .`. The default game continues to use its original CanvasTextures. No forced download of an executable or untrusted source.
- The **same Three.js renderer** uses `KTX2Loader` from official r187 addon, `detectSupport(renderer)` and its Basis JS/WASM transcoder; it patches the existing cube materials only after every new compressed texture is successfully decoded. **No model replacement, no physics/animation reset, no second RAF**.
- `vendor_engines.py` and `vendor_three.py` collect the full official KTX2Loader dependencies from the signed-by-registry SHA-512-verified Three.js 0.187.0 tarball for offline game delivery in an online build environment.
- Preserve the same palette and existing material identities. On a missing KTX2 file, CDN/module/WASM error, or unsupported GPU format, keep the CanvasTexture rendering and display `TEXTURES · CANVAS`, never a blank game.
- The external tool's license is Apache-2.0 in native files with several additional third-party licenses; no CLI binaries or Khronos code are bundled in the plugin itself. See `references/ktx-software.md` and `references/KTX-SOFTWARE-LICENSE-NOTICE.md`.


## ELEVEN complementary systems — v1.1 Three Mesh BVH spatial acceleration

- Use the actual `three-mesh-bvh@0.9.18` MIT implementation via `templates/pastel-blocks/bvh-picking.js`, not homemade collision math. It is a **spatial query accelerator**, NOT a second physics engine and NOT a mesh file compressor.
- Three.js static shared rounded tile geometry builds one `boundsTree` through upstream `computeBoundsTree`. Only static tile mesh instances receive `acceleratedRaycast`; `raycaster.firstHitOnly=true`. Do not patch `THREE.Mesh.prototype` globally, or the live VRM rigs and physical fragments.
- The same raycaster returns a true world-space contact point. Tween.js drives the hit ripple; Rapier continues to control projectile dynamics, impulses and collisions. Quarks and postprocessing continue responding to the same events; preserve character identity and living-world animation.
- ImportMap pins official Three-Mesh BVH. `vendor_engines.py` downloads and verifies the npm tarball SHA-512 and copies the full official ESM `src/` tree into vendor files, preserving license and same Three.js instance. Do not assert full offline functionality until dependencies have actually been installed.
- If the library fails to load or build, show `PICKING · STANDARD`, restore native Three.js raycasting, and keep gameplay active. Never claim speed-up without a relevant benchmark; board geometry is relatively small. Read `references/three-mesh-bvh.md`.


## ELEVENTH add-on: Three-BVH-CSG 0.0.18 for interactive tile carving (v1.2)

- Read `references/three-bvh-csg.md`. Import actual official `Brush`, `Evaluator`, `SUBTRACTION` from `three-bvh-csg@0.0.18`, using existing `three-mesh-bvh@0.9.18`, Three.js 0.187.0 and the *same* render loop. No substitute fake hole decals.
- Only the `CARVE` button or `C` key may carve an actual closed cylinder through the selected static tile. Preserve all character identities and animations. No auto actions.
- Rebuild a **new BVH** on each resulting geometry; keep original shared block mesh geometry untouched. Rapier keeps its conservative box collider, so visual bore is not a true physics void. On hit use existing contact, shards, Tween, Quarks and Bloom hooks.
- Three-BVH-CSG is experimental: validate CSG result and fail safely; never crash scene or claim guaranteed manifold geometry. Cap runtime cuts to avoid frame spikes.
- Vendor `three-bvh-csg` from official npm registry SHA-512-verified package using `vendor_engines.py`; no fake local module when DNS unavailable. Do not claim offline or a live deployment unless observed.
- Keep prior 11 technologies and the full-screen portrait/landscape living-world guard; no new game loop or model substitution.
