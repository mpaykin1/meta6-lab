# KTX-Software 4.4.2 + Three.js KTX2Loader r187

Official: https://github.com/KhronosGroup/KTX-Software/tree/v4.4.2
Official CLI: https://github.khronos.org/KTX-Software/ktxtools/ktx_create.html
Three.js docs: https://threejs.org/docs/pages/KTX2Loader.html

1. Keep uncompressed original PNG sources `templates/pastel-blocks/textures/png/{pink,peach,ice,stone,brick,cream,mint,gift}.png` for editable, licensed art.
2. Build using installed official `ktx` binary:
   `python scripts/encode_ktx2.py --game /path/to/game` or
   `python scripts/create_game.py --out /path/to/game --ktx2`.
   Internally uses `ktx create --format R8G8B8A8_SRGB --encode uastc --uastc-quality 2 --generate-mipmap --zstd 10 --convert-texcoord-origin bottom-left input.png output.ktx2`.
3. The script validates each real KTX2 file header and publishes `ktx2-manifest.json` atomically only once all eight textures are emitted. Never produce placeholder KTX2, or label an uncompressed PNG as compressed.
4. The runtime imports the real upstream Three.js `KTX2Loader` dynamically, `setTranscoderPath('./vendor/three-addons/libs/basis/')`, and `detectSupport(renderer)`. The official Three.js addon uses its own relative basis decoder; `vendor_engines.py` and `vendor_three.py` now include its full dependency set (WorkerPool, ktx-parse, zstddec, ColorSpaces, Basis JS + WASM).
5. KTX2Loader returns the appropriate supported GPU format for the hardware. Swap only the existing MeshStandardMaterial.map (no entity or hitbox replacement). No extra renderer loop; physics, Tween, Quarks, VRM, Bloom remain independent.
6. If the manifest is absent/uncompressed, wasm/network support is missing, an asset fails to decode, or GPU format is unsupported, keep the original CanvasTextures without any visual disappearance.
7. The sample package includes PNG sources and the encoder, but NO pre-compressed KTX2 or native Khronos executable, because this isolated environment cannot download/execute that upstream CLI. Treat it as an operational pipeline, not as evidence that size reductions were measured.
8. `vendor_engines.py` fetches the official Three.js 0.187.0 binaries with npm registry SHA-512 validation and provides the KTX2 decoder for a fully offline game in an online build environment. This is independent from installing KTX-Software CLI on the author's workstation.

KTX-Software licensing: generally Apache-2.0 with various embedded third-party licenses — see upstream license notice. KTX2 GPU textures have lossy codec transcode characteristics; preserve source PNG and sample screenshots for the user's art approval.
