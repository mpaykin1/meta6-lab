# GRAF Weather + Wind V4 — autonomous 3D prototype

**Owner verdict for V4: PENDING**. Do not label PASS or FAIL until the owner explicitly decides.

## Source and test
- Exact offline HTML: [index.html](index.html), usable offline (no CDN).
- Git SHA-1 of source blob: `66a449480b23cce23c9e7000506c42c15f1b9622`.
- Accepted baseline V3: [Weather Lab V3](../weather-showcase-graf-20261017/index.html); leave it unchanged.
- General standard: [graf.md](../graf.md), §27 and §27.1.
- Command to find this work in another chat: `weather-wind mpaykin1/meta6`.

## Two icon controls
- Top right weather button: cycles the original eleven particle and lighting modes.
- Adjacent small wind-icon button: cycles **18 independent wind patterns**, including right/left, toward/away from camera, up/down, both spirals, gusts, suction, blast, waves, alternating fronts, both diagonals, ascending tornado, turbulence, calm.
- Wind drives both foreground atlas FX and real 3D world-space particle velocity/rain streak direction in shared frame rendering. Camera yaw is accounted for when projecting screen-relative wind to 3D.
- Fixed HTML viewport and independently rotatable orbit camera; wind/button interaction doesn't pan HTML.

## Technical checks, not owner acceptance
- Phone-simulated 390×844: 11/11 weather modes and 18/18 winds, minimum weather particle grid coverage 91/100, no JS errors, scroll 0.
- Desktop FX isolated at 1200×730: minimum particle grid coverage 97/100 across all weather and wind presets, no JS errors. The headless GPU/WebGL renderer wasn't available, so this is **FX-layer evidence**, not full 3D desktop GPU verification.
- Source JS syntax checked; embedded assets and zero CDN imports confirmed.
- Physical iPhone 11 FPS, long-session memory, full hardware-WebGL signoff: **UNKNOWN**.
- Keep approved V3 immutable. Upon owner's PASS/FAIL separately record validated result and lessons, never decide automatically.

## Notes
This V4 is a separate candidate and does not imply any integration into Observer World V7 or the full original game. A GitHub Pages deployment URL may be enabled by existing repo settings, but it must be verified independently before being claimed live.
