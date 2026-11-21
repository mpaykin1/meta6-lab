#!/usr/bin/env python3
"""Find Blender and invoke the bundled asset processing script (stdlib only)."""
from __future__ import annotations

import argparse
import os
import platform
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def find_blender():
    override = os.environ.get("BLENDER_BIN")
    if override and Path(override).is_file():
        return str(Path(override).resolve())
    on_path = shutil.which("blender")
    if on_path:
        return on_path
    system = platform.system().lower()
    candidates = []
    if system == "darwin":
        candidates.extend(["/Applications/Blender.app/Contents/MacOS/Blender"])
    elif system == "linux":
        candidates.extend(["/usr/bin/blender", "/snap/bin/blender", "/usr/local/bin/blender"])
    elif system == "windows":
        for root in (os.environ.get("ProgramFiles"), os.environ.get("ProgramFiles(x86)")):
            if root:
                candidates.extend(str(x) for x in Path(root, "Blender Foundation").glob("Blender */blender.exe"))
    return next((str(Path(x).resolve()) for x in candidates if Path(x).is_file()), None)


def main():
    parser = argparse.ArgumentParser(description="Blender model/animation enhancer")
    parser.add_argument("--input", required=True, help="GLB, glTF, FBX, OBJ or BLEND input")
    parser.add_argument("--output", required=True, help="GLB or BLEND output, different path from input")
    parser.add_argument("--repair-static", action="store_true")
    parser.add_argument("--smooth-static", action="store_true")
    parser.add_argument("--polish-motion", action="store_true")
    parser.add_argument("--pymeshlab-analyze", action="store_true", help="PyMeshLab mesh diagnostics only")
    parser.add_argument("--pymeshlab-clean-static", action="store_true", help="PyMeshLab cleanup for untextured, unrigged geometry")
    parser.add_argument("--pymeshlab-python", default=sys.executable, help="Python executable containing pymeshlab")
    parser.add_argument("--instant-retopo-static", action="store_true", help="Retopologize static untextured non-rigged meshes with Instant Meshes")
    parser.add_argument("--instant-meshes-bin", default=None, help="Path to native Instant Meshes executable; overrides INSTANT_MESHES_BIN")
    parser.add_argument("--instant-faces", type=int, default=0, help="Desired face count; 0=auto")
    parser.add_argument("--skintokens-rig", action="store_true", help="Create new skeleton+weights for an UNRIGGED character using official SkinTokens CLI")
    parser.add_argument("--skintokens-dir", help="Path to the real SkinTokens repository")
    parser.add_argument("--skintokens-python", default=None, help="Python in SkinTokens CUDA environment")
    parser.add_argument("--skintokens-timeout", type=int, default=3600)
    parser.add_argument("--skintokens-postprocess", action="store_true", help="Use optional SkinTokens voxel postprocessing")
    parser.add_argument("--mocap-video", help="Video for Open Mocap 4.0 offline body tracking")
    parser.add_argument("--mocap-side-video", help="Optional synchronized side-view video")
    parser.add_argument("--mocap-landmarks", help="Previously captured Open Mocap landmarks JSON")
    parser.add_argument("--mocap-addon-dir", help="Checked-out real Open Mocap upstream repo directory")
    parser.add_argument("--mocap-blender40", help="Separate Blender 4.0 for upstream add-on")
    parser.add_argument("--mocap-bone-map", help="Optional explicit JSON of target bone names to landmark pairs")
    parser.add_argument("--mocap-rig-name", help="Explicit armature object name for multi-rig scenes")
    parser.add_argument("--mocap-clip", default="Mocap_Walk", help="New clip name, never automatically starts in game")
    parser.add_argument("--mocap-mirror", action="store_true")
    parser.add_argument("--rigger-source", help="Animated GLB or FBX whose motion should be retargeted to input character")
    parser.add_argument("--rigger-source-action", help="Exact action when source has several clips")
    parser.add_argument("--rigger-source-rig-name", help="Animated source armature name")
    parser.add_argument("--rigger-rig-name", help="Original character armature name")
    parser.add_argument("--rigger-dir", help="Actual official asu37/Rigger checkout, else RIGGER_SOURCE_DIR")
    parser.add_argument("--rigger-bone-map", help="Optional JSON source bone => target bone mapping")
    parser.add_argument("--rigger-clip", default="Rigger_Retarget", help="Name of newly created animation clip")
    parser.add_argument("--rigger-in-place", action="store_true", help="Remove root travel from a looping motion")
    parser.add_argument("--rigger-controls", action="store_true", help="Generate non-destructive Rigger controls on original skeleton; requires BLEND output")
    parser.add_argument("--rigger-game-export", action="store_true", help="Export existing Rigger control rig BLEND to game GLB")
    # Material Maker (seventh open-source integration); strictly opt-in material editing.
    parser.add_argument("--material-ptex", help="Procedural .ptex graph, exported by real Material Maker")
    parser.add_argument("--material-textures-dir", help="Previously exported Material Maker PBR maps")
    parser.add_argument("--material-maker-bin", help="Native Material Maker executable")
    parser.add_argument("--material-object", help="Exact Blender mesh object name; required for material stage")
    parser.add_argument("--material-slot", type=int, default=0)
    parser.add_argument("--material-size", type=int, default=1024)
    parser.add_argument("--material-name", default="MaterialMaker_PBR")
    parser.add_argument("--material-timeout", type=int, default=600)
    # glTF Transform: opt-in last pass for safe GLB size optimization.
    parser.add_argument("--gltf-optimize", action="store_true", help="Run glTF Transform as final GLB pass, or optimize an existing GLB directly")
    parser.add_argument("--gltf-mode", choices=["safe", "webp", "meshopt", "draco", "webp-meshopt"], default="safe")
    parser.add_argument("--gltf-transform-bin", help="Path to official gltf-transform CLI")
    parser.add_argument("--gltf-timeout", type=int, default=600)
    # Meshoptimizer / gltfpack: ninth open-source tool, after glTF Transform.
    parser.add_argument("--meshoptimizer", action="store_true", help="Apply protected gltfpack post-pass after other tools")
    parser.add_argument("--meshoptimizer-mode", choices=["safe", "compressed", "webp", "ktx2", "simplify"], default="safe")
    parser.add_argument("--meshoptimizer-bin", help="Official gltfpack executable path, otherwise GLTFPACK_BIN")
    parser.add_argument("--meshoptimizer-ratio", type=float, default=0.8, help="Simplification for static-only assets")
    parser.add_argument("--meshoptimizer-timeout", type=int, default=600)
    # Official Khronos glTF Validator: automatic when installed, mandatory on request.
    parser.add_argument("--gltf-validation", choices=["auto", "require", "off"], default="auto", help="Run official glTF Validator before accepting game GLB")
    parser.add_argument("--gltf-validator-bin", help="Path to official gltf_validator CLI (or GLTF_VALIDATOR_BIN)")
    parser.add_argument("--gltf-validator-strict", action="store_true", help="Reject warnings as well as errors")
    parser.add_argument("--gltf-validator-timeout", type=int, default=120)
    parser.add_argument("--merge-distance", type=float, default=0.00001)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    source = Path(args.input).expanduser().resolve()
    output = Path(args.output).expanduser().resolve()
    if not source.is_file():
        parser.error(f"Input does not exist: {source}")
    if source.suffix.lower() not in {".glb", ".gltf", ".fbx", ".obj", ".blend"}:
        parser.error("Input format must be GLB, glTF, FBX, OBJ or BLEND")
    if output.suffix.lower() not in {".glb", ".blend"}:
        parser.error("Output must have .glb or .blend extension")
    if source == output:
        parser.error("Input and output paths must differ")
    if output.exists() and not args.overwrite:
        parser.error(f"Output already exists, add --overwrite to allow replacement: {output}")
    # Wrap all existing pipelines with Khronos validation. The child run is
    # forced to --gltf-validation off to prevent infinite recursion. Validate
    # the final rendered GLB in a temp directory before atomic publication.
    if args.gltf_validation != "off":
        from gltf_validator_worker import find_validator
        validator = None
        try:
            validator = find_validator(args.gltf_validator_bin)
        except FileNotFoundError as exc:
            if args.gltf_validation == "require":
                parser.error(str(exc))
        if output.suffix.lower() != ".glb":
            if args.gltf_validation == "require":
                parser.error("Official glTF Validator only accepts .glb outputs")
        elif validator is not None:
            if not 10 <= args.gltf_validator_timeout <= 7200:
                parser.error("--gltf-validator-timeout must be 10..7200 seconds")
            output.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.TemporaryDirectory(prefix="gltf-validate-pre-", dir=output.parent) as work:
                candidate = Path(work) / "candidate.glb"
                original_argv = sys.argv[1:]
                child_argv = []
                i = 0
                remove_values = {"--gltf-validation", "--gltf-validator-bin", "--gltf-validator-timeout"}
                remove_flags = {"--gltf-validator-strict", "--overwrite"}
                while i < len(original_argv):
                    item = original_argv[i]
                    if item in remove_flags:
                        i += 1
                    elif item in remove_values:
                        i += 2
                    elif any(item.startswith(opt + "=") for opt in remove_values):
                        i += 1
                    elif item == "--output":
                        child_argv.extend(["--output", str(candidate)])
                        i += 2
                    elif item.startswith("--output="):
                        child_argv.append("--output=" + str(candidate))
                        i += 1
                    else:
                        child_argv.append(item)
                        i += 1
                child_argv.extend(["--gltf-validation", "off"])
                # Validate an already-finalized GLB without launching Blender.
                passthrough_flags = ["--repair-static", "--smooth-static", "--polish-motion",
                                     "--pymeshlab-analyze", "--pymeshlab-clean-static",
                                     "--instant-retopo-static", "--skintokens-rig",
                                     "--mocap-video", "--mocap-landmarks", "--rigger-source",
                                     "--rigger-controls", "--rigger-game-export",
                                     "--material-ptex", "--material-textures-dir",
                                     "--gltf-optimize", "--meshoptimizer"]
                needs_processing = source.suffix.lower() != ".glb" or any(
                    opt in original_argv or any(s.startswith(opt + "=") for s in original_argv)
                    for opt in passthrough_flags
                )
                if needs_processing:
                    task = subprocess.run([sys.executable, str(Path(__file__).resolve()), *child_argv], check=False)
                    if task.returncode:
                        return task.returncode
                else:
                    shutil.copy2(source, candidate)
                if not candidate.is_file() or candidate.stat().st_size < 20:
                    print("[gltf-validator] Final GLB not produced", file=sys.stderr)
                    return 5
                worker = Path(__file__).with_name("gltf_validator_worker.py")
                cmd = [sys.executable, str(worker), "--input", str(candidate),
                       "--output", str(output), "--validator-bin", validator,
                       "--timeout", str(args.gltf_validator_timeout)]
                if args.gltf_validator_strict:
                    cmd.append("--strict")
                if args.overwrite:
                    cmd.append("--overwrite")
                return subprocess.run(cmd, check=False).returncode
    if args.meshoptimizer:
        if output.suffix.lower() != ".glb" or args.rigger_controls:
            parser.error("Meshoptimizer postpass requires .glb output, not Rigger controls .blend")
        if args.gltf_optimize and args.gltf_mode != "safe":
            parser.error("For combined processing, use --gltf-mode safe before meshoptimizer; do not double-compress")
        if not 0.1 <= args.meshoptimizer_ratio <= 0.99:
            parser.error("--meshoptimizer-ratio must be between 0.1 and 0.99")
        if not 10 <= args.meshoptimizer_timeout <= 7200:
            parser.error("--meshoptimizer-timeout must be 10..7200 seconds")
        # Build the other stages once, then apply standalone gltfpack as the last
        # postpass. This preserves the order Blender -> glTF Transform -> gltfpack.
        other_flags = ["repair_static", "smooth_static", "polish_motion", "pymeshlab_analyze",
                       "pymeshlab_clean_static", "instant_retopo_static", "skintokens_rig",
                       "mocap_video", "mocap_landmarks", "rigger_source", "rigger_game_export",
                       "material_ptex", "material_textures_dir", "gltf_optimize"]
        prebuild = source.suffix.lower() != ".glb" or any(getattr(args, k) for k in other_flags)
        post = Path(__file__).with_name("meshoptimizer_worker.py")

        def run_post(glb: Path) -> int:
            command = [sys.executable, str(post), "--input", str(glb), "--output", str(output),
                       "--mode", args.meshoptimizer_mode, "--ratio", str(args.meshoptimizer_ratio),
                       "--timeout", str(args.meshoptimizer_timeout)]
            if args.meshoptimizer_bin:
                command += ["--gltfpack-bin", args.meshoptimizer_bin]
            if args.overwrite:
                command.append("--overwrite")
            return subprocess.run(command, check=False).returncode

        if not prebuild:
            return run_post(source)
        output.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix="meshoptimizer-pre-", dir=output.parent) as work:
            intermediate = Path(work) / "preoptimized.glb"
            argv = sys.argv[1:]
            child = []
            drop_switches = {"--meshoptimizer", "--overwrite"}
            drop_values = {"--meshoptimizer-mode", "--meshoptimizer-bin", "--meshoptimizer-ratio",
                           "--meshoptimizer-timeout"}
            i = 0
            while i < len(argv):
                option = argv[i]
                if option in drop_switches:
                    i += 1
                elif option in drop_values:
                    i += 2
                elif any(option.startswith(n + "=") for n in drop_values):
                    i += 1
                elif option == "--output":
                    child.extend(["--output", str(intermediate)])
                    i += 2
                elif option.startswith("--output="):
                    child.append("--output=" + str(intermediate))
                    i += 1
                else:
                    child.append(option)
                    i += 1
            task = subprocess.run([sys.executable, str(Path(__file__).resolve()), *child], check=False)
            if task.returncode:
                return task.returncode
            return run_post(intermediate)

    if args.gltf_optimize:
        if output.suffix.lower() != ".glb":
            parser.error("glTF Transform output must be GLB")
        if args.rigger_controls:
            parser.error("Rigger control rig stage requires .blend output; run glTF Transform only after GLB export")

        # Keep a standalone optimization possible without installing Blender.
        # When other stages are requested, recursively render to an isolated GLB,
        # then validate/compress it; never write an unvalidated final asset.
        flags = ["repair_static", "smooth_static", "polish_motion", "pymeshlab_analyze",
                 "pymeshlab_clean_static", "instant_retopo_static", "skintokens_rig",
                 "mocap_video", "mocap_landmarks", "rigger_source", "rigger_game_export",
                 "material_ptex", "material_textures_dir"]
        must_build_first = source.suffix.lower() != ".glb" or any(getattr(args, f) for f in flags)
        worker = Path(__file__).with_name("gltf_transform_worker.py")
        def optimize(source_glb):
            command = [sys.executable, str(worker), "--input", str(source_glb),
                       "--output", str(output), "--mode", args.gltf_mode,
                       "--timeout", str(args.gltf_timeout)]
            if args.gltf_transform_bin:
                command += ["--gltf-transform-bin", args.gltf_transform_bin]
            if args.overwrite:
                command.append("--overwrite")
            return subprocess.run(command, check=False).returncode
        if not must_build_first:
            return optimize(source)
        # Re-run the existing pipeline once, with only the GLB postpass removed.
        output.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix="gltf-pre-", dir=output.parent) as tmp:
            intermediate = Path(tmp) / "intermediate.glb"
            original_argv = sys.argv[1:]
            child_argv = []
            i = 0
            drop_flags = {"--gltf-optimize", "--overwrite"}
            drop_values = {"--gltf-mode", "--gltf-transform-bin", "--gltf-timeout"}
            while i < len(original_argv):
                arg = original_argv[i]
                if arg in drop_flags:
                    i += 1
                elif arg in drop_values:
                    i += 2
                elif any(arg.startswith(key+"=") for key in drop_values):
                    i += 1
                elif arg == "--output":
                    child_argv.extend(["--output", str(intermediate)])
                    i += 2
                elif arg.startswith("--output="):
                    child_argv.append("--output=" + str(intermediate))
                    i += 1
                else:
                    child_argv.append(arg)
                    i += 1
            task = subprocess.run([sys.executable, str(Path(__file__).resolve()), *child_argv], check=False)
            if task.returncode != 0:
                return task.returncode
            if not intermediate.is_file():
                print("[enhancer] Pre-optimization GLB missing", file=sys.stderr)
                return 5
            return optimize(intermediate)
    if args.gltf_mode != "safe" or args.gltf_transform_bin or args.gltf_timeout != 600:
        parser.error("glTF Transform options require --gltf-optimize")
    if args.material_ptex or args.material_textures_dir:
        if args.material_ptex and args.material_textures_dir:
            parser.error("Use either --material-ptex or --material-textures-dir")
        if not args.material_object:
            parser.error("--material-object is required for opt-in PBR assignment")
        if (args.skintokens_rig or args.mocap_video or args.mocap_landmarks or
            args.rigger_source or args.rigger_controls or args.rigger_game_export or
            args.repair_static or args.smooth_static or args.polish_motion or
            args.pymeshlab_analyze or args.pymeshlab_clean_static or args.instant_retopo_static):
            parser.error("PBR stage must run separately after mesh cleanup/retopology/rigging/retargeting; UVs must exist")
        command = [sys.executable, str(Path(__file__).with_name("material_maker_worker.py")),
                   "--input", str(source), "--output", str(output),
                   "--material-object", args.material_object, "--material-slot", str(args.material_slot),
                   "--material-size", str(args.material_size), "--material-name", args.material_name,
                   "--mm-timeout", str(args.material_timeout)]
        if args.material_ptex:
            command += ["--material-ptex", str(args.material_ptex)]
        else:
            command += ["--material-textures-dir", str(args.material_textures_dir)]
        if args.material_maker_bin:
            command += ["--material-maker-bin", args.material_maker_bin]
        if args.overwrite:
            command.append("--overwrite")
        return subprocess.run(command, check=False).returncode
    if args.material_object or args.material_maker_bin or args.material_textures_dir:
        parser.error("Material options require --material-ptex or --material-textures-dir")
    if args.rigger_source or args.rigger_controls or args.rigger_game_export:
        modes=int(bool(args.rigger_source))+int(args.rigger_controls)+int(args.rigger_game_export)
        if modes!=1:
            parser.error("Use exactly one of --rigger-source, --rigger-controls or --rigger-game-export")
        if (args.skintokens_rig or args.mocap_video or args.mocap_landmarks or
            args.repair_static or args.smooth_static or args.polish_motion or
            args.pymeshlab_analyze or args.pymeshlab_clean_static or args.instant_retopo_static):
            parser.error("Run Rigger in a separate pass on an already rigged character; mesh operations and capture cannot be combined")
        mode="retarget" if args.rigger_source else "controls" if args.rigger_controls else "export"
        command=[sys.executable,str(Path(__file__).with_name('rigger_worker.py')),
                 '--mode',mode,'--input',str(source),'--output',str(output),
                 '--clip',args.rigger_clip]
        for key,value in [('rigger-dir',args.rigger_dir),('source',args.rigger_source),
                          ('source-action',args.rigger_source_action),
                          ('source-rig-name',args.rigger_source_rig_name),
                          ('rig-name',args.rigger_rig_name),
                          ('bone-map',args.rigger_bone_map)]:
            if value is not None:command+=['--'+key,str(value)]
        if args.rigger_in_place:command.append('--in-place')
        if args.overwrite:command.append('--overwrite')
        return subprocess.run(command,check=False).returncode
    if args.mocap_video or args.mocap_landmarks:
        if args.mocap_video and args.mocap_landmarks:
            parser.error("Use either --mocap-video or --mocap-landmarks")
        if args.skintokens_rig or args.pymeshlab_analyze or args.pymeshlab_clean_static or args.instant_retopo_static or args.repair_static or args.smooth_static or args.polish_motion:
            parser.error("Open Mocap stage must operate on a previously rigged character; do not combine with mesh modifications or SkinTokens in the same pass")
        command=[sys.executable,str(Path(__file__).with_name('open_mocap_worker.py')),
                 '--input',str(source),'--output',str(output),'--clip',args.mocap_clip]
        for k,v in [('video',args.mocap_video),('landmarks',args.mocap_landmarks),
                    ('side-video',args.mocap_side_video),('addon-dir',args.mocap_addon_dir),
                    ('blender40',args.mocap_blender40),('bone-map',args.mocap_bone_map),
                    ('rig-name',args.mocap_rig_name)]:
            if v is not None:command.extend(['--'+k,str(v)])
        if args.mocap_mirror:command.append('--mirror')
        if args.overwrite:command.append('--overwrite')
        return subprocess.run(command,check=False).returncode
    if args.skintokens_rig:
        if output.suffix.lower() != ".glb":
            parser.error("SkinTokens requires .glb output")
        if args.repair_static or args.smooth_static or args.polish_motion or args.pymeshlab_analyze:
            parser.error("SkinTokens mode cannot mix ambiguous Blender/polish/diagnostics flags; use only --pymeshlab-clean-static and/or --instant-retopo-static")
        command = [sys.executable, str(Path(__file__).with_name("skintokens_worker.py")),
                   "--input", str(source), "--output", str(output),
                   "--timeout", str(args.skintokens_timeout)]
        if args.skintokens_dir:
            command += ["--skintokens-dir", args.skintokens_dir]
        if args.skintokens_python:
            command += ["--skintokens-python", args.skintokens_python]
        if args.pymeshlab_clean_static:
            command += ["--pymeshlab-clean-static", "--pymeshlab-python", args.pymeshlab_python]
        if args.instant_retopo_static:
            command += ["--instant-retopo-static", "--instant-faces", str(args.instant_faces)]
            if args.instant_meshes_bin:
                command += ["--instant-meshes-bin", args.instant_meshes_bin]
        if args.skintokens_postprocess:
            command.append("--use-postprocess")
        if args.overwrite:
            command.append("--overwrite")
        return subprocess.run(command, check=False).returncode
    if args.pymeshlab_analyze or args.pymeshlab_clean_static:
        # Do not silently continue with a Blender-only pipeline when the user
        # explicitly requested PyMeshLab processing.
        probe = subprocess.run([args.pymeshlab_python, "-c", "import pymeshlab, numpy"],
                               capture_output=True, text=True, check=False)
        if probe.returncode != 0:
            parser.error("PyMeshLab missing from requested Python. Install with: python -m pip install pymeshlab numpy\n" + probe.stderr[-500:])
    instant_bin = None
    if args.instant_retopo_static:
        if not 0 <= args.instant_faces <= 2000000:
            parser.error("--instant-faces must be 0..2,000,000")
        requested = args.instant_meshes_bin or os.environ.get("INSTANT_MESHES_BIN")
        if requested:
            candidate = Path(requested).expanduser()
            instant_bin = str(candidate.resolve()) if candidate.is_file() else None
        else:
            instant_bin = shutil.which("InstantMeshes") or shutil.which("instant-meshes")
        if not instant_bin or not Path(instant_bin).is_file():
            parser.error("Instant Meshes executable not found. Install from https://github.com/wjakob/instant-meshes or set INSTANT_MESHES_BIN; asset was NOT processed.")
    blender = find_blender()
    if blender is None:
        parser.error("Blender executable not found. Install from https://www.blender.org/download/ or set BLENDER_BIN; asset was NOT processed.")
    inner_script = Path(__file__).with_name("auto_enhance.py").resolve()
    command = [blender, "--background", "--factory-startup", "--python-exit-code", "3",
               "--python", str(inner_script), "--", "--input", str(source),
               "--output", str(output), "--merge-distance", str(args.merge_distance)]
    if args.pymeshlab_analyze or args.pymeshlab_clean_static:
        command.extend(["--pymeshlab-python", str(Path(args.pymeshlab_python).resolve())])
    if args.instant_retopo_static:
        command.extend(["--instant-meshes-bin", str(Path(instant_bin).resolve()),
                        "--instant-faces", str(args.instant_faces)])
    for option in ("repair-static", "smooth-static", "polish-motion", "pymeshlab-analyze", "pymeshlab-clean-static", "instant-retopo-static", "overwrite"):
        if getattr(args, option.replace("-", "_")):
            command.append("--" + option)
    print("[enhancer] Processing", source.name, "with", blender, flush=True)
    proc = subprocess.run(command, check=False)
    if proc.returncode != 0:
        print(f"[enhancer] Blender failed with exit code {proc.returncode}", file=sys.stderr)
        return proc.returncode
    if not output.is_file() or output.stat().st_size < 128:
        print("[enhancer] Output is missing or unexpectedly small", file=sys.stderr)
        return 4
    print("[enhancer] Output:", output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
