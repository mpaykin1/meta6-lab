# FastNoiseLite v0.14 integration (MIT)

Upstream: https://github.com/Auburn/FastNoiseLite pinned at
`785f37a9ad76e283586a379675085f2063ae03f7`. Official JS/TS
package `fastnoise-lite@1.1.1` is locked through npm (Lumenwild) and pnpm
(Voxelize) when the source game is generated. Optional full source checkout:
`scripts/download_fastnoise.py --out /path/to/source`; full upstream is not
embedded in the Skill. Preserve LICENSE.

Pipeline: native FastNoiseLite OpenSimplex2+FBm (macro field), Cellular
(region field), OpenSimplex2S+Ridged (3D density field) -> reproducible
placement of *existing authored Ragnagrok models* -> grouped Three.js
InstancedMesh placed in Lumenwild/Voxelize with local scene ground heights.
No new renderer, no change to existing engine voxel blocks, caves, saves,
authoritative Voxelize server or player control. Local scenes only.
Yuka NPCs and Recast use their own navigation routes: these purely decorative
models DO NOT become physical obstacles; never claim dynamic navmeshes.

Flags: `--noise-mode auto|off|required`, `--noise-config file.json`,
`--with-fastnoise-source`. When npm/pnpm isn't reachable, auto restores
manifest and lockfile bytes and leaves the game unchanged. Required fails.
JSON configuration: `seed` signed int32; `radius` 12..42 meters,
`spacing` 2.5..9, `frequency` .005..15 (up to .15), `density` 0..1,
`maxInstances` 0..42, and `models` mapping `forest|mineral|rune` to
existing Ragnagrok model IDs. Generated props stay >14m from spawn.
Hard cap: 160k visible model-voxel instances, max 42 props, one mesh
per referenced model and color group, real GL shader/rendering in Three.
The exact 2D/3D FastNoiseLite noise fields are exposed by
`makeNoiseFields(seed)` for future terrain/cave generator integrations.
**Not actual terrain/cave carving in this release.**
