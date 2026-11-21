# Rapier 3D 0.21.0 — physical gameplay adapter

Upstream: https://github.com/dimforge/rapier
Official JS package: https://www.npmjs.com/package/@dimforge/rapier3d-compat — Apache-2.0.
Version lock: 0.21.0 (stable); ESM bundle `dist/rapier.mjs` includes base64-encoded WebAssembly.

## Integration

- Game `physics.js` dynamically imports `@dimforge/rapier3d-compat` and awaits `RAPIER.init()` before creating its world.
- Real dynamic projectiles use sphere colliders, -9.81 gravity, CCD and collision-start events.
- Grid blocks have position-based kinematic cuboid colliders synced to animated Three.js meshes.
- After collision starts on the selected top block, scoring runs once; collider/body is removed, and the board reflows with Tween.js.
- Real debris bodies fall, bounce and spin, with platform and block collisions; visual fragments sync from physics each frame.
- Fixed timestep 1/60 s with accumulator and frame-delta clamp. One render loop only.
- Tween.js still controls only gameplay presentation (score, camera aim, coins, Blockbench mascot, Bloom); never tween a Rapier dynamic body's pose.
- Missing Rapier or WebAssembly must report explicit `PHYSICS · FALLBACK`; Tween-only fallback is playable but NOT a physics simulation.
- Use `python scripts/vendor_engines.py --game DIR` to download official registry archives once, verify SHA-512 integrity, and vendor Three.js, Rapier and postprocessing, switching importmap to local references. Tween.js already bundled.

## Licensing and boundaries

The engine binary is *not* stored in the plugin ZIP: official npm packaging provides it on demand. `references/RAPIER-APACHE-LICENSE.txt` contains the Apache-2.0 license; the installed game also carries notices. No other project or plugin is overwritten.
