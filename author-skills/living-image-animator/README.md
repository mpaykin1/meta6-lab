# Living Image Animator v0.3

Living-scene artist workflow with strict release-blocking smoothness/coverage validation. Requires actual body-part rigs or matching pose sprites for human and animal motion. Outputs both a looping animated GIF and one ZIP with transparent elements, poses, masks, source and registered plates.

Final entrypoint: `skills/living-image-animator/scripts/smooth_delivery.py`.

**Limits:** Input segmentation/poses for hidden objects cannot be reconstructed perfectly from a single still by a deterministic cutout rig. Unknown actions must not be called completed. See `references/nonjerky-contract.md`.
