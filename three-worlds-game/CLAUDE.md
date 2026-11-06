# Three worlds — working implementation

Read main three-worlds.md, docs/THREE_WORLDS_MERGE_RU.md §§11–19, graf.md §27 and root AGENTS.md before edits. Owner's direct instruction sets ChatGPT as developer, Claude as controller/reviewer. Stages 0→6 use ai/chatgpt/stage-N and one PR per stage; pending review does not block preparing the next dependent branch. Merge only exact reviewed HEAD after applicable gates. Owner alone gives final PASS/FAIL.

This folder is the isolated working copy. Never edit underwater-world/ or accepted V5–V7. No new controls/panels, no invented creatures, no paid API or secrets. Reuse owner-source assets, independent behavior, same renderer and loop, bounded seeded non-flat terrain.

Edit index.source.html and runtime modules; index.html is generated offline output. Rebuild using tools/build-offline.cjs with pinned tools dependencies (tools/package.json). It bundles Three r160 and addons, original classic scripts/CSS, texture payloads and GLBs; do not hand-edit the generated bundle. Node tests: node --test three-worlds-game/tests/*.test.mjs. Actual WebGL/browser/touch/FPS evidence is mandatory, static tests are insufficient.

Progress, leases, exact branch/SHA, PR dependencies, results and blockers live in handoff branch STATUS-chatgpt.md, both mailboxes, and per-stage evidence/notes. Read current SHA before writes. This chat's memory is not the source of truth.
