# Three worlds implementation — performance and verification limits

Working copy only: three-worlds-game/. Accepted underwater-world/ and V5–V7 unchanged.

Bounded resources: terrain evicts before allocating, cap 25 chunks; underwater scenery cap 9 chunks; ash scenery cap 9 chunks; one guest and one 384×384 atlas per guest asset factory; finite three-world lifecycle registry; shared renderer/compositor/loop. Longest renderbuffer side capped at 1080 pixels. Ash/fx updates use GPU points; no CPU pixel processing added.

Verified locally: Node invariant tests, deterministic height relief across seeds/regions, four-direction cache traversal/teleport/dispose, source asset geometry creation with Three r160, 200 unique dialogue encounters including save/restore, bounded ascent/descent and collision rejection, standalone export JavaScript parse and embedded GLB integrity.

Not verified: real game traversal, shader compilation, screenshot perceptual quality, mobile dual-pointer regressions, physical iPhone 11, frame time p50/p95, FPS/1%-low, draw calls, GPU/RAM stability over actual transitions. Values are UNKNOWN. Browser starts but WebGL context creation is blocked in this execution environment; no simulated benchmark is substituted.

Required before merge/release: Claude review at exact HEAD, real rendered tests and applicable gates from design §12/§17.5/graf §27, accepted-folder diff, CI green or documented GitHub quota condition plus local results per §18.4. No OWNER PASS/FAIL assigned.
