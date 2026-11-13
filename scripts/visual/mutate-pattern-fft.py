#!/usr/bin/env python3
"""Mutations against the real FFT image classifier (including hidden periodic waves)."""
import importlib.util
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

script = Path(__file__).with_name("measure-pattern-fft.py")
spec = importlib.util.spec_from_file_location("measure_pattern_fft", script)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

n = 256
y, x = np.mgrid[0:n, 0:n]
rng = np.random.default_rng(13)
raw = np.uint8(rng.integers(0, 256, size=(n, n)))
low = np.asarray(Image.fromarray(raw).filter(ImageFilter.GaussianBlur(10)), dtype=float)
micro = np.asarray(Image.fromarray(raw).filter(ImageFilter.GaussianBlur(3)), dtype=float)
clean = 180 + (low - 128) * 1.2 + (micro - 128) * .2
mutants = [
    ("fixed-oblique-sin-waves", 180 + 22 * np.sin(x * .23 + y * .29) +
     18 * np.cos(x * .17 - y * .21)),
    ("periodic-grid", 180 + 20 * np.sin(x * .28) * np.sin(y * .21)),
    # Deception: hides the oblique wave inside an irregular cloud of random blotches.
    ("disguised-sine-in-noise", 180 + 22 * np.sin(x * .23 + y * .29) + (micro - 128) * 2.0),
]
with tempfile.TemporaryDirectory() as tmp:
    for name, pixels in [("accepted-fbm-like", clean)] + mutants:
        path = Path(tmp) / (name + ".png")
        Image.fromarray(np.uint8(np.clip(pixels, 0, 255))).save(path)
        score = module.spectrum_score(path)
        is_mutant = name != "accepted-fbm-like"
        assert (score >= module.CUTOFF) == is_mutant, (
            f"FFT misclassified {name}: score={score}; cutoff={module.CUTOFF}"
        )
        print(name, "score", score, "CAUGHT" if is_mutant else "PASS")
print("FFT MUTATIONS PASS: 3 rejected; clean accepted")
