#!/usr/bin/env python3
"""Measurable player-visible pixel-change coverage; not a user satisfaction estimate."""
from pathlib import Path
from PIL import Image, ImageChops
import json
import numpy as np

base = Path("three-worlds-game/evidence")
land = Image.open(base / "mobile.png").convert("RGB")
water = Image.open(base / "diving-mobile.png").convert("RGB")
if land.size != water.size:
    raise SystemExit(f"SCREENSHOT_SIZE_MISMATCH {land.size} != {water.size}")
width, height = land.size
# Sample the playable viewport, excluding the persistent top HUD and bottom touch bar.
crop = (0, round(height * .15), width, round(height * .90))
a = np.asarray(land.crop(crop), dtype=np.int16)
b = np.asarray(water.crop(crop), dtype=np.int16)
mean_abs_rgb_difference = np.abs(a - b).mean(axis=2)
threshold = 20
changed = float((mean_abs_rgb_difference >= threshold).mean() * 100)
report = {
    "metric": "underwater_surface_player_visible_changed_pixel_coverage",
    "definition": "Share of RGB pixels in gameplay viewport with mean absolute difference >=20/255",
    "baseline": "mobile.png (island)", "candidate": "diving-mobile.png (underwater)",
    "coverage_percent": round(changed, 2),
    "required_percent": 85, "crop_pixels": crop,
    "mean_absolute_difference": round(float(mean_abs_rgb_difference.mean()), 2),
    "limits": "Pixel-change gate is a reproducible visual novelty proxy, not human usability or enjoyment testing."
}
(base / "visual-visibility.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
print("VISIBLE_CHANGE_EVIDENCE", json.dumps(report, ensure_ascii=False))
if changed <= 85:
    raise SystemExit("VISIBILITY_GATE_FAIL: player-visible changed-pixel coverage must be over 85%")
