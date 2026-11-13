#!/usr/bin/env python3
"""FFT guard: quantify repeated spatial peaks in three Chromium frames per game."""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

CUTOFF = 0.38  # Fixed maximum fraction in eight dominant off-axis spectral bins.


def spectrum_score(filename):
    source = Image.open(filename).convert("L").resize((256, 256))
    # Exclude heads-up elements near the screen edge and broad lighting gradients.
    source = source.crop((24, 24, 232, 232)).resize((256, 256))
    array = np.asarray(source, dtype=np.float32)
    highpass = array - np.asarray(source.filter(ImageFilter.GaussianBlur(11)), dtype=np.float32)
    if float(np.std(array)) < 3.0:
        raise ValueError("Frame has no visible game scene: " + str(filename))
    signal = highpass * np.outer(np.hanning(256), np.hanning(256))
    power = abs(np.fft.fftshift(np.fft.fft2(signal))) ** 2
    ys, xs = np.indices((256, 256))
    rad = np.hypot(xs - 128, ys - 128)
    valid = ((rad > 5) & (rad < 90) & (abs(xs - 128) > 2) & (abs(ys - 128) > 2))
    energy = np.sort(power[valid].ravel())
    total = float(np.sum(energy))
    if total < 1e-9:
        raise ValueError("No analyzable texture frequency in " + str(filename))
    return round(float(np.sum(energy[-8:]) / total), 6)


def load_group(folder):
    path = Path(folder)
    manifest = json.loads((path / "index.json").read_text(encoding="utf-8"))
    if manifest["errors"]:
        raise ValueError("Browser capture failures: " + str(manifest["errors"]))
    games = {}
    for game in manifest["games"]:
        if len(game["images"]) != 3:
            raise ValueError("Must have exactly 3 viewpoints: " + game["id"])
        scores = [spectrum_score(path / Path(name).name) for name in game["images"]]
        games[game["id"]] = {"views": scores, "peak": max(scores)}
    if not games:
        raise ValueError("No images captured")
    return games


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--after", required=True)
    parser.add_argument("--before")
    parser.add_argument("--output", default="/tmp/bez-patternov-fft.json")
    args = parser.parse_args()
    after = load_group(args.after)
    before = load_group(args.before) if args.before else {}
    failures = []
    report = {"fixed_threshold": CUTOFF, "before": before, "after": after}
    for name, data in after.items():
        old = before.get(name)
        current = data["peak"]
        if old is not None:
            previous = old["peak"]
            print(f"INK FFT BEFORE={previous:.6f}, AFTER={current:.6f}, "
                  f"DELTA={previous - current:.6f}, FIXED_LIMIT={CUTOFF:.2f}")
            if previous < CUTOFF:
                failures.append(name + ": old periodic reference was not detected")
            if current >= previous * .85:
                failures.append(name + ": improvement smaller than 15%")
        else:
            print(f"FFT {name}: score={current:.6f}, limit={CUTOFF:.2f}")
        if current >= CUTOFF:
            failures.append(name + ": periodic spectral peak above fixed limit")
    Path(args.output).write_text(json.dumps(report, indent=2), encoding="utf-8")
    if failures:
        for failure in failures:
            print("BEZ_PATTERNOV VISUAL FAIL:", failure)
        raise SystemExit(1)
    print("BEZ_PATTERNOV VISUAL PASS:", len(after), "games x 3 views")


if __name__ == "__main__":
    main()
