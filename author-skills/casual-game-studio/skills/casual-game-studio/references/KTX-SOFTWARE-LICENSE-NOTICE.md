# Khronos KTX-Software 4.4.2 — provenance and licensing

Upstream: https://github.com/KhronosGroup/KTX-Software/tree/v4.4.2
The build-time `ktx` CLI is NOT redistributed inside this skill. Source code unique to Khronos KTX-Software is generally Apache-2.0, while third-party components can use different licenses. Check the upstream `LICENSE.md`, `LICENSES/` and its REUSE metadata before redistribution.
The KTX2 texture format is an open standard, not the same thing as bundling the upstream encoder. A game's KTX2 files are generated from ORIGINAL png assets by `encode_ktx2.py`, which invokes the real official `ktx create` tool. The script never claims successful GPU texture compression without output files and an updated manifest.
Three.js `KTX2Loader.js` and worker helper modules come from the official Three.js 0.187.0 npm tarball; the bundled Basis transcoder in that upstream distribution has its own third-party notices. The vendor script fetches these only in an internet-enabled build.
