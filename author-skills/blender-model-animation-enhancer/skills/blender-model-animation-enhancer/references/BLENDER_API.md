# Blender API integration notes

Source repository: https://github.com/blender/blender
API documentation: https://docs.blender.org/api/current/
GLB/glTF 2.0 addon: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html

Blender is GPL-3.0. The official Blender binary and its full source are **not** included in this skill. Our Python automation scripts are authored for this package; they invoke Blender through its Python interface when Blender is installed. Source README and COPYING are included for provenance under vendor.

Supported import operators (Blender 4.5/5.0):
- `bpy.ops.import_scene.gltf(filepath=...)` (GLB/glTF)
- `bpy.ops.import_scene.fbx(filepath=...)` (FBX)
- `bpy.ops.wm.obj_import(filepath=...)` (OBJ)
- `bpy.ops.wm.open_mainfile(filepath=...)` (BLEND)

Supported export:
- `bpy.ops.export_scene.gltf(filepath=..., export_format='GLB', export_animations=True, export_skins=True, export_morph=True)`

Safer operations:
- `bmesh.ops.remove_doubles` + `bmesh.ops.recalc_face_normals` **only on unskinned, no-shape-key, single-user meshes** and **only with user opt-in**.
- `KeyframePoint.handle_left_type = handle_right_type = 'AUTO_CLAMPED'` on existing BEZIER curves for user-initiated animation smoothing; action APIs vary across Blender versions.

Limitations:
- Hard-surface and hand-illustrated styles may need flat normals. Default pipeline does not change shading.
- `FBX` animation armatures and glTF exporter NLA options require scene-specific inspection.
- `.obj` has no native skeletal animations; the output will not magically contain clips.
- Geometry retopology/rig generation/texture synthesis/AI motion capture are **future separate tools**, not capabilities claimed by the Blender-only first iteration.
