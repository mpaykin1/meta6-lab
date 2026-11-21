# Rapier 3D + Hero Animator — one actual physics controller

**Engine:** `@dimforge/rapier3d-compat@0.21.0` (Apache-2.0), https://github.com/dimforge/rapier. Pin the exact npm version. Official API: https://rapier.rs/docs/user_guides/javascript/character_controller/ . This is the **third** open-source engine added to the same Hero Animator, after rembg and RIFE.

## Required pipeline

`source GIF/PNG → optional rembg (unapproved cutouts) → optional RIFE (unapproved intermediate frames) → explicit human approval of same hero, all required actions/views → directional_pack.py → existing HybridActor RGBA skin → Rapier kinematic 3D capsule/controller → Three.js/GLSL render`.

**Rapier only controls physics.** It must never infer missing art, reskin sprites, or trigger animations. No other physics system runs concurrently: do not use `floorAt`, ad-hoc AABB movement, or a second gravity integration when Rapier is active. Do not use the previous `createDirectionalController` along with Rapier on one actor. Use `runtime/rapier-directional-controller.mjs` instead. The legacy controller remains for existing games with no Rapier.

## Actual integration

1. In the new game's package.json install `@dimforge/rapier3d-compat@0.21.0`; use a bundler (esbuild/Vite) that resolves the npm package. The `-compat` artifact embeds WASM in JS; a bundled game can run without network. **The npm WASM binary is not included in this SKILL archive.** If package is missing, fail closed with an explicit error, not a fake Rapier.
2. `const RAPIER=await loadRapier3D();` imports and initializes WASM using `runtime/rapier-world.mjs`. Do this once per game. Create `const physics=createRapierHeroPhysics({RAPIER,root:actor.root,...})`.
3. Register every walkable slab, obstacle and wall using `physics.addStaticBox({center:{x,y,z},size:{x,y,z},tag:'terrain'})` or `addStaticTrimesh({vertices,indices,position})`. `size` is **full world-space dimension**, `center` is world-space center. Actual THREE visible geometry must match real collider geometry. No automatic ground or invisible box to hide incomplete levels.
4. Call `createRapierDirectionalController({THREE,actor,camera,canvas:renderer.domElement,physics,directions:8,onAttack})`. It reuses `validateDirectionalHero` and the actual RGBA atlas, all 4/8 angles, manual controls, attack windows, hurt/death from real gameplay events, and camera. For a 4-view game explicitly choose `directions:4` and approved clips.
5. Each rendering frame calls **only** `controller.update(Math.min(clock.getDelta(),.05))` then `renderer.render(scene,camera)`. The Rapier adapter substeps at most 1/60 s, computes `KinematicCharacterController.computeColliderMovement`, reads `computedMovement/computedGrounded`, applies `setNextKinematicTranslation`, and advances `world.step`. Hero visual foot pivot is synchronized to the collider capsule. On key release the character does not move itself.
6. `physics.overlapsBox({center,size,includeTags:['enemy']})` uses Rapier broadphase/shape overlap for combat. Register enemies with `tag:'enemy'`. Hit callback is only called in attack's approved `hitActive` window and at most once per attack. Game logic must then check whether the queried colliders are alive, belong to the intended team, and are damageable. Merely showing an attack animation is not a registered hit.
7. For crouch, the real capsule is resized downward. Standing again only happens if Rapier detects adequate head clearance; blocked standing keeps a crouched collider and animation. Jump on Space only when grounded. Dodge/roll on Q/F require a key press. Jump, gravity, collision, stairs, slopes and ceiling contacts are geometric, not video-frame-driven.
8. For restart use `physics.teleport(spawn)`; do not write directly to `actor.root.position` except before initial physics creation. On level exit dispose controller (optionally `{disposePhysics:true}`) and original actor texture resources. Preserve the user's current game-state logic.

## Offline packaging

The `scripts/rapier_bundle.mjs` helper can install pinned npm dependencies and compile one game entry module into inline `<script>` HTML. It does **not** replace the existing GIF/PNG base64/atlas packer: the game entry itself must embed approved JSON and atlas images, or the build is NOT standalone. No CDN, local `fetch(file://...)`, or WASM fetched at runtime. Use `-compat` npm package because WASM is base64-embedded. Release only when `file://` launch works on target browsers; never claim a working offline demo without running one.

License: Rapier `Apache-2.0` — include its LICENSE and any distributed upstream NOTICE when shipping copies. This skill only contains integration code and a pinned npm dependency, not a bundled upstream WASM binary. Its version and package hash should be recorded when preparing an actual game.

## Example game setup (requires approved actor assets)

```js
import * as THREE from 'three';
import {loadHybridActor} from './runtime/hero-hybrid.mjs';
import {loadRapier3D,createRapierHeroPhysics} from './runtime/rapier-world.mjs';
import {createRapierDirectionalController} from './runtime/rapier-directional-controller.mjs';

const RAPIER=await loadRapier3D();
const actor=await loadHybridActor({THREE,atlasUrl:'./approved/hero.json',worldHeight:1.8,billboard:true,multiAngle:true});
scene.add(actor.root);
const physics=createRapierHeroPhysics({RAPIER,root:actor.root});
physics.addStaticBox({center:{x:0,y:-.35,z:0},size:{x:40,y:.7,z:40},tag:'terrain'});
physics.addStaticBox({center:{x:2,y:1,z:-4},size:{x:2,y:2,z:1},tag:'obstacle'});
const controller=createRapierDirectionalController({THREE,actor,camera,canvas:renderer.domElement,physics,directions:8});
function frame(){controller.update(Math.min(clock.getDelta(),.05));renderer.render(scene,camera);requestAnimationFrame(frame)}
frame();
```

The snippet presupposes real `scene`, `camera`, `renderer`, `clock` and approved sprites created elsewhere in the game. Do not ship this snippet alone as a playable artifact.
