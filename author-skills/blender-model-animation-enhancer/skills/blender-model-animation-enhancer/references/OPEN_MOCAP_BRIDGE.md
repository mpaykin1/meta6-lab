# Open Mocap motion-capture bridge (fifth upstream integration)

Official upstream: https://github.com/Larenju-Rai/open-mocap-blender (MIT, Larenju Rai). Previously listed fork: https://github.com/capgorack/opm (fork of same project).

**Compatibility constraint:** upstream explicitly supports Blender **4.0 and earlier only** (Python 3.10 / mediapipe 0.10.14 / opencv-python 4.11.0.86 / cvzone 1.6.1). Do not install into modern Blender 4.5+ running the rest of the pipeline. Requires its own Blender 4.0 executable and dependencies installed in that Blender environment. All tools must actually exist. The separate capture worker uses official upstream `PoseTracking.detect_pose()` without the upstream GUI/timers to process a video in headless mode. This adapter is NOT a replacement mocap engine.

## Sequence

1. Real source checkout `bash scripts/get_official_open_mocap_source.sh /work/open-mocap-blender` (requires working GitHub network; if unavailable, **stop** instead of simulating the upstream).
2. Install upstream required versions inside Blender 4.0 using add-on preferences. Keep the Python environments separate.
3. If input model has no rig, use existing SkinTokens pathway first to generate a rigged GLB. Existing/approved rigs are not replaced. Static PyMeshLab+Instant Meshes stages are allowed only before rigging, never after.
4. Capture video in legacy Blender 4.0: the integration calls upstream Open Mocap's original `utils.PoseTracking.detect_pose` for 40 x/y/z tracked landmarks each frame, preserving missed-frame timing; optional synchronized side view can refine depth. This captures observed motion, **not** invented jumps/attacks.
5. In Blender 4.5+, apply rotations to existing mapped bones, generating a new Action named by the user. Existing armature, mesh, material slots, topology and weighted groups stay unchanged. First captured pose is rotation baseline (not necessarily a T-pose). Root translation, feet contact, IK, hands/fingers and look direction are **not** derived. Do not claim physically accurate retargeting without viewing output.
6. Export separate GLB. Parse output animation names and reject if original named animation clips would be removed; preserve the source GLB and keep new clip separate for `AnimationMixer` and explicit player controls. The game should never automatically attack/crouch unless the user inputs the corresponding command.

## One command

```bash
python scripts/run_enhancer.py \
  --input hero-rigged.glb --output hero-mocap.glb \
  --mocap-video run.mp4 --mocap-addon-dir /work/open-mocap-blender \
  --mocap-blender40 /opt/blender-4.0/blender \
  --mocap-clip Run
```

Optional target bone-name map if automatic Mixamo/Rigify name matching is insufficient, including arbitrary TokenRig-generated bone identifiers:

```json
{
  "left_upper_arm": [11, 13],
  "left_forearm": [13, 15],
  "right_upper_arm": [12, 14],
  "right_forearm": [14, 16],
  "left_thigh": [23, 25],
  "left_shin": [25, 27],
  "right_thigh": [24, 26],
  "right_shin": [26, 28]
}
```

Replace **keys with actual bone names** in the user-provided rig (these are illustrative). Pass as `--mocap-bone-map /path/mapping.json`. Never guess mappings when names are ambiguous. To import recorded landmarks without Blender 4.0, use `--mocap-landmarks /path/captured.json` instead of `--mocap-video`. This is not video extraction; it only imports already-real captured data.

For multi-view use `--mocap-side-video side.mp4`: videos must have the same FPS and be frame-synchronized. Inconsistent recordings are refused.

## Limits

- Video → 2D landmarks → approximate 3D motion: a single camera has uncertain depth and foot contact. A two-view setup improves depth when correctly synchronized but is not full performance capture.
- Generic Auto-rigs from SkinTokens do not necessarily have semantic bone names. If automatic matching fails, explicit mapping is required. No same-hero guarantee from video alone; the rigged mesh must already exist.
- Upstream Open Mocap uses Blender 4.0.0 and earlier; this extension splits its work into a headless process and never registers the add-on into newer Blender.
- The original upstream repository was inspected from GitHub, not fully downloaded into this build environment. Its source is obtained separately via `get_official_open_mocap_source.sh`. Do not state it is bundled.
- Scripts create no `.blend`/`.glb` unless their dependencies and input sources exist. Actual Blender capture/retarget run has not been exercised in the plugin-building environment.
