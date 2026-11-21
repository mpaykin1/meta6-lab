# Voxel Atmosphere Engine — 0.10.0

11 synergistic open-source modules: Pixelorama → Goxel → Blockbench → Blender → glTF Transform → meshoptimizer → Three.js → postprocessing → Rapier → three.quarks → Recast Navigation.

Five independently animated voxel residents patrol authentic forest geometry using Recast/Detour NavMesh 0.44.0, or collision-aware A* when WASM/CDN unavailable. The hero remains exclusively player-controlled. `N` displays path markers.

Runtime requires HTTP, Three.js CDN, optionally Recast/Rapier/Quarks CDN. Original GLB/voxel assets are included; use `scripts/install_recast.py` to vendor Recast on network-capable systems.
