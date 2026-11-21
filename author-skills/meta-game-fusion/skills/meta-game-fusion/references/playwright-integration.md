# Playwright integration — v1.0.0

Official upstream: https://github.com/microsoft/playwright , release 1.65.1 (2026-11-13), Apache-2.0.
Runtime installation is opt-in; only the license and original MGF browser suite are embedded in the plugin.

## Shared module flow

- Tree-sitter/Assimp/glTF-Transform: the asset and gameplay index is generated without executing source code.
- Qdrant: reuses indexed records and new Playwright verification adapter, never grants reuse rights based on test success.
- Rete.js: the validated finite scene graph provides exactly the stage IDs checked in the live world.
- inkjs: full dialogue and choice progression is verified through real visible buttons and event flags, not direct manipulation of Ink state.
- Rapier: actual player collider position, grounded state and jump are verified from a stable read-only observation function.
- Recast: NPC physics position, NavMesh initialization and graph-driven destination are checked.
- Postprocessing: preset and quality transitions are checked without changing the hero or game state.

## Generated world

Every `rapier_bridge.py prepare` output now contains `playwright.config.mjs`, `e2e/runtime.spec.mjs`,
`@playwright/test@1.65.1` as a pinned devDependency, and the extra npm script `e2e`.
All tests launch the actual Vite game via webServer in Chromium (desktop and mobile emulation).
The page exposes `window.__MGF_STATE__()` with read-only current state snapshots.
This API cannot move the player, select a choice, fake physics or bypass game triggers.

After the user expressly requests running checks or deploying the generated game:

```bash
cd /path/to/generated/rapier-world
npm install --ignore-scripts
# Browser runtime must already be available; installing one requires explicit authorization.
npm run e2e
# If a provisioned Chromium exists:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run e2e
```

Without npm/Chromium access, do not mark browser checks PASS or claim a playable URL.
Default setup does not save screenshots, videos, HTML reports or traces, and does not run against the protected original games.
The suite should be extended to cover additional authored components before full-game publication.
