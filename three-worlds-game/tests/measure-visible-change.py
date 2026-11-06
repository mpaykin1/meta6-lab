#!/usr/bin/env python3
"""Measure the actual visible switch from original Twilight island to underwater scene.
This is VIEWPORT-CHANGE COVERAGE, not an artistic-quality score.
Screenshots are real browser WebGL captures at identical device sizes and HUD state.
Pass: >85% of the central scene pixels change by >20 mean RGB levels.
"""
from pathlib import Path
import json
import sys

import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1] / "evidence"
result = {"gate": "VIEWPORT_CHANGE_COVERAGE", "threshold_percent": 85.0,
          "minimum_mean_rgb_delta": 20, "devices": {}}
for device in ("mobile", "desktop"):
    island = np.asarray(Image.open(root / (device + ".png")).convert("RGB"), dtype=np.int16)
    underwater = np.asarray(Image.open(root / ("diving-" + device + ".png")).convert("RGB"), dtype=np.int16)
    assert island.shape == underwater.shape
    h, w = island.shape[:2]
    ys = slice(int(h * 0.22), int(h * 0.88))
    xs = slice(int(w * 0.04), int(w * 0.96))
    delta = np.abs(island[ys, xs] - underwater[ys, xs]).mean(axis=2)
    coverage = float((delta > 20).mean() * 100)
    result["devices"][device] = {
        "coverage_percent": round(coverage, 2),
        "width": w,
        "height": h,
        "passed": coverage > 85.0
    }
    print(f"PLAYER_VISIBLE_{device.upper()}: {coverage:.2f}% (required >85.00%)")
out = root / "visible-change.json"
out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
if not all(x["passed"] for x in result["devices"].values()):
    print("VISIBILITY_GATE_FAILED", file=sys.stderr)
    raise SystemExit(1)
print("VISIBILITY_GATE_PASS (scene-change metric only, not user PASS or artistic-quality approval)")
