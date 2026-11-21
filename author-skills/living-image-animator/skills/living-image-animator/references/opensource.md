# Upstream open source pipeline

Each repo should be fetched as required; nothing is silently claimed installed. Respect checkpoint/model licenses separately from source code licenses.

1. GroundingDINO (Apache-2.0): https://github.com/IDEA-Research/GroundingDINO — text-grounded boxes for inhabitants, birds, lamps, tree, cats, etc.
2. SAM 2 (Apache-2.0): https://github.com/facebookresearch/sam2 — precise object RGBA segmentation, image masks and sequence tracking.
3. IOPaint (Apache-2.0 code; model-specific terms apply): https://github.com/Sanster/IOPaint — LaMa and other inpainting methods to restore background behind lifted layers.
4. ComfyUI (GPL-3.0 code; model-specific terms apply): https://github.com/Comfy-Org/ComfyUI — graph to author pose variants and keyframes, with identity checks.
5. Practical-RIFE (MIT): https://github.com/hzwer/Practical-RIFE — optical flow frame interpolation after valid keyframes.
6. Blender (GPL): https://github.com/blender/blender — optional 2.5D plane rigs, armatures, non-destructive multiplane depth, export.
7. Pillow (HPND): https://github.com/python-pillow/Pillow — compositing and GIF export.
8. OpenCV (Apache-2.0): https://github.com/opencv/opencv — masking, warp and conservative inpaint fallback.
9. FFmpeg (LGPL/GPL build dependent): https://github.com/FFmpeg/FFmpeg — optional APNG/WebM/MP4/GIF palette-based encoding.

No claimed technical integration unless actual pipeline code calls the project. This package ships a working Pillow/OpenCV renderer and optional GroundingDINO+SAM2 adapter; other listed projects are integration slots, not bundled binaries or checkpoints.
