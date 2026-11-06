# Stage 7 — player-visible repairs and independent review checkpoint

Status: **REVIEW REQUEST**, NOT owner PASS, PR [#49](https://github.com/mpaykin1/meta6/pull/49) remains a draft. Do not merge before Claude REVIEW: OK and owner decision.

Evidence run: [GitHub Actions #39201634797](https://github.com/mpaykin1/meta6/actions/runs/39201634797) — **SUCCESS**, pinned dependencies via `npm ci`, independent standalone offline build, `node --test three-worlds-game/tests/*.test.mjs` **25/25**, Chromium headless with SwiftShader **browser gates OK**, no browser console/page errors.

- `index.html` standalone rebuilt in the **same feature branch** from `index.source.html`, 19 local embedded GLB models; offline-export and byte-for-byte reproducible SHA tests pass. No external runtime dependencies or CDN.
- A+B: shoreline sampling gate, immersion monotonic, 180 virtual frames held-jump buoyancy / release descent and velocity delta below 0.16 per 1/60s. Actual runtime calls the tested simulation, so the previous surface vertical-velocity snap is removed.
- C: actual underwater runtime pooled bubbles = 86 (capacity 96, no CPU pixel effect).
- D: actual instantiated model counts inside radius 40, seeds 1/1337/90210 respectively: ruins 19/14/15; wrecks 1/1/1; fish 44/40/44; plants 26/28/23. Sample relief 4.75/4.92/4.72 blocks, above required 3.
- E: actual rift story kill -> guest removed, rearm cycle 1 delay 65.84s; rewarded departure -> removed, cycle 2 delay 63.79s, checked in game integration via virtual `update(dt)`. No repeated full-minute real-time wait.
- F: real LMB drag changed target yaw from 0.339 to -0.561; independently held virtual touch joystick + second touch camera pointer both active, yaw changed while vx ~0.89. Canvas rect and scroll unchanged.
- G: hero traversed toward real seeded emergent island using `__isle.sim`, x82 -> x142 in 514 virtual steps, final walkable ground y14.26 > sea y3.8, health retained.
- Evidence: `evidence/stage7-browser.json`, `evidence/stage7-shore.png`, `evidence/stage7-depth.png`, `evidence/stage7-rift-guest.png`, `evidence/stage7-emergent-island.png` uploaded in PR branch and CI artifact; shoreline screenshot at night is dark, scene legibility in daytime/other devices remains for controller/owner qualitative judgment.

Known UNKNOWN: physical iPhone, physical GPU, five-to-ten minutes of owner play, artistic quality and owner PASS/FAIL. The short SwiftShader run does not establish real iPhone FPS or visual approval. No accepted V5–V7 or `underwater-world/` modifications. No extra HUD controls.

Reviewer source: `handoff/to-chatgpt/023-review.md`; implementation acknowledgment: `handoff/to-claude/024-ack-review-changes.md`. Tests and screenshots must be inspected by Claude before requesting merge.
