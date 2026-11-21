# Voxel Atmosphere — style of the supplied night-forest video

Target: pixelated low-poly/voxel campfire clearing in a dark bluish forest, warm orange firelight at center, mushroom houses, narrow ponds, moonlight and depth fog. Reference is guidance for palette/lighting, not a copied asset.

## Four layers

1. Distance: desaturated indigo sky `#131b29`, blue atmospheric fog `#1c2937`, distant tree silhouettes; low-contrast moon.
2. Middle: uneven forest, chunky crown silhouettes, small mushroom houses, scattered stones, bright bonfire; camera 3/4 at ~44° FOV.
3. Near: ground tufts, pond, wet-rock highlights, small fireflies and motes.
4. Screen: actual 3D rendered at reduced resolution (target 380–560 pixels wide), nearest-neighbor CSS scaling, subtle grain, vignette, warm tone mapping; UI in a separate layer.

## Material / light budget
- Rough materials and faceted geometry, limited palette; don't force glossy PBR everywhere.
- Fire point light: `#ff7630`, intensity dynamic + movement-synchronized geometry; blue directional moon.
- Blue fog for depth; orange local lights (houses and lamps), vegetation should stay dark.
- Fire is a dynamic, shader-like event, not a static drawing. Each hero action is triggered only by input.

## Asset identity
- Voxel forest objects should be real 3D volumes with front/back/side silhouettes, not flat cards.
- The player is one persistent hierarchy, not alternate stand/run/attack meshes.
- Generate or import textured Blockbench GLB; never replace user-approved art with generic blocks silently.

## Performance
- Combine static material groups for drawcall reduction; use level of detail / frustum culling.
- Pixel render resolution scales to device; keep UI full resolution.
- Prefer GLB/glTF and compressed textures for production; the starter has uncompressed glTF GLB.
- Transparent particles moderate on mobile; pause/resume on visibility change for production.
