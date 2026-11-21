# Material Maker — official upstream provenance

- Source: https://github.com/RodZill4/material-maker
- Verified master SHA: `7d6daae3c74c09720afe4138ce09699ab3591ce1` (2026-10-24)
- License: MIT, Copyright 2018-present Rodolphe Suescun and contributors, https://github.com/RodZill4/material-maker/blob/master/LICENSE.md
- Verified native CLI in `parse_args.gd`: `--export-material`, `--target`, `--output-dir`, `--output-file`, `--size`.
- Verified `addons/material_maker/nodes/material.mmg`: official `GLTF/Plane` export target emits PBR albedo, ORM, normal and emission PNG maps.
- Our original adapter scripts run the upstream application *as a separate process*; they do NOT embed a copy of the native Godot application, the complete Material Maker source, or other upstream authors' textures.
- Retrieve official source on a connected machine using `scripts/get_official_material_maker_source.sh`. The current environment could not access github.com over DNS, so no full checkout is bundled. Actual material generation requires the native executable.
