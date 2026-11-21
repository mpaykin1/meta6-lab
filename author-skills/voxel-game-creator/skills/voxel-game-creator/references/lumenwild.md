# Lumenwild: standalone counterpart to the Voxelize multiplayer backend

Repository: https://github.com/Vincent-P-essy/minecraft-clone
Pinned source: `593eddaf542a563c1e9c857d42239be1d5002335` (2026-11-20)
MIT: Copyright (c) 2026 Vincent Plessy. Included as `LUMENWILD-LICENSE.txt`.
Live upstream demo: https://vincent-p-essy.github.io/minecraft-clone/

### Actual code anchors

- `src/main.ts`: `const DEFAULT_SEED = 2026;` replaced with world spec seed. Game runtime, input, day/night, mobile and weather unmodified.
- `src/branding.ts`: `GAME_NAME`, `GAME_TAGLINE` replaced; `index.html` page and menu title updated.
- `src/render/environment.ts` and `src/render/sky.ts`: phase palette replaced, without replacing sky clock or weather simulation.
- `src/render/tile-painter.ts`: imports `src/vgc/theme.ts` from the generated project. Paints original seeded detailed textures first, then remaps selected materials while preserving alpha (emissive & foliage transparency). Thus CPU, WebGL texture atlas and GPU texture array are still built from the same tile painter.
- `src/render/block-colors.ts`: updates flat CPU fallback for devices lacking WebGL2, using same spec palette.
- `src/world/terrain.ts`, `src/world/streamer.ts`, `src/player/*`, `src/game/*`, `src/ui/touch-controls.ts`, `src/render/weather.ts`, `src/render/mesher.ts`: original mechanics kept.
- Static production build: `npm ci && npm run build`, then upload `dist/`. For local use: `npm ci && npm run dev`. Service worker is supplied by upstream Vite config.

### Complementarity / not faking integration

Voxelize and Lumenwild cannot be imported into one runtime unchanged: Voxelize's authoritative state is in Rust server and its WebGPU Three.js client, while Lumenwild uses its own browser-only terrain/chunks/storage/WebGL2 renderer. VGC offers two faithful build targets from one semantic spec. `engine=both` exports both targets with the same palette, title and numeric seed; the map algorithm, block IDs and persisted edits are **not** shared. Lumenwild is neither a WebSocket fallback for Voxelize multiplayer nor a Voxelize client.

Browser mode provides autonomous exploration, crafting, weather, caves, save, mobile UI and working build/dig. Multiplayer mode provides server sync and custom worlds/entities. Add mechanisms to each native engine, don't paste APIs between them. No new licensed third-party textures required by the base Lumenwild procedural renderer. Before packaging games, preserve `LICENSE` from each upstream repo and display original attribution in source distribution.

If no local source is provided and external git access is unavailable, the generator cannot fetch full upstream and must say so. A skill ZIP is not a prebundled game runtime.
