# Instant Meshes upstream provenance

Project: Instant Meshes — https://github.com/wjakob/instant-meshes

Authors: Wenzel Jakob, Marco Tarini, Daniele Panozzo and Olga Sorkine-Hornung (SIGGRAPH Asia 2015).

**Source inspected from the official repository using the connected GitHub source reader:**
- `README.md` source at https://github.com/wjakob/instant-meshes/blob/master/README.md
- `src/main.cpp` source at https://github.com/wjakob/instant-meshes/blob/master/src/main.cpp (CLI flags for batch mode)
- `LICENSE.txt` at https://github.com/wjakob/instant-meshes/blob/master/LICENSE.txt — BSD-style redistribution terms

**Not bundled:** Complete Instant Meshes source, third-party git submodules or compiled binaries. Direct cloning in the build environment failed because `github.com` could not resolve. The official source download helper in the Skill clones recursively when available. Do not describe this directory as a full checkout.

The authored bridge `scripts/instant_meshes_worker.py` runs the official CLI and uses its OBJ input/output. It does not implement the Instant Meshes research algorithm itself.
