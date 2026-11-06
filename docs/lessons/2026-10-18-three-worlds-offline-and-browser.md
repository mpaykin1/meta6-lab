# Confirmed process errors during three-worlds implementation

No owner PASS/FAIL is assigned by this record.

1. The inherited module/importmap/CDN arrangement cannot satisfy autonomous file://. Fixed by a reproducible bundled classic-script export, inlined original classic scripts/CSS and 19 GLB payloads. Source stays in index.source.html. Checks: every inline script parses; no external script/style/importmap; GLB magic and byte lengths verified.
2. JavaScript String.replace replacement strings interpret dollar patterns inside bundled library code. This duplicated the original source inside the generated output. Fixed by a replacement callback. Regression: vm.Script parses every generated inline script. Do not feed generated JS through a replacement string.
3. Initial WorldManager.dispose disposed inactive worlds, causing a double-dispose. Fixed to dispose only the active world; repeated transition count returns to zero.
4. Initial terrain blend measured distance from x=63 instead of the x=64 boundary. Fixed boundary clamp; four-edge continuity test now passes.
5. Browser download retries returned truncated archives. A packaged Chromium alternative was acquired and extracted without unsupported chown. It starts, but this execution environment cannot create WebGL (BindToCurrentSequence failed). This is ENVIRONMENT_BLOCKED, not game PASS or game FAIL. Further identical retries are stopped. Actual rendering, GPU shader compilation, traversal, touch and FPS require Claude's available browser/device verification. Connected Desktop Commander device was offline.
6. An existing ack-003 caused GitHub create-file to return 422. Read the existing ack instead of retrying a create. Read current SHA and detect existing files before writing.
