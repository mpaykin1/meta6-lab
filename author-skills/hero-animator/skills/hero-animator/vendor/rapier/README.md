Rapier 3D runtime dependency
============================
Project: https://github.com/dimforge/rapier
JavaScript package: @dimforge/rapier3d-compat@0.21.0
License: Apache-2.0 (upstream LICENSE; Apache Software Foundation license text).

Hero Animator adds the real Rapier 3D API adapter but does not contain the large upstream WASM binary. The game bundler MUST install the version-pinned official npm package and embed it in its completed local HTML. No CDN substitution or JS fake physics is allowed.

Model/render pipeline: approved GIF+PNG → rembg/RIFE candidates (approval required) → atlas → HybridActor/Three.js + Rapier kinematic capsule.
