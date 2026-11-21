# EMBERGROVE — Living Forest 0.10.0

Five original voxel inhabitants have independent animated behaviour and paths around actual Goxel/Blockbench models. Navigation: Recast Navigation 0.44.0 NavMesh / Detour Crowd when loaded, otherwise deterministic collision-aware A*. `N` shows route markers. Real Rapier collision and Quarks particles remain optional upstream dependencies.

Launch with `python -m http.server 8000` from this folder. Requires browser access to Three.js CDN and optionally to Recast/Rapier/Quarks; source GLBs and Pixelorama textures are local. Portrait and landscape resize dynamically.
