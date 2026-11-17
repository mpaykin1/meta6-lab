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
    ("vertical-wallpaper", 180 + 24 * np.sin(x * .23) + (micro - 128) * 1.5),
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
print("FFT MUTATIONS PASS: 4 rejected; clean accepted")

# Every captured viewpoint must be different. A changing timestamp or flicker
# must not masquerade as moving through the scene.
with tempfile.TemporaryDirectory() as tmp:
    original = np.uint8(rng.integers(30, 230, size=(128, 128)))
    independent = np.uint8(rng.integers(30, 230, size=(128, 128)))
    shifted = np.uint8(rng.integers(30, 230, size=(128, 128)))

    def write_view(name, data):
        path = Path(tmp) / (name + ".png")
        Image.fromarray(data).save(path)
        return path

    original_path = write_view("original", original)
    duplicate = write_view("duplicate", original.copy())
    alternate = write_view("alternate", independent)
    third = write_view("third", shifted)
    tiny_flicker = write_view("one-unit-flicker", np.uint8(original + 1))

    mutants = [
        ("three-same-screenshots", [original_path, duplicate, duplicate]),
        ("two-duplicates-one-different", [original_path, duplicate, alternate]),
        ("subtle-animation-not-a-new-view", [original_path, tiny_flicker, third]),
    ]
    for name, files in mutants:
        separation = module.view_separation(files)
        assert separation < 2.5, (
            f"Undetected viewpoint mutation {name}: {separation}"
        )
        print(name, "separation", separation, "CAUGHT")
    clean_separation = module.view_separation(
        [original_path, alternate, third]
    )
    assert clean_separation >= 2.5, (
        f"Three independent views rejected: {clean_separation}"
    )
    print("VIEWPOINT MUTATIONS PASS: 3 rejected; 3 distinct accepted")
