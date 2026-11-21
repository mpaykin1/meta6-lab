---
name: hero-interop
description: Use when passing authorized 3D GLB assets from Voxel, Blender, Casual or Fusion to the one existing Hero Animator plugin via glTF-Transform 4.5.1.
---

# Hero Animator — cross-skill glTF compatibility

For glTF-Transform 4.5.1, use `node skills/hero-animator/scripts/gltf_prepare_compat.mjs SOURCE.glb OUT.glb` from the plugin root with dependencies installed. This is a tiny compatibility entrypoint for the original (unchanged) Hero `gltf_prepare.mjs`; it maps the removed `Node.getParent()` API to `getParentNode()` before loading the original script. Do not duplicate Hero Animator, replace approved artwork, or auto-start player animations. Preserve original files. Require real GLB roundtrip and scene render confirmation before claiming completed integration. Once the original source adopts `getParentNode()` directly this shim is obsolete; prefer a direct source fix in that release.
