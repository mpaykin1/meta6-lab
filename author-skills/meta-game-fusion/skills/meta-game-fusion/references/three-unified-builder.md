# Three.js unified builder — META GAME FUSION 1.2.0

## What was integrated

Three.js **0.186.1** is retained to match Rapier 0.21, Recast 0.44, GLTFLoader Meshopt decoder and Postprocessing 6.39.6 (peer `>=0.168.0 <0.188.0`). Official upstream currently tags `r187` as of 2026-11-21; 0.186.1 remains intentional pending browser compatibility verification. MIT; see `vendor/three/LICENSE`.

`scripts/fusion_builder.py` is the unified entrypoint. It consumes indexed game/library metadata plus a **previously validated Rete scene blueprint** or an original concept. It validates requested model reuse by the original file hash and ScanCode status, invokes `rapier_bridge.prepare`, then emits a fresh Vite project. Imported JavaScript mechanics remain **references only**; never `eval` or silently execute them.

`src/living-world.js` adds layered visual stage art from the Rete scene nodes: midground ruined archways and rings, animated foreground forest and lanterns, particles, wind swaying leaves and flickering light. Each stage has independent phases and palette. This scene composer is **visual only**, does not add phantom colliders and never changes player inputs. Rapier remains authoritative for motion and collision; Recast receives walkable geometry from Rapier. The same hero entity persists throughout, no automatic actions. Actual user-approved character artwork must be supplied as approved character-specific animated assets; procedural demo hero is only a placeholder and must never replace uploaded originals.

## Generate a project from an original concept

```bash
python skills/meta-game-fusion/scripts/fusion_builder.py build \
  --library /path/to/fusion-library \
  --concept 'Остров, где маяк помнит исчезнувшие корабли' \
  --visual-style ink --seed 413 \
  --out /path/to/new-game
```

`--concept` creates a playable **three-chapter exploration scaffold**, NOT an authored Ink script and NOT an import of existing whole-game code. To include original dialogue or own art, use a Rete blueprint with approved Ink sources:

```bash
python skills/meta-game-fusion/scripts/fusion_builder.py build \
  --library /path/to/fusion-library \
  --workbench /path/to/rete-workbench \
  --blueprint /path/to/fusion-scene-blueprint.json \
  --out /path/to/new-game
```

Requires a valid `fusion-index.json` from Tree-sitter, even when using `--concept` (may be an empty indexed library). Model copying requires `optimized-model-library.json`, `scancode-rights.json`, separate exact-hash asset approvals in Rete and the optimized output hash. Any missing model fails the entire build; no silent media omissions. Output must be new, outside source trees and outside the library. A temporary staging directory is renamed atomically, avoiding partial output on failure. `fusion-build.json` and `public/world.json` describe the new project, but do not prove browser execution.

The generated `package.json` pins actual external npm modules. Run `npm install --ignore-scripts && npm run dev` in the generated project when network access and package installation are available. To inspect real rendered frames and mobile control, use opt-in Playwright `scripts/playwright_bridge.py run --project /path/to/new-game`. No test report is required by default; do not advertise a hosted URL before deployment.

## Explicit non-goals

- Automatic execution of harvested gameplay scripts or unknown third-party code
- Asset identity substitution, skeleton retargeting, or silent animated-model changes
- Automatic licensing clearance, conversion success, or browser PASS when tools cannot run
- Automatic publishing, mutation of meta6 originals, or downloading dependencies in the background

This module combines the **authorized assets and narrative plan** into a repeatable game project; additional adapter work is required for third-party game mechanics to become executable rather than references.
