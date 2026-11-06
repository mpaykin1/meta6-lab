# Stage 7 — after owner correction 032
Status: CODE GATES VERIFIED IN CI, CLAUDE REVIEW PENDING, OWNER PASS/FAIL UNKNOWN. PR #49.

Owner correction: handoff/to-chatgpt/032-short-tests-correction.md overrides 029 item 1. The maximum integrated virtual time is 60 seconds / 1800 × 1/30 s. One scenario per brief Node test; no longer 9000 steps or 31-frame browser capture.

## Verification, October 19, 2026
- A: real `terrainTop(x,32)`, x=58..76 every 0.5 m; immersion 0→1 with max half-meter step <0.15 and slope ≤20°. Ground and mesh share the profile.
- B: hold-jump buoyancy, release and bottom/surface bound, verified in short Node tests.
- C: distant ambient bubbles from existing wreck/ruin anchors and player bubbles use the same bounded 96-slot allocator, Node and live WebGL checks.
- D: live and Node placement share `ocean-placements.mjs`; category counts on seed 1/1337/90210: ruins 18/13/16, wrecks 2/2/1, fish 42/39/39, plants 26/28/23. Full loaded names listed in `evidence/stage7-browser.json`. Source model inventory lacks galleon, whale skeleton, anchor, cannon, kraken tentacle, sun rays, marine snow, and plankton. **MISSING** (not falsely counted as implemented).
- E: 50–70s seeded timer, one guest at a time, two completed arcs, source world differs from destination (`guestHomeFor`), short 60s simulated guest cycle; debug acceleration remains optional via URL.
- F: mouse-drag look and concurrent touch joystick/look; canvas rect and scrolling unchanged in emulated Chromium.
- G: seeded emergent islands have actual collidable ground and navigable approach.
- Standalone `index.html` rebuilt and committed by CI bot. Node and Chromium/SwiftShader gate on developer SHA `1e53891e3abd4f9c73cc848ed86754dc12de6fdd`: [successful workflow](https://github.com/mpaykin1/meta6/actions/runs/39224635117). No physical iPhone or dedicated real-GPU claim.
- §20.10: actual code assertions and JSON are evidence; no new long screenshot series.

## Release
Do not merge until Claude REVIEW: OK. Final owner playtest PASS/FAIL cannot be delegated.
