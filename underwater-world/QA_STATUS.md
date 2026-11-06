# Twilight Underwater — measured pre-release QA (2026-10-16)
 
Source: [Issue #522](https://github.com/mpaykin1/World_server/issues/522) · [Integrated PR #3](https://github.com/mpaykin1/meta6/pull/3).
 
## Browser / gameplay, real GitHub Actions emulated devices
[Run #38978968611](https://github.com/mpaykin1/meta6/actions/runs/38978968611) — PASS (head `110e5d3332407dfe14af304e6b753381cd1d6c10`).
- Chromium + Three.js WebGL desktop 1440×900: original 21-weapon collection, keyboard WASD/arrow movement, jump hold -> rise underwater/release -> descent, bathyscaphe B, unarmed -> blocked, ranged pistol with ammo -> allowed.
- Mobile 390×844 DPR2 Chromium touch emulation: HUD visible, joystick doesn't scroll document, ascent-only button, middle button fires only with picked ranged weapon, proper release on touchEnd and no zombie pointer capture, top button toggles bathyscaphe. No phone controls on desktop.
- Deterministic loaded chunks bounded at 9 for coordinates in all four directions; surface mode restored upon returning to original lighthouse island.
- Visual WebGL screenshot change ratio (mean RGB delta >20, central viewport): mobile **90.81%**, desktop **87.07%**. Both exceed 85% change-area threshold. **These percentages measure player-visible scene difference, not artistic satisfaction or device-specific FPS.**
- Sunken City original generator builds 19 real GLB models including bathyscaphe, animated fish, Gothic ruins, coral, bell, shipwreck.
 
## Release gate
**Public route must be independently checked by the GitHub Pages live workflow** `.github/workflows/verify-underwater-pages.yml`: real HTTP pages, GLB bytes, old V7 unaffected, desktop + mobile WebGL gameplay and >85% difference from PUBLIC URL. Do not claim publication until it reports PASS.
 
Owner has not decided PASS or FAIL. Never commit either outcome or close the World_server issue until user explicitly gives verdict. Source should be discoverable by new ChatGPT, Codex and Claude chats through root [CLAUDE.md](../CLAUDE.md).
