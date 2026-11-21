# CASUAL GAME STUDIO — Visual DNA

Inspired by the user's gameplay reference: soft powder-blue sky, candy-pink tile towers, pale turquoise ice, sandstone and brick blocks, colorful rewards, thick-rounded interface and energetic fracture particles.

## Depth layers

1. Background: sky gradient, distant pale clouds, subtle bloom-like glows (CSS, optional scene sprites).
2. Midground: readable toy-like chunky tiles; offset face shades, short outlines, matte pastel surfaces, highlights.
3. Foreground: airborne shards and confetti, golden coin arcs, ground contact shadows, soft floor reflections.
4. Screen layer: translucent rounded cards, thick pressable buttons, tactile score bounce; no constant full-screen shaking.

## Palette

sky #aeddfc; lavender #b6a4e6; coral #ff93a8; peach #ffd09f; mint #9ce6d9; ice #b8f5ff; brick #d98159; stone #bec2d3; gold #ffc85c; blue #257cc7; ink #384772.

## Rendering principles

- Orthographic camera with 10-20° pitch and slight yaw for 2.5D look; do not use full perspective distortion.
- Directional + hemisphere + ambient fill, sRGB and ACES filmic tone mapping, soft contact shadow.
- Geometry must have genuine thickness; use beveled geometry where available or layered bevel strips.
- Procedural graphics are acceptable for game prototype; original user-supplied artwork, when provided, remains highest priority.
- Reward interactions within 120ms; 0.25-0.65s action animation with ease-out and slight overshoot.
- On mobile: support tap, avoid page scroll during gameplay, bound DPR <= 2; keep hit targets >= 44px.
- Never copy copyrighted third-party game art, character likenesses or proprietary source sprites.
