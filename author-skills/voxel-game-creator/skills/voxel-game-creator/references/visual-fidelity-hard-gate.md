# Native graphics fidelity, not demo imitation

- Requirement: exactly the pinned source engine, complete native scene; add-on effects extend and never replace native terrain/materials/water/physics.
- Offline artifact: inline real built JS and all local assets, no CDN/fetch; if impossible, say so and do not substitute a scratch renderer.
- Failed frame bug: `gl_VertexID` fullscreen triangle p=(0,0),(2,0),(0,2) mapped with `p-1` covers only half the NDC square. Correct mapping is `p*2-1`. Correctness must be verified in both orientations with real WebGL frames.
- Visual source acceptance: landscape, authored vegetation, structures, visible characters, proper lighting and authored models are all recognisable at screenshot crop; otherwise abort release.
- Run `source_fidelity_guard.py` from the same skill. For `--preview` the gate returns **preview only** and may not certify the native engine.
